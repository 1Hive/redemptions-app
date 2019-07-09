import '@babel/polyfill'
import { first, map, publishReplay } from 'rxjs/operators'
import { of, forkJoin } from 'rxjs'
import AragonApi from '@aragon/api'

import {
  ETHER_TOKEN_FAKE_ADDRESS,
  isTokenVerified,
  tokenDataFallback,
  getTokenSymbol,
  getTokenName,
} from './lib/token-utils'
import { addressesEqual } from './lib/web3-utils'
import tokenDecimalsAbi from './abi/token-decimals.json'
import tokenNameAbi from './abi/token-name.json'
import tokenSymbolAbi from './abi/token-symbol.json'
import tokenSupplyAbi from './abi/token-totalSupply.json'

import minimeTokenAbi from './abi/minimeToken.json'
import tmAbi from './abi/tokenManager.json'
import vaultAbi from './abi/vault.json'

const tokenAbi = [].concat(tokenDecimalsAbi, tokenNameAbi, tokenSymbolAbi, tokenSupplyAbi)

const INITIALIZATION_TRIGGER = Symbol('INITIALIZATION_TRIGGER')
const ACCOUNTS_TRIGGER = Symbol('ACCOUNTS_TRIGGER')

const tokenContracts = new Map() // Addr -> External contract
const tokenDecimals = new Map() // External contract -> decimals
const tokenNames = new Map() // External contract -> name
const tokenSymbols = new Map() // External contract -> symbol

const ETH_CONTRACT = Symbol('ETH_CONTRACT')

const api = new AragonApi()

try {
  forkJoin(api.call('vault'), api.call('tokenManager')).subscribe(
    adresses => initialize(...adresses, ETHER_TOKEN_FAKE_ADDRESS),
    err =>
      console.error('Could not start background script execution due to the contract not loading vault or tokenManager')
  )
} catch (err) {
  console.error(err)
}

async function initialize(vaultAddress, tmAddress, ethAddress) {
  const vaultContract = api.external(vaultAddress, vaultAbi)
  const tmContract = api.external(tmAddress, tmAbi)

  const minimeAddress = await tmContract.token().toPromise()
  const minimeContract = api.external(minimeAddress, minimeTokenAbi)

  const minimeData = await getMinimeTokenData(minimeContract)
  api.identify(`Rdemptions ${minimeData.symbol}`)

  const network = await api
    .network()
    .pipe(first())
    .toPromise()

  // Set up ETH placeholders
  tokenContracts.set(ethAddress, ETH_CONTRACT)
  tokenDecimals.set(ETH_CONTRACT, '18')
  tokenNames.set(ETH_CONTRACT, 'Ether')
  tokenSymbols.set(ETH_CONTRACT, 'ETH')

  return createStore({
    network,
    ethToken: {
      address: ethAddress,
    },
    vault: {
      address: vaultAddress,
      contract: vaultContract,
    },
    tokenManager: {
      address: tmAddress,
      contract: tmContract,
    },
    minimeToken: {
      address: minimeAddress,
      contract: minimeContract,
      data: minimeData,
    },
  })
}

async function createStore(settings) {
  let vaultInitializationBlock

  try {
    vaultInitializationBlock = await settings.vault.contract.getInitializationBlock().toPromise()
  } catch (err) {
    console.error("Could not get attached vault's initialization block:", err)
  }

  // Hot observable which emits an web3.js event-like object with an account string of the current active account.
  const accounts$ = api.accounts().pipe(
    map(accounts => {
      return {
        event: ACCOUNTS_TRIGGER,
        account: accounts[0],
      }
    }),
    publishReplay(1)
  )

  accounts$.connect()

  const currentBlock = await getBlockNumber()

  return api.store(
    async (state, event) => {
      const { vault, minimeToken } = settings
      const { address: eventAddress, event: eventName, blockNumber } = event

      console.log('event', event)
      //dont want to listen for past events for now
      //(our app state can be obtained from smart contract vars)
      if (blockNumber && blockNumber <= currentBlock) return state

      let nextState = {
        ...state,
      }

      if (eventName === INITIALIZATION_TRIGGER) {
        nextState = await initializeState(nextState, settings)
      } else if (eventName === ACCOUNTS_TRIGGER) {
        nextState = await updateConnectedAccount(nextState, event, settings)
      } else if (addressesEqual(eventAddress, vault.address)) {
        // Vault event
        nextState = await vaultEvent(nextState, event, settings)
      } else {
        // Redemptions event
        switch (eventName) {
          case 'AddToken':
            nextState = await addedToken(nextState, event, settings)
            break
          case 'RemoveToken':
            nextState = await removedToken(nextState, event)
            break
          case 'Redeem':
            nextState = await newRedemption(nextState, settings)
            break
          default:
            break
        }
      }
      return nextState
    },
    [
      // Always initialize the store with our own home-made event
      of({ event: INITIALIZATION_TRIGGER }),
      accounts$,
      // Handle Vault events
      settings.vault.contract.events(vaultInitializationBlock),
      settings.minimeToken.contract.events(),
    ]
  )
}

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

async function initializeState(state, settings) {
  let minimeContract = settings.minimeToken.contract
  let nextState = {
    ...state,
    redeemableToken: {
      ...settings.minimeToken.data,
      totalSupply: await getMinimeTokenTotalSupply(minimeContract),
    },
    tokens: await updateTokens(settings),
  }

  return nextState
}

async function updateConnectedAccount(state, { account }, { tokenManager: { contract } }) {
  const { redeemableToken } = state
  return {
    ...state,
    redeemableToken: {
      ...redeemableToken,
      balance: await contract.spendableBalanceOf(account).toPromise(),
    },
    account,
  }
}

async function addedToken(state, { returnValues: { token } }, settings) {
  return {
    ...state,
    tokens: [...state.tokens, ...(await getVaultBalances([token], settings))],
  }
}

async function removedToken(state, { returnValues: { token } }) {
  const { tokens } = state

  let nextState = {
    ...state,
  }

  const index = tokens.findIndex(t => addressesEqual(t.address, token))

  if (index > -1) {
    tokens.splice(index, 1)
    nextState.tokens = [...tokens]
  }

  return nextState
}

async function newRedemption({ redeemableToken, ...state }, settings) {
  const {
    tokenManager: { contract: tokenManagerContract },
    minimeToken: { contract: minimeContract },
  } = settings
  const newBalance = await minimeContract.spendableBalanceOf(state.account).toPromise()
  const newSupply = await tokenManagerContract.totalSupply().toPromise()

  return {
    ...state,
    redeemableToken: {
      ...redeemableToken,
      totalSupply: newSupply,
      balance: newBalance,
    },
    tokens: await updateTokens(settings),
  }
}

/** called when token is withdrawn from or deposited to the vault */
async function vaultEvent(state, { returnValues: { token } }, settings) {
  const { tokens } = state
  const index = tokens.findIndex(t => addressesEqual(t.address, token))

  if (index < 0) return state

  const elem = {
    ...tokens[index],
    amount: await loadTokenBalance(token, settings),
  }

  const newTokens = [...tokens.slice(0, index), elem, ...tokens.slice(index + 1)]
  return {
    ...state,
    tokens: newTokens,
  }
}

/** called when redemption has been made (refresh of all tokens balances)  */
async function updateTokens(settings) {
  const tokens = await api.call('getTokens').toPromise()
  return getVaultBalances(tokens, settings)
}

/***********************
 *                     *
 *       Helpers       *
 *                     *
 ***********************/
/** returns redeemable token metadata + supply */
async function getMinimeTokenData(minimeContract) {
  const [symbol, decimals, totalSupply] = await Promise.all([
    minimeContract.symbol().toPromise(),
    minimeContract.decimals().toPromise(),
  ])
  return {
    symbol,
    decimals,
  }
}

function getMinimeTokenTotalSupply(minimeContract) {
  return minimeContract.totalSupply().toPromise()
}

/** returns `tokens` balances from vault */
async function getVaultBalances(tokens = [], settings) {
  let balances = []
  for (let tokenAddress of tokens) {
    const tokenContract = tokenContracts.has(tokenAddress)
      ? tokenContracts.get(tokenAddress)
      : api.external(tokenAddress, tokenAbi)
    tokenContracts.set(tokenAddress, tokenContract)
    balances = [...balances, await newBalanceEntry(tokenContract, tokenAddress, settings)]
  }
  return balances
}

async function newBalanceEntry(tokenContract, tokenAddress, settings) {
  const [balance, decimals, name, symbol] = await Promise.all([
    loadTokenBalance(tokenAddress, settings),
    loadTokenDecimals(tokenContract, tokenAddress, settings),
    loadTokenName(tokenContract, tokenAddress, settings),
    loadTokenSymbol(tokenContract, tokenAddress, settings),
  ])

  return {
    decimals,
    name,
    symbol,
    address: tokenAddress,
    amount: balance,
    verified:
      isTokenVerified(tokenAddress, settings.network.type) || addressesEqual(tokenAddress, settings.ethToken.address),
  }
}

function loadTokenBalance(tokenAddress, { vault }) {
  return vault.contract.balance(tokenAddress).toPromise()
}

async function loadTokenDecimals(tokenContract, tokenAddress, { network }) {
  if (tokenDecimals.has(tokenContract)) {
    return tokenDecimals.get(tokenContract)
  }

  const fallback = tokenDataFallback(tokenAddress, 'decimals', network.type) || '0'

  let decimals
  try {
    decimals = (await tokenContract.decimals().toPromise()) || fallback
    tokenDecimals.set(tokenContract, decimals)
  } catch (err) {
    // decimals is optional
    decimals = fallback
  }
  return decimals
}

async function loadTokenName(tokenContract, tokenAddress, { network }) {
  if (tokenNames.has(tokenContract)) {
    return tokenNames.get(tokenContract)
  }
  const fallback = tokenDataFallback(tokenAddress, 'name', network.type) || ''

  let name
  try {
    name = (await getTokenName(api, tokenAddress)) || fallback
    tokenNames.set(tokenContract, name)
  } catch (err) {
    // name is optional
    name = fallback
  }
  return name
}

async function loadTokenSymbol(tokenContract, tokenAddress, { network }) {
  if (tokenSymbols.has(tokenContract)) {
    return tokenSymbols.get(tokenContract)
  }
  const fallback = tokenDataFallback(tokenAddress, 'symbol', network.type) || ''

  let symbol
  try {
    symbol = (await getTokenSymbol(api, tokenAddress)) || fallback
    tokenSymbols.set(tokenContract, symbol)
  } catch (err) {
    // symbol is optional
    symbol = fallback
  }
  return symbol
}

function getBlockNumber() {
  return new Promise((resolve, reject) => api.web3Eth('getBlockNumber').subscribe(resolve, reject))
}

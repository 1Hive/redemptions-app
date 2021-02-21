/*
 * These hooks are called by the Aragon Buidler plugin during the start task's lifecycle. Use them to perform custom tasks at certain entry points of the development build process, like deploying a token before a proxy is initialized, etc.
 *
 * Link them to the main buidler config file (buidler.config.js) in the `aragon.hooks` property.
 *
 * All hooks receive two parameters:
 * 1) A params object that may contain other objects that pertain to the particular hook.
 * 2) A "bre" or BuidlerRuntimeEnvironment object that contains enviroment objects like web3, Truffle artifacts, etc.
 *
 * Please see AragonConfigHooks, in the plugin's types for further details on these interfaces.
 * https://github.com/aragon/buidler-aragon/blob/develop/src/types.ts#L31
 */

const table = require('console.table')
const { tokens } = require('./helpers/get-tokens')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TOKEN_NAME = 'Redeemable token'
const TOKEN_SYMBOL = 'RDT'
const TOKEN_TRANSFERABLE = true
const TOKEN_DECIMALS = 18
const TOKEN_MAX_PER_ACCOUNT = 0
const VOTING_SETTINGS = [
  '500000000000000000',
  '200000000000000000',
  '86400',
]

let tm, vault

const getInstallers = ({ artifacts, web3, _experimentalAppInstaller, proxy}) => {
  const newTokenAndManager = async (tokenName, tokenSymbol) => {
    const MiniMeToken = artifacts.require('MiniMeToken')
    const TokenManager = artifacts.require('TokenManager')
    const token = await MiniMeToken.new(
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      tokenName,
      TOKEN_DECIMALS,
      tokenSymbol,
      TOKEN_TRANSFERABLE
    )
    const tm = await _experimentalAppInstaller('token-manager', {
      skipInitialize: true,
    })

    await token.changeController(tm.address)
    await tm.initialize([
      token.address,
      TOKEN_TRANSFERABLE,
      TOKEN_MAX_PER_ACCOUNT,
    ])
    const accounts = await web3.eth.getAccounts()
    await tm.createPermission('MINT_ROLE')
    const tokenManager = await TokenManager.at(tm.address)
    await tokenManager.mint(accounts[0], '1000000000000000000')
    await tokenManager.mint(accounts[1], '1000000000000000000')
    return [token, tm]
  }

  const newVoting = async (token, votingSettings) => {
    const voting = await _experimentalAppInstaller('voting', {
      initializeArgs: [token, ...votingSettings],
    })
    await voting.createPermission('CREATE_VOTES_ROLE')
    return voting
  }

  const newVault = async () => {
    const vault = await _experimentalAppInstaller('vault')

    await vault.createPermission('TRANSFER_ROLE', proxy.address)
    return [vault]
  }
  return { newTokenAndManager, newVoting, newVault }
}

module.exports = {
  // Called before a dao is deployed.
  preDao: async ({ log }, { web3, artifacts }) => {},

  // Called after a dao is deployed.
  postDao: async (
    { dao, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {},

  // Called after the app's proxy is created, but before it's initialized.
  preInit: async (
    { proxy, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {
    const { newTokenAndManager, newVoting, newVault } = getInstallers(
      { proxy, _experimentalAppInstaller, web3, artifacts }
    )
    const [token, _tm] = await newTokenAndManager(TOKEN_NAME, TOKEN_SYMBOL)

    _tm.createPermission('BURN_ROLE', proxy.address)

    const voting = await newVoting(token.address, VOTING_SETTINGS)

    const [_vault] = await newVault()
    
    tm = _tm
    vault = _vault
  },

  // Called after the app's proxy is initialized.
  postInit: async (
    { proxy, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {
    const ERC20Token = artifacts.require('ERC20Token')
    const Vault = artifacts.require('Vault')
    const Redemptions = artifacts.require('Redemptions')
    const accounts = await web3.eth.getAccounts()
    const { toWei, fromWei } = web3.utils
    const vaultContract = await Vault.at(vault.address)
    const redemptionsContract = await Redemptions.at(proxy.address)
    log('Depositing test tokens')
    try {
      const data = []
      // Deposit test tokens
      let tokenContract
      for (const { amount, ...token } of tokens) {
        tokenContract = await ERC20Token.new(accounts[0], ...Object.values(token))
        await tokenContract.approve(vault.address, amount)
        await vaultContract.deposit(tokenContract.address, amount)
        const balance = await tokenContract.balanceOf(vault.address)
        data.push([token.symbol, tokenContract.address, fromWei(balance)])
      }
  
      // Deposit ETH
      const etherAmount = toWei('0.1', 'ether')
      await vaultContract.deposit(ZERO_ADDRESS, etherAmount, { value: etherAmount })
      const balance = await web3.eth.getBalance(vault.address)
      data.push(['ETH', ZERO_ADDRESS, fromWei(balance)])
  
      console.table(['Token', 'Address', 'Balance'], data)
    } catch (err) {
      log(`Error depositing tokens: ${err}`)
    }
  },

  // Called when the start task needs to know the app proxy's init parameters.
  // Must return an array with the proxy's init parameters.
  getInitParams: async ({ log }, { web3, artifacts }) => {
    return [vault.address, tm.address, [ZERO_ADDRESS]]
  },

  // Called after the app's proxy is updated with a new implementation.
  postUpdate: async ({ proxy, log }, { web3, artifacts }) => {},
}

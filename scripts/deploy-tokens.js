const getAccounts = require('./helpers/get-accounts')
const tokens = require('./helpers/get-tokens')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle

const defaultOwner = process.env.OWNER
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const PROXY_APP_NAMESPACE = '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb'
const KERNEL_DEFAULT_VAULT_APP_ID = '0x7e852e0fcfce6551c13800f1e7476f982525c2b5277ba14b24339c68416336d1'

module.exports = async (
  truffleExecCallback,
  { artifacts = globalArtifacts, web3 = globalWeb3, owner = defaultOwner, verbose = true } = {}
) => {
  const log = (...args) => {
    if (verbose) {
      console.log(...args)
    }
  }

  if (!owner) {
    const accounts = await getAccounts(web3)
    owner = accounts[0]
    log(`No OWNER environment variable passed, setting ENS owner to provider's account: ${owner}`)
  }

  const ERC20Token = artifacts.require('ERC20Token')
  const Kernel = artifacts.require('Kernel')
  const Vault = artifacts.require('Vault')

  //get Vault contract
  const daoAddress = process.argv.slice(4)[0]

  const kernel = await Kernel.at(daoAddress)
  const vaultAddress = await kernel.getApp(PROXY_APP_NAMESPACE, KERNEL_DEFAULT_VAULT_APP_ID)
  const vault = Vault.at(vaultAddress)

  const decimals = 18

  try {
    // Deposit test tokens
    let tokenContract
    for (const { amount, ...token } of tokens) {
      tokenContract = await ERC20Token.new(owner, ...Object.values(token))

      await tokenContract.approve(vaultAddress, amount)
      await vault.deposit(tokenContract.address, amount)

      let balance = await tokenContract.balanceOf(vaultAddress)
      log(`${token.symbol} token: `, tokenContract.address, ' Balance: ', balance.toNumber() / Math.pow(10, decimals))
    }

    // Deposit ETH
    await vault.deposit(ZERO_ADDRESS, 2e18, { value: web3.toWei('2', 'ether') })
    log('Ether: ', web3.eth.getBalance(vaultAddress).toNumber() / Math.pow(10, decimals))
  } catch (err) {
    console.log(`Error depositing tokens: ${err}`)
  }

  if (typeof truffleExecCallback === 'function') {
    // Called directly via `truffle exec`
    truffleExecCallback()
  } else {
    return {}
  }
}

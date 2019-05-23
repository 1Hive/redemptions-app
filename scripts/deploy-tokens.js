const getAccounts = require('./helpers/get-accounts')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle

const defaultOwner = process.env.OWNER
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const PROXY_APP_NAMESPACE =
  '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb'
const KERNEL_DEFAULT_VAULT_APP_ID =
  '0x7e852e0fcfce6551c13800f1e7476f982525c2b5277ba14b24339c68416336d1'

module.exports = async (
  truffleExecCallback,
  {
    artifacts = globalArtifacts,
    web3 = globalWeb3,
    owner = defaultOwner,
    verbose = true,
  } = {}
) => {
  const log = (...args) => {
    if (verbose) {
      console.log(...args)
    }
  }

  if (!owner) {
    const accounts = await getAccounts(web3)
    owner = accounts[0]
    log(
      `No OWNER environment variable passed, setting ENS owner to provider's account: ${owner}`
    )
  }

  const ERC20Token = artifacts.require('ERC20Token')
  const Kernel = artifacts.require('Kernel')
  const Vault = artifacts.require('Vault')

  const daoAddress = process.argv.slice(4)[0]

  const kernel = await Kernel.at(daoAddress)
  const vaultAddress = await kernel.getApp(
    PROXY_APP_NAMESPACE,
    KERNEL_DEFAULT_VAULT_APP_ID
  )
  const vault = Vault.at(vaultAddress)

  // Deposit test tokens
  const token0 = await ERC20Token.new(owner, 'Test Token 0', 'TS0', 18)
  await token0.approve(vaultAddress, 100)
  await vault.deposit(token0.address, 100)

  const token1 = await ERC20Token.new(owner, 'Test Token 1', 'TS1', 18)
  await token1.approve(vaultAddress, 50)
  await vault.deposit(token1.address, 50)

  // Deposit ETH
  await vault.deposit(ZERO_ADDRESS, 2e18, { value: 2e18 })

  log('Vault token0:', token0.address, await token0.balanceOf(vaultAddress))
  log('Vault token1', token1.address, await token1.balanceOf(vaultAddress))

  if (typeof truffleExecCallback === 'function') {
    // Called directly via `truffle exec`
    truffleExecCallback()
  } else {
    return {}
  }
}

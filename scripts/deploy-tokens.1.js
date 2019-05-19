const logDeploy = require('@aragon/os/scripts/helpers/deploy-logger')
const getAccounts = require('./helpers/get-accounts')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle

const defaultOwner = process.env.OWNER


const getKernelEventLogs = (kernel,event) => {
  kernel[event]({},(err,log) => {
    console.log(log)
  })
}

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

  
  const Kernel = artifacts.require('Kernel')
  const Vault = artifacts.require('Vault')
  const TokenFactory = artifacts.require('TokenFactory');
  const Depositer = artifacts.depositer.require('Depositer')

  const tokenFactory = TokenFactory.new()
  const depositer = Depositer.new(tokenFactory)

  const daoAddress = process.argv.slice(4)[0]

  const PROXY_APP_NAMESPACE = '0xd6f028ca0e8edb4a8c9757ca4fdccab25fa1e0317da1188108f7d2dee14902fb'
  const KERNEL_DEFAULT_VAULT_APP_ID = '0x7e852e0fcfce6551c13800f1e7476f982525c2b5277ba14b24339c68416336d1'

  const kernel = await Kernel.at(daoAddress)
  const vaultAddress = await kernel.getApp(PROXY_APP_NAMESPACE,KERNEL_DEFAULT_VAULT_APP_ID)
  const vault = Vault.at(vaultAddress)
  
  const token0 = await tokenFactory.newToken('Test Token 0', 'TS0')
  await depositer.pleaseAirdrop(vault,token0,1000)

  const token1 = await tokenFactory.newToken('Test Token 1', 'TS1')
  await depositer.pleaseAirdrop(vault,token0,1000)


  console.log('Vault balance t0',await token0.balanceOf(vaultAddress));
  console.log('Vault balance t1',await token1.balanceOf(vaultAddress));

  if (typeof truffleExecCallback === 'function') {
    // Called directly via `truffle exec`
    truffleExecCallback()
  } else {
    return {

    }
  }  
}

const logDeploy = require('@aragon/os/scripts/helpers/deploy-logger')
const getAccounts = require('./helpers/get-accounts')

const globalArtifacts = this.artifacts // Not injected unless called directly via truffle
const globalWeb3 = this.web3 // Not injected unless called directly via truffle

const defaultOwner = process.env.OWNER
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const getKernelEventLogs = (kernel, event) => {
  kernel[event]({}, (err, log) => {
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

  const BasicToken = artifacts.require('TestToken')

  const valutAddress = '0xd4303618a7eab0092a4bdea064a1be66c665478c'

  log('Deploying BasicTokens...')
  const token0 = await BasicToken.new(valutAddress, 'TEST', 'TST', 18)
  //const token1 = await BasicToken.new()
  //await logDeploy(token0, { verbose })

  const kernel = await Kernel.at(daoAddress)
  const vaultAddress = await kernel.getApp(
    PROXY_APP_NAMESPACE,
    KERNEL_DEFAULT_VAULT_APP_ID
  )
  const vault = Vault.at(vaultAddress)

  const token0 = await ERC20Token.new(owner, 'Test Token 0', 'TS0', 18)
  await token0.approve(vaultAddress, 100)
  const receipt0 = await vault.deposit(token0.address, 100)

  //token0.transfer(valutAddress, 100)

  await vault.deposit(ZERO_ADDRESS, 2e18, { value: 2e18 })

  console.log(
    'Vault token0:',
    token0.address,
    await token0.balanceOf(vaultAddress)
  )
  console.log(
    'Vault token1',
    token1.address,
    await token1.balanceOf(vaultAddress)
  )

  if (typeof truffleExecCallback === 'function') {
    // Called directly via `truffle exec`
    truffleExecCallback()
  } else {
    return {}
  }
}

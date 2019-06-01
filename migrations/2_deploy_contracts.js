const ECRecovery = artifacts.require('ECRecovery.sol')
var Redemptions = artifacts.require('Redemptions.sol')

module.exports = function(deployer) {
  deployer.deploy(ECRecovery).then(() => {
    deployer.deploy(Redemptions)
  })
  deployer.link(ECRecovery, Redemptions)
}

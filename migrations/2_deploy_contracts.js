/* global artifacts */
var CounterApp = artifacts.require('Redemptions.sol')

module.exports = function(deployer) {
  deployer.deploy(CounterApp)
}

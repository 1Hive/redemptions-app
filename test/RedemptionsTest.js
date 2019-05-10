const Redemptions = artifacts.require('Redemptions')
const Vault = artifacts.require('@aragon/apps-vault/contracts/vault')
const MiniMeToken = artifacts.require('@aragon/apps-shared-minime/contracts/MiniMeToken')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel')

const {assertRevert} = require('@aragon/test-helpers/assertThrow')

const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const getLog = (receipt, logName, argName) => {
    const log = receipt.logs.find(({event}) => event === logName)
    return log ? log.args[argName] : null
}

const deployedContract = (receipt) =>
    getLog(receipt, 'NewAppProxy', 'proxy')

contract('Redemptions', ([rootAccount, ...accounts]) => {

    let APP_MANAGER_ROLE, REDEEM_ROLE, ADD_TOKEN_ROLE, REMOVE_TOKEN_ROLE
    let daoFactory, vaultBase, vault, redeemableToken, redemptionsBase, redemptions

    before(async () => {
        const kernelBase = await Kernel.new(true) // petrify immediately
        const aclBase = await ACL.new()
        const evmScriptRegistryFactory = await EVMScriptRegistryFactory.new()
        daoFactory = await DAOFactory.new(kernelBase.address, aclBase.address, evmScriptRegistryFactory.address)
        vaultBase = await Vault.new()
        redemptionsBase = await Redemptions.new()

        APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()
        REDEEM_ROLE = await redemptionsBase.REDEEM_ROLE()
        ADD_TOKEN_ROLE = await redemptionsBase.ADD_TOKEN_ROLE()
        REMOVE_TOKEN_ROLE = await redemptionsBase.REMOVE_TOKEN_ROLE()
    })

    beforeEach(async () => {
        const daoReceipt = await daoFactory.newDAO(rootAccount)
        const dao = await Kernel.at(getLog(daoReceipt, 'DeployDAO', 'dao'))
        const acl = await ACL.at(await dao.acl())
        await acl.createPermission(rootAccount, dao.address, APP_MANAGER_ROLE, rootAccount, {from: rootAccount})

        const newVaultAppReceipt = await dao.newAppInstance('0x5678', vaultBase.address, '0x', false, {from: rootAccount})
        vault = await Redemptions.at(deployedContract(newVaultAppReceipt))

        const newRedemptionsAppReceipt = await dao.newAppInstance('0x1234', redemptionsBase.address, '0x', false, {from: rootAccount})
        redemptions = await Redemptions.at(deployedContract(newRedemptionsAppReceipt))

        await acl.createPermission(ANY_ADDRESS, redemptions.address, REDEEM_ROLE, rootAccount, {from: rootAccount})
        await acl.createPermission(ANY_ADDRESS, redemptions.address, ADD_TOKEN_ROLE, rootAccount, {from: rootAccount})
        await acl.createPermission(ANY_ADDRESS, redemptions.address, REMOVE_TOKEN_ROLE, rootAccount, {from: rootAccount})

        const miniMeTokenFactory = await MiniMeTokenFactory.new()
        console.log("CREATED FACTORY")
        redeemableToken = await MiniMeToken.new(miniMeTokenFactory.address, ZERO_ADDRESS, 0, 'RedeemableToken', 18, 'RDT', true)
        console.log("CREATED TOKEN")
    })

    it('initial vault token addresses should be set correctly', async () => {
        const expectedTokenAddresses = [accounts[0], accounts[1]]

        await redemptions.initialize(vault.address, redeemableToken.address, expectedTokenAddresses)

        const actualTokenAddresses = await redemptions.getVaultTokens()
        assert.deepStrictEqual(actualTokenAddresses, expectedTokenAddresses)
    })

    // it('should not be decremented if already 0', async () => {
    //     redemptions.initialize()
    //     return assertRevert(async () => {
    //         return redemptions.decrement(1)
    //     })
    // })
})

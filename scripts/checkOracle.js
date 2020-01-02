// artifacts
const Kernel = this.artifacts.require('Kernel')
const ACL = this.artifacts.require('ACL')
const IACLOracle = this.artifacts.require('IACLOracle')
const Redemptions = this.artifacts.require('Redemptions')

const BN = require('bn.js')

const ANY_ENTITY = '0x'.padEnd(42, 'f')

const web3 = this.web3
const { soliditySha3 } = require('web3-utils')

// role
const ROLE = soliditySha3('REDEEM_ROLE')

// params
const ID = 'ORACLE_PARAM_ID'
const OP = 'EQ'

module.exports = async () => {
  const args = process.argv.slice(6)
  const [redemptionsAddress, oracleAddress, sender] = args

  console.log('Redemptions:', redemptionsAddress, 'Oracle:', oracleAddress, 'Sender:', sender)

  try {
    const redemptions = await Redemptions.at(redemptionsAddress)

    console.log('Redemptions:')
    const canPerform = await redemptions.canPerform(sender, ROLE, [sender])
    console.log('(canPerform)', canPerform)

    console.log('ACL:')
    const kernel = await Kernel.at(await redemptions.kernel())
    const acl = await ACL.at(await kernel.acl())

    // Check if permission params setted correctly
    const permissionParamsLength = await acl.getPermissionParamsLength(
      ANY_ENTITY,
      redemptionsAddress,
      ROLE
    )
    console.log('permission params length:', permissionParamsLength)

    const permissionParams = await acl.getPermissionParam(
      ANY_ENTITY,
      redemptionsAddress,
      ROLE,
      new BN('0')
    )
    console.log('permission params:', permissionParams)

    // get permission params hash
    const paramHash = await getPermissionParamsHash(acl, redemptionsAddress, ROLE)
    console.log('param hash', paramHash)
    // evauluate logic (performs the call to the oracle)
    const evalparams = await acl.evalParams(paramHash, ANY_ENTITY, redemptionsAddress, ROLE, [
      sender,
    ])
    console.log('evalparams result', evalparams)

    console.log('Oracle:')
    const oracle = await IACLOracle.at(oracleAddress)
    const canPerformOracle = await oracle.canPerform(ANY_ENTITY, ANY_ENTITY, '0x', [sender])
    console.log('canPerform', canPerformOracle)
  } catch (err) {
    console.error(err)
  }
}

function getPermissionParamsHash(acl, where, what) {
  return new Promise((resolve, reject) => {
    acl.contract.getPastEvents(
      'SetPermissionParams',
      { filter: { entity: ANY_ENTITY, app: where, role: what }, fromBlock: 0 },
      (error, events) => {
        if (error) console.log('Error getting events:', error)
        console.log('events', events)
        resolve(events[0].returnValues.paramsHash)
      }
    )
  })
}

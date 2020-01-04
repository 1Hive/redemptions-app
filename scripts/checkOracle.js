// artifacts
const Kernel = artifacts.require('Kernel')
const ACL = artifacts.require('ACL')
const Oracle = artifacts.require('IACLOracle')
const Redemptions = artifacts.require('Redemptions')

const BN = require('bn.js')
const ANY_ENTITY = '0x'.padEnd(42, 'f')

const ORACLE_PARAM_ID = '203' // ORACLE_PARAM_ID
const OP = '1' // EQ

module.exports = async () => {
  const args = process.argv.slice(6)
  const [redemptionsAddress, oracleAddress, sender] = args

  console.log(
    'Args: Redemptions:',
    redemptionsAddress,
    'Oracle:',
    oracleAddress,
    'Sender:',
    sender,
    '\n'
  )

  try {
    // Contract Redemptions
    const redemptions = await Redemptions.at(redemptionsAddress)
    const ROLE = await redemptions.REDEEM_ROLE()

    console.log('Contract: Redemptions \n')

    console.log(`Calling canPerform(address _sender, bytes32 _role, uint256[] _params)`)
    console.log(`Params: ${sender}, ${ROLE}, [${sender}]`)
    const redemptionsCanPerform = await redemptions.canPerform(sender, ROLE, [sender])
    console.log('Result: ', redemptionsCanPerform)
    writeEnd()
    // Contract Redemptions END

    // Contract ACL
    console.log('Contract ACL \n')
    const kernel = await Kernel.at(await redemptions.kernel())
    const acl = await ACL.at(await kernel.acl())

    // Check if permission params setted correctly
    console.log('Checking if permission setted correctly with the right parameters.. \n')
    const permissionParamsLength = await acl.getPermissionParamsLength(
      ANY_ENTITY,
      redemptionsAddress,
      ROLE
    )

    if (permissionParamsLength.toString() === '1')
      console.log(`Permission parameters correct length (${permissionParamsLength})`)

    const permissionParams = await acl.getPermissionParam(
      ANY_ENTITY,
      redemptionsAddress,
      ROLE,
      new BN('0')
    )
    const permissionParamsArray = Object.values(permissionParams).map(paramBN => paramBN.toString())
    const oracleAddressNumber = new BN(oracleAddress.slice(2), 16).toString()
    if (
      permissionParamsArray[0] === ORACLE_PARAM_ID &&
      permissionParamsArray[1] === OP &&
      permissionParamsArray[2] === oracleAddressNumber
    )
      console.log('Permission parameters setted correctly \n')

    // get permission params hash (needed for evalParams ACL function)
    const paramHash = await getPermissionParamsHash(acl, redemptionsAddress, ROLE)
    // evauluate logic (performs the call to the oracle)
    console.log(
      'Calling  function evalParams(bytes32 _paramsHash, address _who, address _where, bytes32 _what, uint256[] _how)'
    )
    console.log(`Params: ${paramHash}, ${ANY_ENTITY}, ${redemptionsAddress}, ${ROLE}, [${sender}]`)
    const aclEvalParams = await acl.evalParams(paramHash, ANY_ENTITY, redemptionsAddress, ROLE, [
      sender,
    ])
    console.log('Result', aclEvalParams)
    writeEnd()
    // Contract ACL END

    // Contract Oracle
    console.log('Contract: Oracle \n')
    const oracle = await Oracle.at(oracleAddress)

    console.log('Calling  function canPerform(address, address, bytes32, uint256[] _how)')
    console.log(`Params: ${ANY_ENTITY}, ${ANY_ENTITY}, '0x', [${sender}]`)
    const canPerformOracle = await oracle.canPerform(ANY_ENTITY, ANY_ENTITY, '0x', [sender])
    console.log('Result: ', canPerformOracle)
    writeEnd()
    // Contract Oracle END

    return
  } catch (err) {
    console.error(err)
  }
}

function writeEnd() {
  console.log('-----------------------------------------------------------------------\n')
}

function getPermissionParamsHash(acl, where, what) {
  return new Promise((resolve, reject) => {
    acl.contract.getPastEvents(
      'SetPermissionParams',
      { filter: { entity: ANY_ENTITY, app: where, role: what }, fromBlock: 0 },
      (error, events) => {
        if (error) console.log('Error getting events:', error)
        resolve(events[0].returnValues.paramsHash)
      }
    )
  })
}

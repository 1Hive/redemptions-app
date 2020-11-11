pragma solidity ^0.4.24;

// Compiling with buidler fails if uncommented
// import "@aragon/abis/os/contracts/apps/AragonApp.sol";
// import "@aragon/abis/os/contracts/lib/math/SafeMath.sol";
// import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

contract IIssuance  {

    bytes32 constant public ADD_POLICY_ROLE = keccak256("ADD_POLICY_ROLE");
    bytes32 constant public REMOVE_POLICY_ROLE = keccak256("REMOVE_POLICY_ROLE");

    uint64 public constant PCT_BASE = 10 ** 18; // 0% = 0; 1% = 10^16; 100% = 10^18
    uint64 public constant BLOCKS_PER_YEAR = 2102400;


    struct Policy {
        bool active;
        address beneficiary;
        uint256 blockInflationRate;
    }

    address public tokenManager;
    address public token;

    mapping (uint256 => Policy) public policies;
    uint256 public lastMintBlockNumber;
    /**
     * @param _tokenManager TokenManager instance that controls the token being issued
     */
    function initialize(address _tokenManager) public;

    /**
     * @notice Add a new issuance policy of `@formatPct(_blockInflationRate * self.BLOCKS_PER_YEAR(): uint256)`% for `_beneficiary`
     * @param _beneficiary Address that will receive tokens minted from inflation
     * @param _blockInflationRate Percentage of the token's total supply that will be issued per block (expressed as a percentage of 10^18; eg. 10^16 = 1%, 10^18 = 100%)
     */
    function addPolicy(address _beneficiary, uint256 _blockInflationRate) external;


    /**
     * @notice Remove policy with id `_policyId`
     * @param _policyId Id of the policy being removed
     */
    function removePolicy(uint256 _policyId) external;


    /**
     * @notice Execute minting for all issuance policies
     */
    function executeIssuance() public;

    /**
     * @param _policyId Id of the policy being checked
     * @return Amount of tokens that would be minted on execution
     */
    function getMintAmountForPolicy(uint256 _policyId) public view returns (uint256 amount);
}

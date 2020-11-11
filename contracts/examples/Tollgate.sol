pragma solidity 0.4.24;

contract Tollgate {

    bytes32 public constant CHANGE_AMOUNT_ROLE = keccak256("CHANGE_AMOUNT_ROLE");
    bytes32 public constant CHANGE_DESTINATION_ROLE = keccak256("CHANGE_DESTINATION_ROLE");

    string private constant ERROR_CAN_NOT_FORWARD = "TOLLGATE_CAN_NOT_FORWARD";
    string private constant ERROR_INVALID_FEE_TOKEN = "TOLLGATE_INVALID_FEE_TOKEN";
    string private constant ERROR_INVALID_FEE_AMOUNT = "TOLLGATE_INVALID_FEE_AMOUNT";
    string private constant ERROR_INVALID_FEE_DESTINATION = "TOLLGATE_INVALID_FEE_DESTINATION";
    string private constant ERROR_FEE_TRANSFER_REVERTED = "TOLLGATE_FEE_TRANSFER_REVERTED";

    address public feeToken;
    uint256 public feeAmount;
    address public feeDestination;

    event ChangeFeeAmount(uint256 previousAmount, uint256 newAmount);
    event ChangeFeeDestination(address indexed previousDestination, address indexed newDestination);

    /**
    * @notice Initialize Tollgate with fee of `@tokenAmount(_feeToken, _feeAmount)`
    * @param _feeToken ERC20 address for the fee token
    * @param _feeAmount Amount of tokens collected as a fee on each forward
    * @param _feeDestination Destination for collected fees
    */
    function initialize(address _feeToken, uint256 _feeAmount, address _feeDestination) external;

    /**
    * @notice Change fee to `@tokenAmount(self.feeToken(): address, _feeAmount)`
    * @param _feeAmount Fee amount
    */
    function changeFeeAmount(uint256 _feeAmount) external;

    /**
    * @notice Change fee destination to `_feeDestination`
    * @param _feeDestination Destination for collected fees
    */
    function changeFeeDestination(address _feeDestination) external;

    // Forwarding fns

    /**
    * @notice Tells the forward fee token and amount of the Tollgate app
    * @dev IFeeForwarder interface conformance
    * @return Forwarder fee token address
    * @return Forwarder fee amount
    */
    function forwardFee() external view returns (address, uint256);

    /**
    * @notice Tells whether the Tollgate app is a forwarder or not
    * @dev IForwarder interface conformance
    * @return Always true
    */
    function isForwarder() external pure returns (bool);

    /**
    * @notice Execute desired action after paying `@tokenAmount(self.feeToken(): address, self.feeAmount(): uint256)`
    * @dev IForwarder interface conformance. Forwards any action if the sender pays the configured amount.
    * @param _evmScript Script being executed
    */
    function forward(bytes _evmScript) public;

    /**
    * @notice Tells whether the _sender can forward actions or not
    * @dev IForwarder interface conformance. It assumes the sender can always forward actions through the Tollgate app.
    * @return Always true unless app it's not initialized
    */
    function canForward(address, bytes) public view returns (bool);
}

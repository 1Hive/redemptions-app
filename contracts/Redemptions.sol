pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/common/EtherTokenConstant.sol";
import "./lib/ArrayUtils.sol";


contract Redemptions is AragonApp {
    using SafeMath for uint256;
    using ArrayUtils for address[];

    bytes32 constant public REDEEM_ROLE = keccak256("REDEEM_ROLE");
    bytes32 constant public ADD_TOKEN_ROLE = keccak256("ADD_TOKEN_ROLE");
    bytes32 constant public REMOVE_TOKEN_ROLE = keccak256("REMOVE_TOKEN_ROLE");

    string private constant ERROR_VAULT_IS_NOT_CONTRACT = "REDEMPTIONS_VAULT_NOT_CONTRACT";
    string private constant ERROR_TOKEN_MANAGER_IS_NOT_CONTRACT = "REDEMPTIONS_TOKEN_MANAGER_NOT_CONTRACT";
    string private constant ERROR_CANNOT_ADD_TOKEN_MANAGER = "REDEMPTIONS_CANNOT_ADD_TOKEN_MANAGER";
    string private constant ERROR_TOKEN_ALREADY_ADDED = "REDEMPTIONS_TOKEN_ALREADY_ADDED";
    string private constant ERROR_TOKEN_NOT_CONTRACT = "REDEMPTIONS_TOKEN_NOT_CONTRACT";
    string private constant ERROR_NOT_VAULT_TOKEN = "REDEMPTIONS_NOT_VAULT_TOKEN";
    string private constant ERROR_CANNOT_REDEEM_ZERO = "REDEMPTIONS_CANNOT_REDEEM_ZERO";
    string private constant ERROR_INSUFFICIENT_BALANCE = "REDEMPTIONS_INSUFFICIENT_BALANCE";
    string private constant ERROR_INCORRECT_MESSAGE = "REDEMPTIONS_INCORRECT_MESSAGE";

    Vault public vault;
    TokenManager public tokenManager;
    MiniMeToken public token;              //temporary workaround, to show amount of tokens on radspecs's redeem function

    mapping(address => bool) public tokenAdded;
    address[] public redemptionTokenList;

    event AddToken(address indexed token);
    event RemoveToken(address indexed token);
    event Redeem(address indexed redeemer, uint256 amount);

    /**
    * @notice Initialize Redemptions app contract
    * @param _vault Address of the vault
    * @param _tokenManager TokenManager address
    */
    function initialize(Vault _vault, TokenManager _tokenManager) external onlyInit {
        initialized();

        require(isContract(_vault), ERROR_VAULT_IS_NOT_CONTRACT);
        require(isContract(_tokenManager), ERROR_TOKEN_MANAGER_IS_NOT_CONTRACT);

        vault = _vault;
        tokenManager = _tokenManager;
        token = _tokenManager.token();
    }

    /**
    * @notice Add ` _token.symbol(): string` token to redemption list
    * @param _token token address
    */
    function addToken(address _token) external auth(ADD_TOKEN_ROLE) {
        require(_token != address(tokenManager), ERROR_CANNOT_ADD_TOKEN_MANAGER);
        require(!tokenAdded[_token], ERROR_TOKEN_ALREADY_ADDED);

        if (_token != ETH) {
            require(isContract(_token), ERROR_TOKEN_NOT_CONTRACT);
        }

        tokenAdded[_token] = true;
        redemptionTokenList.push(_token);

        emit AddToken(_token);
    }

    /**
    * @notice Remove `_token.symbol(): string` token from redemption list
    * @param _token token address
    */
    function removeToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
        require(tokenAdded[_token], ERROR_NOT_VAULT_TOKEN);

        tokenAdded[_token] = false;
        redemptionTokenList.deleteItem(_token);

        emit RemoveToken(_token);
    }

    /**
    * @dev Redeem function is intended to only be used directly, using a forwarder will not work see: https://github.com/1Hive/redemptions-app/issues/78
    * @notice Redeem `@tokenAmount(self.token(): address, _amount, true)` tokens
    * @param _amount amount of tokens
    */
    function redeem(uint256 _amount) external auth(REDEEM_ROLE) {
        require(_amount > 0, ERROR_CANNOT_REDEEM_ZERO);
        require(tokenManager.spendableBalanceOf(msg.sender) >= _amount, ERROR_INSUFFICIENT_BALANCE);

        uint256 redemptionAmount;
        uint256 tokenBalance;
        uint256 totalSupply = tokenManager.token().totalSupply();

        for (uint256 i = 0; i < redemptionTokenList.length; i++) {
            tokenBalance = vault.balance(redemptionTokenList[i]);

            redemptionAmount = _amount.mul(tokenBalance).div(totalSupply);
            if (redemptionAmount > 0)
                vault.transfer(redemptionTokenList[i], msg.sender, redemptionAmount);
        }

        tokenManager.burn(msg.sender, _amount);

        emit Redeem(msg.sender, _amount);
    }

    /**
    * @notice Get tokens from redemption list
    * @return token addresses
    */
    function getTokens() public view returns (address[]) {
        return redemptionTokenList;
    }
}

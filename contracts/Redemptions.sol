pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "./ArrayUtils.sol";

contract Redemptions is AragonApp {
    using SafeMath for uint256;
    using ArrayUtils for address[];

    bytes32 constant public REDEEM_ROLE = keccak256("REDEEM_ROLE");
    bytes32 constant public ADD_TOKEN_ROLE = keccak256("ADD_TOKEN_ROLE");
    bytes32 constant public REMOVE_TOKEN_ROLE = keccak256("REMOVE_TOKEN_ROLE");

    string private constant ERROR_VAULT_NOT_CONTRACT = "REDEMPTIONS_VAULT_NOT_CONTRACT";
    string private constant ERROR_TOKEN_MANAGER_NOT_CONTRACT = "REDEMPTIONS_TOKEN_MANAGER_NOT_CONTRACT";
    string private constant ERROR_TOKEN_NOT_CONTRACT = "REDEMPTIONS_TOKEN_NOT_CONTRACT";
    string private constant ERROR_TOKEN_NOT_TOKEN_MANAGER = "REDEMPTIONS_TOKEN_NOT_TOKEN_MANAGER";
    string private constant ERROR_TOKEN_ALREADY_ADDED = "REDEMPTIONS_TOKEN_ALREADY_ADDED";
    string private constant ERROR_NOT_VAULT_TOKEN = "REDEMPTIONS_NOT_VAULT_TOKEN";
    string private constant ERROR_CANNOT_REDEEM_ZERO = "REDEMPTIONS_CANNOT_REDEEM_ZERO";
    string private constant ERROR_INSUFFICIENT_BALANCE = "REDEMPTIONS_INSUFFICIENT_BALANCE";

    Vault public vault;
    TokenManager public tokenManager;

    mapping(address => bool) public tokenAdded;
    address[] public redemptionTokenList;

    event AddToken(address indexed token);
    event RemoveToken(address indexed token);
    event Redeem(address indexed receiver, uint256 amount);

    /**
    * @notice Initialize Redemptions app contract
    * @param _vault Address of the vault
    * @param _tokenManager TokenManager address
    * @param _redemptionTokenList token addreses
    */
    function initialize(Vault _vault, TokenManager _tokenManager, address[] _redemptionTokenList) external onlyInit {
        initialized();

        require(isContract(_vault), ERROR_VAULT_NOT_CONTRACT);
        require(isContract(_tokenManager), ERROR_TOKEN_MANAGER_NOT_CONTRACT);

        vault = _vault;
        tokenManager = _tokenManager;
        redemptionTokenList = _redemptionTokenList;

        for (uint i = 0; i < _redemptionTokenList.length; i++) {
            tokenAdded[_redemptionTokenList[i]] = true;
        }
    }

    /**
    * @notice Add token `_token` to redemption list
    * @param _token token address
    */
    function addToken(address _token) external auth(ADD_TOKEN_ROLE) {
        require(_token != address(tokenManager), ERROR_TOKEN_NOT_TOKEN_MANAGER);
        require(!tokenAdded[_token], ERROR_TOKEN_ALREADY_ADDED);
        require(isContract(_token), ERROR_TOKEN_NOT_CONTRACT);

        tokenAdded[_token] = true;
        redemptionTokenList.push(_token);

        emit AddToken(_token);
    }

    /**
    * @notice Remove token `_token` from redemption list
    * @param _token token address
    */
    function removeToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
        require(tokenAdded[_token], ERROR_NOT_VAULT_TOKEN);

        tokenAdded[_token] = false;
        redemptionTokenList.deleteItem(_token);

        emit RemoveToken(_token);
    }

    /**
    * @notice Redeem `_amount` redeemable tokens
    * @param _amount amount of tokens
    */
    function redeem(uint256 _amount) external auth(REDEEM_ROLE) {
        require(_amount > 0, ERROR_CANNOT_REDEEM_ZERO);
        require(spendableBalanceOf(msg.sender) >= _amount, ERROR_INSUFFICIENT_BALANCE);

        uint256 redemptionAmount;

        for (uint256 i = 0; i < redemptionTokenList.length; i++) {
            redemptionAmount = _amount.mul(vault.balance(redemptionTokenList[i])).div(totalSupply());
            vault.transfer(redemptionTokenList[i], msg.sender, redemptionAmount);
        }

        tokenManager.burn(msg.sender, _amount);

        emit Redeem(msg.sender, _amount);
    }

    /**
    * @notice Get redeemable token total supply
    * @return total supply
    */
    function totalSupply() public view returns (uint256) {
        return tokenManager.token().totalSupply();
    }


   /**
    * @notice Get spendable balance of address
    * @return spendable balance of holder
    */
    function spendableBalanceOf(address holder) public view returns (uint256) {
        return tokenManager.spendableBalanceOf(holder);
    }

    /**
    * @notice Get tokens from redemption list
    * @return token addresses
    */
    function getTokens() public view returns (address[]) {
        return redemptionTokenList;
    }

}

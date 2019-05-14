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
    string private constant ERROR_TOKEN_MANAGER = "REDEMPTIONS_TOKEN_MANAGER";
    string private constant ERROR_TOKEN_ALREADY_ADDED = "REDEMPTIONS_TOKEN_ALREADY_ADDED";
    string private constant ERROR_TOKEN_NOT_CONTRACT = "REDEMPTIONS_TOKEN_NOT_CONTRACT";
    string private constant ERROR_NOT_VAULT_TOKEN = "REDEMPTIONS_NOT_VAULT_TOKEN";
    string private constant ERROR_CANNOT_REDEEM_ZERO = "REDEMPTIONS_CANNOT_REDEEM_ZERO";
    string private constant ERROR_INSUFFICIENT_BALANCE = "REDEMPTIONS_INSUFFICIENT_BALANCE";
    string private constant ERROR_VAULT_CANNOT_REDEEM = "REDEMPTIONS_VAULT_CANNOT_REDEEM";
    string private constant ERROR_TOKEN_MANAGER_CANNOT_REDEEM = "REDEMPTIONS_TOKEN_MANAGER_CANNOT_REDEEM";

    Vault public vault;
    TokenManager public tokenManager;

    mapping(address => bool) public tokenAdded;
    address[] public vaultTokens;

    event Redeem(address indexed receiver, uint256 amount);

    /**
    * @notice Initialize
    * @param _vault Address of the vault
    * @param _tokenManager TokenManager address
    * @param _vaultTokens token addreses
    */
    function initialize(Vault _vault, TokenManager _tokenManager, address[] _vaultTokens) external onlyInit {
        initialized();

        require(isContract(_vault), ERROR_VAULT_NOT_CONTRACT);

        vault = _vault;
        tokenManager = _tokenManager;
        vaultTokens = _vaultTokens;

        for (uint i = 0; i < _vaultTokens.length; i++) {
            tokenAdded[_vaultTokens[i]] = true;
        }
    }

    /**
    * @notice Add token to vault
    * @param _token token address
    */
    function addVaultToken(address _token) external auth(ADD_TOKEN_ROLE) {
        require(_token != address(tokenManager), ERROR_TOKEN_MANAGER);
        require(!tokenAdded[_token], ERROR_TOKEN_ALREADY_ADDED);
        require(isContract(_token), ERROR_TOKEN_NOT_CONTRACT);

        tokenAdded[_token] = true;
        vaultTokens.push(_token);
    }

    /**
    * @notice Remove token from vault
    * @param _token token address
    */
    function removeVaultToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
        require(tokenAdded[_token], ERROR_NOT_VAULT_TOKEN);

        tokenAdded[_token] = false;
        vaultTokens.deleteItem(_token);
    }

    /**
    * @notice Redeem tokens from vault
    * @param _amount amount of tokens
[]    */
    function redeem(uint256 _amount) external auth(REDEEM_ROLE) {
        require(_amount > 0, ERROR_CANNOT_REDEEM_ZERO);
        require(tokenManager.spendableBalanceOf(msg.sender) >= _amount, ERROR_INSUFFICIENT_BALANCE);
        require(msg.sender != address(vault), ERROR_VAULT_CANNOT_REDEEM);
        require(msg.sender != address(tokenManager), ERROR_TOKEN_MANAGER_CANNOT_REDEEM);

        uint256 redemptionAmount;

        for (uint256 i = 0; i < vaultTokens.length; i++) {
            redemptionAmount = _amount.mul(vault.balance(vaultTokens[i])).div(tokenManager.token().totalSupply());
            vault.transfer(vaultTokens[i], msg.sender, redemptionAmount);
        }
        
        tokenManager.burn(msg.sender, _amount);

        emit Redeem(msg.sender, _amount);
    }

    /**
    * @notice Get tokens from vault
    * @return token addresses 
    */
    function getVaultTokens() public view returns (address[]) {
        return vaultTokens;
    }

}

pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import "./ArrayUtils.sol";

contract Redemptions is AragonApp {
    using SafeMath for uint256;
    using ArrayUtils for address[];

    bytes32 constant public REDEEM_ROLE = keccak256("REDEEM_ROLE");
    bytes32 constant public ADD_TOKEN_ROLE = keccak256("ADD_TOKEN_ROLE");
    bytes32 constant public REMOVE_TOKEN_ROLE = keccak256("REMOVE_TOKEN_ROLE");

    string private constant ERROR_VAULT_NOT_CONTRACT = "REDEMPTIONS_VAULT_NOT_CONTRACT";
    string private constant ERROR_REDEEMABLE_TOKEN = "REDEMPTIONS_REDEEMABLE_TOKEN";
    string private constant ERROR_TOKEN_ALREADY_ADDED = "REDEMPTIONS_TOKEN_ALREADY_ADDED";
    string private constant ERROR_NOT_VAULT_TOKEN = "REDEMPTIONS_NOT_VAULT_TOKEN";
    string private constant ERROR_CANNOT_REDEEM_ZERO = "REDEMPTIONS_CANNOT_REDEEM_ZERO";
    string private constant ERROR_INSUFFICIENT_BALANCE = "REDEMPTIONS_INSUFFICIENT_BALANCE";
    string private constant ERROR_THIS_CONTRACT_CANNOT_REDEEM = "REDEMPTIONS_THIS_CONTRACT_CANNOT_REDEEM";
    string private constant ERROR_VAULT_CANNOT_REDEEM = "REDEMPTIONS_VAULT_CANNOT_REDEEM";
    string private constant ERROR_TOKEN_CANNOT_REDEEM = "REDEMPTIONS_TOKEN_CANNOT_REDEEM";
    string private constant ERROR_CANNOT_DESTROY_TOKENS= "REDEMPTIONS_CANNOT_DESTROY_TOKENS";

    mapping(address => bool) public tokens;
    address[] public vaultTokens;

    MiniMeToken public redeemableToken;
    Vault public vault;

    event Redeem(address indexed receiver, uint256 amount);

    /**
    * @notice Initialize
    * @param _vault Address of the vault
    * @param _redeemableToken MiniMeToken address
    */
    function initialize(Vault _vault, MiniMeToken _redeemableToken, address[] memory _vaultTokens) external onlyInit {
        initialized();

        require(isContract(_vault), ERROR_VAULT_NOT_CONTRACT);

        vault = _vault;
        redeemableToken = _redeemableToken;

        for (uint i = 0; i < _vaultTokens.length; i++) {
            tokens[_vaultTokens[i]] = true;
            vaultTokens.push(_vaultTokens[i]);  // TODO: Can just do 'vaultTokens = _vaultTokens;' but not if we expect vault tokens to be populated before init
        }
    }

    function addVaultToken(address _token) external auth(ADD_TOKEN_ROLE) {
        require(_token != address(redeemableToken), ERROR_REDEEMABLE_TOKEN);
        require(!tokens[_token], ERROR_TOKEN_ALREADY_ADDED);

        tokens[_token] = true;
        vaultTokens.push(_token);
    }

    function removeVaultToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
        require(tokens[_token], ERROR_NOT_VAULT_TOKEN);

        vaultTokens.deleteItem(_token);
    }

    function redeem(uint256 _amount) external auth(REDEEM_ROLE) {
        require(_amount > 0, ERROR_CANNOT_REDEEM_ZERO);
        require(redeemableToken.balanceOf(msg.sender) >= _amount, ERROR_INSUFFICIENT_BALANCE);
        require(msg.sender != this, ERROR_THIS_CONTRACT_CANNOT_REDEEM);
        require(msg.sender != address(vault), ERROR_VAULT_CANNOT_REDEEM);
        require(msg.sender != address(redeemableToken), ERROR_TOKEN_CANNOT_REDEEM);

        uint256 redemptionAmount;

        for (uint256 i = 0; i < vaultTokens.length; i++) {
            redemptionAmount = _amount.mul(vault.balance(vaultTokens[i])).div(redeemableToken.totalSupply);
            vault.transfer(vaultTokens[i], _receiver, redemptionAmount);
        }

        require(redeemableToken.destroyTokens(_receiver, _amount), ERROR_CANNOT_DESTROY_TOKENS);

        emit Redeem(_receiver, _amount);
    }

}

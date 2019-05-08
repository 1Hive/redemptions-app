pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";

import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/apps-vault/contracts/Vault.sol";


contract Redemptions is AragonApp {
    using SafeMath for uint256;

    bytes32 constant public REDEEM_ROLE = keccak256("REDEEM_ROLE");
    bytes32 constant public ADD_TOKEN_ROLE = keccak256("ADD_TOKEN_ROLE");
    bytes32 constant public REMOVE_TOKEN_ROLE = keccak256("REMOVE_TOKEN_ROLE");

    // Add more error messages
    string private constant ERROR_VAULT_NOT_CONTRACT="ERROR_VAULT_NOT_CONTRACT";
    string private constant ERROR_CAN_NOT_REDEEM = "CAN_NOT_REDEEM";

    mapping (address => bool) public tokens;
    address[] public vaultTokens;

    MiniMeToken public redeemableToken;
    Vault public vault;

    event ExecuteRedeem(address indexed reciver, uint256 amount);

    /**
    * @notice Initialize
    * @param _vault Address of the vault
    * @param _redeemableToken MiniMeToken address
    */
    function initialize(Vault _vault, MiniMeToken _redeemableToken, address[] _tokens) external onlyInit {

        initialized();

        require(isContract(_vault), ERROR_VAULT_NOT_CONTRACT);

        vault = _vault;
        redeemableToken = _redeemableToken;

        for (uint i = 0; i < _tokens.length; i++) {
            tokens[_tokens[i]] = true;
            vaultTokens.push(_tokens[i]);
        }

    }

    function addValutToken(address _token) external auth(ADD_TOKEN_ROLE) {
        require(_token != address(redeemableToken));
        require(!tokens[_token]);
        tokens[_token] = true;
        vaultTokens.push(_token);
    }

    function removeVaultToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
        require(tokens[_token]);
        // Delete token
    }


    function redeem(uint256 _amount) external auth(REDEEM_ROLE) {
        if (_amount == 0) {
            return true;
        }
        require(canRedeem(msg.sender, _amount), ERROR_CAN_NOT_REDEEM);
        require ((msg.sender != this) && (msg.sender != address(vault)) && (msg.sender != address(redeemableToken));
        _redeem(msg.sender, _amount);
    }

    function canRedeem(address _sender) public view returns (bool) {
        return redeemableToken.balanceOfAt(_sender) > 0 && redeemableToken.balanceOfAt(_sender) >= _amount;
    }

    // Internal functions
    function _redeem(address _receiver, uint256 _amount) internal {

        uint256[] storage amounts;
        uint256 redemptionAmount;

        for (uint i = 0; i < vaultTokens.length; i++) {
            redemptionAmount = (_amount / redeemableToken.totalSupply) * vault.balance(vaultTokens[i]);
            amounts.push(redemptionAmount);

        require(redeemableToken.destroyTokens(_receiver, _amount));

        for (uint i = 0; i < amounts.length; i++) {
            vault.transfer(vaultTokens[i], _receiver, amounts[i]);

        emit ExecuteRedeem(_receiver, _amount)
    }

}

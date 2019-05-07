pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";

import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/apps-vault/contracts/Vault.sol";


contract Redemptions is AragonApp {
    using SafeMath for uint256;

    bytes32 constant public REDEEM_ROLE = keccak256("REDEEM_ROLE");

    string private constant ERROR_CAN_NOT_REDEEM = "CAN_NOT_REDEEM";
    string private constant ERROR_VAULT_NOT_CONTRACT= "ERROR_VAULT_NOT_CONTRACT";

    MiniMeToken public token;
    Vault public vault;

    event ExecuteRedeem(address indexed reciver, uint256 amount);

    /**
    * @notice Initialize
    * @param _vault Address of the vault
    * @param _token MiniMeToken address
    */
    function initialize(Vault _vault, MiniMeToken _token) external onlyInit {
        initialized();

        require(isContract(_vault), ERROR_VAULT_NOT_CONTRACT);
        vault = _vault;
        token = _token;

    }

    function redeem(uint256 _amount) external auth(REDEEM_ROLE) {
        if (_amount == 0) {
            return true;
        }
        require(canRedeem(msg.sender), ERROR_CAN_NOT_REDEEM);
        require ((msg.sender != this) && (msg.sender != address(vault)) && (msg.sender != address(token));
        _redeem(msg.sender, _amount);
    }

    function canRedeem(address _sender) public view returns (bool) {
        return token.balanceOfAt(_sender) > 0;
    }

    // Internal functions
    function _redeem(address _receiver, uint256 _amount) internal {
        // If the amount being transfered is more than the balance of the
        //  account the transfer returns false
        uint256 previousBalanceMember = token.balanceOfAt(_receiver, block.number);
        if (previousBalanceMember < _amount) {
            return false;
        }
        //USE SAFEMATH HERE
        uint256 redemptionAmount = (vault.balance(address(0))/token.totalSupply) * _amount;

        require(token.destroyTokens(_receiver,_amount));

        // We use ETH as first use-case
        vault.transfer(address(0), _receiver, _amount);

        emit ExecuteRedeem(_receiver, _amount)
    }

}

pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";

import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/apps-vault/contracts/Vault.sol";


contract Redemptions is AragonApp {
    using SafeMath for uint256;

    /// Events

    /// State
    mapping (address => bool) public members;
    address[] public memberList;

    MiniMeToken public token;
    Vault public vault;

    /// ACL
    bytes32 constant public ADD_MEMBER_ROLE = keccak256("ADD_MEMBER_ROLE");
    bytes32 constant public REDEME_ROLE = keccak256("REDEME_ROLE");

    string private constant ERROR_VAULT_NOT_CONTRACT = "ERROR_VAULT_NOT_CONTRACT";

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

    //WE ARE NOT SURE IF THIS IS NEEDED
    function addParticipant(address _member) external auth(ADD_MEMBER_ROLE) {
        memberList.push(_member) - 1;
        members[_member] = true;
        return true;
    }

    function redeem(address _member, uint256 _amount) external auth(REDEME_ROLE) {
        if (_amount == 0) {
            return true;
        }
        require ((address(_member) != this) && (addres(_member) != address(vault)) && (address(_member) != address(token));
        // If the amount being transfered is more than the balance of the
        //  account the transfer returns false
        var previousBalanceMember = token.balanceOfAt(_member, block.number);
        if (previousBalanceMember < _amount) {
            return false;
        }
        //USE SAFEMATH HERE
        var redemptionAmount = (vault.balance(0)/token.totalSupply) * _amount;
        require(token.destroyTokens(_member,_amount));

        //SOMEHOW SEND THE MONEY TO MEMBER

    }

    // Redem token
        // Get total supply
        // Get vault amount
        // Calculate how much to redem
        // Burn tokens (we have to do this first to prevent reentry issue)
        // Send vault amount to member

}

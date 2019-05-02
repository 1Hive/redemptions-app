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
    // bytes32 constant public REDEME_ROLE = keccak256("REDEME_ROLE");

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

    function addParticipant(uint256 step) external auth(ADD_MEMBER_ROLE) {

        //
    }

    // Redem token
        // Get total supply
        // Get vault amount
        // Calculate how much to redem
        // Burn tokens (we have to do this first to prevent reentry issue)
        // Send vault amount to member

}

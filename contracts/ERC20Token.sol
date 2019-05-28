
pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract ERC20Token is ERC20, ERC20Detailed {

   constructor(address owner, string name, string symbol, uint8 decimals) ERC20Detailed(name,symbol, decimals) public {
      _mint(owner,100000e18);
   }
}
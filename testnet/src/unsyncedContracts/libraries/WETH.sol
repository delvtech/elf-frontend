// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/drafts/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WETH is ERC20Permit {
    using SafeERC20 for IERC20;
    using Address for address;

    constructor(address sender)
        ERC20("Wrapped Ether", "WETH")
        ERC20Permit("Wrapped Ether")
    {
        _setupDecimals(18);
        mint(sender, 1000000000000000000000000000000000000000);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}

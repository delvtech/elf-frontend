// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../contracts/libraries/Address.sol";
import "../../contracts/libraries/ERC20Permit.sol";
import "../../contracts/libraries/SafeERC20.sol";
import "../../contracts/interfaces/IERC20.sol";

contract USDC is ERC20Permit {
    using SafeERC20 for IERC20;
    using Address for address;

    constructor(address sender)
        ERC20("USD Coin", "USDC")
        ERC20Permit("USD Coin")
    {
        _setupDecimals(6);
        mint(sender, 1e6 * 1000000);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}

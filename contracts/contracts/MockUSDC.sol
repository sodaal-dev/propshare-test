// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice Test ERC20 with 6 decimals. Anyone can mint — for local/dev use only.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}

    /// @inheritdoc ERC20
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint `amount` tokens to `to`. Unrestricted for testing.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

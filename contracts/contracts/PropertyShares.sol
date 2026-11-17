// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PropertyShares
/// @notice ERC20 share tokens for a single property, with pro-rata rent distribution.
/// @dev HINT (for candidates): rent accounting is typically done with a
///      "dividend-per-share" / magnified accumulator pattern so each holder's
///      claimable rent can be tracked without iterating over all holders on
///      every deposit or transfer. Design your storage and `_update` accordingly.
contract PropertyShares is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Maximum number of shares that can ever be minted.
    uint256 public constant MAX_SUPPLY = 1000;

    /// @notice Immutable mUSDC token used for purchases and rent.
    IERC20 public immutable usdc;

    /// @notice Address authorized to deposit rent.
    address public manager;

    /// @notice Price of one share in mUSDC units (6 decimals).
    uint256 public pricePerShare;

    event SharesPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RentDeposited(uint256 amount);
    event RentClaimed(address indexed holder, uint256 amount);

    error NotManager();
    error ExceedsMaxSupply();
    error ZeroAmount();
    error NothingToClaim();

    /// @param usdc_ Address of the MockUSDC (or real USDC) token.
    /// @param manager_ Address allowed to call `depositRent`.
    /// @param pricePerShare_ Cost of one share in mUSDC base units (6 decimals).
    constructor(address usdc_, address manager_, uint256 pricePerShare_)
        ERC20("PropShare Main St", "PSMS")
        Ownable(msg.sender)
    {
        usdc = IERC20(usdc_);
        manager = manager_;
        pricePerShare = pricePerShare_;
    }

    /// @inheritdoc ERC20
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /// @notice Restricts a function to the `manager` address.
    modifier onlyManager() {
        if (msg.sender != manager) revert NotManager();
        _;
    }

    /// @notice Buy `amount` shares by paying `amount * pricePerShare` mUSDC.
    /// @dev Expected behavior (candidate implements):
    ///      - Revert with `ZeroAmount` if `amount == 0`.
    ///      - Revert with `ExceedsMaxSupply` if `totalSupply() + amount > MAX_SUPPLY`.
    ///      - Pull `cost = amount * pricePerShare` mUSDC from `msg.sender` via SafeERC20.
    ///      - Mint `amount` shares to `msg.sender`.
    ///      - Emit `SharesPurchased(msg.sender, amount, cost)`.
    /// @param amount Number of whole shares to buy (token has 0 decimals).
    function buyShares(uint256 amount) external {
        revert("NOT_IMPLEMENTED");
    }

    /// @notice Manager deposits rent in mUSDC to be claimed pro-rata by share holders.
    /// @dev Expected behavior (candidate implements):
    ///      - Only callable by `manager` (`onlyManager`).
    ///      - Revert with `ZeroAmount` if `amount == 0`.
    ///      - Pull `amount` mUSDC from the manager via SafeERC20.
    ///      - Credit the rent so that whoever held shares *at deposit time* can later
    ///        claim their pro-rata share (based on their balance when the deposit landed).
    ///      - Emit `RentDeposited(amount)`.
    /// @param amount mUSDC amount (6 decimals) to deposit as rent.
    function depositRent(uint256 amount) external onlyManager {
        revert("NOT_IMPLEMENTED");
    }

    /// @notice Claim all accrued rent owed to the caller.
    /// @dev Expected behavior (candidate implements):
    ///      - Must be reentrancy-safe (use `nonReentrant` or checks-effects-interactions).
    ///      - Compute the caller's unclaimed rent; revert `NothingToClaim` if zero.
    ///      - Update accounting so the same rent cannot be claimed twice.
    ///      - Transfer the mUSDC to `msg.sender` via SafeERC20.
    ///      - Emit `RentClaimed(msg.sender, amount)`.
    function claimRent() external nonReentrant {
        revert("NOT_IMPLEMENTED");
    }

    /// @notice Unclaimed rent (in mUSDC units) currently owed to `holder`.
    /// @dev Expected behavior (candidate implements): return the holder's accrued
    ///      but not-yet-claimed rent without modifying state.
    /// @param holder Address whose claimable rent is queried.
    /// @return The amount of mUSDC the holder can claim.
    function claimableRent(address holder) external view returns (uint256) {
        revert("NOT_IMPLEMENTED");
    }

    /// @dev Hook called on every mint, burn, and transfer.
    ///      Expected accounting (candidate implements):
    ///      Rent already earned before a transfer stays with the sender; the receiver
    ///      only earns from deposits that happen *after* they receive the shares.
    ///      Before calling `super._update`, settle / snapshot each side's rent so
    ///      balances can change without moving past entitlements.
    ///      // TODO: candidate needs to add accounting here.
    function _update(address from, address to, uint256 value) internal override {
        // TODO: candidate needs to add accounting here.
        super._update(from, to, value);
    }
}

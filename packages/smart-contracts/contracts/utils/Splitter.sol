// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error InvalidPayeeAddress();

contract Splitter {
    using SafeERC20 for IERC20;

    struct Payee {
        address account;
        uint112 amount;
    }

    constructor() {}

    /**
     * @notice Transfers pre-approved tokens to a list of recipients
     * @param token Address of the token that will be transferred
     * @param payees List of recipient addresses and amounts
     */
    function send(IERC20 token, Payee[] calldata payees) external {
        for (uint256 i = 0; i < payees.length; i++) {
            if (payees[i].account == address(0)) revert InvalidPayeeAddress();
            token.safeTransferFrom(msg.sender, payees[i].account, payees[i].amount);
        }
    }
}

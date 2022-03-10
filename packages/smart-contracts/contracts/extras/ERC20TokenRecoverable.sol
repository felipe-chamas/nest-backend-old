// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../access/AccessControllable.sol";

abstract contract ERC20TokenRecoverable is AccessControllable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    function __ERC20TokenRecoverable_init(address aclContract) internal onlyInitializing {
        __ERC20TokenRecoverable_init_unchained(aclContract);
    }

    function __ERC20TokenRecoverable_init_unchained(address aclContract) internal onlyInitializing {
        __AccessControllable_init_unchained(aclContract);
    }

    function recover(
        IERC20Upgradeable token,
        address to,
        uint256 amount
    ) external onlyAdmin {
        token.safeTransfer(to, amount);
    }
}

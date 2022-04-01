// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./extras/ERC20TokenRecoverable.sol";
import "./access/AccessControllable.sol";

// solhint-disable func-name-mixedcase
abstract contract BaseContract is ERC20TokenRecoverable, AccessControllable, UUPSUpgradeable {
    function __BaseContract_init(address acl) internal onlyInitializing {
        __BaseContract_init_unchained(acl);
    }

    function __BaseContract_init_unchained(address acl) internal onlyInitializing {
        __UUPSUpgradeable_init();
        __AccessControllable_init(acl);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    function _authorizeRecover(
        IERC20Upgradeable,
        address,
        uint256
    ) internal override onlyAdmin {}
}

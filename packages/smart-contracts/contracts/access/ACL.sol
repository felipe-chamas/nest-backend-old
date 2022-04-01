// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "./IACL.sol";
import "./Roles.sol";

contract ACL is IACL, AccessControlEnumerableUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    // solhint-disable-next-line no-empty-blocks
    constructor() initializer {}

    function initialize(address admin, address operator) external initializer {
        __UUPSUpgradeable_init();

        _grantRole(Roles.ADMIN, admin);
        if (operator != address(0)) {
            _grantRole(Roles.OPERATOR, operator);
        }
    }

    function checkRole(bytes32 role, address account) external view override {
        _checkRole(role, account);
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(Roles.ADMIN) {}
}

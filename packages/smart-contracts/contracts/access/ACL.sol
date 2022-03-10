// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./IACL.sol";
import "./Roles.sol";

contract ACL is IACL, AccessControlUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
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

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(Roles.ADMIN) {}
}

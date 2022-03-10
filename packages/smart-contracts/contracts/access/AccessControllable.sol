// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./IACL.sol";
import "./Roles.sol";

abstract contract AccessControllable is Initializable, ContextUpgradeable {
    IACL private acl;
    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;

    modifier onlyAdmin() {
        _acl().checkRole(Roles.ADMIN, _msgSender());
        _;
    }

    modifier onlyOperator() {
        _acl().checkRole(Roles.OPERATOR, _msgSender());
        _;
    }

    modifier onlyRole(bytes32 role) {
        _acl().checkRole(role, _msgSender());
        _;
    }

    function __AccessControllable_init(address aclContract) internal onlyInitializing {
        __AccessControllable_init_unchained(aclContract);
    }

    function __AccessControllable_init_unchained(address aclContract) internal onlyInitializing {
        acl = IACL(aclContract);
    }

    function _acl() internal virtual returns (IACL) {
        return acl;
    }
}

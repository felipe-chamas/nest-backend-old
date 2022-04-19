// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlEnumerableUpgradeable.sol";

interface IACL is IAccessControlEnumerableUpgradeable {
    function checkRole(bytes32 role, address account) external view;
}

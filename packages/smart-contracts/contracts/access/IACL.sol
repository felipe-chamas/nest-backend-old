// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

interface IACL {
    function checkRole(bytes32 role, address account) external view;
}

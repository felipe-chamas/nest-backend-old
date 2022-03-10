// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

/**
 * @title Different role definitions used by the ACL contract.
 */
library Roles {
    /**
     * @dev This maps directly to the OpenZeppelins AccessControl DEFAULT_ADMIN_ROLE
     */
    bytes32 public constant ADMIN = 0x00;
    bytes32 public constant OPERATOR = keccak256("OPERATOR_ROLE");
}

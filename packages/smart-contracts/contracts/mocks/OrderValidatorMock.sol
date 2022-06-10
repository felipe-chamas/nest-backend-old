// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../marketplace/OrderValidator.sol";
import "../marketplace/Orders.sol";
import "../BaseContract.sol";

contract OrderValidatorMock is BaseContract, OrderValidator {
    using Orders for Orders.Order;

    function initialize(string calldata name, address aclContract) external initializer {
        __BaseContract_init_unchained(aclContract);
        __OrderValidator_init_unchained(name);
    }

    function validateSignature(Orders.Order memory order, bytes memory signature) external view {
        _validate(order, signature);
    }

    function validateTimestamp(Orders.Order memory order) external view {
        order.validate();
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}

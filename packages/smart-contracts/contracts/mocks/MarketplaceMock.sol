// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../marketplace/Marketplace.sol";
import "../marketplace/Orders.sol";

contract MarketplaceMock is Marketplace {
    using Orders for Orders.Order;

    function getOrderHash(Orders.Order calldata order) external pure returns (bytes32) {
        return order.hash();
    }
}

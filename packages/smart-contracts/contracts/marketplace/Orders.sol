// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "./Assets.sol";

library Orders {
    using Assets for Assets.Asset[];

    error OrderStartValidationFailed();
    error OrderEndValidationFailed();

    struct Order {
        address maker;
        Assets.Asset[] makeAssets;
        address taker;
        Assets.Asset[] takeAssets;
        uint256 salt;
        uint256 start;
        uint256 end;
    }

    bytes32 public constant ORDER_TYPEHASH =
        keccak256(
            "Order(address maker,Asset[] makeAssets,address taker,Asset[] takeAssets,uint256 salt,uint256 start,uint256 end)Asset(AssetId id,uint256 value)AssetId(bytes4 class,bytes data)"
        );

    function validate(Orders.Order memory order) internal view {
        // solhint-disable-next-line not-rely-on-time
        if (order.start != 0 && order.start >= block.timestamp) revert OrderStartValidationFailed();
        // solhint-disable-next-line not-rely-on-time
        if (order.end != 0 && order.end < block.timestamp) revert OrderEndValidationFailed();
    }

    function hashKey(Order memory order) internal pure returns (bytes32) {
        return keccak256(abi.encode(order.maker, order.makeAssets.hash(), order.takeAssets.hash(), order.salt));
    }

    function hash(Order memory order) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    ORDER_TYPEHASH,
                    order.maker,
                    order.makeAssets.hash(),
                    order.taker,
                    order.takeAssets.hash(),
                    order.salt,
                    order.start,
                    order.end
                )
            );
    }
}

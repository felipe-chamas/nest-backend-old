// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "./INFTBox.sol";

abstract contract NFTUnboxingStorage {
    uint32 internal constant CALLBACK_GAS_LIMIT = 40_000;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 internal _keyHash;
    INFTBox internal _nftBox;
    // Your subscription ID.
    uint64 internal _subscriptionId;
    uint16 internal _requestConfirmations;
    // @dev requestId to tokenId mapping
    mapping(uint256 => uint256) internal _requestIds;
    // @dev tokenId to requestId mapping
    mapping(uint256 => uint256) internal _unboxingRequests;
    // @dev tokenId to results mapping
    mapping(uint256 => uint256) internal _requestResults;
}

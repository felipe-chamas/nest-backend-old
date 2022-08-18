// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../nft/INFT.sol";

abstract contract NFTLevelUpStorage {
    address internal _receiver;

    uint256 internal _levelUpValue;
}

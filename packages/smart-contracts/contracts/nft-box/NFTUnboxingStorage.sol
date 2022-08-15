// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../nft/INFT.sol";

abstract contract NFTUnboxingStorage {
    INFT internal _nftBox;
}

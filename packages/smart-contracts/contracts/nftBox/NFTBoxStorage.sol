// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

abstract contract NFTBoxStorage {
    string internal _baseTokenURI;
    CountersUpgradeable.Counter internal _tokenIdCounter;
}

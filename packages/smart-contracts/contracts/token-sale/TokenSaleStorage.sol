// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

abstract contract TokenSaleStorage {
    struct Round {
        uint112 cap;
        uint112 price;
        uint112 tokensLeft;
        uint64 start;
        uint32 duration;
        /**
         * @dev Here we have hybrid approach with allowlist: Merkle Tree + Mapping
         * First major bulk of addresses is added to allowlist by merklizing them,
         * then additional addresses can be added to allowlist without
         * changing the merkle root
         */
        bytes32 merkleRoot;
        mapping(address => bool) allowlist;
    }

    IERC20Upgradeable internal _paymentToken;
    IERC20Upgradeable internal _gameToken;
    uint64 internal _vestingStart;

    address internal _custody;
    uint64 internal _vestingPeriod;

    Round[] internal _rounds;
    mapping(address => uint256) internal _balances;
    mapping(address => uint256) internal _withdrawals;
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../BaseRecoverableContract.sol";
import "../nft/INFT.sol";
import "./NFTLevelUpStorage.sol";
import "../game-token/IGameToken.sol";

error NFTsOwnershipMismatch(address first, address second);
error BurnerEqualsToken(uint256 id);

contract NFTLevelUp is BaseRecoverableContract, NFTLevelUpStorage {
    event NFTLeveledUp(INFT nft, uint256 indexed tokenId);
    event NFTUpgraded(INFT nft, uint256 indexed tokenId);
    event ReceiverChanged(address indexed oldReceiver, address indexed newReceiver);
    event LevelUpValueChanged(uint256 oldValue, uint256 newValue);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        uint256 levelUpValue,
        address receiver,
        address acl
    ) external initializer {
        __BaseContract_init(acl);
        _levelUpValue = levelUpValue;
        _receiver = receiver;
    }

    function upgradeNFT(
        INFT nft,
        uint256 tokenId,
        uint256 burnerId
    ) external onlyOperator {
        if (tokenId == burnerId) revert BurnerEqualsToken(burnerId);
        address cardOwner = nft.ownerOf(tokenId);
        address burnerOwner = nft.ownerOf(burnerId);
        if (cardOwner != burnerOwner) revert NFTsOwnershipMismatch(cardOwner, burnerOwner);
        nft.burn(burnerId);
        emit NFTUpgraded(nft, tokenId);
    }

    function levelUpNFT(
        IGameToken gameToken,
        INFT nft,
        uint256 tokenId
    ) external {
        gameToken.transferFrom(msg.sender, _receiver, _levelUpValue);
        emit NFTLeveledUp(nft, tokenId);
    }

    function changeReceiver(address newReceiver) external onlyAdmin {
        emit ReceiverChanged(_receiver, newReceiver);
        _receiver = newReceiver;
    }

    function setLevelUpValue(uint256 newLevelUpValue) external onlyOperator {
        emit LevelUpValueChanged(_levelUpValue, newLevelUpValue);
        _levelUpValue = newLevelUpValue;
    }

    function getLevelUpValue() public view returns (uint256) {
        return _levelUpValue;
    }
}

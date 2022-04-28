// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "../BaseContract.sol";
import "../nft/INFT.sol";
import "./VRFConsumerBaseV2Upgradeable.sol";
import "./NFTUnboxingStorage.sol";

error RequesterIsNotTokenOwnerOrApproved(uint256 tokenId);
error UnboxingAlreadyRequested(uint256 tokenId);
error ArrayLengthsDoesNotMatch(uint256 first, uint256 second);
error UnregisteredRequestId(uint256 requestId);

contract NFTUnboxing is VRFConsumerBaseV2Upgradeable, ReentrancyGuardUpgradeable, BaseContract, NFTUnboxingStorage {
    event UnboxingRequested(uint256 indexed requestId, uint256 tokenId);
    event UnboxingRandomReceived(uint256 indexed requestId, uint256 indexed tokenId, uint256 randomWord);
    event Unboxed(uint256 indexed requestId, uint256 indexed tokenId, address[] nfts, uint256[][] mintedTokenIds);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        INFT nftBox,
        uint16 requestConfirmations,
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        address acl
    ) external initializer {
        __ReentrancyGuard_init();
        __BaseContract_init(acl);
        __VRFConsumerBaseV2_init(vrfCoordinator);
        _nftBox = nftBox;
        _subscriptionId = subscriptionId;
        _keyHash = keyHash;
        _requestConfirmations = requestConfirmations;
    }

    function requestUnboxing(uint256 tokenId) external nonReentrant {
        if (!_nftBox.isApprovedOrOwner(_msgSender(), tokenId)) revert RequesterIsNotTokenOwnerOrApproved(tokenId);
        if (_unboxingRequests[tokenId] != 0) revert UnboxingAlreadyRequested(tokenId);

        VRFCoordinatorV2Interface coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);

        uint256 requestId = coordinator.requestRandomWords(
            _keyHash,
            _subscriptionId,
            _requestConfirmations,
            _CALLBACK_GAS_LIMIT,
            1
        );

        _requestIds[requestId] = tokenId;
        _unboxingRequests[tokenId] = requestId;

        emit UnboxingRequested(requestId, tokenId);
    }

    function completeUnboxing(
        uint256 requestId,
        address[] calldata nfts,
        uint256[] calldata tokenCount
    ) external onlyOperator {
        if (nfts.length != tokenCount.length) revert ArrayLengthsDoesNotMatch(nfts.length, tokenCount.length);
        uint256 boxTokenId = _requestIds[requestId];
        if (boxTokenId == 0) revert UnregisteredRequestId(requestId);

        address boxOwner = _nftBox.ownerOf(boxTokenId);

        _nftBox.burn(boxTokenId);
        uint256[][] memory tokenIds = new uint256[][](nfts.length);

        for (uint256 i = 0; i < nfts.length; i++) {
            INFT nft = INFT(nfts[i]);
            uint256 count = tokenCount[i];
            uint256[] memory mintedIds = new uint256[](count);
            for (uint256 j = 0; j < count; j++) {
                mintedIds[j] = nft.mint(boxOwner);
            }
            tokenIds[i] = mintedIds;
        }

        emit Unboxed(requestId, boxTokenId, nfts, tokenIds);
    }

    function getRequestId(uint256 tokenId) external view returns (uint256) {
        return _unboxingRequests[tokenId];
    }

    function getTokenId(uint256 requestId) external view returns (uint256) {
        return _requestIds[requestId];
    }

    function getRandomResultByRequestId(uint256 requestId) external view returns (uint256) {
        return _requestResults[_requestIds[requestId]];
    }

    function getRandomResultByTokenId(uint256 tokenId) external view returns (uint256) {
        return _requestResults[tokenId];
    }

    function _fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tokenId = _requestIds[requestId];
        _requestResults[tokenId] = randomWords[0];

        emit UnboxingRandomReceived(requestId, tokenId, randomWords[0]);
    }
}

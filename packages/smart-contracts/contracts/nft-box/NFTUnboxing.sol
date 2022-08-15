// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../BaseRecoverableContract.sol";
import "../nft/INFT.sol";
import "./NFTUnboxingStorage.sol";

error RequesterIsNotTokenOwnerOrApproved(uint256 tokenId);
error ArrayLengthsDoesNotMatch(uint256 first, uint256 second);

contract NFTUnboxing is BaseRecoverableContract, NFTUnboxingStorage {
    event Unboxed(uint256 indexed tokenId, address[] nfts, uint256[][] mintedTokenIds);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(INFT nftBox, address acl) external initializer {
        __BaseContract_init(acl);
        _nftBox = nftBox;
    }

    function unbox(
        uint256 tokenId,
        address[] calldata nfts,
        uint256[] calldata tokenCount
    ) external onlyOperator {
        if (nfts.length != tokenCount.length) revert ArrayLengthsDoesNotMatch(nfts.length, tokenCount.length);

        address boxOwner = _nftBox.ownerOf(tokenId);

        _nftBox.burn(tokenId);
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

        emit Unboxed(tokenId, nfts, tokenIds);
    }
}

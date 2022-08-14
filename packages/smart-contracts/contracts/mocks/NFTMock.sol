// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "../nft/NFT.sol";
import "../nft-permit/ERC721WithPermit.sol";
import "./INFTPermitMock.sol";

contract NFTMock is NFT, INFTPermitMock {
    uint256 private _lastTokenId;

    /// @notice Mint next to
    function mint() external {
        _mint(msg.sender, ++_lastTokenId);
    }

    /// @notice Allows to get approved using a permit and transfer in the same call
    /// @dev this supposes that the permit is for msg.sender
    /// @param from current owner
    /// @param to recipient
    /// @param tokenId the token id
    /// @param _data optional data to add
    /// @param deadline the deadline for the permit to be used
    /// @param signature of permit
    function safeTransferFromWithPermit(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata _data,
        uint256 deadline,
        bytes calldata signature
    ) external {
        // use the permit to get msg.sender approved
        _permit(msg.sender, tokenId, deadline, signature);

        // do the transfer
        safeTransferFrom(from, to, tokenId, _data);
    }

    /// @inheritdoc ERC721Upgradeable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165Upgradeable, NFTBase)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @inheritdoc ERC721Upgradeable
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        // do normal transfer
        super._transfer(from, to, tokenId);
    }
}

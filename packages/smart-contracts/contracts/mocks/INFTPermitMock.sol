// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "../nft-permit/IERC721WithPermit.sol";

interface INFTPermitMock is IERC721WithPermit, IERC721Upgradeable {
    function safeTransferFromWithPermit(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data,
        uint256 deadline,
        bytes memory signature
    ) external;

    function mint() external;
}

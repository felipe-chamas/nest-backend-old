// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface INFT is IERC721Upgradeable {
    function mint(address to) external returns (uint256 tokenId);

    function setBaseTokenURI(string calldata baseTokenURI) external;

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) external;
}

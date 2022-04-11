// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";

interface INFTBox is IERC721EnumerableUpgradeable {
    function mint(address to) external returns (uint256 tokenId);

    function burn(uint256 tokenId) external;

    function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool);
}

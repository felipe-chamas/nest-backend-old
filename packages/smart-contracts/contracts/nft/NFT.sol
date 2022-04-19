// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "../BaseContract.sol";
import "./NFTStorage.sol";
import "./INFT.sol";

error MaximumTotalSupplyReached(uint256 maximum);

// solhint-disable no-empty-blocks
contract NFT is
    INFT,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    ERC721BurnableUpgradeable,
    BaseContract,
    NFTStorage
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        string calldata name,
        string calldata symbol,
        string calldata baseTokenURI,
        uint256 maxTokenSupply,
        address aclContract
    ) external initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __BaseContract_init(aclContract);
        _baseTokenURI = baseTokenURI;
        _maxTokenSupply = maxTokenSupply;
        // nextTokenId is initialized to 1
        _tokenIdCounter.increment();
    }

    function mint(address to) external onlyMinter returns (uint256 tokenId) {
        if (totalSupply() >= _maxTokenSupply) revert MaximumTotalSupplyReached(_maxTokenSupply);
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function setBaseTokenURI(string calldata baseTokenURI) external onlyOperator {
        _baseTokenURI = baseTokenURI;
    }

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) external onlyOperator {
        _setTokenURI(tokenId, _tokenURI);
    }

    function getMaxTokenSupply() external view returns (uint256) {
        return _maxTokenSupply;
    }

    function getBaseTokenURI() external view returns (string memory) {
        return _baseURI();
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165Upgradeable, ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}

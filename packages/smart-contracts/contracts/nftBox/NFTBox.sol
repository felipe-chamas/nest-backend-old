// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "../BaseContract.sol";
import "./NFTBoxStorage.sol";

error MaximumTotalSupplyReached(uint256 maximum);

contract NFTBox is
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    ERC721BurnableUpgradeable,
    BaseContract,
    NFTBoxStorage
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        string calldata name,
        string calldata symbol,
        string calldata baseTokenURI,
        address aclContract
    ) external initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __BaseContract_init(aclContract);
        _baseTokenURI = baseTokenURI;
    }

    function mint(address to, uint256 count) external onlyOperator {
        uint256 tokenId = _tokenIdCounter.current();

        for (uint256 i = 0; i < count; i++) {
            _safeMint(to, tokenId);
            tokenId++;
        }
        _tokenIdCounter._value = tokenId;
    }

    function setBaseTokenURI(string calldata baseTokenURI) external onlyOperator {
        _baseTokenURI = baseTokenURI;
    }

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) external onlyOperator {
        _setTokenURI(tokenId, _tokenURI);
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
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
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

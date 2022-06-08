// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "../BaseRecoverableContract.sol";
import "../nft-permit/ERC721WithPermit.sol";
import "./NFTStorage.sol";
import "./INFT.sol";

error MaximumTotalSupplyReached(uint256 maximum);
error BurningIsNotEnabled();

// solhint-disable no-empty-blocks
contract NFT is
    INFT,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    BaseRecoverableContract,
    ERC721WithPermit,
    NFTStorage
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    event BaseURIChanged(string baseURI);
    event TokenURIChanged(uint256 tokenId, string tokenURI);

    modifier whenBurnEnabled() {
        if (!_burnEnabled) revert BurningIsNotEnabled();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        string calldata name,
        string calldata symbol,
        string calldata baseTokenURI,
        uint256 maxTokenSupply,
        bool burnEnabled,
        address aclContract
    ) external initializer {
        __ERC721_init_unchained(name, symbol);
        __ERC721Enumerable_init_unchained();
        __ERC721WithPermit_init_unchained();
        __BaseContract_init(aclContract);
        _baseTokenURI = baseTokenURI;
        _maxTokenSupply = maxTokenSupply;
        _burnEnabled = burnEnabled;
        // nextTokenId is initialized to 1
        _tokenIdCounter.increment();
    }

    function mint(address to) external onlyMinter returns (uint256 tokenId) {
        if (totalSupply() >= _maxTokenSupply) revert MaximumTotalSupplyReached(_maxTokenSupply);
        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function burn(uint256 tokenId) external override onlyMinter whenBurnEnabled {
        _burn(tokenId);
    }

    function setBaseTokenURI(string calldata baseTokenURI) external onlyOperator {
        _baseTokenURI = baseTokenURI;
        emit BaseURIChanged(baseTokenURI);
    }

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) external onlyOperator {
        _setTokenURI(tokenId, _tokenURI);
        emit TokenURIChanged(tokenId, tokenURI(tokenId));
    }

    function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool) {
        return _isApprovedOrOwner(spender, tokenId);
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
        virtual
        override(IERC165Upgradeable, ERC721WithPermit, ERC721Upgradeable, ERC721EnumerableUpgradeable)
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

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable, ERC721WithPermit) {
        super._transfer(from, to, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}

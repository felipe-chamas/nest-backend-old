// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

import "./extras/ERC20TokenRecoverable.sol";

contract NFT is ERC721EnumerableUpgradeable, ERC721BurnableUpgradeable, ERC20TokenRecoverable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}



    function initialize(
        string calldata name,
        string calldata symbol,
        address aclContract
    ) external initializer {
        __ERC20TokenRecoverable_init(aclContract);
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __UUPSUpgradeable_init();
    }

    function mint(address to, uint256 tokenId) external onlyOperator {
        _safeMint(to, tokenId);
    }



    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}
}

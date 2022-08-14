// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "./INFTLaunchpad.sol";
import "./NFT.sol";

error MaximumLaunchpadSupplyReached(uint256 maximum);
error LaunchpadIsZeroAddress();
error ToIsZeroAddress();
error SizeIsZero();
error MsgSenderIsNotLaunchpad();
error MintNotAvailableOutsideLaunchpad();

contract NFTLaunchpad is NFTBase, INFTLaunchpad {
    address public launchpad;

    modifier onlyLaunchpad() {
        if (msg.sender != launchpad) revert MsgSenderIsNotLaunchpad();
        _;
    }

    function initialize(
        string calldata name_,
        string calldata symbol_,
        string calldata baseTokenURI,
        uint256 maxTokenSupply,
        bool burnEnabled,
        address aclContract,
        address _launchpad
    ) external initializer {
        __NFT_init(name_, symbol_, baseTokenURI, maxTokenSupply, burnEnabled, aclContract);

        if (_launchpad == address(0)) revert LaunchpadIsZeroAddress();
        launchpad = _launchpad;
    }

    function getMaxLaunchpadSupply() external view returns (uint256) {
        return _maxTokenSupply;
    }

    function getLaunchpadSupply() external view returns (uint256) {
        return super.totalSupply();
    }

    function mintTo(address to, uint256 size) external onlyLaunchpad {
        if (to == address(0)) revert ToIsZeroAddress();
        if (size == 0) revert SizeIsZero();

        if (super.totalSupply() + size > _maxTokenSupply) {
            revert MaximumLaunchpadSupplyReached(_maxTokenSupply);
        }

        for (uint256 i = 0; i < size; i++) {
            _mintTo(to);
        }
    }
}

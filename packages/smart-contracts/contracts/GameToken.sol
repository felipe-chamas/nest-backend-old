// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "./ACL.sol";
// TODO define tokenomics wallets on the smart contract
// TODO define tokenomics cliff/vesting schedules on the smart contract

/// @custom:security-contact security@leeroy.gg
contract GameToken is UUPSUpgradeable, ERC20BurnableUpgradeable, PausableUpgradeable, ACL {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() initializer {}

    function initialize(
        address owner,
        string memory name,
        string memory symbol,
        uint256 supply
    ) external initializer {
        __Pausable_init();
        __ACL_init();
        __ERC20_init(name, symbol);
        _mint(owner, supply);
    }

    function pause() external onlyManager {
        _pause();
    }

    function unpause() external onlyManager {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function recover(IERC20Upgradeable token, address to, uint256 amount) external onlyAdmin {
      token.safeTransfer(to, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./extras/ERC20TokenRecoverable.sol";

// TODO define tokenomics wallets on the smart contract
// TODO define tokenomics cliff/vesting schedules on the smart contract

/// @custom:security-contact security@leeroy.gg
contract GameToken is ERC20BurnableUpgradeable, PausableUpgradeable, ERC20TokenRecoverable, UUPSUpgradeable {
    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() initializer {}

    function initialize(
        address owner,
        string memory name,
        string memory symbol,
        uint256 supply,
        address acl
    ) external initializer {
        __Pausable_init();
        __ERC20TokenRecoverable_init(acl);
        __ERC20_init(name, symbol);
        __UUPSUpgradeable_init();
        _mint(owner, supply);
    }

    function pause() external onlyOperator {
        _pause();
    }

    function unpause() external onlyOperator {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}
}

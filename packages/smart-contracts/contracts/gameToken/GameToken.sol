// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "../dependencies/@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "../dependencies/@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "../BaseContract.sol";

// solhint-disable no-empty-blocks
contract GameToken is ERC20BurnableUpgradeable, PausableUpgradeable, ERC20PermitUpgradeable, BaseContract {
    struct Payee {
        address account;
        uint256 amount;
    }

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
        __BaseContract_init(acl);
        __ERC20_init(name, symbol);
        __ERC20Permit_init(name);
        _mint(owner, supply);
    }

    function pause() external onlyOperator {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function transferBatch(Payee[] calldata payee) external {
        uint256 total = _getTotal(payee);
        _transferBatch(_msgSender(), total, payee);
    }

    function transferFromBatch(address from, Payee[] calldata payee) external {
        address spender = _msgSender();
        uint256 total = _getTotal(payee);
        _spendAllowance(from, spender, total);
        _transferBatch(from, total, payee);
    }

    function _getTotal(Payee[] calldata payee) internal pure returns (uint256 total) {
        for (uint256 i = 0; i < payee.length; i++) {
            total += payee[i].amount;
        }
    }

    /**
     * @dev This is more gas effiecient way to send a batch of tokens.
     *      By eliminating multiple updates for _balances[from] we
     *      are able to reduce gas usage by ~20-25% in comparison
     *      of calling _transfer(...) in loop
     */
    function _transferBatch(
        address from,
        uint256 total,
        Payee[] calldata payee
    ) internal {
        uint256 fromBalance = _balances[from];
        require(fromBalance >= total, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - total;
        }
        for (uint256 i = 0; i < payee.length; i++) {
            address to = payee[i].account;
            uint256 amount = payee[i].amount;
            require(to != address(0), "ERC20: transfer to the zero address");

            _beforeTokenTransfer(from, to, amount);

            _balances[to] += amount;

            emit Transfer(from, to, amount);

            _afterTokenTransfer(from, to, amount);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";
import "./Orders.sol";

abstract contract OrderValidator is ContextUpgradeable, EIP712Upgradeable {
    using Orders for Orders.Order;

    error MakerIsNotTxSender();
    error OrderSignatureVerificationFailed();

    // solhint-disable-next-line func-name-mixedcase
    function __OrderValidator_init_unchained(string memory name) internal onlyInitializing {
        __EIP712_init_unchained(name, "1");
    }

    function _validate(Orders.Order memory order, bytes memory signature) internal view {
        if (order.salt == 0) {
            _validateWithZeroSalt(order);
            return;
        }
        if (_msgSender() == order.maker) return;

        if (!SignatureCheckerUpgradeable.isValidSignatureNow(order.maker, _hashTypedDataV4(order.hash()), signature)) {
            revert OrderSignatureVerificationFailed();
        }
    }

    function _validateWithZeroSalt(Orders.Order memory order) internal view {
        if (order.maker == address(0)) {
            order.maker = _msgSender();
        } else if (_msgSender() != order.maker) {
            revert MakerIsNotTxSender();
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}

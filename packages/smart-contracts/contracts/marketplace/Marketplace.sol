// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "./Assets.sol";
import "./Orders.sol";
import "./Permits.sol";
import "./OrderValidator.sol";
import "./TransferManager.sol";
import "../game-token/IGameToken.sol";
import "../nft-permit/IERC721WithPermit.sol";

contract Marketplace is PausableUpgradeable, OrderValidator, TransferManager {
    using SafeERC20Upgradeable for IGameToken;
    using Assets for Assets.Asset[];
    using Assets for Assets.Asset;
    using Permits for Permits.Permit;
    using Orders for Orders.Order;

    error UnsupportedERC20Token(address token);
    error OrderAlreadyCompleted(bytes32 orderKeyHash);
    error UnexpectedSenderPermitAssetClass(bytes4 expected, bytes4 actual);
    error MsgSenderIsNotOrderMaker();
    error ZeroSaltCannotBeUsed();
    error OrderTargetVerificationFailed(address maker, address taker);

    mapping(bytes32 => bool) public completedOrders;

    event Cancel(bytes32 hash, address indexed maker, Assets.Asset[] makeAssets, Assets.Asset[] takeAssets);
    event Match(
        bytes32 leftHash,
        bytes32 rightHash,
        address leftMaker,
        address rightMaker,
        Assets.Asset[] leftAssets,
        Assets.Asset[] rightAssets
    );

    function initialize(
        address gameToken,
        string calldata name,
        uint256 marketplaceERC20Fee,
        uint256 marketplaceNFTFee,
        address custody,
        address aclContract
    ) external initializer {
        __TransferManager_init_unchained(aclContract, gameToken, marketplaceERC20Fee, marketplaceNFTFee, custody);
        __Pausable_init_unchained();
        __OrderValidator_init_unchained(name);
    }

    function cancel(Orders.Order calldata order) external {
        if (_msgSender() != order.maker) revert MsgSenderIsNotOrderMaker();
        if (order.salt == 0) revert ZeroSaltCannotBeUsed();
        bytes32 orderKeyHash = order.hashKey();
        completedOrders[orderKeyHash] = true;
        emit Cancel(orderKeyHash, order.maker, order.makeAssets, order.takeAssets);
    }

    /**
     * @notice Matches orders and executes them by transferring tokens.
     *         msg.sender pays fees (in GameTokens) to the marketplace. In order to use this
     *         function all tokens participated in both orders must be
     *         approved before calling this function. Also approval from msg.sender
     *         must exist to cover marketplace fees.
     */
    function matchOrders(
        Orders.Order calldata left,
        bytes calldata signatureLeft,
        Orders.Order calldata right,
        bytes calldata signatureRight
    ) external whenNotPaused {
        _matchOrders(left, signatureLeft, right, signatureRight);
    }

    function matchOrdersWithPermits(
        Orders.Order calldata left,
        bytes calldata signatureLeft,
        Orders.Order calldata right,
        bytes calldata signatureRight,
        Permits.Permit[] calldata leftPermits,
        Permits.Permit[] calldata rightPermits
    ) external whenNotPaused {
        _matchOrdersWithPermits(left, signatureLeft, right, signatureRight, leftPermits, rightPermits);
    }

    function matchOrdersWithPermitsAndSenderPermit(
        Orders.Order calldata left,
        bytes calldata signatureLeft,
        Orders.Order calldata right,
        bytes calldata signatureRight,
        Permits.Permit[] calldata leftPermits,
        Permits.Permit[] calldata rightPermits,
        Permits.Permit calldata senderPermit
    ) external whenNotPaused {
        _applySenderPermit(senderPermit);

        _matchOrdersWithPermits(left, signatureLeft, right, signatureRight, leftPermits, rightPermits);
    }

    function pause() external onlyOperator {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function _matchOrdersWithPermits(
        Orders.Order calldata left,
        bytes calldata signatureLeft,
        Orders.Order calldata right,
        bytes calldata signatureRight,
        Permits.Permit[] calldata leftPermits,
        Permits.Permit[] calldata rightPermits
    ) internal {
        _applyPermits(left.maker, leftPermits);
        _applyPermits(right.maker, rightPermits);

        _matchOrders(left, signatureLeft, right, signatureRight);
    }

    function _applySenderPermit(Permits.Permit calldata permit) internal {
        Assets.Asset calldata asset = permit.asset;
        if (asset.id.class != Assets.ERC20) revert UnexpectedSenderPermitAssetClass(Assets.ERC20, asset.id.class);
        if (asset.token() != _gameToken) revert UnsupportedERC20Token(asset.token());

        permit.applyPermit(_msgSender(), address(this));
    }

    function _applyPermits(address owner, Permits.Permit[] calldata permits) internal {
        uint256 count = permits.length;
        for (uint256 i = 0; i < count; i++) {
            permits[i].applyPermit(owner, address(this));
        }
    }

    function _matchOrders(
        Orders.Order calldata orderLeft,
        bytes calldata signatureLeft,
        Orders.Order calldata orderRight,
        bytes calldata signatureRight
    ) internal {
        _validateFull(orderLeft, signatureLeft);
        _validateFull(orderRight, signatureRight);
        if (orderLeft.taker != address(0) && orderLeft.taker != orderRight.maker) {
            revert OrderTargetVerificationFailed(orderRight.maker, orderLeft.taker);
        }
        if (orderRight.taker != address(0) && orderRight.taker != orderLeft.maker) {
            revert OrderTargetVerificationFailed(orderLeft.maker, orderRight.taker);
        }
        _matchAndTransfer(orderLeft, orderRight);
    }

    function _matchAndTransfer(Orders.Order calldata orderLeft, Orders.Order calldata orderRight) internal {
        bytes32 leftOrderKeyHash = orderLeft.hashKey();
        bytes32 rightOrderKeyHash = orderRight.hashKey();
        if (completedOrders[leftOrderKeyHash]) revert OrderAlreadyCompleted(leftOrderKeyHash);
        if (completedOrders[rightOrderKeyHash]) revert OrderAlreadyCompleted(rightOrderKeyHash);
        if (orderLeft.salt != 0) {
            completedOrders[leftOrderKeyHash] = true;
        }
        if (orderRight.salt != 0) {
            completedOrders[rightOrderKeyHash] = true;
        }

        _matchAssets(orderLeft, orderRight);
        _doTransfers(orderLeft, orderRight);

        emit Match(
            leftOrderKeyHash,
            rightOrderKeyHash,
            orderLeft.maker,
            orderRight.maker,
            orderLeft.makeAssets,
            orderRight.makeAssets
        );
    }

    function _validateFull(Orders.Order calldata order, bytes calldata signature) internal view {
        order.validate();
        _validate(order, signature);
        uint256 count = order.makeAssets.length;
        for (uint256 i = 0; i < count; i++) {
            Assets.Asset memory asset = order.makeAssets[i];
            if (asset.id.class == Assets.ERC20 && asset.token() != _gameToken) {
                revert UnsupportedERC20Token(asset.token());
            }
        }
    }

    function _matchAssets(Orders.Order calldata orderLeft, Orders.Order calldata orderRight) internal pure {
        orderLeft.makeAssets.matchAssets(orderRight.takeAssets);
        orderRight.makeAssets.matchAssets(orderLeft.takeAssets);
    }
}

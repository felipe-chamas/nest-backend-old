// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "../BaseRecoverableContract.sol";
import "./Orders.sol";
import "./Assets.sol";

abstract contract TransferManager is BaseRecoverableContract {
    using Assets for Assets.Asset;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    error CustodyIsZeroAddress();
    error GameTokenIsZeroAddress();
    error UnsupportedAssetClass(bytes4 class);
    error MarketplaceERC20FeePercentExceedsMaximum(uint256 maximum, uint256 actual);

    uint256 private constant _MARKETPLACE_ERC20_FEE_PERCENT_DECIMALS = 4;
    uint256 private constant _MAX_MARKETPLACE_ERC20_FEE_PERCENT = 10 * (10**_MARKETPLACE_ERC20_FEE_PERCENT_DECIMALS); // 10%

    uint256 internal _marketplaceERC20FeePercent;
    uint256 internal _marketplaceNFTFee;
    address internal _custody;
    address internal _gameToken;

    event MarketplaceERC20FeePercentChanged(uint256 feePercent);
    event MarketplaceNFTFeeChanged(uint256 fee);
    event CustodyChanged(address indexed custody);

    // solhint-disable-next-line func-name-mixedcase
    function __TransferManager_init_unchained(
        address aclContract,
        address gameToken,
        uint256 marketplaceERC20FeePercent,
        uint256 marketplaceNFTFee,
        address custody
    ) internal onlyInitializing {
        if (gameToken == address(0)) revert GameTokenIsZeroAddress();
        if (custody == address(0)) revert CustodyIsZeroAddress();
        if (marketplaceERC20FeePercent > _MAX_MARKETPLACE_ERC20_FEE_PERCENT) {
            revert MarketplaceERC20FeePercentExceedsMaximum(
                _MAX_MARKETPLACE_ERC20_FEE_PERCENT,
                marketplaceERC20FeePercent
            );
        }
        __BaseRecoverableContract_init_unchained(aclContract);

        _gameToken = gameToken;
        _marketplaceERC20FeePercent = marketplaceERC20FeePercent;
        _marketplaceNFTFee = marketplaceNFTFee;
        _custody = custody;
        emit MarketplaceERC20FeePercentChanged(marketplaceERC20FeePercent);
        emit MarketplaceNFTFeeChanged(marketplaceNFTFee);
        emit CustodyChanged(custody);
    }

    function setMarketplaceERC20FeePercent(uint256 marketplaceERC20FeePercent) external onlyAdmin {
        if (marketplaceERC20FeePercent > _MAX_MARKETPLACE_ERC20_FEE_PERCENT) {
            revert MarketplaceERC20FeePercentExceedsMaximum(
                _MAX_MARKETPLACE_ERC20_FEE_PERCENT,
                marketplaceERC20FeePercent
            );
        }

        _marketplaceERC20FeePercent = marketplaceERC20FeePercent;
        emit MarketplaceERC20FeePercentChanged(marketplaceERC20FeePercent);
    }

    function setMarketplaceNFTFee(uint256 marketplaceNFTFee) external onlyAdmin {
        _marketplaceNFTFee = marketplaceNFTFee;
        emit MarketplaceNFTFeeChanged(marketplaceNFTFee);
    }

    function setCustody(address custody) external onlyAdmin {
        if (custody == address(0)) revert CustodyIsZeroAddress();

        _custody = custody;
        emit CustodyChanged(custody);
    }

    function getMarketplaceERC20FeePercent() external view returns (uint256) {
        return _marketplaceERC20FeePercent;
    }

    function getMarketplaceNFTFee() external view returns (uint256) {
        return _marketplaceNFTFee;
    }

    function getCustody() external view returns (address) {
        return _custody;
    }

    function getGameToken() external view returns (address) {
        return address(_gameToken);
    }

    function getOrderFee(Orders.Order calldata order) external view returns (uint256 fee) {
        fee = _getOrderFee(order);
    }

    function _getOrderFee(Orders.Order calldata order) internal view returns (uint256 fee) {
        return _getAssetsFee(order.makeAssets) + _getAssetsFee(order.takeAssets);
    }

    function _doTransfers(Orders.Order calldata leftOrder, Orders.Order calldata rightOrder) internal {
        _doTransfers(leftOrder, rightOrder.maker);
        _doTransfers(rightOrder, leftOrder.maker);

        uint256 fee = _getOrderFee(leftOrder);
        if (fee > 0) {
            IERC20Upgradeable(_gameToken).safeTransferFrom(_msgSender(), _custody, fee);
        }
    }

    function _doTransfers(Orders.Order calldata order, address to) internal {
        address from = order.maker;
        uint256 count = order.makeAssets.length;
        for (uint256 i = 0; i < count; i++) {
            _doTransfer(from, to, order.makeAssets[i]);
        }
    }

    function _getAssetsFee(Assets.Asset[] calldata assets) internal view returns (uint256 fee) {
        uint256 count = assets.length;
        for (uint256 i = 0; i < count; i++) {
            Assets.Asset calldata asset = assets[i];
            if (asset.id.class == Assets.ERC20) {
                fee +=
                    (asset.value * _marketplaceERC20FeePercent) /
                    (100 * (10**_MARKETPLACE_ERC20_FEE_PERCENT_DECIMALS));
            } else if (asset.id.class == Assets.ERC721) {
                fee += _marketplaceNFTFee;
            } else {
                revert UnsupportedAssetClass(asset.id.class);
            }
        }
    }

    function _doTransfer(
        address from,
        address to,
        Assets.Asset calldata asset
    ) private {
        if (asset.id.class == Assets.ERC20) {
            IERC20Upgradeable(asset.token()).safeTransferFrom(from, to, asset.value);
        } else if (asset.id.class == Assets.ERC721) {
            (address token, uint256 tokenId) = asset.asERC721();
            IERC721Upgradeable(token).safeTransferFrom(from, to, tokenId);
        } else {
            revert UnsupportedAssetClass(asset.id.class);
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[46] private __gap;
}

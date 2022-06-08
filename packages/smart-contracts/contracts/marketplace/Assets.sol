// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

library Assets {
    error AssetsLengthDoNotMatch(uint256 leftAssetLength, uint256 rightAssetLength);
    error AssetsDoNotMatch();

    struct AssetId {
        bytes4 class;
        bytes data;
    }

    struct Asset {
        AssetId id;
        uint256 value;
    }

    bytes4 public constant ERC20 = bytes4(keccak256("ERC20"));
    bytes4 public constant ERC721 = bytes4(keccak256("ERC721"));
    bytes32 private constant _ASSET_ID_TYPEHASH = keccak256("AssetId(bytes4 class,bytes data)");
    bytes32 private constant _ASSET_TYPEHASH =
        keccak256("Asset(AssetId id,uint256 value)AssetId(bytes4 class,bytes data)");

    /**
     * @dev Extracts token contract address from the Asset ID structure.
     * The address is the common attribute for all assets regardless of their asset class.
     */
    function token(AssetId memory self) internal pure returns (address) {
        return abi.decode(self.data, (address));
    }

    function asERC721(AssetId memory self) internal pure returns (address, uint256) {
        return abi.decode(self.data, (address, uint256));
    }

    /**
     * @dev Extracts token contract address from the Asset structure.
     * The address is the common attribute for all assets regardless of their asset class.
     */
    function token(Asset memory self) internal pure returns (address) {
        return token(self.id);
    }

    function asERC721(Asset memory self) internal pure returns (address, uint256) {
        return asERC721(self.id);
    }

    /// @notice produces EIP712 compatible hashing of `Assets.AssetId` structure
    function hash(AssetId memory id) internal pure returns (bytes32) {
        return keccak256(abi.encode(_ASSET_ID_TYPEHASH, id.class, keccak256(id.data)));
    }

    /// @notice produces EIP712 compatible hashing of `Assets.Asset` structure
    function hash(Asset memory asset) internal pure returns (bytes32) {
        return keccak256(abi.encode(_ASSET_TYPEHASH, hash(asset.id), asset.value));
    }

    /// @notice produces EIP712 compatible hashing of `Assets.Asset[]` structure
    function hash(Asset[] memory assets) internal pure returns (bytes32) {
        uint256 count = assets.length;
        bytes32[] memory hashes = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            hashes[i] = hash(assets[i]);
        }

        return keccak256(abi.encodePacked(hashes));
    }

    function matchAssets(Assets.Asset[] memory leftAssets, Assets.Asset[] memory rightAssets) internal pure {
        // no match
        if (leftAssets.length != rightAssets.length) {
            revert AssetsLengthDoNotMatch(leftAssets.length, rightAssets.length);
        }
        uint256 length = leftAssets.length;
        for (uint256 i = 0; i < length; i++) {
            if (hash(leftAssets[i]) != hash(rightAssets[i])) revert AssetsDoNotMatch();
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-IERC20PermitUpgradeable.sol";
import "../nft-permit/IERC721WithPermit.sol";
import "./Assets.sol";

library Permits {
    using Assets for Assets.Asset;

    error CannotPermitUnsupportedAssetClass(bytes4 class);
    error InvalidSignatureLength();

    struct Permit {
        Assets.Asset asset;
        bytes signature;
        uint256 deadline;
    }

    function applyPermit(
        Permit calldata permit,
        address owner,
        address spender
    ) internal {
        Assets.Asset memory asset = permit.asset;

        if (asset.id.class == Assets.ERC20) {
            if (permit.signature.length != 65) revert InvalidSignatureLength();

            bytes memory signature = permit.signature;
            bytes32 r;
            bytes32 s;
            uint8 v;
            // ecrecover takes the signature parameters, and the only way to get them
            // currently is to use assembly.
            /// @solidity memory-safe-assembly
            // slither-disable-next-line assembly
            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }

            IERC20PermitUpgradeable(asset.token()).permit(owner, spender, asset.value, permit.deadline, v, r, s);
        } else if (asset.id.class == Assets.ERC721) {
            (address token, uint256 tokenId) = asset.asERC721();
            IERC721WithPermit(token).permit(spender, tokenId, permit.deadline, permit.signature);
        } else {
            revert CannotPermitUnsupportedAssetClass(asset.id.class);
        }
    }
}

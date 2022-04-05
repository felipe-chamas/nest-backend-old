// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "../BaseContract.sol";
import "./INFT.sol";

error ClaimingNotAllowed();

// solhint-disable no-empty-blocks
contract NFTClaim is BaseContract {
    using MerkleProofUpgradeable for bytes32[];
    INFT internal _nft;

    mapping(bytes32 => bool) internal _merkleRoots;
    mapping(address => mapping(bytes32 => bool)) internal _claimedRoots;

    event MerkleRootAdded(bytes32 merkleRoot);
    event TokenClaimed(address indexed account, bytes32 indexed merkleRoot, uint256 tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(INFT nft, address aclContract) external initializer {
        __BaseContract_init(aclContract);
        _nft = nft;
    }

    function addMerkleRoot(bytes32 merkleRoot) external onlyOperator {
        _merkleRoots[merkleRoot] = true;
        emit MerkleRootAdded(merkleRoot);
    }

    function claim(
        bytes32 merkleRoot,
        bytes32[] calldata proof,
        address account,
        uint256 tokens
    ) external {
        if (!_isAllowed(merkleRoot, proof, account, tokens)) revert ClaimingNotAllowed();

        _claimedRoots[account][merkleRoot] = true;

        INFT nft = _nft;
        for (uint256 i = 0; i < tokens; i++) {
            uint256 tokenId = nft.mint(account);
            emit TokenClaimed(account, merkleRoot, tokenId);
        }
    }

    function isClaimAllowed(
        bytes32 merkleRoot,
        bytes32[] calldata proof,
        address account,
        uint256 tokens
    ) external view returns (bool) {
        return _isAllowed(merkleRoot, proof, account, tokens);
    }

    function _isAllowed(
        bytes32 merkleRoot,
        bytes32[] calldata proof,
        address account,
        uint256 tokens
    ) internal view returns (bool) {
        if (!_merkleRoots[merkleRoot]) return false;
        if (_claimedRoots[_msgSender()][merkleRoot]) return false;

        bytes32 leaf = _getMerkleLeaf(account, tokens);

        return proof.verify(merkleRoot, leaf);
    }

    function _getMerkleLeaf(address account, uint256 tokens) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, address(this), account, tokens));
    }
}

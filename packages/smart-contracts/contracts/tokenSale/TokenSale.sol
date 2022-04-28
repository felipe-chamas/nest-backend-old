// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "../BaseContract.sol";
import "./TokenSaleStorage.sol";

error RoundStartInPast(uint64 start);
error InvalidRoundStart(uint64 lastRoundEnd, uint64 start);
error InvalidRoundIndex(uint16 index);
error InvalidTokenPrice();
error InvalidTokenCap();
error InvalidVestingPeriod();
error VestingNotStarted();
error InvalidCustodyAddress();
error VestingAlreadyStarted(uint64 start);
error VestingStartMustBeInFuture();
error AlreadyInAllowlist(address account);
error NotInAllowlist(address account);
error InvalidPaymentTokenAddress();
error InvalidGameTokenAddress();
error RoundAlreadyStarted(uint64 start);
error RoundIsNotStarted(uint64 start);
error RoundEnded(uint64 end);
error RoundIsNotFinished(uint64 end);
error NoRounds();
error AccountNotAllowlisted(address account);
error NotEnoughTokensLeftInCurrentRound(uint112 tokensLeft, uint112 tokensRequested);

// solhint-disable no-empty-blocks, not-rely-on-time
contract TokenSale is BaseContract, TokenSaleStorage {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeCastUpgradeable for uint256;
    using MerkleProofUpgradeable for bytes32[];

    uint256 private constant _ONE = 10**18;

    event RoundAdded(
        uint16 indexed index,
        uint64 start,
        uint32 duration,
        uint112 price,
        uint112 cap,
        bytes32 merkleRoot
    );
    event AddedToAllowlist(uint16 indexed roundIndex, address indexed account);
    event RemovedFromAllowlist(uint16 indexed roundIndex, address indexed account);
    event CustodyChanged(address previousCustody, address custody);
    event VestingStartChanged(uint64 vestingStart);
    event RoundPriceChanged(uint16 indexed index, uint112 previousPrice, uint112 price);
    event RoundMerkleRootChanged(uint16 indexed index, bytes32 previousMerkleRoot, bytes32 merkleRoot);
    event TokenPurchase(address indexed buyer, uint16 roundIndex, uint256 tokensPayed, uint256 tokensReceived);
    event TokensWithdraw(uint16 indexed roundIndex, address custody, uint256 tokens);
    event TokensClaimed(address indexed account, uint256 amount);

    modifier whenRoundExists(uint16 roundIndex) {
        if (roundIndex >= _rounds.length) revert InvalidRoundIndex(roundIndex);
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        uint64 vestingPeriod,
        address custody,
        address gameToken,
        address paymentToken,
        address acl
    ) external initializer {
        __BaseContract_init(acl);
        if (vestingPeriod == 0) revert InvalidVestingPeriod();
        if (gameToken == address(0)) revert InvalidGameTokenAddress();
        if (paymentToken == address(0)) revert InvalidPaymentTokenAddress();

        _vestingPeriod = vestingPeriod;
        _gameToken = IERC20Upgradeable(gameToken);
        _paymentToken = IERC20Upgradeable(paymentToken);
        _setCustody(custody);
    }

    function addRound(
        uint64 start,
        uint32 duration,
        uint112 price,
        uint112 cap,
        bytes32 merkleRoot
    ) external onlyOperator {
        if (price == 0) revert InvalidTokenPrice();
        if (cap == 0) revert InvalidTokenCap();
        if (start < block.timestamp) revert RoundStartInPast(start);

        uint256 roundCount = _rounds.length;
        if (roundCount > 0) {
            Round storage last = _rounds[roundCount - 1];
            uint64 lastRoundEnd = last.start + last.duration;
            if (lastRoundEnd > start) revert InvalidRoundStart(lastRoundEnd, start);
        }

        Round storage round = _rounds.push();
        round.cap = cap;
        round.price = price;
        round.tokensLeft = cap;
        round.start = start;
        round.duration = duration;
        round.merkleRoot = merkleRoot;

        _gameToken.safeTransferFrom(_custody, address(this), cap);

        emit RoundAdded(roundCount.toUint16(), start, duration, price, cap, merkleRoot);
    }

    function addToAllowlist(uint16 roundIndex, address[] calldata accounts)
        external
        onlyOperator
        whenRoundExists(roundIndex)
    {
        Round storage round = _rounds[roundIndex];

        for (uint256 i = 0; i < accounts.length; i++) {
            _addToAllowlist(round, roundIndex, accounts[i]);
        }
    }

    function buy(
        uint16 roundIndex,
        uint112 amount,
        bytes32[] calldata proof
    ) external whenRoundExists(roundIndex) {
        Round storage round = _rounds[roundIndex];
        uint64 start = round.start;
        uint64 end = start + round.duration;

        if (start > block.timestamp) revert RoundIsNotStarted(start);
        if (end < block.timestamp) revert RoundEnded(end);

        if (!_isAllowlisted(roundIndex, proof, msg.sender)) revert AccountNotAllowlisted(msg.sender);

        uint112 tokensLeft = _rounds[roundIndex].tokensLeft;
        if (tokensLeft < amount) revert NotEnoughTokensLeftInCurrentRound(tokensLeft, amount);

        unchecked {
            _rounds[roundIndex].tokensLeft = tokensLeft - amount;
        }

        uint256 tokensToPay = _estimateBuy(roundIndex, amount);
        _paymentToken.safeTransferFrom(msg.sender, _custody, tokensToPay);
        _balances[msg.sender] += amount;

        emit TokenPurchase(msg.sender, roundIndex, tokensToPay, amount);
    }

    function claim(address account) external {
        if (_vestingStart == 0 || _vestingStart > block.timestamp) revert VestingNotStarted();

        uint256 owedAmount = _vestingStart + _vestingPeriod < block.timestamp
            ? _balances[account]
            : ((block.timestamp - _vestingStart) * _balances[account]) / _vestingPeriod;
        uint256 amount = owedAmount - _withdrawals[account];

        _withdrawals[account] = owedAmount;

        _gameToken.safeTransfer(account, amount);

        emit TokensClaimed(account, amount);
    }

    function withdraw(uint16 roundIndex) external whenRoundExists(roundIndex) onlyOperator {
        Round storage round = _rounds[roundIndex];
        uint64 end = round.start + round.duration;
        if (end > block.timestamp) revert RoundIsNotFinished(end);

        uint256 amount = round.tokensLeft;
        if (amount == 0) return;

        round.tokensLeft = 0;

        _gameToken.safeTransfer(_custody, amount);
        emit TokensWithdraw(roundIndex, _custody, amount);
    }

    function setVestingStart(uint64 vestingStart) external onlyOperator {
        if (_vestingStart > 0) revert VestingAlreadyStarted(_vestingStart);
        if (vestingStart < block.timestamp) revert VestingStartMustBeInFuture();

        _vestingStart = vestingStart;

        emit VestingStartChanged(vestingStart);
    }

    function setRoundMerkleRoot(uint16 roundIndex, bytes32 merkleRoot)
        external
        onlyOperator
        whenRoundExists(roundIndex)
    {
        Round storage round = _rounds[roundIndex];
        if (round.start < block.timestamp) revert RoundAlreadyStarted(round.start);

        emit RoundMerkleRootChanged(roundIndex, round.merkleRoot, merkleRoot);
        round.merkleRoot = merkleRoot;
    }

    function setCustody(address custody) external onlyAdmin {
        _setCustody(custody);
    }

    function getCustody() external view returns (address) {
        return _custody;
    }

    function getVestingPeriod() external view returns (uint64) {
        return _vestingPeriod;
    }

    function getVestingStart() external view returns (uint64) {
        return _vestingStart;
    }

    function getCurrentRoundIndex() external view returns (uint16) {
        return _getCurrentRoundIndex();
    }

    function getRound(uint16 roundIndex)
        external
        view
        whenRoundExists(roundIndex)
        returns (
            uint64 start,
            uint32 duration,
            uint112 cap,
            uint112 price,
            bytes32 merkleRoot,
            uint112 tokensLeft
        )
    {
        Round storage round = _rounds[roundIndex];
        return (round.start, round.duration, round.cap, round.price, round.merkleRoot, round.tokensLeft);
    }

    function getRoundCount() external view returns (uint256) {
        return _rounds.length;
    }

    function isAllowlisted(
        uint16 roundIndex,
        address account,
        bytes32[] calldata proof
    ) external view whenRoundExists(roundIndex) returns (bool) {
        return _isAllowlisted(roundIndex, proof, account);
    }

    function getPaymentToken() external view returns (address) {
        return address(_paymentToken);
    }

    function getGameToken() external view returns (address) {
        return address(_gameToken);
    }

    function getBalance(address account) external view returns (uint256) {
        return _balances[account];
    }

    function estimateBuy(uint16 roundIndex, uint112 amount)
        external
        view
        whenRoundExists(roundIndex)
        returns (uint112)
    {
        return _estimateBuy(roundIndex, amount);
    }

    function _addToAllowlist(
        Round storage round,
        uint16 roundIndex,
        address account
    ) internal {
        if (round.allowlist[account] == true) revert AlreadyInAllowlist(account);

        round.allowlist[account] = true;
        emit AddedToAllowlist(roundIndex, account);
    }

    function _setCustody(address custody) internal {
        if (custody == address(0)) revert InvalidCustodyAddress();

        emit CustodyChanged(_custody, custody);
        _custody = custody;
    }

    function _isAllowlisted(
        uint16 roundIndex,
        bytes32[] memory proof,
        address account
    ) internal view returns (bool) {
        bytes32 leaf = _getMerkleLeaf(account);

        Round storage round = _rounds[roundIndex];
        return proof.verify(round.merkleRoot, leaf) || round.allowlist[account];
    }

    function _getMerkleLeaf(address account) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, address(this), account));
    }

    function _estimateBuy(uint16 roundIndex, uint112 amount) internal view returns (uint112) {
        return uint112((uint256(_rounds[roundIndex].price) * amount) / _ONE);
    }

    function _getCurrentRoundIndex() internal view returns (uint16) {
        uint256 lastRoundIndex = _rounds.length;
        if (lastRoundIndex == 0) revert NoRounds();

        uint64 start;

        for (uint256 i = 0; i < lastRoundIndex; i++) {
            Round storage round = _rounds[i];
            start = round.start;
            // round is not started yet
            if (start > block.timestamp) {
                if (i == 0) revert RoundIsNotStarted(start);

                return (i - 1).toUint16();
            }
            // we're on i-th round
            if (start + round.duration > block.timestamp) return i.toUint16();
        }

        return (lastRoundIndex - 1).toUint16();
    }
}

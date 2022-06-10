// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../BaseContract.sol";
import "../IPermittableAndUpgradeable.sol";
import "../nft/INFT.sol";

// solhint-disable not-rely-on-time
contract Staking is BaseContract {
    using EnumerableMap for EnumerableMap.Bytes32ToBytes32Map;
    using SafeERC20Upgradeable for IPermittableAndUpgradeable;

    error InvalidLockPeriod();
    error UnownedNFT();
    error PrematureWithdrawal();
    error CustodyIsZeroAddress();

    event CustodyChanged(address indexed to);
    event Staked(address indexed from, uint256 indexed stakeTokenId);
    event LockPeriodsChanged(LockPeriod[] lockPeriods);

    struct Stake {
        uint256 amount;
        uint256 unlockTimestamp;
    }

    struct LockPeriod {
        uint256 period;
        uint256 rewardPercentage;
    }

    uint256 internal constant _PERCENTAGE_DECIMALS = 4;

    IPermittableAndUpgradeable private _token;
    EnumerableMap.Bytes32ToBytes32Map private _poolSettings;
    INFT internal _stakeNFT;
    address private _custody;
    mapping(uint256 => Stake) public stakes;

    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() initializer {}

    function initialize(
        address stakeNFT,
        address token,
        address custody,
        address acl
    ) external initializer {
        if (custody == address(0)) revert CustodyIsZeroAddress();

        __BaseContract_init(acl);
        _custody = custody;
        _stakeNFT = INFT(stakeNFT);
        _token = IPermittableAndUpgradeable(token);

        emit CustodyChanged(custody);
    }

    /**
     * @notice
     * periods - in seconds
     * percentages - with 4 decimals, multiplied till integer (e.g. pass 60025 if you want 6.0025%)
     */
    function setLockPeriods(LockPeriod[] calldata lockPeriods) external onlyAdmin {
        uint256 count = lockPeriods.length;
        for (uint256 i = 0; i < count; i++) {
            // slither-disable-next-line unused-return
            _poolSettings.set(bytes32(lockPeriods[i].period), bytes32(lockPeriods[i].rewardPercentage));
        }

        emit LockPeriodsChanged(lockPeriods);
    }

    function getLockPeriods() external view returns (LockPeriod[] memory) {
        uint256 count = _poolSettings.length();
        LockPeriod[] memory res = new LockPeriod[](count);
        for (uint256 i = 0; i < count; i++) {
            (bytes32 bAmount, bytes32 bRewardPercentage) = _poolSettings.at(i);
            res[i] = LockPeriod(uint256(bAmount), uint256(bRewardPercentage));
        }

        return res;
    }

    function setCustody(address custody) external onlyAdmin {
        if (custody == address(0)) revert CustodyIsZeroAddress();

        _custody = custody;

        emit CustodyChanged(custody);
    }

    function stake(uint256 amount, uint256 lockPeriod) external returns (uint256 tokenId) {
        tokenId = _stake(amount, lockPeriod);
    }

    function stakeWithPermit(
        uint256 amount,
        uint256 lockPeriod,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 tokenId) {
        _token.permit(msg.sender, address(this), amount, deadline, v, r, s);

        tokenId = _stake(amount, lockPeriod);
    }

    function withdraw(uint256 tokenId) external {
        if (!_stakeNFT.isApprovedOrOwner(msg.sender, tokenId)) revert UnownedNFT();
        if (block.timestamp < stakes[tokenId].unlockTimestamp) revert PrematureWithdrawal();

        _token.safeTransfer(msg.sender, stakes[tokenId].amount);
        _stakeNFT.burn(tokenId);
    }

    function getCustody() external view returns (address custody) {
        custody = _custody;
    }

    function _stake(uint256 amount, uint256 lockPeriod) internal returns (uint256 tokenId) {
        uint256 rewardPercentage = uint256(_poolSettings.get(bytes32(lockPeriod)));
        if (rewardPercentage <= 0) revert InvalidLockPeriod();

        uint256 interest = (amount * rewardPercentage) / (100 * (10**_PERCENTAGE_DECIMALS));

        _token.safeTransferFrom(_custody, address(this), interest);
        _token.safeTransferFrom(msg.sender, address(this), amount);

        tokenId = _stakeNFT.mint(msg.sender);

        stakes[tokenId].amount = amount + interest;
        stakes[tokenId].unlockTimestamp = block.timestamp + lockPeriod;

        emit Staked(msg.sender, tokenId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../BaseContract.sol";
import "../IPermittableAndUpgradeable.sol";
import "../nft/INFT.sol";

error InvalidLockPeriod();
error UnownedNFT();
error PrematureWithdrawal();

contract Staking is BaseContract {
    using EnumerableMap for EnumerableMap.Bytes32ToBytes32Map;
    using SafeERC20Upgradeable for IPermittableAndUpgradeable;

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

    uint256 internal constant PERCENTAGE_DECIMALS = 4;

    mapping(uint256 => Stake) public stakes;
    EnumerableMap.Bytes32ToBytes32Map private poolSettings;
    address public custody;
    INFT internal nftStake;
    IPermittableAndUpgradeable tokenContract;

    /**
     * @custom:oz-upgrades-unsafe-allow constructor
     */
    constructor() initializer {}

    function initialize(
        INFT _nftStake,
        address _tokenContract,
        address _custody,
        address _acl
    ) external initializer {
        __BaseContract_init(_acl);
        custody = _custody;
        nftStake = _nftStake;
        tokenContract = IPermittableAndUpgradeable(_tokenContract);
    }

    /**
     * periods - in seconds
     * percentages - with 4 decimals, multiplied till integer (e.g. pass 60025 if you want 6.0025%)
     */
    function setLockPeriods(LockPeriod[] calldata lockPeriods) external onlyAdmin {
        for (uint256 i = 0; i < lockPeriods.length; i++) {
            poolSettings.set(bytes32(lockPeriods[i].period), bytes32(lockPeriods[i].rewardPercentage));
        }

        emit LockPeriodsChanged(lockPeriods);
    }

    function getLockPeriods() external view returns (LockPeriod[] memory) {
        uint256 count = poolSettings.length();
        LockPeriod[] memory res = new LockPeriod[](count);
        for (uint256 i = 0; i < count; i++) {
            (bytes32 bAmount, bytes32 bRewardPercentage) = poolSettings.at(i);
            res[i] = LockPeriod(uint256(bAmount), uint256(bRewardPercentage));
        }

        return res;
    }

    function setCustody(address _newCustody) external onlyAdmin {
        custody = _newCustody;

        emit CustodyChanged(_newCustody);
    }

    function stake(uint256 _amount, uint256 _lockPeriod) public returns (uint256) {
        uint256 rewardPercentage = uint256(poolSettings.get(bytes32(_lockPeriod)));
        if (rewardPercentage <= 0) revert InvalidLockPeriod();

        uint256 interest = (_amount * rewardPercentage) / (100 * (10**PERCENTAGE_DECIMALS));

        tokenContract.safeTransferFrom(custody, address(this), interest);
        tokenContract.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 stakeTokenId = nftStake.mint(msg.sender);

        stakes[stakeTokenId].amount = _amount + interest;
        stakes[stakeTokenId].unlockTimestamp = block.timestamp + _lockPeriod;

        emit Staked(msg.sender, stakeTokenId);

        return stakeTokenId;
    }

    function stakeWithPermit(
        uint256 _amount,
        uint256 _lockPeriod,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256) {
        tokenContract.permit(msg.sender, address(this), _amount, deadline, v, r, s);

        return stake(_amount, _lockPeriod);
    }

    function withdraw(uint256 _stakeTokenId) external {
        if (!nftStake.isApprovedOrOwner(msg.sender, _stakeTokenId)) revert UnownedNFT();
        if (block.timestamp < stakes[_stakeTokenId].unlockTimestamp) revert PrematureWithdrawal();

        tokenContract.safeTransfer(msg.sender, stakes[_stakeTokenId].amount);
        nftStake.burn(_stakeTokenId);
    }

    function getStakeInfo(uint256 _stakeTokenId) external view returns (Stake memory) {
        return stakes[_stakeTokenId];
    }
}

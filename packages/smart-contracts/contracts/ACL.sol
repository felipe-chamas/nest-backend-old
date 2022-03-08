import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract ACL is AccessControlUpgradeable {

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    /**
     * @dev Modifier to make a function callable by the admin account.
     */
    modifier onlyAdmin() {
        _checkRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _;
    }

    /**
     * @dev Modifier to make a function callable by a supervisor account.
     */
    modifier onlyManager() {
        _checkRole(MANAGER_ROLE, _msgSender());
        _;
    }
    function __ACL_init() internal onlyInitializing {
        __ACL_init_unchained();
    }

    function __ACL_init_unchained() internal onlyInitializing {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MANAGER_ROLE, _msgSender());
    }
}

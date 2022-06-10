// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../token-sale/TokenSale.sol";

// solhint-disable func-name-mixedcase,private-vars-leading-underscore
contract GodModeTokenSale is TokenSale {
    function __god_mode_setPaymentToken(address paymentToken) external {
        _paymentToken = IERC20Upgradeable(paymentToken);
    }

    function __god_mode_setGameToken(address gameToken) external {
        _gameToken = IERC20Upgradeable(gameToken);
    }

    function __god_mode_setVestingPeriod(uint32 vestingPeriod) external {
        _vestingPeriod = vestingPeriod;
    }

    function __god_mode_setCustody(address custody) external {
        _custody = custody;
    }

    function __god_mode_setACL(address acl) external {
        _accessControl = IACL(acl);
    }
}

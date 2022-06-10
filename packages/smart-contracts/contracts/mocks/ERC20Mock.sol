// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Sample ERC20 contract
contract ERC20Mock is ERC20 {
    uint8 internal _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 totalSupply_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(msg.sender, totalSupply_);
    }

    // solhint-disable comprehensive-interface
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

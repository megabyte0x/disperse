// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Disperse {
    error InvalidRecipientsAndAmountsLength();
    error TransferFailed();

    modifier checkLength(address[] memory recipients, uint256[] memory amounts) {
        if (recipients.length != amounts.length) {
            revert InvalidRecipientsAndAmountsLength();
        }
        _;
    }

    function disperseETH(address[] memory recipients, uint256[] memory amounts)
        public
        payable
        checkLength(recipients, amounts)
    {
        uint256 length = recipients.length;

        for (uint256 i = 0; i < length; i++) {
            (bool success,) = payable(recipients[i]).call{value: amounts[i]}("");
            if (!success) {
                revert TransferFailed();
            }
        }
    }

    function disperseToken(address token, address[] memory recipients, uint256[] memory values)
        external
        checkLength(recipients, values)
    {
        bool success = false;
        uint256 total = 0;
        uint256 length = recipients.length;

        for (uint256 i = 0; i < length; i++) {
            total += values[i];
        }
        success = IERC20(token).transferFrom(msg.sender, address(this), total);
        if (!success) {
            revert TransferFailed();
        }

        for (uint256 i = 0; i < length; i++) {
            success = IERC20(token).transfer(recipients[i], values[i]);
            if (!success) {
                revert TransferFailed();
            }
        }
    }

    function disperseTokenSimple(address token, address[] memory recipients, uint256[] memory values)
        external
        checkLength(recipients, values)
    {
        bool success = false;
        uint256 length = recipients.length;

        for (uint256 i = 0; i < length; i++) {
            success = IERC20(token).transferFrom(msg.sender, recipients[i], values[i]);
            if (!success) {
                revert TransferFailed();
            }
        }
    }
}

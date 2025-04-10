// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Disperse {
    // Function to disperse ETH to multiple addresses
    function disperseEther(address[] memory recipients, uint256[] memory values) external payable {
        require(recipients.length == values.length, "Disperse: recipients and values length mismatch");

        uint256 totalSent = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            address payable recipient = payable(recipients[i]);
            recipient.transfer(values[i]);
            totalSent += values[i];
        }

        // Return remaining ETH to sender
        uint256 remaining = msg.value - totalSent;
        if (remaining > 0) {
            payable(msg.sender).transfer(remaining);
        }
    }

    // Function to disperse ERC20 tokens to multiple addresses
    function disperseToken(IERC20 token, address[] memory recipients, uint256[] memory values) external {
        require(recipients.length == values.length, "Disperse: recipients and values length mismatch");

        uint256 totalSent = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transferFrom(msg.sender, recipients[i], values[i]), "Disperse: transfer failed");
            totalSent += values[i];
        }
    }

    // Function to disperse ERC20 tokens to multiple addresses with approval in advance
    function disperseTokenSimple(IERC20 token, address[] memory recipients, uint256[] memory values) external {
        require(recipients.length == values.length, "Disperse: recipients and values length mismatch");

        for (uint256 i = 0; i < recipients.length; i++) {
            token.transferFrom(msg.sender, recipients[i], values[i]);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Disperse} from "../src/Disperse.sol";
import {MockToken} from "./MockToken.sol";

contract DisperseTest is Test {
    Disperse disperse;
    MockToken token;

    address abc = vm.addr(334);
    address def = vm.addr(335);

    function setUp() public {
        vm.startPrank(msg.sender);
        disperse = new Disperse();
        token = new MockToken();
        token.mint(msg.sender, 10000 ether);
        token.approve(address(disperse), 10000 ether);
        vm.stopPrank();
    }

    function test_disperseETH() public {
        address[] memory recipients = new address[](2);
        recipients[0] = abc;
        recipients[1] = def;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;

        vm.deal(msg.sender, 4 ether);

        vm.startBroadcast(msg.sender);
        disperse.disperseETH{value: 4 ether}(recipients, amounts);
        vm.stopBroadcast();

        assertEq(abc.balance, 1 ether);
        assertEq(def.balance, 2 ether);
        assertEq(address(disperse).balance, 1 ether);
        assertEq(msg.sender.balance, 0 ether);
    }

    function test_disperseToken() public {
        address[] memory recipients = new address[](2);
        recipients[0] = abc;
        recipients[1] = def;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1000 ether;
        amounts[1] = 2000 ether;

        vm.startBroadcast(msg.sender);
        disperse.disperseToken(address(token), recipients, amounts);
        vm.stopBroadcast();

        assertEq(token.balanceOf(abc), 1000 ether);
        assertEq(token.balanceOf(def), 2000 ether);
        assertEq(token.balanceOf(address(disperse)), 0 ether);
        assertEq(token.balanceOf(msg.sender), 7000 ether);
    }

    function test_disperseTokenSimple() public {
        address[] memory recipients = new address[](2);
        recipients[0] = abc;
        recipients[1] = def;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1000 ether;
        amounts[1] = 2000 ether;

        vm.startBroadcast(msg.sender);
        disperse.disperseTokenSimple(address(token), recipients, amounts);
        vm.stopBroadcast();

        assertEq(token.balanceOf(abc), 1000 ether);
        assertEq(token.balanceOf(def), 2000 ether);
        assertEq(token.balanceOf(address(disperse)), 0 ether);
        assertEq(token.balanceOf(msg.sender), 7000 ether);
    }
}

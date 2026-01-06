// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAuthorizationManager {
    function verifyAuthorization(
        address vault,
        address recipient,
        uint256 amount,
        bytes32 nonce
    ) external returns (bool);
}

contract SecureVault {
    IAuthorizationManager public authManager;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    error Unauthorized();
    error InsufficientBalance();

    constructor(address _authManager) {
        authManager = IAuthorizationManager(_authManager);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(
        address payable recipient,
        uint256 amount,
        bytes32 nonce
    ) external {
        if (address(this).balance < amount) {
            revert InsufficientBalance();
        }

        bool ok = authManager.verifyAuthorization(
            address(this),
            recipient,
            amount,
            nonce
        );

        if (!ok) {
            revert Unauthorized();
        }

        // Effects before interaction
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "ETH_TRANSFER_FAILED");

        emit Withdrawal(recipient, amount);
    }
}

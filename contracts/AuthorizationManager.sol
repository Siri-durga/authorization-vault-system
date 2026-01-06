// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuthorizationManager {
    address public owner;

    // authorizationHash => consumed?
    mapping(bytes32 => bool) public usedAuthorizations;

    event AuthorizationConsumed(bytes32 indexed authHash);

    error AlreadyUsed();
    error InvalidCaller();

    constructor() {
        owner = msg.sender;
    }

    function verifyAuthorization(
        address vault,
        address recipient,
        uint256 amount,
        bytes32 nonce
    ) external returns (bool) {
        // Bind authorization to context
        bytes32 authHash = keccak256(
            abi.encodePacked(
                block.chainid,
                vault,
                recipient,
                amount,
                nonce
            )
        );

        if (usedAuthorizations[authHash]) {
            revert AlreadyUsed();
        }

        // Mark as consumed BEFORE returning
        usedAuthorizations[authHash] = true;

        emit AuthorizationConsumed(authHash);
        return true;
    }
}

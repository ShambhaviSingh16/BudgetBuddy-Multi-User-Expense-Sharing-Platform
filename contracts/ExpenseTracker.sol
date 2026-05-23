
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExpenseTracker {
    uint public expenseCount = 0;

    struct Expense {
        uint id;
        address payer;
        string description;
        uint amount;
        string category;
        uint timestamp;
    }

    mapping(uint => Expense) public expenses;
    mapping(address => uint[]) public userExpenses;

    event ExpenseAdded(uint id, address payer, uint amount, string description);

    function addExpense(string memory _description, uint _amount, string memory _category) public {
        expenseCount++;
        expenses[expenseCount] = Expense(expenseCount, msg.sender, _description, _amount, _category, block.timestamp);
        userExpenses[msg.sender].push(expenseCount);

        emit ExpenseAdded(expenseCount, msg.sender, _amount, _description);
    }

    function getMyExpenses() public view returns (Expense[] memory) {
        uint[] memory ids = userExpenses[msg.sender];
        Expense[] memory myExpenses = new Expense[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            myExpenses[i] = expenses[ids[i]];
        }

        return myExpenses;
    }
}

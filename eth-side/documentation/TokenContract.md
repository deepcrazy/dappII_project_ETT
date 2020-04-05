# CRED Token Contract Specifications

[credToken.sol](../contracts/credToken.sol)

_Based on the ERC20 standard_  
[EIP20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md)  
[OpenZepplin ERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol)  
**All ERC20 functions + variables are used accordingly**

## Functions

| Function name | Input Parameters | Return Parameters | Called By | Description |
| ------------- | ---------------- | ----------------- | --------- | ----------- |
| buyToken | uint256 value | | shareholder | allows shareholder to purchase CRED tokens according to the rate and `status = 0` in the shareholder contract, update `deployable` in shareholder contract with current DAI balance |
| withdrawToken | uint256 value | | shareholder | allows shareholder to withdraw CRED according to the rate and if `status = 2` in shareholder contract |
| payLoan | uint256 value | | user | allows user to pay monthly payment for the loan, reverts if incorrect amount, record payment in loan contract and shareholder contract |
| fundLoan | bytes32 loanId, bool yesNo | | admin | If `status = 1` in shareholder contract, allow the admin to fund loans. Update status in loan contract, get requested amount and expected from loan contract and send to user, update `deployed` and `receivable` in shareholder contract |

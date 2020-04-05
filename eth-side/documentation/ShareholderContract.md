# Shareholder Contract Specifications

[ShareholderContract.sol](../contracts/shareHolderContract.sol)

_Based on the ERC20 standard_  
[EIP20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md)  
[OpenZepplin ERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol)  
**All ERC20 functions + variables are used accordingly**

## Variable Names

| Name          | Type    | Structure | Visibility | Purpose                                                                               |
| ------------- | ------- | --------- | ---------- | ------------------------------------------------------------------------------------- |
| status        | uint4   | N/A       | public    | Track the status between fundraising, deploying, distribution                         |
| \_totalSupply | uint256 | N/A       | public     | Purpose track the number of ERC20 tokens issued (standard ERC20 variable)             |
| deployable    | uint256 | N/A       | public     | The amount of DAI available to be deployed in loans (equal to value of DAI for the contract address) |
| deployed      | uint256 | N/A       | public     | The amount of DAI deployed in loans                                                   |
| receivable    | uint256 | N/A       | public     | The maximum return in DAI of the deployed loans (principal + interest)                |
| collected     | uint256 | N/A       | public     | The total amount of DAI collected in loan payments (at the end of stage, it equals amount of DAI for the contract)                                    |
| defaulted     | uint256 | N/A       | public     | The total amount of DAI in defaulted loans                                            |
| rate          | uint256 | N/A       | public     | The distribution rate for withdraw (ie. 1 CRD = 1.2 DAI)                              |

## Functions

| Function name   | Input Parameters                               | Return Parameters      | Called By              | Description                                                                                                                            |
| --------------- | ---------------------------------------------- | ---------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| shareholderFund | `uint256 tokenNum`                             | `uint256 tokenBalance` | shareholder            | allows investment by shareholders, purchased based on current `rate`, only runs if status = 0, mints tokens, transfer DAI from shareholder to contract address            |
| changeStatus    | N/A                                            | N/A                    | owner                  | increments status, must meet checks to change status (0 -> 1: get DAI balance for `deployable`) (1 -> 2: `deployable = deployed`, `receivable = collected + defaulted`, set `rates`)                                                                        |
| fundLoan        | `uint256 amtDeployed`, `uint256 amtReceivable` | N/A                    | owner                  | check to verify deployed < receivable, check to verify deployed + amtDeployed <= deployable, add amount to `deployed` and `receivable` |
| payLoan         | `uint256 amt`                                  | N/A                    | other contract / admin | mark a certain amount as paid                                                                                                          |
| defaultLoan     | `uint256 amt`                                  | N/A                    | admin                  | mark an amount as defaulted                                                                                                            |
| withdraw        | `uint256 amt`                                  | N/A                    | shareholder            | burn tokens from shareholder account, transfer DAI tokens to, only when status = 2 shareholder                                                               |

## Status State

| Status Number        | Initial State                                                                                                             | Transition                                                                                                                                    | End State                                                     | Continuation                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| **0** (fundraising)  | `_totalSupply = 0` \& `rate=1` or `_totalSupply = previous amount` \& `rate = previous rate`                               | `shareholderFund` called to send DAI to contract for tokens                                                                                   | `_totalSupply = uint256 number`                               | `changeStatus` called, `deployable = DAI balance` |
| **1** (deploying)    | `deployable = DAI balance`, `deployed = 0`, `receivable = 0`, `collected = 0`, `defaulted = 0`                           | `fundLoan` called to increase `deployed` and `receivable`, `payLoan` called to change `collected`, `defaultLoan` called to change `defaulted` | `deployable = deployed`, `receivable = collected + defaulted` | `changeStatus` called              |
| **2** (distributing) | `deployable = deployed`, `receivable = collected + defaulted`, `rate = collected/_totalSupply` | `withdraw` called to distribute DAI and burn tokens                                                                                           | `_totalSupply -= withdrawn amount`                            | `changeStatus` called (cycle repeats)              |

## Questions/Thoughts
- Need to implement scale factor for interact with DAI contract.
- What if someone pays after the status changes from deploying to distribution?
- Other option: start `defaulted` = `receivable` and decrease that amount as payments are made.
  > How to track when all loans are complete? Using time?
- How to change status?
  > Using time, manually, etc...
- How to store fund data/history?
  > IPFS?

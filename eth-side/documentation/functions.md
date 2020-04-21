## Functions

**`EventCreation.sol` Contract**
| Function name | Function visibility | Input Parameters | Return Parameters | Function Type | Modifier/Called By | Description |
| ------------- | ----|-------------- | ------------------------------------- | -------|------- | -------------------------------------------------------------------------------------------------- |
| createEvent | external | `uint256 maximumSeats` | `bool eventCreated, address eventTicketingTokenAddress, uint8 eventId` | N/A | onlyEventOwner | - creates the event (lets say small music concert) every time owner wants to create<br> - Will have maximum limit on the total number of seats available for the event <br> - deploys the `EventTicketingToken` contract <br> - notifies the event owner about the event creation <br> - creates the mapping of `event created` with the `event owner` address|
| maximumSeats | public | N/A | `uint256 maximumSeats` | view | N/A| - fetch the value of maximum number of tokens sold |
|constructor | public | N/A | N/A | N/A | N/A | - set the owner of the event |

**`EventTicketingToken.sol` Contract**
| Function name | Function visibility | Input Parameters | Return Parameters | Function Type | Modifier/Called By | Description |
| ------------- | ----|-------------- | ------------------------------------- | -------|------- | -------------------------------------------------------------------------------------------------- |
| buyToken | public |`uint256 tokenId` | `uint256 tokenId, bool tokenBought` | payable | onlyBuyer | - Used to buy the tickets (which are basically now treated as tokens) for the event.<br> - Mint the token, buyer is willing to buy.<br> - Increment the total number of tokens sold. <br> - Notifies the buyer with the token details (like price)<br> **Note: tokenId will be basically corresponds to the seatNumber.** |
| isEventOwner | public | N/A | `bool isEventOwner` | view | N/A | - Used to check whether the current login in user is event owner or buyer |
| constructor | public | `address _eventOwner` | N/A | N/A | N/A | - validates the address of the event owner<br> - store the address of event owner<br> - notify the event is initialized |

**ERC721 Contract functions (High-Level layout)**
| Function name | Input Parameters | Return Parameters | Function Type (pure/view/payable) |Modifier/Called By | Description |
| ------------- | ------------------ | ------------------------------------- | -------|------- | -------------------------------------------------------------------------------------------------- |
| ownerOf | `uint256 tokenId` | `address _owner` | N/A | This function is used to get the owner/buyer of the tokenId |
| safeMint | `uint256 tokenId` | | onlyBuyer | This function will be used to mint the token which is willing to buy,<br> **Note: There will be additional checks to restrict the buyer to mint again and also additional checks to restrict minting of invalid tokenIds** |
| burn | `uint256 tokenIds` | N/A | onlyEventOwner | This function is used to burn all the tokens after the event ends up. |

**`SafeMath.sol` Contract functions (High-Level layout)**
**Main Contract functions**
| Function name | Input Parameters | Return Parameters | Function identifier |Modifier/Called By | Description |
| ------------- | ------------------ | ------------------------------------- | -------|------- | -------------------------------------------------------------------------------------------------- |
| add | `uint256 a, uint256 8` | `uint256 sum` | N/A | This function will be used to calculate the number of tokens sold and to restrict the overflow error |

**Few `Future scope` functions**
| Function name | Input Parameters   | Return Parameters      | Modifier/Called By | Description                                                                                        |
| ------------- | ------------------ | ---------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| registerUser  | N/A                | `bytes32 userId`       | User/Owner         | To register the user logged in for the first time and creates the userId for new users registered. |
| getUserId     | `address _address` | `bytes32 userId`       | Logged in User     | Get the user id for the current logged in user                                                     |
| getAllUserId  | N/A                | `bytes32[] userIdList` | Only Owner         | Get all the user ids for all users                                                                 |

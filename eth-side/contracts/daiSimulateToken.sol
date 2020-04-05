pragma solidity ^0.6.0;
import "./openZeppelin/ERC20.sol";

//name this contract whatever you'd like
contract DAI is ERC20 {
    fallback() external { revert();}
    receive() external payable { revert(); }
    /* Public variables of the token */

    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
    string public symbol;                 //An identifier: eg SBX
    string public version = 'H1.0';       //human 0.1 standard. Just an arbitrary versioning scheme.

//
// CHANGE THESE VALUES FOR YOUR TOKEN
//

//make sure this function name matches the contract name above. So if you're token is called TutorialToken, make sure the //contract name above is also TutorialToken instead of ERC20Token
    constructor() public {
        name = "DAI";                                   // Set the name for display purposes
        decimals = 0;                            // Amount of decimals for display purposes
        symbol = "DAI";                               // Set the symbol for display purposes
    }
    function buyToken(address buyer, uint256 value) external {
        _mint(buyer,value);
    }
    function removeToken(address remover, uint256 value) external {
        require(balanceOf(remover)>=value,"not enough token to burn");
        _burn(remover,value);
    }
    /* Approves and then calls the receiving contract */
    function approveAndCall(address _spender, uint256 _value, bytes memory _extraData) public returns (bool) {
        approve(_spender,_value);
        emit Approval(msg.sender, _spender, _value);

        //call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
        //receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
        //it is assumed that when does this that the call *should* succeed, otherwise one would use vanilla approve instead.
        (bool success, bytes memory returnData) = _spender.call(
           abi.encodeWithSignature("receiveApproval(address,uint256,address,bytes)", msg.sender, _value, this, _extraData)
        );
        if(!success){
            revert();
        }
        
        return true;
    }
}
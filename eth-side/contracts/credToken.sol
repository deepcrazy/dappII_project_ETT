pragma solidity ^0.6.0;
import "./ERC20.sol";


interface daiInterface {
    function balanceOf(address) external view returns (uint256);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
}


interface shareHolderInterface {
    function getStatus() external view returns (uint24);

    function getRate() external view returns (uint256);

    function setDeployable(uint256 amt) external;
}


interface loanContractInterface {
    function fundLoan(bytes32 _credId, bool _yesNo) external returns (uint8);

    function getApprovedLoan(bytes32 _loanId) external view returns (uint256);

    function getPayment(bytes32 _loanId)
        external
        view
        returns (uint256[] memory, uint8[] memory, uint256, uint256);

    function getUser(bytes32 _credId) external view returns (address[] memory);

    function getActiveLoan(bytes32 _credId) external view returns (bytes32);

    function getCredId(address _address) external view returns (bytes32);

    function makePayment(address _userAddress) external returns (uint256);
}


//name this contract whatever you'd like
contract CredToken is ERC20 {
    fallback() external {
        revert();
    }

    receive() external payable {
        revert();
    }

    /* Public variables of the token */

    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name; //fancy name: eg Simon Bucks
    uint8 public decimals; //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
    string public symbol; //An identifier: eg SBX
    string public version = "H1.0"; //human 0.1 standard. Just an arbitrary versioning scheme.
    address public owner;
    address private shareHolderContract;
    address public daiAddress;
    address private loanContract;
    bool public isSetShareHolderContract;
    bool public isSetLoanContract;
    event LogBalances(
        uint256 updatedUserBal,
        uint256 updatedAdminBal,
        uint256 updatedContractBal
    ); //  Log event with User bal, admin's bal, LoanContract's balance after funding the loan
    event LogTransferStatus(bool transferStatus); //  Log event with the transfer of funds status from contract to user account
    event LogStatus(uint24 indexed status); //  Log event for deployed status
    event LogPaymentStatus(
        bool status,
        address userAddress,
        uint256 monthlyPayment
    ); // Log event with Payment status, user's address and monthly Payment

    //
    // CHANGE THESE VALUES FOR YOUR TOKEN
    //

    //make sure this function name matches the contract name above. So if you're token is called TutorialToken, make sure the //contract name above is also TutorialToken instead of ERC20Token
    constructor(address _daiAddress) public {
        name = "CRED TOKEN"; // Set the name for display purposes
        decimals = 0; // Amount of decimals for display purposes
        symbol = "CRED"; // Set the symbol for display purposes
        owner = msg.sender;
        daiAddress = _daiAddress;
    }

    function getStatus() public returns (uint24) {
        // calling `getStatus` function of the shareHolder contract for getting the status
        shareHolderInterface shareHolderInstance = shareHolderInterface(
            shareHolderContract
        ); //  creating the instance of deployed shareHolder contract
        uint24 receivedStatus = shareHolderInstance.getStatus(); //  Get deployed status
        emit LogStatus(receivedStatus); //  Emit event of the received status
        return receivedStatus;
    }

    function fundLoan(bytes32 _credId, bool _yesNo)
        public
        _onlyOwner()
        returns (bool _fundstatus)
    {
        if (_yesNo == true) {
            require(getStatus() == 1, "Status is not deployed"); //  Check the status is deployed or not

            loanContractInterface loanContractInstance = loanContractInterface(
                loanContract
            ); //  Get the instance of the LoanContract
            uint8 fundLoanStatus = loanContractInstance.fundLoan(
                _credId,
                _yesNo
            ); //  Get the fundLoanStatus from the LoanContract and calculate the monthly payment and total payment also
            require(
                fundLoanStatus == 6,
                "Fund Loan status not changed to funded."
            ); //  Check fundLoanStatus is funded or not. (Doing this before transferring funds to prevent re-entrancy)

            bytes32 _loanId = loanContractInstance.getActiveLoan(_credId); //  Get the loanId of the loan
            address[] memory userAddresses = loanContractInstance.getUser(
                _credId
            ); //  User address to whom fund the loan
            uint256 principalAmtApproved = loanContractInstance.getApprovedLoan(
                _loanId
            );

            // calling `transfer` function of the DAI contract for funding loan amount to user
            daiInterface daiContractInstance = daiInterface(daiAddress); //  creating the instance of deployed DAI contract

            bool fundStatus = daiContractInstance.transfer(
                userAddresses[0],
                principalAmtApproved
            ); //  transfer DAI from contract to user account
            require(fundStatus, "Error: Fund Loan transaction failed."); //  Check fund loan transaction status
            uint256 userBal = getWadBalance(userAddresses[0]); //  Get user's balance
            uint256 contractOwnerBal = getWadBalance(msg.sender); //  Get the contract owner's balance
            uint256 contractBal = getWadBalance(address(this)); //  Get contract's balance
            emit LogBalances(userBal, contractOwnerBal, contractBal); //  Emit event with balances of user, owner and credToken contract
            emit LogTransferStatus(fundStatus); //  Emit the event with  the transfer funds status from credToken contract to user

            return (fundStatus);
        } else {
            loanContractInterface loanContractInstance = loanContractInterface(
                loanContract
            );
            uint8 fundLoanStatus = loanContractInstance.fundLoan(
                _credId,
                _yesNo
            );
            require(
                fundLoanStatus == 7,
                "Fund Loan status not changed to 'Not funded'"
            );
            return false;
        }
    }

    /// @notice Get the balance in wad for the address being passed as input
    /// @param _address Address to query balance for
    /// @return uint Balance of the user/admin/contract
    function getWadBalance(address _address) internal view returns (uint256) {
        // emit LogDaiContractAddress(daiAddress);

        // calling `balanceOf` function of the DAI contract for getting the balance
        daiInterface daiContractInstance = daiInterface(daiAddress); //  creating the instance of deployed DAI contract
        uint256 wadBalance = daiContractInstance.balanceOf(_address);
        return wadBalance;
    }

    function validateCallerAddress(address _address) internal pure {
        require(_address != address(0), "Error: User is of zero address.");
    }

    /// @notice Modifier to check user is not Owner
    modifier _notOwner() {
        validateCallerAddress(msg.sender); //  Validate the caller's address
        require(!(msg.sender == owner), "Error: Caller is a owner.");
        _;
    }

    modifier _onlyOwner() {
        validateCallerAddress(msg.sender); //  Validate the caller's address
        require(msg.sender == owner, "Error: Caller is not owner.");
        _;
    }
    modifier _onlyShareHolderContract() {
        validateCallerAddress(msg.sender); //  Validate the caller's address
        require(
            isSetShareHolderContract == true,
            "Haven't set Share Holder Contract yet"
        );
        require(
            msg.sender == shareHolderContract,
            "Error: Caller is not shareHolderContract."
        );
        _;
    }

    function setLoanContract(address _loanContractaddress) public _onlyOwner() {
        require(isSetLoanContract == false, "Loan contract is already set");
        loanContract = _loanContractaddress;
        isSetLoanContract = true;
    }

    function setShareHolderContract(address _address) public _onlyOwner() {
        require(
            isSetShareHolderContract == false,
            "Share holder contract is already set"
        );
        shareHolderContract = _address;
        isSetShareHolderContract = true;
    }

    function buyToken(uint256 value) public returns (bool) {
        require(
            isSetShareHolderContract == true,
            "Owner has not set shareHolderContract address"
        );
        shareHolderInterface shareHolderInstance = shareHolderInterface(
            shareHolderContract
        );
        uint24 status = shareHolderInstance.getStatus();
        require(status == 0, "Not in fundraising status");
        uint256 rate = shareHolderInstance.getRate();
        uint256 appropriateDai = value.mul(rate);
        daiInterface dai = daiInterface(daiAddress);
        require(
            dai.allowance(msg.sender, address(this)) >= appropriateDai,
            "Not enough DAI"
        );
        bool isSuccess = dai.transferFrom(
            msg.sender,
            address(this),
            appropriateDai
        );
        require(isSuccess, "Error: Fund Transaction failed.");
        _mint(msg.sender, value);
        shareHolderInstance.setDeployable(dai.balanceOf(address(this)));
        return true;
    }

    function withdrawToken(uint256 value) public returns (bool) {
        require(
            isSetShareHolderContract == true,
            "Owner has not set shareHolderContract address"
        );
        shareHolderInterface shareHolderInstance = shareHolderInterface(
            shareHolderContract
        );
        uint24 status = shareHolderInstance.getStatus();
        require(status == 2, "Not in distributing status");
        uint256 rate = shareHolderInstance.getRate();
        require(balanceOf(msg.sender) >= value, "not enough token to burn");
        daiInterface dai = daiInterface(daiAddress);
        uint256 appropriateDai = value.mul(rate);
        bool isSuccess = dai.transfer(msg.sender, appropriateDai);
        require(isSuccess, "Error: Burn Transaction failed.");
        _burn(msg.sender, value);
        return true;
    }

    /* Approves and then calls the receiving contract */
    function approveAndCall(
        address _spender,
        uint256 _value,
        bytes memory _extraData
    ) public returns (bool) {
        approve(_spender, _value);
        emit Approval(msg.sender, _spender, _value);

        //call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
        //receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
        //it is assumed that when does this that the call *should* succeed, otherwise one would use vanilla approve instead.
        (bool success, ) = _spender.call(
            abi.encodeWithSignature(
                "receiveApproval(address,uint256,address,bytes)",
                msg.sender,
                _value,
                this,
                _extraData
            )
        );
        if (!success) {
            revert();
        }

        return true;
    }

    function makePayment() public _notOwner() {
        loanContractInterface loanContractInstance = loanContractInterface(
            loanContract
        ); //  Get the instance of the LoanContract
        uint256 _monthlyPayment = loanContractInstance.makePayment(msg.sender);

        // calling `transferFrom` function of the DAI contract for accepting payment from user to the contract wallet
        daiInterface daiContractInstance = daiInterface(daiAddress); //  creating the instance of deployed DAI contract
        bool paymentStatus = daiContractInstance.transferFrom(
            msg.sender,
            address(this),
            _monthlyPayment
        ); // Payment is made to contract wallet
        require(paymentStatus, "Error: DAI Payment failed"); // The transcation is reverted if the payment status is false
        emit LogPaymentStatus(paymentStatus, msg.sender, _monthlyPayment); //  Emit the event with payment status  and user's address and monthly payment made
    }
}

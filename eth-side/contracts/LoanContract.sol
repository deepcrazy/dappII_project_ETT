pragma solidity ^0.6.0;

import "./SafeMath.sol";


/// @notice Interface of Dai Stable coin (SCD token)
interface stableCoinInterface {
    function balanceOf(address) external view returns (uint256);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(address, address, uint256) external returns (bool);
}


/**
 * @dev Contract for the loan request process.
 *
 * Make the loan request and store the loan status as requested in blockchain
 * Requested loan can be approved/not approved by Owner and status  changes to approved/not approved
 * Approved loan can be accepted/not accepted by User and status changes to accepted/not accepted
 * Accepted loan can be funded/not funded by Owner and status changes to funded/not funded
 * `LoanContract` restores this intuition by reverting the transaction when any `require` conditions fails.
 *
 * Using this contract, developer can setup the basic lending process similar to bank.
 */
contract LoanContract {
    address contractOwner; // store the owner of the contract
    address public credTokenContractAddress;
    address public daiContractaddress;
    uint256 scaleFactor = 1e18; // scale factor to convert float into integers
    event CreateCredId(address indexed addressOwner, bytes32 indexed credId); //  Log event with address and Credefi Id of user
    event LogRequestLoan(
        bytes32 indexed loadId,
        uint8 indexed status,
        uint256 indexed timeStamp
    ); //  Log event with loanId, its status and date(in seconds) for requested loan
    event LogApproveLoan(
        bytes32 indexed loadId,
        uint8 indexed status,
        uint256 indexed timeStamp
    ); //  Log event with loanId, its status and date(in seconds) for approved loan
    event LogAcceptLoan(
        bytes32 indexed loadId,
        uint8 indexed status,
        uint256 indexed timeStamp
    ); //  Log event with loanId, its status and date(in seconds) for accepted loan
    event LogFundLoan(bytes32 indexed loadId, uint8 indexed status); //  Log event with loanId and its status for funded loan
    event LogTransfer(
        uint256 updatedUserBal,
        uint256 updatedAdminBal,
        uint256 updatedContractBal
    ); //  Log event with User bal, admin's bal, LoanContract's balance after funding the loan
    event LogPaymentStatus(uint256 monthlyPayment); // Log event with Payment status, user's address and monthly Payment

    /**
     * @dev Contract for the loan request process.
     *
     * `Constructor` called automatically while deploy and set the user as Owner whoever deploys the 'LoanContract' contract
     */
    constructor(address _credTokenContractAddress) public {
        contractOwner = msg.sender;
        credTokenContractAddress = _credTokenContractAddress;
        daiContractaddress = 0xC4375B7De8af5a38a93548eb8453a498222C4fF2;
    }

    //  Custom data type for storing User Ids
    struct User {
        //  User's credefi id and ethereum address
        bytes32 credId;
        address[] ethAddress;
        // Optional User Id params - Bright Id, Bloom Id and Scanned Passport Id of the user
        bytes32 brightId;
        bytes32 bloomId;
        bytes32 passportScanId;
    }

    // Custom data type for storing Loan Terms for the loan
    struct LoanTerms {
        uint256 principalAmt; //  principal amount in DAI
        uint256 interestRate; //  interestRate is annually
        uint8 duration; //  duration is in months
    }

    // Custom data type for storing the Payment details for the loan
    struct PaymentDetails {
        uint256[] dueDates; //  monthly due dates for the loan
        uint8[] statuses; //  status of payment corresponding to monthly due dates
        uint256 monthlyPayment; //  amount to be paid monthly for the loan
        uint256 totalPayment; // total amount including interest for the loan
    }

    mapping(address => bytes32) credId; //  mapping of user address with the credId
    mapping(bytes32 => User) userInfo; //  mapping of credId with the User struct
    bytes32[] credIdList; //  Array for storing the list of cred Ids
    mapping(bytes32 => bytes32) activeLoans; //  mapping of credId with active loan Id
    mapping(bytes32 => bytes32[]) inactiveLoans; //  mapping of credId with the array of inactive loan Ids

    mapping(bytes32 => LoanTerms) loanRequested; //  mapping of loanId with the loan terms requested (LoanTerms struct)
    mapping(bytes32 => LoanTerms) loanApproved; //  mapping of loanId with the loan terms approved (LoanTerms struct)

    mapping(bytes32 => uint8) loanStatus; //  mapping of loanId with the loanStatus
    mapping(bytes32 => uint256) loanRequestedDate; //  mapping of loanId with date when loan is requested
    mapping(bytes32 => uint256) loanApprovedDate; //  mapping of loanId with date when loan is approved or not approved
    mapping(bytes32 => uint256) loanAcceptedDate; //  mapping of loanId with date when loan is accepted or not accepted
    mapping(bytes32 => uint256) loanFundedDate; //  mapping of loanId with date when loan is funded

    mapping(bytes32 => PaymentDetails) userLoanPayment; //  mapping of loanId with the PaymentDetails struct
    mapping(bytes32 => uint256) paymentCounter; //  Track payments paid for the user

    /// @notice Check user/owner address is zero or not
    /// @param _address An address for whom to validate it is zero or not.
    function validateCallerAddress(address _address) internal pure {
        require(_address != address(0), "Error: User is of zero address.");
    }

    /// @notice Validate Cred Id is null or not.
    /// @param _credId Credefi Id of the User/Owner
    function validateCredId(bytes32 _credId) internal pure {
        require(
            _credId !=
                0x0000000000000000000000000000000000000000000000000000000000000000,
            "Error: Cred Id doesn't exists."
        );
    }

    /// @notice Validate Loan Id is null or not.
    /// @param _loanId Loan Id corresponds to the Loan request for the user
    function validateLoanId(bytes32 _loanId) internal pure {
        require(
            _loanId !=
                0x0000000000000000000000000000000000000000000000000000000000000000,
            "Error: Loan Id is 0."
        );
    }

    /// @notice Modifier to check user is not Owner
    modifier _notOwner(address _address) {
        validateCallerAddress(_address); //  Validate the caller's address
        if (_address != credTokenContractAddress)
            require(!(_address == contractOwner), "Error: Caller is a owner.");
        else
            require(
                (!(_address == contractOwner)) ||
                    _address == credTokenContractAddress,
                "Error: Caller is a owner."
            );
        _;
    }

    /// @notice Modifer to check user is only owner.
    modifier _onlyOwner() {
        validateCallerAddress(msg.sender); //  Validate the caller's address
        require(msg.sender == contractOwner, "Error: Caller is not owner.");
        _;
    }

    /// @notice Modifier to check caller is credTokenContractAddress.
    modifier _onlyCredTokenContract() {
        require(
            msg.sender == credTokenContractAddress,
            "Error: Caller is not credToken contract's address"
        );
        _;
    }

    /// @notice Function to check user is Owner
    /// @return _isOwner True if user is Owner and False if user is normal user
    function isOwner() public view returns (bool _isOwner) {
        validateCallerAddress(msg.sender);
        if (msg.sender == contractOwner) return true;
        else return false;
    }

    /// @notice Function to create Credefi Id(credId) for logged in user
    /// @return _credId Unique Credefi Id for the user logged for the first time
    function registerUser() public returns (bytes32 _credId) {
        validateCallerAddress(msg.sender); //  Validate the caller's (user/owner) address
        require(
            credId[msg.sender] ==
                0x0000000000000000000000000000000000000000000000000000000000000000,
            "Cred Id of user already exists."
        );
        bytes32 _newCredId = (sha256(abi.encodePacked(msg.sender, now))); //  Create the new credId for the user
        validateCredId(_newCredId); //  Validate the generated credId of the user
        credId[msg.sender] = _newCredId; //  Assign the credId to the user
        credIdList.push(_newCredId); //  Add the generated credId into the list of credIds
        userInfo[credId[msg.sender]].credId = credId[msg.sender]; //  Set the credId into the User info
        userInfo[credId[msg.sender]].ethAddress.push(msg.sender); //  Add the user's etheereum address into the User info
        emit CreateCredId(msg.sender, _newCredId); //  Emit an event after creating the credId for the user
        return credId[msg.sender];
    }

    /// @notice Function to fetch the Credefi Id(credId) for the logged in user
    /// @return _credId Credefi Id of the user
    function getCredId(address _address)
        public
        view
        _notOwner(msg.sender)
        returns (bytes32 _credId)
    {
        validateCallerAddress(_address); //  Validate the user's address
        // Check for the credId of the user
        require(
            credId[_address] !=
                0x0000000000000000000000000000000000000000000000000000000000000000,
            "Cred Id of user is null."
        );
        return credId[_address];
    }

    /// @notice Function to fetch all the Credefi Ids(credIds) for all users
    /// @return _credIds List of Credefi Ids for all Users.
    function getAllCredId()
        public
        view
        _onlyOwner()
        returns (bytes32[] memory _credIds)
    {
        //  Check for the credIds list
        require(credIdList.length > 0, "Error: CredId's list is empty.");
        return credIdList;
    }

    /// @notice Function to get the User information like ethereum addresses, brightId, bloomId and passportScanId
    /// @param  _credId Credefi Id of the User
    /// @return _ethAdresses Ethereum Address of the user
    /// @return _brightId Bright Id of the user
    /// @return _bloomId Bloom Id of the user
    /// @return _passportScanId Id of the Scanned passport of the user
    function getUser(bytes32 _credId)
        public
        view
        returns (
            address[] memory _ethAdresses,
            bytes32 _brightId,
            bytes32 _bloomId,
            bytes32 _passportScanId
        )
    {
        validateCallerAddress(msg.sender); //  Validate the caller's (user/owner) address
        validateCredId(_credId); //  Validate the credId of the caller
        return (
            userInfo[_credId].ethAddress,
            userInfo[_credId].brightId,
            userInfo[_credId].bloomId,
            userInfo[_credId].passportScanId
        );
    }

    /// @notice Function to get the Loan Id(loanId) for the active loans
    /// @param  _credId Credefi Id of the user
    /// @return _loanId Loan Id corresponds to the Loan request for the user
    function getActiveLoan(bytes32 _credId)
        public
        view
        returns (bytes32 _loanId)
    {
        validateCallerAddress(msg.sender); //  Validate the caller's (user/owner) address
        validateCredId(_credId); //  Validate credId of the caller
        return activeLoans[_credId];
    }

    /// @notice Function to get the all the Loan Ids(loanIds) for all inactive loans
    /// @param  _credId Credefi Id of the user
    /// @return _loanIds List of all Inactive Loan Ids corresponds to the Loan requests for the users
    function getInactiveLoan(bytes32 _credId)
        public
        view
        returns (bytes32[] memory _loanIds)
    {
        validateCredId(_credId); //  Validate the credId of the user
        return inactiveLoans[_credId];
    }

    /// @notice Function to validate the loan terms
    /// @param  _principalAmt Principal amount for the loan in DAI
    /// @param  _interestRate Interest rate for the loan
    /// @param  _duration Number of months as duration for the loan
    function validateLoanTerms(
        uint256 _principalAmt,
        uint256 _interestRate,
        uint8 _duration
    ) internal pure {
        //  Checks for the loan terms of the loan
        require(
            _principalAmt > 0,
            "Error: Principal amount should be greater than 0..!!"
        );
        require(
            _interestRate > 0,
            "Error: Interest rate should be greater than 0..!!"
        );
        require(
            _duration > 0,
            "Error: Term requested should be greater than 0..!!"
        );
    }

    /// @notice Function to calculate the monthly payments and total payment
    /// @param  _loanId Loan Id corresponds to the Loan request for the user
    /// @return _monthlyPayment Monthly installment for the loan user has to pay
    /// @return _totalPayment Total payment of the loan including interest rate
    function calulatePayments(bytes32 _loanId)
        private
        view
        returns (uint256, uint256)
    {
        //  Calculations for interest rate, monthly payment and total payment
        uint256 r_amount = SafeMath.div(
            SafeMath.mul(
                loanApproved[_loanId].interestRate,
                loanApproved[_loanId].duration
            ),
            12
        );
        uint256 unscaledTotalPayment = SafeMath.mul(
            loanApproved[_loanId].principalAmt,
            SafeMath.add(SafeMath.mul(1, scaleFactor), r_amount)
        );
        uint256 _totalPayment = SafeMath.div(unscaledTotalPayment, scaleFactor);
        uint256 _monthlyPayment = SafeMath.div(
            _totalPayment,
            loanApproved[_loanId].duration
        );
        return (_monthlyPayment, _totalPayment);
    }

    /// @notice Function to request the loan
    /// @param  _principalAmt Principal amount request for the loan
    /// @param  _interestRate Interest rate for the loan
    /// @param  _duration Number of months as duration for the loan
    /// @return loanId Loan Id corresponds to the Loan request for the user
    /// @return _loanStatus Status of the loan request
    /// @return _loanRequestedDate Date on which loan is requested
    function requestLoan(
        uint256 _principalAmt,
        uint256 _interestRate,
        uint8 _duration
    )
        public
        _notOwner(msg.sender)
        returns (bytes32 loanId, uint8 _loanStatus, uint256 _loanRequestedDate)
    {
        validateLoanTerms(_principalAmt, _interestRate, _duration); //  Validate the loan terms
        bytes32 _credId = credId[msg.sender]; //  Get the credId of the user
        // Create new loan request Id for every different loan requests
        bytes32 _loanId = (
            sha256(
                abi.encodePacked(
                    msg.sender,
                    _principalAmt,
                    _interestRate,
                    _duration
                )
            )
        );
        validateCredId(_credId); //  Validate is credId is null or not.
        validateLoanId(_loanId); //  Validate  loanId is null or not.

        //  To check 1 cred Id has 1 loan request.
        require(
            activeLoans[_credId] ==
                0x0000000000000000000000000000000000000000000000000000000000000000,
            "Error: loan Id already exists."
        );

        //  Check current status of the loan
        require(
            loanStatus[_loanId] == 0,
            "Error: Loan status is already 'Requested'"
        );
        //  Set the requested loan terms
        loanRequested[_loanId].principalAmt = _principalAmt;
        loanRequested[_loanId].interestRate = _interestRate;
        loanRequested[_loanId].duration = _duration;

        loanStatus[_loanId] = 1; // Store the loan status as 'Requested'
        loanRequestedDate[_loanId] = now; // Store the date when loan is requested
        activeLoans[_credId] = _loanId; //  set the loanId corresponding to credId
        //  Emit an event after the loan is requested
        emit LogRequestLoan(
            _loanId,
            loanStatus[_loanId],
            loanRequestedDate[_loanId]
        );

        return (_loanId, loanStatus[_loanId], loanRequestedDate[_loanId]);
    }

    /// @notice Function to approve the loan
    /// @param  _credId Credefi Id of the user
    /// @param  _principalOffered Principal amount to approve for the loan
    /// @param  _interestRateOffered Interest rate to approve for the loan
    /// @param  _durationOffered Number of months as duration to approve for the loan
    /// @param  _yesNo True if Owner has to approve the loan and False if to not approve the loan
    /// @return _loanStatus Status of the loan
    /// @return _loanApprovedDate Date on which loan is approved
    function approveLoan(
        bytes32 _credId,
        uint256 _principalOffered,
        uint256 _interestRateOffered,
        uint8 _durationOffered,
        bool _yesNo
    )
        public
        _onlyOwner()
        returns (uint8 _loanStatus, uint256 _loanApprovedDate)
    {
        validateCredId(_credId); //  Validate the credId of the user
        bytes32 _loanId = activeLoans[_credId]; // Get the loanId of the loan
        validateLoanId(_loanId); // Validate the fetched loanId

        //  Check the current status of the loan
        require(
            loanStatus[_loanId] == 1,
            "Error: Loan status is not 'Requested'."
        );

        if (_yesNo == true) {
            validateLoanTerms(
                _principalOffered,
                _interestRateOffered,
                _durationOffered
            ); // Validate the loan terms of the loan

            //  Set the loan terms for the approved loan
            loanApproved[_loanId].principalAmt = _principalOffered;
            loanApproved[_loanId].interestRate = _interestRateOffered;
            loanApproved[_loanId].duration = _durationOffered;

            (uint256 _monthlyPayment, uint256 _totalPayment) = calulatePayments(
                _loanId
            ); // Calulate and fetch the monthly and total payment

            //  Set the payment details of the loan
            userLoanPayment[_loanId].monthlyPayment = _monthlyPayment;
            userLoanPayment[_loanId].totalPayment = _totalPayment;

            loanStatus[_loanId] = 2; // Store the loan status as 'Approved'
            loanApprovedDate[_loanId] = now; //  Store the date when loan is approved

            // Emit an event after the loan is approved
            emit LogApproveLoan(
                _loanId,
                loanStatus[_loanId],
                loanApprovedDate[_loanId]
            );
        } else if (_yesNo == false) {
            loanStatus[_loanId] = 3; //  Store the loan status as 'Not Approved'
            loanApprovedDate[_loanId] = now; //  Store the date when loan is not approved
            inactiveLoans[_credId].push(_loanId); //  Store the loanId into the inactive loans list
            activeLoans[_credId] = 0x0000000000000000000000000000000000000000000000000000000000000000; // Remove the loanId from the active loans

            //  Emit an event after the loan is not approved
            emit LogApproveLoan(
                _loanId,
                loanStatus[_loanId],
                loanApprovedDate[_loanId]
            );
        }
        return (loanStatus[_loanId], loanApprovedDate[_loanId]);
    }

    /// @notice Function to accept (by user) the loan terms approved (by Admin)
    /// @param  _loanId Loan Id corresponds to the Loan request for the user
    /// @param  _yesNo True if User has accepted the approved loan terms and False if to not accepted the approved loan terms
    /// @return _loanStatus Status of the loan
    /// @return _loanAcceptedDate Date on which loan is accpeted
    function acceptLoan(bytes32 _loanId, bool _yesNo)
        public
        _notOwner(msg.sender)
        returns (uint8 _loanStatus, uint256 _loanAcceptedDate)
    {
        validateLoanId(_loanId); //  Validate the loanId of the loan

        //  Check for the loanId passed as input to the function
        require(
            activeLoans[credId[msg.sender]] == _loanId,
            "Error: Invalid loan Id."
        );
        //  Check the current status of the loan
        require(
            loanStatus[_loanId] == 2,
            "Error: Loan status is not 'Approved'."
        );

        if (_yesNo == true) {
            loanAcceptedDate[_loanId] = now; //  Store the date when the loan is accepted
            loanStatus[_loanId] = 4; // Store the loan status as 'Accepted'
            activeLoans[credId[msg.sender]] = _loanId; //  Store the loanId into the active loans

            //  Emit an event after loan is accepted
            emit LogAcceptLoan(
                _loanId,
                loanStatus[_loanId],
                loanAcceptedDate[_loanId]
            );
        } else if (_yesNo == false) {
            loanAcceptedDate[_loanId] = now; //  Store the date when the loan is not accepted
            loanStatus[_loanId] = 5; //  Store the loan status as 'Not Accepted'
            inactiveLoans[credId[msg.sender]].push(_loanId); //  Store the loanId into the inactive loans list
            activeLoans[credId[msg
                .sender]] = 0x0000000000000000000000000000000000000000000000000000000000000000; //  Remove the loanId from the active loans

            //  Emit an event after loan is not accepted
            emit LogAcceptLoan(
                _loanId,
                loanStatus[_loanId],
                loanAcceptedDate[_loanId]
            );
        }

        return (loanStatus[_loanId], loanAcceptedDate[_loanId]);
    }

    /// @notice Function to fund the user with loan amount approved
    /// @param  _credId Credefi Id of the user
    /// @param  _yesNo True if Owner has funded the approved loan terms and False if to not funded the approved loan terms
    /// @return _loanStatus Status of the loan
    /// @return _duedates List of monthly due dates for the loan
    /// @return _statuses List of status (pending or successful or missed) corresponding to monthly due date
    /// @return monthlyPayment Amount to paid as monthly payment for the loan
    /// @return totalPayment Total amount to be paid for the loan
    /// @return _loanFundedDate Date on which loan is funded
    function fundLoan(bytes32 _credId, bool _yesNo)
        public
        _onlyCredTokenContract()
        returns (
            uint8 _loanStatus,
            uint256[] memory _duedates,
            uint8[] memory _statuses,
            uint256 monthlyPayment,
            uint256 totalPayment,
            uint256 _loanFundedDate
        )
    {
        validateCredId(_credId); //  Validate the credId of the user
        bytes32 _loanId = activeLoans[_credId]; // Get the loanId of the loan
        validateLoanId(_loanId); //  Validate the fetched loanId

        //  Check the current status of the loan
        require(
            loanStatus[_loanId] == 4,
            "Error: Loan status is not 'Accepted'."
        );

        loanFundedDate[_loanId] = now; // Store the date when loan is funded
        if (_yesNo == true) {
            uint256 count = 30 days;
            for (uint8 i = 0; i < loanApproved[_loanId].duration; i++) {
                userLoanPayment[_loanId].dueDates.push(
                    loanFundedDate[_loanId] + count
                ); // Set the array with monthly due dates
                userLoanPayment[_loanId].statuses.push(0); // Set the payment status corresponding to each monthly due date as 'Pending'
                count = count + 30 days;
            }
            loanStatus[_loanId] = 6; //  Store the loan status as 'Funded'
        } else if (_yesNo == false) {
            loanStatus[_loanId] = 7; //  Store the loan status as 'Not Funded'
            inactiveLoans[_credId].push(_loanId); // Store the loanId into the inactive loans list
            activeLoans[_credId] = 0x0000000000000000000000000000000000000000000000000000000000000000; // Remove the loanId from the active loans
            emit LogFundLoan(_loanId, loanStatus[_loanId]); //  Emit an event after the loan is not funded
        }

        return (
            loanStatus[_loanId],
            userLoanPayment[_loanId].dueDates,
            userLoanPayment[_loanId].statuses,
            userLoanPayment[_loanId].monthlyPayment,
            userLoanPayment[_loanId].totalPayment,
            loanFundedDate[_loanId]
        );
    }

    /// @notice Function to get the Status of the loan
    /// @param  _loanId Loan Id corresponds to the Loan request for the user
    /// @return _loanStatus Status of the loan
    function getLoanStatus(bytes32 _loanId)
        public
        view
        returns (uint8 _loanStatus)
    {
        validateCallerAddress(msg.sender); //  Validate the caller's (user/owner) address
        validateLoanId(_loanId); // Validate the loanId of the loan
        return loanStatus[_loanId];
    }

    /// @notice Function to fetch the loan terms for requested loan
    /// @param  _loanId Loan Id corresponds to the Loan request for the user
    /// @return _principalAmt Principal amount of the requested loan
    /// @return _interestRate Interest rate of the requested loan
    /// @return _duration Number of months as duration of the requested loan
    /// @return _loanRequestedDate Date on which loan is requested
    /// @return _loanStatus Status of the loan
    function getRequestedLoan(bytes32 _loanId)
        public
        view
        returns (
            uint256 _principalAmt,
            uint256 _interestRate,
            uint8 _duration,
            uint256 _loanRequestedDate,
            uint8 _loanStatus
        )
    {
        validateCallerAddress(msg.sender); //  Validate the caller's (user/owner) address
        validateLoanId(_loanId); //  Validate the loanId of the loan
        return (
            loanRequested[_loanId].principalAmt,
            loanRequested[_loanId].interestRate,
            loanRequested[_loanId].duration,
            loanRequestedDate[_loanId],
            loanStatus[_loanId]
        );
    }

    /// @notice Function to fetch the loan terms for approved loan
    /// @param  _loanId Loan Id corresponds to the Loan request for the user
    /// @return _principalAmt Principal amount of the approved loan
    /// @return _interestRate Interest rate of the approved loan
    /// @return _duration Number of months as duration of the approved loan
    /// @return _loanApprovedDate Date on which loan is approved
    /// @return _loanStatus Status of the loan
    function getApprovedLoan(bytes32 _loanId)
        public
        view
        returns (
            uint256 _principalAmt,
            uint256 _interestRate,
            uint8 _duration,
            uint256 _loanApprovedDate,
            uint8 _loanStatus
        )
    {
        validateCallerAddress(msg.sender); //  Validate the caller's (user/owner) address
        validateLoanId(_loanId); //  Validate the loanId of the loan
        return (
            loanApproved[_loanId].principalAmt,
            loanApproved[_loanId].interestRate,
            loanApproved[_loanId].duration,
            loanApprovedDate[_loanId],
            loanStatus[_loanId]
        );
    }

    /// @notice Function to fetch payment details of the loan (called by admin only)
    /// @param  _loanId Loan Id corresponds to the Loan request for the user
    /// @return _duedates List of monthly due dates for the loan
    /// @return _statuses List of status corresponds to monthly due dates
    /// @return _monthlyPayment Amount to paid as monthly payment for the loan
    /// @return _totalPayment Total amount to be paid for the loan
    function getPayment(bytes32 _loanId)
        public
        view
        _onlyOwner()
        returns (
            uint256[] memory _duedates,
            uint8[] memory _statuses,
            uint256 _monthlyPayment,
            uint256 _totalPayment
        )
    {
        validateLoanId(_loanId); //  Validate the loanId of the loan
        return (
            userLoanPayment[_loanId].dueDates,
            userLoanPayment[_loanId].statuses,
            userLoanPayment[_loanId].monthlyPayment,
            userLoanPayment[_loanId].totalPayment
        );
    }

    /// @notice Function to fetch payment details of the loan (called by user only)
    /// @return _duedates List of monthly due dates for the loan
    /// @return _statuses List of status corresponds to monthly due dates
    /// @return _monthlyPayment Amount to paid as monthly payment for the loan
    /// @return _totalPayment Total amount to be paid for the loan
    function getPayment()
        public
        view
        _notOwner(msg.sender)
        returns (
            uint256[] memory _duedates,
            uint8[] memory _statuses,
            uint256 _monthlyPayment,
            uint256 _totalPayment
        )
    {
        bytes32 _loanId = activeLoans[credId[msg.sender]]; //  Get the loanId of the loan for the user
        validateLoanId(_loanId); // Validate the fetched loanId of the loan
        return (
            userLoanPayment[_loanId].dueDates,
            userLoanPayment[_loanId].statuses,
            userLoanPayment[_loanId].monthlyPayment,
            userLoanPayment[_loanId].totalPayment
        );
    }

    /// @notice Function to make the payment from user to admin's account
    /// @param  _userAddress User's address who is going to make the payment
    /// @return uint256 Monthly payment, user has to pay as a monthly installment
    function makePayment(address _userAddress)
        public
        _onlyCredTokenContract()
        returns (uint256)
    {
        bytes32 _credId = getCredId(_userAddress); //  Get the credId of the user
        bytes32 _loanId = getActiveLoan(_credId); //  Get the loanId of the loan
        validateLoanId(_loanId); //  Validate the fetched loanId
        uint8 _loanStatus = getLoanStatus(_loanId); //  Get the current status of the loan
        uint256 paymentCount = paymentCounter[_loanId]; // Track the number of payments
        require(_loanStatus == 6, "Error: Loan Status is not 'Funded'."); // Check the current status of the loan
        //  Check the number of payments in comparison with the duration
        require(
            paymentCount < loanApproved[_loanId].duration,
            "Error: There is no due payment left."
        ); // Check if the user payments are left

        userLoanPayment[_loanId].statuses[paymentCount] = 1; //  Store the payment status corresponding to monthly due date as 'Successful'
        paymentCounter[_loanId] = SafeMath.add(paymentCount, 1);
        emit LogPaymentStatus(userLoanPayment[_loanId].monthlyPayment); // Emit the event with the monthly payment
        return userLoanPayment[_loanId].monthlyPayment;
    }
}

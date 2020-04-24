pragma solidity ^0.5.8;


library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        require(b != 0, errorMessage);
        return a % b;
    }
}


library Address {
    function isContract(address account) internal view returns (bool) {
        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;


            bytes32 accountHash
         = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            codehash := extcodehash(account)
        }
        return (codehash != accountHash && codehash != 0x0);
    }

    function toPayable(address account)
        internal
        pure
        returns (address payable)
    {
        return address(uint160(account));
    }

    function sendValue(address payable recipient, uint256 amount) internal {
        require(
            address(this).balance >= amount,
            "Address: insufficient balance"
        );

        // solhint-disable-next-line avoid-call-value
        (bool success, ) = recipient.call.value(amount)("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }
}


interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}


contract ERC165 is IERC165 {
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;

    mapping(bytes4 => bool) private _supportedInterfaces;

    constructor() internal {
        _registerInterface(_INTERFACE_ID_ERC165);
    }

    function supportsInterface(bytes4 interfaceId) public view returns (bool) {
        return _supportedInterfaces[interfaceId];
    }

    function _registerInterface(bytes4 interfaceId) internal {
        require(interfaceId != 0xffffffff, "ERC165: invalid interface id");
        _supportedInterfaces[interfaceId] = true;
    }
}


contract ERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4);
}


interface IERC721 {
    /* is ERC165 */
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );

    function balanceOf(address _owner) external view returns (uint256);

    function ownerOf(uint256 _tokenId) external view returns (address);

    function safeDataTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) external;

    function safeTransferFrom(address _from, address _to, uint256 _tokenId)
        external;

    function transferFrom(address _from, address _to, uint256 _tokenId)
        external;

    function approve(address _approved, uint256 _tokenId) external payable;

    function setApprovalForAll(address _operator, bool _approved) external;

    function getApproved(uint256 _tokenId) external view returns (address);

    function isApprovedForAll(address _owner, address _operator)
        external
        view
        returns (bool);
}


contract ERC721 is ERC165, IERC721 {
    using SafeMath for uint256;
    using Address for address;
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
    mapping(uint256 => address) private _tokenOwner;
    mapping(uint256 => address) private _approvalUsersList;
    mapping(address => uint256) private _numberOfOwnedToken;
    mapping(address => mapping(address => bool)) private _approvalUsersAllList;
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    constructor() public {
        _registerInterface(_INTERFACE_ID_ERC721);
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "balance query for the zero address");
        return _numberOfOwnedToken[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _tokenOwner[tokenId];
        require(owner != address(0), "owner query for nonexistent token");
        return owner;
    }

    function safeTransferFrom(address from, address to, uint256 tokenId)
        public
    {
        safeDataTransferFrom(from, to, tokenId, "");
    }

    function safeDataTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, tokenId, _data);
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public {
        transferFrom(from, to, tokenId);
        require(
            checkAndCallSafeTransfer(from, to, tokenId, data),
            "transfer to non ERC721Receiver implementer"
        );
    }

    function approve(address approved, uint256 tokenId) public payable {
        address owner = _tokenOwner[tokenId];
        require(approved != owner, "approval to current owner");
        require(
            owner == msg.sender || isApprovedForAll(owner, msg.sender),
            "approve caller is not owner nor approved for all"
        );
        _approvalUsersList[tokenId] = approved;
        emit Approval(owner, approved, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "approve to caller");
        _approvalUsersAllList[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        return _approvalUsersList[tokenId];
    }

    function isApprovedForAll(address owner, address operator)
        public
        view
        returns (bool)
    {
        return _approvalUsersAllList[owner][operator];
    }

    function isApprovedOrOwner(address sender, uint256 tokenId)
        public
        view
        returns (bool)
    {
        address owner = _tokenOwner[tokenId];
        address approved = _approvalUsersList[tokenId];
        return (sender == owner ||
            sender == approved ||
            isApprovedForAll(owner, msg.sender));
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(
            ownerOf(tokenId) == from,
            "ERC721: transfer of token that is not own"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _clearApproval(tokenId);
        _numberOfOwnedToken[from] = _numberOfOwnedToken[from].sub(1);
        _numberOfOwnedToken[to] += 1;

        _tokenOwner[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _clearApproval(uint256 tokenId) private {
        if (_approvalUsersList[tokenId] != address(0)) {
            _approvalUsersList[tokenId] = address(0);
        }
    }

    function checkAndCallSafeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal returns (bool) {
        if (!address(to).isContract()) {
            return true;
        }
        bytes4 retval = ERC721Receiver(to).onERC721Received(
            msg.sender,
            from,
            tokenId,
            data
        );
        return (retval == _ERC721_RECEIVED);
    }

    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }

    function _safeMint(address to, uint256 tokenId, bytes memory _data)
        internal
    {
        _mint(to, tokenId);
        require(
            checkAndCallSafeTransfer(address(0), to, tokenId, _data),
            "ERC721: transfer to non ERC721Receiver implementer"
        );
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        _tokenOwner[tokenId] = to;
        _numberOfOwnedToken[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        address owner = _tokenOwner[tokenId];
        return owner != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }
}

// Contract for EventChain - An EventTicketingToken or EventTicketTokenization (ETT) dAPP
contract EventTicketingToken is ERC721 {
    address public owner;
    address public store;

    string public tokenName;
    uint8 public decimals;
    string public symbol;
    string public version = "ETTv1.0";
    address public eventOwner;
    address payable public eventOwnerWallet;
    uint256 public tokenPrice = 1 ether;
    string public eventName;
    uint256 maximumSeats;
    mapping(address => uint8) eventId;

    // Events
    event LogEventDetails(
        uint8 _eventId,
        string _eventName,
        uint256 _maximumSeats
    );
    event LogMaximumSeats(uint256 _maximumSeats);

    //  constructor to set the owner who deployed the contract
    constructor() public {
        owner = msg.sender;
    }

    //  modifier to check the owners
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can do");
        _;
    }

    function setStore(address _store) public onlyOwner {
        store = _store;
    }

    /// @notice Function to create an Event
    /// @return uint256 EventId to be returned after event created
    function createEvent(
        string memory _eventName,
        // uint8 _eventId,
        uint256 _maximumSeats
    ) public returns (uint256) {
        // require(
        //     eventId[msg.sender] == 0,
        //     "Event owner has already created the event"
        // );
        tokenName = _eventName;
        decimals = 1;
        symbol = "ETT";
        eventName = _eventName;
        eventOwner = msg.sender;
        eventOwnerWallet = msg.sender;
        maximumSeats = _maximumSeats;
        // eventId[eventOwner] = _eventId;

        // emit LogEventDetails(eventId[eventOwner], eventName, maximumSeats);

        // ticketPrice = _ticketPrice;
        // eventOwnerWallet = _eventOwnerWallet;
    }

    /// @notice Function to buy the token
    /// @param  _tokenId tokenId to buy for the event
    function buyToken(uint256 _tokenId) public payable {
        require(msg.value == tokenPrice, "Value is not equal to tokenPrice");
        require(_tokenId > 0 && _tokenId <= maximumSeats, "Invalid tokenId");
        _safeMint(msg.sender, _tokenId);
        eventOwnerWallet.transfer(tokenPrice);
    }

    /// @notice Check user/owner address is zero or not
    /// @param _address An address for whom to validate it is zero or not.
    function validateCallerAddress(address _address) internal pure {
        require(_address != address(0), "Error: User is of zero address.");
        return;
    }

    /// @notice Function to check user is Owner
    /// @return _isOwner True if user is Owner and False if user is normal user
    function isEventOwner() public view returns (bool _isOwner) {
        validateCallerAddress(msg.sender);
        if (msg.sender == eventOwner) return true;
        else return false;
    }

    /// @notice Check user/owner address is zero or not
    /// @return _maximumSeats Maximum number of seats for the event
    function getMaximumSeats() public view returns (uint256 _maximumSeats) {
        // emit LogMaximumSeats(maximumSeats);
        return maximumSeats;
    }
}

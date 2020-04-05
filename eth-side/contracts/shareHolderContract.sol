pragma solidity ^0.6.0;
import "./SafeMath.sol";


interface credTokenInterface {
    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function buyToken(address buyer, uint256 value, uint256 rate)
        external
        returns (bool);

    function removeToken(address remover, uint256 value)
        external
        returns (bool);
}


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


contract shareHolderContract {
    using SafeMath for uint256;
    address private owner;
    address public credTokenAddress;
    address public daiAddress;
    uint24 private status;
    uint256 private deployed;
    uint256 private deployable;
    uint256 private receivable;
    uint256 private collected;
    uint256 private defaulted;
    uint256 private rate;
    uint256 scaleFactor = 1e16; // scale factor to convert float into integers

    constructor(address _credTokenAddress, address _daiAddress) public {
        owner = msg.sender;
        rate = 1e18; // 1 credID = 1 DAI 1e18
        credTokenAddress = _credTokenAddress;
        daiAddress = _daiAddress;
    }

    /// @notice Check user/owner address is zero or not
    /// @param _address An address for whom to validate it is zero or not.
    function validateCallerAddress(address _address) internal pure {
        require(_address != address(0), "Error: User is of zero address.");
    }

    modifier _onlyAddress(address _acceptedAddress) {
        validateCallerAddress(msg.sender); //  Validate the caller's address
        require(
            msg.sender == _acceptedAddress,
            "Error: Caller is not acceptable."
        );
        _;
    }
    modifier _notOwner() {
        validateCallerAddress(msg.sender); //  Validate the caller's address
        require(!(msg.sender == owner), "Error: Caller is a owner.");
        _;
    }

    function setDeployable(uint256 amt)
        external
        _onlyAddress(credTokenAddress)
    {
        deployable = amt;
    }

    function fundLoan(uint256 amtDeployed, uint256 amtReceivable)
        public
        _onlyAddress(owner)
    {
        uint256 updatedDeployed = deployed.add(amtDeployed);
        require(
            amtReceivable > amtDeployed,
            "receivable amount should be greater than deployed amount"
        );
        require(
            updatedDeployed <= deployable,
            "deployed should be less than deployable"
        );
        require(status == 1, "Not in deploying status");
        deployed = updatedDeployed;
        receivable = receivable.add(amtReceivable);
    }

    function payLoan(uint256 amt) public _onlyAddress(owner) {
        uint256 currentReceived = collected.add(amt).add(defaulted);
        require(
            currentReceived <= receivable,
            "amount should be less than receivable"
        );
        require(status == 1, "Not in deploying status");
        collected = collected.add(amt);
    }

    function defaultLoan(uint256 amt) public _onlyAddress(owner) {
        uint256 currentReceived = defaulted.add(amt).add(collected);
        require(
            currentReceived <= receivable,
            "amount should be less than receivable"
        );
        require(status == 1, "Not in deploying status");
        defaulted = defaulted.add(amt);
    }

    function changeStatus() public _onlyAddress(owner) {
        if (status == 0) {
            status = status + 1;
        } else if (status == 1) {
            require(deployed == deployable, "Haven't deployed all token yet");
            require(
                receivable == collected.add(defaulted),
                "receivable should equal collected + defaulted"
            );
            uint256 totalSupply = getTotalSupply();
            rate = (collected.div(totalSupply.mul(scaleFactor))).mul(
                scaleFactor
            );
            status = status + 1;
        } else if (status == 2) {
            status = 0;
            uint256 totalSupply = getTotalSupply();
            if (totalSupply == 0) {
                rate = 1e18;
            }
            receivable = 0;
            collected = 0;
            defaulted = 0;
            deployed = 0;
        }
    }

    function getCredBalance(address _address) public view returns (uint256) {
        credTokenInterface credToken = credTokenInterface(credTokenAddress);
        uint256 credBalance = credToken.balanceOf(_address);
        return credBalance;
    }

    function getWadBalance(address _address) internal view returns (uint256) {
        daiInterface dai = daiInterface(daiAddress);
        uint256 wadBalance = dai.balanceOf(_address);
        return wadBalance;
    }

    function getTotalSupply() public view returns (uint256) {
        credTokenInterface credToken = credTokenInterface(credTokenAddress);
        uint256 _totalSupply = credToken.totalSupply();
        return _totalSupply;
    }

    function getStatus() public view returns (uint24) {
        return status;
    }

    function getDeployed() public view returns (uint256) {
        return deployed;
    }

    function getDeployable() public view returns (uint256) {
        return deployable;
    }

    function getReceivable() public view returns (uint256) {
        return receivable;
    }

    function getCollected() public view returns (uint256) {
        return collected;
    }

    function getDefaulted() public view returns (uint256) {
        return defaulted;
    }

    function getRate() public view returns (uint256) {
        return rate;
    }
    function getDaiContractAddress() public view returns (address) {
        return daiAddress;
    }
}

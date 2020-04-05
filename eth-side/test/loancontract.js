const LoanContract = artifacts.require("LoanContract.sol")
contract("LoanContract", accounts => {
    it("should return the account owner", async function() {
        let loan = await LoanContract.deployed().catch(err=>console.error(err.message))
        let res = await loan.isOwner().catch(err=>console.error(err.message))
        assert.equal(res,true, "Contract owner set properly")
    })
  
})

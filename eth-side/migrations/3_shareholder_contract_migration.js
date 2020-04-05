const credTokenInstance = artifacts.require("CredToken");
const daiInstance = artifacts.require("DAI");
const shareHolderInstance = artifacts.require("shareHolderContract");
const loanContractInstance = artifacts.require("LoanContract");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(daiInstance);
    await deployer.deploy(credTokenInstance, daiInstance.address);
    await deployer.deploy(loanContractInstance, credTokenInstance.address);
    await deployer.deploy(
      shareHolderInstance,
      credTokenInstance.address,
      daiInstance.address
    );
  });
};

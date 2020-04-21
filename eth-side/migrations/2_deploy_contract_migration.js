const eventTicketingTokenInstance = artifacts.require("EventTicketingToken");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(eventTicketingTokenInstance);
  });
};

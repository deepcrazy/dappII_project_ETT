const eventTicketingTokenInstance = artifacts.require("EventTicketingToken");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(eventTicketingTokenInstance);
  });
};


// const Migrations = artifacts.require("Migrations");

// module.exports = function(deployer) {
//   deployer.deploy(Migrations);
// };

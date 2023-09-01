var Cookiechain = artifacts.require("./Cookiechain.sol");

module.exports = function(deployer) {
  deployer.deploy(Cookiechain);
};

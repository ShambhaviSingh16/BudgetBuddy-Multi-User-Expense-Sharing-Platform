require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/AjhYMf3zxru9EUG85v813",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

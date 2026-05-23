require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

let { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

// Make sure PRIVATE_KEY is 0x-prefixed and non-empty
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = "0x" + PRIVATE_KEY.trim();
}

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/AjhYMf3zxru9EUG85v813",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};



  
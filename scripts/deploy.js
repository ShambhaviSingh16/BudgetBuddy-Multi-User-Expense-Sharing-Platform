const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer balance (ETH):", hre.ethers.formatEther(balance));

  const Expenses = await hre.ethers.getContractFactory("ExpenseTracker"); // match your .sol contract name
  const expenses = await Expenses.deploy();

  // ethers v6:
  await expenses.waitForDeployment();

  const address = await expenses.getAddress(); // or: const address = expenses.target;
  console.log("ExpenseTracker deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

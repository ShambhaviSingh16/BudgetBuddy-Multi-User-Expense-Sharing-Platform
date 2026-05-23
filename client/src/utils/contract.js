// export const contractABI = [
//   {
//     "inputs": [
//       { "internalType": "string", "name": "_description", "type": "string" },
//       { "internalType": "uint256", "name": "_amount", "type": "uint256" }
//     ],
//     "name": "addExpense",
//     "outputs": [],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   {
//     "inputs": [],
//     "name": "getAllExpenses",
//     "outputs": [
//       {
//         "components": [
//           { "internalType": "string", "name": "description", "type": "string" },
//           { "internalType": "uint256", "name": "amount", "type": "uint256" },
//           { "internalType": "address", "name": "payer", "type": "address" }
//         ],
//         "internalType": "struct ExpenseTracker.Expense[]",
//         "name": "",
//         "type": "tuple[]"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [],
//     "name": "getExpenseCount",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "",
//         "type": "uint256"
//       }
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   }
// ];

// // Replace this with your actual deployed contract address
// export const CONTRACT_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

import { ethers } from "ethers";
import CONTRACT_ABI from "./abi.json";

// ✅ Your deployed Sepolia contract address
const CONTRACT_ADDRESS = "0xD023C4F0205e0Da0F0cc7d3D78D0252E63a025A6";

export async function getContract() {
  // Step 1: Check if MetaMask is available
   if (!window.ethereum) throw new Error("MetaMask not found. Please install it.");

   // Step 2: Create a provider & request wallet access
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

    // Step 3: Ensure wallet is on Sepolia network
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  } catch (e) {
    if (e.code === 4902) {
      // If Sepolia is not added in MetaMask
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xaa36a7",
          chainName: "Sepolia",
          nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/AjhYMf3zxru9EUG85v813"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }]
      });
   } else {
      throw e;
    }
  }

   // Step 4: Get signer (connected wallet)
  const signer = await provider.getSigner();

  // Step 5: Return connected contract
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

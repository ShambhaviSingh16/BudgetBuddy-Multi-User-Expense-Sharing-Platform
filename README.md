# BudgetBuddy: Multi-User Expense Management Platform

BudgetBuddy is a secure multi-user expense management platform designed to simplify shared expense tracking and financial record management. The platform focuses on scalable full-stack application development combined with decentralized validation concepts to improve transaction integrity, reliability, and transparency.

The project is being developed with modern web technologies, RESTful architecture, and blockchain integration concepts to provide a secure and efficient expense-sharing ecosystem.

---

## 🚀 Features

- Multi-User Expense Tracking
- Shared Transaction Management
- Secure User Authentication
- Role-Based Access Control
- Real-Time Expense Updates
- REST API Integration
- Secure Financial Record Handling
- Optimized Backend Workflows
- Decentralized Validation Concepts
- Scalable Application Architecture

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST APIs

### Database & Authentication
- Firebase Authentication
- MongoDB

### Blockchain Technologies
- Ethereum
- Solidity
- Hardhat
- Ethers.js
- MetaMask

---

<!--[
    
    HOW TO TEST EVERYTHING LOCALLY

Step 1. Deploy Contract to Sepolia

cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia

Copy the new address → update it in contract.js.

{After it finishes, copy the deployed address shown in the console
(e.g. Contract deployed to: 0xABC123...)
Paste that into src/utils/contract.js:
const CONTRACT_ADDRESS = "0xABC123...";}

Step 2. Start Frontend
cd client
npm install
npm run dev

Visit http://localhost:5173


]--> 
## 📂 Project Structure

```bash
BudgetBuddy_Final/
│
├── backend/
├── client/
├── contracts/
├── scripts/
├── test/
├── ignition/
├── cache/
├── artifacts/
├── hardhat.config.js
├── package.json
└── README.md

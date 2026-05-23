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

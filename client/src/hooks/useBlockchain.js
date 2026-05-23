// src/hooks/useBlockchain.js
import { getContract } from "../utils/contract";
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const useBlockchain = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const normalizeExpenses = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map(e => ({
      id: Number(e.id ?? e[0]),
      payer: e.payer ?? e[1],
      description: e.description ?? e[2],
      amountWei: e.amount ?? e[3],
      amountEth: (() => {
        try { return ethers.formatEther(e.amount ?? e[3]); } catch { return "0.0"; }
      })(),
      category: e.category ?? e[4],
      timestamp: Number(e.timestamp ?? e[5] ?? 0),
    }));
  };

  const fetchExpenses = async (contractInstance = contract) => {
    if (!contractInstance) return;
    try {
      setLoading(true);
      setError('');
      const mine = await contractInstance.getMyExpenses();
      setExpenses(normalizeExpenses(mine));
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to fetch expenses: " + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask!");
      return false;
    }
    try {
      setLoading(true);
      setError('');
      // Request accounts (shows MetaMask popup)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        setError("No accounts found.");
        setLoading(false);
        return false;
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerLocal = await browserProvider.getSigner();
      const userAddress = await signerLocal.getAddress();
      const userBalance = await browserProvider.getBalance(userAddress);

      // signer-connected contract (getContract may request chain switch)
      const contractInstance = await getContract();

      setProvider(browserProvider);
      setSigner(signerLocal);
      setAccount(userAddress);
      setBalance(ethers.formatEther(userBalance));
      setIsConnected(true);
      setContract(contractInstance);

      await fetchExpenses(contractInstance);
      return true;
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      if (error.code === -32603 || (error.message || '').includes('circuit breaker')) {
        setError("MetaMask is temporarily unavailable. Please try again in a few moments.");
      } else if (error.code === 4001) {
        setError("Connection rejected by user.");
      } else {
        setError("Failed to connect wallet: " + (error?.message ?? error));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = () => {
    // Note: Browser wallet (MetaMask) cannot be programmatically disconnected,
    // but clearing app state gives the expected UX.
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setBalance('0');
    setIsConnected(false);
    setExpenses([]);
    setError('');
  };

  const addExpense = async (description, amount, category = "other") => {
    if (!description || !amount) {
      setError("Please enter both description and amount");
      return false;
    }
    try {
      setLoading(true);
      setError('');

      const contractInstance = contract ?? await getContract();
      const amountInWei = ethers.parseEther(String(amount));
      const tx = await contractInstance.addExpense(description, amountInWei, category);
      await tx.wait();
      await fetchExpenses(contractInstance);
      return true;
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Failed to add expense: " + (err?.message ?? err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // On mount: check if wallet already connected (without popups)
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!window.ethereum) {
        setIsInitialized(true);
        return;
      }
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }); // recommended
        if (accounts && accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const signerLocal = await browserProvider.getSigner();
          const userAddress = await signerLocal.getAddress();
          const userBalance = await browserProvider.getBalance(userAddress);

          const contractInstance = await getContract();

          setProvider(browserProvider);
          setSigner(signerLocal);
          setAccount(userAddress);
          setBalance(ethers.formatEther(userBalance));
          setIsConnected(true);
          setContract(contractInstance);

          await fetchExpenses(contractInstance);
        }
      } catch (error) {
        console.error("Error checking existing connection:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    checkExistingConnection();
  }, [connectWallet]);

  // react to account/chain changes (global)
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // refresh state for the new account
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      // best option is a full reload to re-init provider & contract
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, connectWallet]);

  return {
    provider,
    signer,
    contract,
    account,
    balance,
    isConnected,
    isInitialized,
    expenses,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    addExpense,
    fetchExpenses
  };
};

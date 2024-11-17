// Import necessary modules and libraries
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

// Define the HomePage component
export default function HomePage() {
  // State variables
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [burnAmount, setBurnAmount] = useState(0);

  // Contract address and ABI
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Function to get the wallet
  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  // Function to handle the connected account
  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  // Function to connect the account
  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // Once wallet is set, get a reference to the deployed contract
    getATMContract();
  };

  // Function to get the ATM contract
  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  // Function to get the account balance
  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  // Function to handle the deposit amount change
  const handleDepositAmountChange = (event) => {
    setDepositAmount(event.target.value);
  };

  // Function to handle the withdraw amount change
  const handleWithdrawAmountChange = (event) => {
    setWithdrawAmount(event.target.value);
  };

  // Function to handle the burn amount change
  const handleBurnAmountChange = (event) => {
    setBurnAmount(event.target.value);
  };

  // Function to deposit the specified amount
  const deposit = async () => {
    if (atm && depositAmount > 0) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  };

  // Function to withdraw the specified amount
  const withdraw = async () => {
    if (atm && withdrawAmount > 0) {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
    }
  };

  // Function to burn the specified amount
  const burn = async () => {
    if (atm && burnAmount > 0) {
      let tx = await atm.burn(burnAmount);
      await tx.wait();
      getBalance();
    }
  };

  // Function to initialize the user
  const initUser = () => {
    // Check if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check if the user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <label>
          Deposit Amount:
          <input
            type="number"
            value={depositAmount}
            onChange={handleDepositAmountChange}
          />
        </label>
        <button onClick={deposit}>Deposit</button>
        <br />
        <label>
          Withdraw Amount:
          <input
            type="number"
            value={withdrawAmount}
            onChange={handleWithdrawAmountChange}
          />
        </label>
        <button onClick={withdraw}>Withdraw</button>
        <br />
        <label>
          Burn Amount:
          <input
            type="number"
            value={burnAmount}
            onChange={handleBurnAmountChange}
          />
        </label>
        <button onClick={burn}>Burn</button>
      </div>
    );
  };
  

  // useEffect to get the wallet on component mount
  useEffect(() => {
    getWallet();
  }, []);

  // JSX for the main component
  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      <div className="content-container">
        <div className="balance-container">
          <p>Your Balance: {balance}</p>
          <p>Your Account: {account}</p>
        </div>
        <div className="operations-container">
          {initUser()}
        </div>
      </div>
      <style jsx>{`
        .container {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .content-container {
          display: flex;
          justify-content: space-around;
          width: 80%;
        }

        .balance-container {
          flex: 1;
          text-align: left;
        }

        .operations-container {
          flex: 1;
          text-align: right;
        }

        label {
          display: block;
          margin-bottom: 5px;
        }

        input {
          margin-bottom: 10px;
        }
      `}
      </style>
    </main>
  );
}
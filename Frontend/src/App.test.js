import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CampaignFactoryABI from "./CampaignFactory.Abi.json";
import CampaignABI from "./Campaign.Abi.json";
import "./App.css";

const factoryAddress = "0x79d03f62f8865c1Bc3d6d96c493f3C1986a88340"; 

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");

  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      const signer = ethProvider.getSigner();
      const acc = await signer.getAddress();
      setProvider(ethProvider);
      setSigner(signer);
      setAccount(acc);
    } else {
      alert("Install MetaMask");
    }
  };

  // Load campaigns
  const loadCampaigns = async () => {
    const contract = new ethers.Contract(factoryAddress, CampaignFactoryABI, provider);
    const deployed = await contract.getAllCampaigns();
    setCampaigns(deployed);
  };

  const createCampaign = async () => {
    const contract = new ethers.Contract(factoryAddress, CampaignFactoryABI, signer);
    const tx = await contract.createCampaign(title, description, ethers.utils.parseEther(goal));
    await tx.wait();
    alert("Campaign Created");
    loadCampaigns();
  };

  useEffect(() => {
    if (provider) {
      loadCampaigns();
    }
  }, [provider]);

  return (
    <div className="App">
      <h1>CoreFund Crowdfunding dApp</h1>
      <button onClick={connectWallet}>{account ? `Connected: ${account}` : "Connect Wallet"}</button>

      <div className="create-section">
        <h2>Create New Campaign</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal in ETH" />
        <button onClick={createCampaign}>Create</button>
      </div>

      <div className="campaign-list">
        <h2>Active Campaigns</h2>
        {campaigns.length === 0 && <p>No campaigns found.</p>}
        {campaigns.map((addr, i) => (
          <CampaignCard key={i} address={addr} provider={provider} signer={signer} account={account} />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ address, provider, signer, account }) {
  const [details, setDetails] = useState({});
  const [amount, setAmount] = useState("");

  const contract = new ethers.Contract(address, CampaignABI, signer || provider);

  const loadDetails = async () => {
    const [title, desc, goal, raised] = await Promise.all([
      contract.title(),
      contract.description(),
      contract.goal(),
      contract.raisedAmount(),
    ]);
    setDetails({
      title,
      description: desc,
      goal: ethers.utils.formatEther(goal),
      raised: ethers.utils.formatEther(raised),
    });
  };

  const contribute = async () => {
    const tx = await contract.contribute({ value: ethers.utils.parseEther(amount) });
    await tx.wait();
    alert("Contribution successful");
    loadDetails();
  };

  useEffect(() => {
    loadDetails();
  }, []);

  return (
    <div className="card">
      <h3>{details.title}</h3>
      <p>{details.description}</p>
      <p>Goal: {details.goal} ETH</p>
      <p>Raised: {details.raised} ETH</p>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in ETH" />
      <button onClick={contribute}>Contribute</button>
    </div>
  );
}

export default App;

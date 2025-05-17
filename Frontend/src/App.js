import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Replace these with your actual contract address and ABI
const CONTRACT_ADDRESS = '0x1c1F252190A3c0680077F33235CF9E6F7f53E426';
const CONTRACT_ABI = [
  // Put your contract's ABI here
  // Example minimal ABI for guestbook contract:
  "function getMessages() view returns (string[] memory)",
  "function addMessage(string memory _msg) public"
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Connect wallet and set provider, signer, contract
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is required to use this app');
      return;
    }
    const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const tempSigner = tempProvider.getSigner();
    const tempAccount = await tempSigner.getAddress();
    const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, tempSigner);

    setProvider(tempProvider);
    setSigner(tempSigner);
    setAccount(tempAccount);
    setContract(tempContract);
  };

  // Fetch balance on Core Testnet
  const fetchBalance = async () => {
    if (!provider || !account) return;
    const bal = await provider.getBalance(account);
    // Convert from wei to ether units
    setBalance(ethers.utils.formatEther(bal));
  };

  // Fetch guestbook messages
  const fetchMessages = async () => {
    if (!contract) return;
    try {
      const msgs = await contract.getMessages();
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Add a new message
  const submitMessage = async () => {
    if (!contract) return;
    if (!newMsg) {
      alert('Enter a message');
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.addMessage(newMsg);
      await tx.wait();  // wait for transaction to confirm
      setNewMsg('');
      fetchMessages();  // refresh messages
      fetchBalance();   // update balance after spending gas
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (provider && account) {
      fetchBalance();
    }
  }, [provider, account]);

  useEffect(() => {
    if (contract) {
      fetchMessages();
    }
  }, [contract]);

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Core Testnet Guestbook DApp</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p><strong>Wallet address:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} TCORE</p>

          <h3>Guestbook Messages:</h3>
          <ul>
            {messages.length === 0 && <li>No messages yet</li>}
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>

          <textarea
            rows={3}
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Write your message here"
            disabled={loading}
            style={{ width: '100%', padding: 8 }}
          />
          <br />
          <button onClick={submitMessage} disabled={loading || !newMsg}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;

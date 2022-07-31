import React, { useEffect, useState } from "react";
import './styles/App.css';
import {ethers} from "ethers";
import abi from "./components/abi.json";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import InlineSVG from 'svg-inline-react';
import LoadingSpin from "react-loading-spin";

const Create = () => {
	const [currentAccount, setCurrentAccount] = useState('');
  const [tx, setTx] = useState('');
	const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
	const [network, setNetwork] = useState('');
  const [loading, setLoading] = useState(false);
	const [mints, setMints] = useState('');
	const [transaction, setTransactionProcess] = useState('');
	const [success, setSuccess] = useState('');
	
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
	
	const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // Users can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }

		const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);

    ethereum.on('chainChanged', handleChainChanged);
    
    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{	
									chainId: '8001',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
											name: "Mumbai Matic",
											symbol: "MATIC",
											decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		} 
	}

  const mintBlog = async () => {
		// Don't run if the title is empty
		if (!title) { return alert('Your blog post must include a title')}
    // Don't run if the description is empty
    if (!description) { return alert('Your blog post must include a description')}
		
    //price will always be 0.1 Matic
		const price =  '0.1';
		console.log("Minting blog", title, "with price", price);

		try {
				const { ethereum } = window;
				if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract('0x83DA12E85640D217f47b1Ce01f383ec5091De6Bd', abi, signer);
				console.log(typeof(currentAccount));
        console.log(contract);
				
				setTransactionProcess(true);
				let tx = await contract.safeMint(currentAccount, title, description, {value: ethers.utils.parseEther(price)});
        
						// Wait for the transaction to be mined
				const receipt = await tx.wait();
	
				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Blog minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
          setTx("https://mumbai.polygonscan.com/tx/"+tx.hash);
					console.log(tx);
					setSuccess(true);
				
					setTimeout(() => {
						
					}, 2000);
	
					setTitle('');
					setDescription('');
				} else {
					setTransactionProcess(false);
					alert("Transaction failed! Please try again");
				}
				}
			} catch(error) {
				console.log(error);
        setTransactionProcess(false);
			}
	}

  const renderInputForm = () =>{
    if (network !== 'Polygon Mumbai Testnet') {
      return (
        <div className="connect-wallet-container">
          <h2>Please switch to Polygon Mumbai Testnet</h2>
      <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      );
    }

    if(!transaction){
    return (
      <div className="form-container">
        
        <input
          type="text"
          value={title}
          placeholder='your blog title'
          onChange={e => setTitle(e.target.value)}
        />
        
      <textarea rows = "50" cols = "60" name = "description" type="text"
          value={description}
          placeholder='your blog title'
          onChange={e => setDescription(e.target.value)}>
            Enter blog post here...
         </textarea>

         <button className='cta-button mint-button' disabled={loading} onClick={mintBlog}>
              Mint Blog Post
            </button> 

    </div>
  );
    }
}

const renderNotConnectedContainer = () => (
  <div className="connect-wallet-container">
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect your wallet to mint blogs
    </button>
  </div>
  );

    //clear state after viewing is complete
    const clearView = async () => {
      setSuccess('');
      setTransactionProcess(false);
      setMints('');
      setTitle('');
			setDescription('');
      setTx('');
    }

    const viewPost = async () => {	
      try {
        const { ethereum } = window;
        if (ethereum) {
          // You know all this
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract('0x83DA12E85640D217f47b1Ce01f383ec5091De6Bd', abi, signer);
          var base64 = require('base-64');
          const names = await contract.viewMinted();
          //we assume the most recent blog minted is the one to render
          const newestBlog = await names.length - 1;
          console.log(contract);
          const owner = await contract.ownerOf(newestBlog);
          const printContract = await contract.tokenURI(newestBlog);
          console.log(printContract);
          async function check(url){
            const dest = 
            await fetch(url)
            .then(response => response.text())
            .then(data => JSON.parse(data))
            .then(response => response.image)
            .then(response => response.toString())
            .then(response => response.split(','))
            .then(response => response[1]);
            return dest;
          }
          let item = await check(printContract);
          const decodedData = await base64.decode(item);
  
          let blogName = await fetch(printContract)
          .then(response => response.text())
          .then(data => JSON.parse(data))
          .then(response => response.name);
  
          let blogDescription = await fetch(printContract)
          .then(response => response.text())
          .then(data => JSON.parse(data))
          .then(response => response.description);
      
          const records = await [newestBlog, owner, decodedData, blogName, blogDescription];
          
        console.log("MINTS FETCHED ", records);
        setMints(records);
        }
      } catch(error){
        console.log(error);
      }
    } 

    const renderMintLoading = () => 
			
    { if(!success) return (
      <div className="connect-wallet-other">
        <p>Blog Minting in Progress </p>
        <br></br>
            <LoadingSpin className = 'centerspin'/>

      </div>
      );
      
      if(success){
        if(mints){
          return(
            <div>
            <div className="mint-container">
            <InlineSVG className = 'nft-image-2'src={mints[2]} />
            <h2>{mints[3]}</h2>
            <small>
            <p>Author: {mints[1]}</p>
            <a className="link-two" href={`${tx}`} target="_blank" rel="noopener noreferrer"><p>View on block explorer</p></a>
            </small>
            <br></br>
            <p>{mints[4]}</p>
            <br></br>
            <br></br>
            
            
        </div>
        <br></br>
        <button className="cta-button connect-wallet-button-two" onClick = {clearView}>Go back</button>
        </div>
          )
        }
        if(!mints){
        return(
          <div className="connect-wallet-container">
            <p>Blog post successful! </p>
            <br></br>
            <div>
                  <button className="cta-button connect-wallet-button-two" onClick = {clearView}>Go back</button>
                  <button className="cta-button connect-wallet-button-two" onClick = {viewPost}>View Post</button>
                  </div>
            </div>
        )
      }
      
    }

      
      
      
      
      }
	
  useEffect(() => {
    checkIfWalletIsConnected();
		
  }, [])


  useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			
		}
	}, [currentAccount, network]);

  return(
    <div className="App">
      <div className="container">
        <div className="header-container">
        <p className="title">Mint a Blog Post</p>
        <br></br>
        <p className="subtitle">Anyone is free to mint their own blog post </p>
          <header>
          <div className="right">
      				<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
      				{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
    				</div>
          </header>
        </div>
        <div>
          {!currentAccount && renderNotConnectedContainer()}
          {transaction && renderMintLoading()}
          {currentAccount  && renderInputForm()}
        
        
        </div>

        <div className="footer-container">
          
          
        </div>
      </div>
			
			
    </div>
  )
};

export default Create;
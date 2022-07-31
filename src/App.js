import React, { useEffect, useState } from "react";
import './styles/App.css';
import {ethers} from "ethers";
import abi from "./components/abi.json";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import InlineSVG from 'svg-inline-react';


const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [network, setNetwork] = useState('');
	const [mints, setMints] = useState([]);
	const [transaction, setTransactionProcess] = useState('');
	const [view, setView] = useState('');
	
	
  
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
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
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
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		} 
	}

	

	const fetchMints = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract('0x83DA12E85640D217f47b1Ce01f383ec5091De6Bd', abi, signer);
				var base64 = require('base-64');
				//var svgtojsx = require('svg-to-jsx');
				// Get all the domain names from our contract
				const names = await contract.viewMinted();
				console.log(contract);
					
				// For each name, get the record and the address
				const mintRecords = await Promise.all(names.map(async (name) => {
				
				const owner = await contract.ownerOf(name);
				

				const printContract = await contract.tokenURI(name);
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
				
				return {
					id: name,
					owner: owner,
					location: decodedData,
					name: blogName,
					description: blogDescription
				};
			}));
	
			console.log("MINTS FETCHED ", mintRecords);
			setMints(mintRecords);
			}
		} catch(error){
			console.log(error);
		}
		
	}
	
	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			fetchMints();
		}
	}, [currentAccount, network]);


  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
    );

		const renderNotConnectedTitle = () => (
			<div >
						<p className="title">Web3 Blog</p>
						<br></br>
            <p className="subtitle">Sign in to view recent blog posts, and post some of your own </p>
			</div>
			);

			const renderConnectedTitle = () => (
				<div >
							<p className="title">Web3 Blog</p>
							<br></br>
							<p className="subtitle">Click into recent blog posts, or mint some of your own </p>
				</div>
				);

				//Hook to let user view specific blog post
				const doThis = async (event, param) => {
    			setView(param);
				}

				//clear state if user is done viewing post
				const clearView = async () => {
    			setView('');
				}
				
				//render minted blogs
					const renderMints = () => {
						if(view){
							return (
								<div className="mint-container">
									
									<h2>{view[1]}</h2>
									<p > <small>Blog number: {view[0]}</small></p>
									<p > <small> Author: {view[4]} </small></p>
									<br></br>
									<br></br>
									<p>{view[2]}</p>
									<br></br>
									<br></br>
									<InlineSVG className = 'nft-image'src={view[3]} />
									
							</div>);
						}

						if (currentAccount && mints.length > 0) {
							return (
								<div className="mint-container">
									<p className="subtitle"> Recently minted blog posts:</p>
									<div className="mint-list">
										{ mints.map((mint, index) => {
											return (
												<button className = "thumbButton" onClick={event => doThis(event, [index, mint.name, mint.description, mint.location, mint.owner])}>
												<div className="mint-item" key={index} >
														<div className='mint-row'>
														<InlineSVG className = 'nft-image'src={mint.location} />
											</div>
													
										<p className = 'nft-name'> Id: {index} </p>
										<p className = 'nft-name'> Name: {mint.name} </p>
									</div></button>)
									})}
								</div>
							</div>);
						}
					};
					
				
					
		//I was lazy and did not change the name of this component - it's just to switch to testnet
		const renderInputForm = () =>{
			if (network !== 'Polygon Mumbai Testnet') {
				return (
					<div className="connect-wallet-container">
						<h2>Please switch to Polygon Mumbai Testnet</h2>
        <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
					</div>
				);
			}
			return (
				<div className="form-container">
      </div>
    );
  }
  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
		
  }, [])

  return (
		<div className="App">
			{!view && 
      <div className="container">
        <div className="header-container">
				<div >
            {!currentAccount && renderNotConnectedTitle()}
						{currentAccount && renderConnectedTitle()}
            </div>
          <header>
           
						<div className="right">
      				<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
      				{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
    				</div>
          </header>
        </div>
       
				{!currentAccount && renderNotConnectedContainer()}
				{!transaction && currentAccount && renderInputForm()}
				{mints && renderMints()}	

        <div className="footer-container">
        </div>
      </div>
			}
			
			{view && 
      <div className="container">
        <div className="other-container">
          <header>
           
						<div className="right">
      				<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
      				{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
    				</div>
          </header>
					<div className = "yield-container">
					{!currentAccount && renderNotConnectedContainer()}
				{!transaction && currentAccount && renderInputForm()}
				{mints && renderMints()}
				</div>
				<br></br>
				<button className="cta-button connect-wallet-button-two" onClick = {clearView}>Go back</button>
        </div>
        <div className="footer-container">
        </div>
      </div>
			}
    </div>
  );
};

export default App;
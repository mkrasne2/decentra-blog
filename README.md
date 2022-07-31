# Web3 Blog Service

I created this fun application that allows anyone to view and mint their own blogs on the Polygon POS Mumbai testnet chain.

## Technologies used

1. Hardhat, stringUtils, and Base64 to help compile my smartcontracts, as well as OpenZeppelin to instantiate my ERC721 standard, and ERC721URIStorage
2. React and ethers.js for the frontend experience

## Interesting specs

When you mint a blog post, the smartcontract stores the blog title, blog description, and a unique SVG associated with that blog post directly on-chain without using IPFS. Obviously this is not the most cost-efficient option, but I thought it would be cool.

Try it for yourself: https://mkrasne2.github.io/web3-blog/#/

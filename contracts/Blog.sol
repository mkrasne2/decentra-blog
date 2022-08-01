//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import { StringUtils } from "./libraries/stringUtils.sol";
import {Base64} from "./libraries/Base64.sol";

contract Blog is ERC721, ERC721URIStorage, Ownable{
    
    //Use counter utility to keep track of which NFTs have already been minted
    using Counters for Counters.Counter;
    Counters.Counter private _blogIdCounter;
    string public tld;
    uint[] public minted;

    //Make fees publicly viewable 
    uint256 public fees;
    //run at deployment of contract, use parameters to define variables for instantiation of ERC721 contract
    constructor(string memory _name, 
                string memory _symbol,
                string memory _tld, 
                uint256 _fees
                ) ERC721(_name, _symbol){
                    fees = _fees;
                    tld = _tld;
                }

    
    function safeMint(address _to, string memory _title, string memory _body) public payable {

        //ensure message value associated with calling safemint is enough to mint blog post
        require(msg.value >= fees, "Not enough funds to mint blog post");
        //if yes, transfer fees to deployer of blog contract
        payable(owner()).transfer(fees);

        //Create SVG for the unique blog
    uint256 blogId = _blogIdCounter.current();
    string memory _name = string(abi.encodePacked(tld, "-", Strings.toString(blogId)));
    // Create the SVG (image) for the NFT with the name
    string memory svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-10.081 6.032-6.85 3.934-10.081 6.032c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616c-.384-.665-.594-1.418-.608-2.187v-9.31c-.013-.775.185-1.538.572-2.208a4.25 4.25 0 0 1 1.625-1.595l7.884-4.59c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v6.032l6.85-4.065v-6.032c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595L41.456 24.59c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595c-.387.67-.585 1.434-.572 2.208v17.441c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l10.081-5.901 6.85-4.065 10.081-5.901c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v9.311c.013.775-.185 1.538-.572 2.208a4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616c-.385-.665-.594-1.418-.608-2.187v-6.032l-6.85 4.065v6.032c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l14.864-8.655c.657-.394 1.204-.95 1.589-1.616s.594-1.418.609-2.187V55.538c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#fff"/><defs><linearGradient id="B" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3DBEC7" /><stop offset="50%" stop-color="#BC3DE" /><stop offset="100%" stop-color="#3DC7BF" /></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,sans-serif" font-weight="bold">';
    string memory svgPartTwo = '</text></svg>';
    string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));

    // Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
    string memory json = Base64.encode(
      abi.encodePacked(
        '{"name": "',
        _title,
        '", "description": "', 
        _body, 
        '", "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(finalSvg)),
        '"}'
      )
    );

    string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));

        //Mint blog NFT

        _blogIdCounter.increment();
        _safeMint(_to, blogId);
        _setTokenURI(blogId, finalTokenUri);
        minted.push(blogId);

        //return overpaid fees (any blog balance) since exact fees already transferred to owner
        uint256 blogBalance = address(this).balance;
        if(blogBalance > 0){
            payable(msg.sender).transfer(address(this).balance);
        }

    }

    //Override functions

    function _burn(uint256 blogId) internal override(ERC721, ERC721URIStorage){
        super._burn(blogId);
    }

    function tokenURI(uint256 blogId) public view override(ERC721, ERC721URIStorage) returns (string memory){
        return super.tokenURI(blogId);
    }

    function viewMinted() public view returns (uint[] memory mintedblogs){
        mintedblogs = minted;
    }

}

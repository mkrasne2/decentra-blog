import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import '../styles/App.css';
import { Link } from  "react-router-dom";

export default function Header() {
  
  return (
    <Navbar className = 'newnav' expand="lg" bg="dark" variant="dark">
      <Nav className="me-auto">
      <Navbar.Brand ><Link className = 'item' aria-current='page' to='/'>Web3 Blog</Link></Navbar.Brand>
      <Nav.Link className = 'item'><Link to='/create' className = 'item'>Create a Post</Link></Nav.Link>
      
          </Nav>
    </Navbar>
      )
      }
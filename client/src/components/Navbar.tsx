import React, { useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import type {RootState}  from '../reduxstore/store'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../reduxstore/authSlice'
import {clearUserItems} from '../reduxstore/userItemsSlice'


// need to add token for viewer as default

const Navbar = () => {

  // styling options
  const [navStyle,setNavStyle] = useState({})
  const [hamburgerClicked,setHamburgerClicked] = useState<boolean>(false);
  const [listStyle,setListStyle] = useState({display: "block"});

    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

    const token = localStorage.getItem("token");
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const showInfo = () => {
      console.log(role,isAuthenticated,token)
    }



  return (
    <nav>
      <button id='hamburgerbtn' onClick={() => {
        setHamburgerClicked(prev => !prev);
        if(hamburgerClicked){
          setNavStyle({display: "block"})
        } else {
          setNavStyle({display: "none"})
        } }}>{!hamburgerClicked ? "❌" : "💾"}</button>
      <ul id='navlist' style={navStyle}>
        <li>{isAuthenticated && token ? <button onClick={()=> {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          dispatch(clearUserItems());
          dispatch(logout());
          navigate("/login");
          }}>logout</button> : null}</li>
        <li>{isAuthenticated && role === 'admin' ? (<Link className='navlink' to={"/admin"}>Admin</Link>) : null }</li>
        <li>{role === "admin" || role === "user" ? <Link className='navlink' to={"/diet"}>Diet Plans</Link> : null}</li>
        <li>{role === "admin" || role === "user" ? <Link className='navlink' to={"/account"}>Account</Link> : null}</li>
        <li><Link className='navlink' to={"/"}>The app</Link></li>
        <li><Link className='navlink' to={"/home"}>FoodGuide</Link></li>
        <li><Link className='navlink' to={"/contact"}>Get in touch</Link></li>
        <li><Link className='navlink' to={"/login"}>Login/Register</Link></li>
      </ul>
        {/* <button onClick={() => showInfo()}>INFO</button> */}
    </nav>
  )
}

export default Navbar
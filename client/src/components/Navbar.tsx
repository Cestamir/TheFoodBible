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

  const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const navigate = useNavigate()

  return (
    <nav>
      <button id='hamburgerbtn' onClick={() => {
        setHamburgerClicked(prev => !prev);
        if(hamburgerClicked){
          setNavStyle({display: "block"})
        } else {
          setNavStyle({display: "none"})
        } }}>{!hamburgerClicked ? "❌" : "🟰"}</button>

      <ul id='navlist' style={navStyle}>
        {isAuthenticated && token ? <li><button className='smallbtn' onClick={()=> {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          dispatch(clearUserItems());
          dispatch(logout());
          navigate("/login");
          }}>logout</button></li> : null}
          
        {/* display only items based on your role */}
        {isAuthenticated && role === 'admin' ? (<li><Link className='navlink' to={"/admin"}>Admin</Link></li>) : null }
        {role === "admin" || role === "user" ? <li><Link className='navlink' to={"/diet"}>Diet Plans</Link></li> : null}
        {role === "admin" || role === "user" ? <li><Link className='navlink' to={"/account"}>Account</Link></li> : null}
        <li><Link className='navlink' to={"/"}>The app</Link></li>
        <li><Link className='navlink' to={"/home"}>FoodGuide</Link></li>
        <li><Link className='navlink' to={"/contact"}>Get in touch</Link></li>
        <li><Link className='navlink' to={"/login"}>Login/Register</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar
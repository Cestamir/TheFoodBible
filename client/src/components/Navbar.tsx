import React from 'react'
import { useDispatch,useSelector } from 'react-redux'
import type {RootState}  from '../reduxstore/store'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../reduxstore/authSlice'


// need to add token for viewer as default

const Navbar = () => {

    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate()

  return (
    <nav>
        {isAuthenticated ? <button onClick={()=> {
          dispatch(logout())
          navigate("/");
          }}>logout</button> : null}
        {role === 'admin' ? <button><Link to={"/admin"}>Admin</Link></button> : null }
        {role === "admin" || role === "user" ? <button><Link to={"/diet"}>Diet Plans</Link></button> : null}
        <button>
            <Link to={"/"}>App</Link>
        </button>
        <button>
            <Link to={"/home"}>Home - guide</Link>
        </button>
        <button>
          <Link to={"/contact"}>Contact</Link>
        </button>
        <button>
          <Link to={"/login"}>Login/Register</Link>
        </button>
    </nav>
  )
}

export default Navbar
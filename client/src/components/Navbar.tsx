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
        {role == 'admin' ? <Link to={"/admin"}>Admin</Link> : null }
        {/* doesnt work for the viewer */}
        {role !== "viewer" ? <Link to={"/diet"}>Diet Plans</Link> : null}
        {isAuthenticated ? <button onClick={()=> {
          dispatch(logout())
          navigate("/");
          }}>logout</button> : null}
        <button>
            <Link to={"/"}>Home</Link>
            <Link to={"/home"}>App</Link>
        </button>
    </nav>
  )
}

export default Navbar
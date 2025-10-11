import React from 'react'
import { useDispatch,useSelector } from 'react-redux'
import type {RootState}  from '../reduxstore/store'
import { Link } from 'react-router-dom'

const Navbar = () => {

    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

  return (
    <nav>
        {role == 'admin' ? <Link to={"/admin"}>Admin</Link> : null }
        <button>
            <Link to={"/"}>Home</Link>
            <Link to={"/home"}>App</Link>
        </button>
    </nav>
  )
}

export default Navbar
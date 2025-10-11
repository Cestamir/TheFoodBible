import React from 'react'
import ControlPanel from '../ControlPanel'
import { Link } from 'react-router-dom'

const AdminPage = () => {
  return (
    <div>
        AdminPage = 
        <ControlPanel nodeServerRunning='nah'/>
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default AdminPage
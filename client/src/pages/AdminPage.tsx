import React from 'react'
import ControlPanel from '../ControlPanel'
import { Link } from 'react-router-dom'

const AdminPage = () => {
  return (
    <div>
        AdminPage = 
        <ControlPanel nodeServerRunning='nah'/>
        <Link to={"/"}>Go back</Link>
        <button>Populate the db with food | recipes</button>
        <button>Add new admin | user account</button>
        <button>Create new diet plan</button>
    </div>
  )
}

export default AdminPage
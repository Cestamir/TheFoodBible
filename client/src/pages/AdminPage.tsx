import React, { useEffect, useState } from 'react'
import ControlPanel from '../ControlPanel'
import { Link } from 'react-router-dom'
import type { User } from '../utils/types'

// add live update of the users

const AdminPage = () => {

  const [createBtn,setCreateBtn] = useState(false);
  const [updateBtn,setUpdateBtn] = useState(false);
  const [newUser,setNewUser] = useState<User>({userName: '',
    password: '',
    userEmail: '',
    role: ''});

  const [userPanelClicked,setUserPanelClicked] = useState(false);
  const [users,setUsers] = useState<User[]>();
  const token = localStorage.getItem("token");

  const manageUsers = async () => {
    const res = await fetch("/api/users",{method: "GET",headers: {"Content-Type" : "application/json","Authorization": `Bearer ${token}`}});
    const data = await res.json();
    setUsers(data);
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`,{method: "DELETE",headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`}})
      if(!res.ok){
        console.log(`failed to delete user with id: ${id}`)
        return;
      }
      console.log("success")

    } catch (error) {
      console.log(error)
    }
  }

  const handleCreateUser = async() => {
    try {
    const res = await fetch("/api/auth/register",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(newUser)})
    if(res.ok){
      console.log("user created")
    } else {
      console.log("failed to create user.")
    }
      
    } catch (error) {
      console.log(error)
    } finally {
      setNewUser({userName: '',
    password: '',
    userEmail: '',
    role: ''})
    }
  }

  const handleUpdateUser = async (id: string) => {
    try {
    
    const userToUpdate = {...newUser,_id: id};

    // deletes the property password on the object since its optional
    if(!userToUpdate.password){
      delete userToUpdate.password;
    }

    console.log("🔍 Updating user:", id);
    console.log("📦 Data being sent:", userToUpdate);
    console.log("🔑 Token:", token);

    const res = await fetch(`/api/users/${id}`,{method: "PUT",headers: {"Content-Type" : "application/json","Authorization": `Bearer ${token}`},body: JSON.stringify(userToUpdate)})
    if(res.ok){
      console.log("user updated")
    } else {
      const error = await res.text();
      console.log("failed to update user.",error)
    }
      
    } catch (error) {
      console.log(error)
    } finally {
      setUpdateBtn(false);
      setNewUser({userName: '',
    password: '',
    userEmail: '',
    role: ''})
    }
  }

  const loadUserToUpdate = (userToUpdate : User) => {
    setNewUser({...userToUpdate,password: ""});
  }

  return (
    <div>
        AdminPage = 
        <ControlPanel nodeServerRunning='nah'/>
        <Link to={"/"}>Go back</Link>
        <button>Populate the db with food | recipes</button>
        <button onClick={() => {manageUsers();setUserPanelClicked(prev => !prev);setUpdateBtn(false);setCreateBtn(false)}}>Add new admin | user account</button>
        <button>Create new diet plan</button>
        {/* create */}
        {createBtn && <form onSubmit={(e) => {e.preventDefault(); handleCreateUser()}}>
          <label>Name:</label>
          <input value={newUser.userName} onChange={(e) => setNewUser(prev => ({...prev,userName:  e.target.value}))} id='newusername'/>
          <label>Pass:</label>
          <input value={newUser.password} onChange={(e) => setNewUser(prev => ({...prev,password:  e.target.value}))} id='newuserpassword'/>
          <label>Role:</label>
          <input value={newUser.role} onChange={(e) => setNewUser(prev => ({...prev,role:  e.target.value}))} id='newuserrole'/>
          <label>Mail:</label>
          <input value={newUser.userEmail} onChange={(e) => setNewUser(prev => ({...prev,userEmail:  e.target.value}))} id='newusermail'/>
          <button type='submit'>Create</button>
          </form>}
          {/* update */}
          {!createBtn && updateBtn && <form onSubmit={(e) => {e.preventDefault(); handleUpdateUser(newUser._id!)}}>
          <label>Name:</label>
          <input value={newUser.userName} onChange={(e) => setNewUser(prev => ({...prev,userName:  e.target.value}))} id='newusername'/>
          <label>Pass:</label>
          <input placeholder='Leave empty to keep same password' value={newUser.password} onChange={(e) => setNewUser(prev => ({...prev,password:  e.target.value}))} id='newuserpassword'/>
          <label>Role:</label>
          <input value={newUser.role} onChange={(e) => setNewUser(prev => ({...prev,role:  e.target.value}))} id='newuserrole'/>
          <label>Mail:</label>
          <input value={newUser.userEmail} onChange={(e) => setNewUser(prev => ({...prev,userEmail:  e.target.value}))} id='newusermail'/>
          <button type='submit'>Update</button>
          </form>}
          {/* user list */}
        {userPanelClicked && <div>
          <button onClick={() => setCreateBtn(prev => !prev)}>CREATE NEW USER</button>
          {users ? users.map((user) => (
            <div key={user._id} style={{margin: "20px auto"}}>
              <h2>{user._id}</h2>
              <h2>{user.role}</h2>
              <h2>{user.userEmail}</h2>
              <h2>{user.userName}</h2>
              <h2>{user.password}</h2>
              <button onClick={() => handleDeleteUser(user._id!)}>DELETE USER</button>
              <button onClick={() => {setUpdateBtn(prev => !prev);loadUserToUpdate(user)}}>UPDATE USER</button>
            </div>
          )) : <p>No data.</p>}
          </div>}
    </div>
  )
}

export default AdminPage
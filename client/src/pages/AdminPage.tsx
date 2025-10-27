import React, { useEffect, useState } from 'react'
import ControlPanel from '../ControlPanel'
import { Link, useNavigate } from 'react-router-dom'
import { type User,type Diet, isExpiredToken } from '../utils/types'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../reduxstore/store'
import { addDiet, setDiets, updateDiet,deleteDiet } from '../reduxstore/dietSlice'

// add live update of the users

const AdminPage = () => {

    // node server running test
    const [message,setMessage] = useState<string>("");
    useEffect(() => {
        fetch("/api/test")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch((err) => {
            console.error("error fetching data:",err)
        })
    },[]);

  // diets

  const {diets} = useSelector((state: RootState) => state.diet);
  const dispatch = useDispatch();

  const [dietBtn,setDietBtn] = useState<boolean>(false);
  const [updateDietBtn,setUpdateDietBtn] = useState<boolean>(false);
  const [newDiet,setNewDiet] = useState<Diet>({planName: "",duration: 30,goal: ""});

  // need to implement to parent component to load for the entire application
  useEffect(() => {
    if(diets.length === 0){
      const loadData = async() => {
        try {
          const dietRes = await fetch("/api/diet");
          const dietData = await dietRes.json();

          dispatch(setDiets(dietData));
          console.log('data loaded from Redux.')
          
        } catch (error) {
          console.log(error,"error while loading data from db.")
        }
      }
      loadData();
    }
  },[diets.length,dispatch])

  // users

  const [createBtn,setCreateBtn] = useState(false);
  const [updateBtn,setUpdateBtn] = useState(false);
  const [newUser,setNewUser] = useState<User>({userName: '',
    password: '',
    userEmail: '',
    role: '',foodItems: []});

  const [userPanelClicked,setUserPanelClicked] = useState(false);
  const [users,setUsers] = useState<User[]>();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
      manageUsers();

    } catch (error) {
      console.log(error)
    }
  }

  const handleCreateUser = async() => {
    try {
    const res = await fetch("/api/auth/register",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(newUser)})
    if(res.ok){
      console.log("user created")
      manageUsers();
    } else {
      console.log("failed to create user.")
    }
      
    } catch (error) {
      console.log(error)
    } finally {
      setNewUser({userName: '',
    password: '',
    userEmail: '',
    role: '',foodItems: []})
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
      manageUsers();
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
    role: '',foodItems: []})
    }
  }

  const loadUserToUpdate = (userToUpdate : User) => {
    setNewUser({...userToUpdate,password: ""});
  }

  const handleDietSubmit = async () => {
    const isUpdate = !!newDiet._id;
    const fetchMethod = isUpdate ? "PUT" : "POST";
    
    try {
      const url = isUpdate ? `/api/diet/${newDiet._id}` : `/api/diet`;
      
      const res = await fetch(url, {
        method: fetchMethod,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newDiet)
      });
      
      if (!res.ok) {
        console.log(`Failed to ${isUpdate ? "update" : "add"} diet.`);
        return;
      }
      
      const savedDiet = await res.json();
      
      if (isUpdate) {
        dispatch(updateDiet(savedDiet));
      } else {
        dispatch(addDiet(savedDiet));
      }
      
      console.log(`Diet ${isUpdate ? "updated" : "created"} successfully`);
      
      setNewDiet({ planName: "", duration: 30, goal: "" });
      setUpdateDietBtn(false);
      
    } catch (error) {
      console.log(error);
    }
  }

  const updateDietPlan = (id: string) => {
    const dietToUpdate = diets.filter((d) => d._id === id)
    setNewDiet(dietToUpdate[0]);
  }

  const deleteDietPlan = async (id: string) => {
    try {
      const res = await fetch(`/api/diet/${id}`,{method: "DELETE",headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`}})
      if(!res.ok){
        console.log(`failed to delete diet.`)
        return;
      }
      dispatch(deleteDiet(id))
      console.log("success")

    } catch (error) {
      console.log(error)
    }
  }

  if(token && isExpiredToken(token)){
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("login again.")
    navigate("/login")
  }

  return (
    <div id='adminpage'>
      <h2>AdminPage</h2>
        <ControlPanel nodeServerRunning={message}/>
        <button>Populate the db with food | recipes</button>
        <button onClick={() => {manageUsers();setUserPanelClicked(prev => !prev);setUpdateBtn(false);setCreateBtn(false)}}>Manage users</button>
        <button onClick={() => setDietBtn(prev => !prev)}>Create new diet plan</button>
        {/* manage diet plans */}
        {dietBtn && <form onSubmit={(e) => {e.preventDefault();handleDietSubmit()}}>
          <label>Name</label>
          <input value={newDiet.planName} onChange={(e) => setNewDiet((prev) => ({...prev,planName: e.target.value}))}/>
          <label>Duration in days</label>
          <input placeholder='40' min={0} value={newDiet.duration} onChange={(e) => setNewDiet((prev) => ({...prev,duration: Number(e.target.value)}))}/>
          <label>Goal</label>
          <input value={newDiet.goal} onChange={(e) => setNewDiet((prev) => ({...prev,goal: e.target.value}))}/>
          {updateDietBtn ? <button type='submit'>Update</button> : <button type='submit'>Add plan</button>}
          </form>}
          {dietBtn && diets && diets.map((diet,i) => (
            <div key={i}>
              <button onClick={() => {setUpdateDietBtn(prev => !prev);updateDietPlan(diet._id!)}}>Update</button>
              <button onClick={() => deleteDietPlan(diet._id!)}>❌</button>
              <h3>{diet.planName}</h3>
              <h4>{diet.duration} days</h4>
              <p>{diet.goal}</p>
            </div>
          ))}
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
              {user.userName === localStorage.getItem("user") ? <h2 style={{color: "red"}}>{`CURRENT ACC ${user.userName}`}</h2>: <h2>{user.userName}</h2>}
              <h2>{user.password}</h2>
              <h3>Items on acc: {user.foodItems?.length}</h3>
              <button onClick={() => handleDeleteUser(user._id!)}>DELETE USER</button>
              <button onClick={() => {setUpdateBtn(prev => !prev);loadUserToUpdate(user)}}>UPDATE USER</button>
            </div>
          )) : <p>No data.</p>}
          </div>}
    </div>
  )
}

export default AdminPage
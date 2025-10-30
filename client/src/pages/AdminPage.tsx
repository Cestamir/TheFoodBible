import { useEffect, useState } from 'react'
import ControlPanel from '../utils/ControlPanel'
import {useNavigate } from 'react-router-dom'
import { type User,type Diet, isExpiredToken } from '../utils/types'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../reduxstore/store'
import { addDiet, setDiets, updateDiet,deleteDiet } from '../reduxstore/dietSlice'
import ScraperButton from '../components/ScraperButton'

const AdminPage = () => {

  // redux
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // populate db
  const [populateBtn,setPopulateBtn] = useState<boolean>(false);
  const [globalCooldown,setGlobalCooldown] = useState<number>(0);

  // handle 1 hour cooldown for USDA webpage req. limit
  const updateCooldown = () => {

    // set last scraper run time to storage
    const lastRun = localStorage.getItem("scraperLastRun");

    if(!lastRun){
      setGlobalCooldown(0);
      return;
    }
    const diff = Date.now() - parseInt(lastRun,10);
    const remaining = Math.max(0,60 * 60 * 1000 - diff);
    setGlobalCooldown(remaining);
  }

  // check for remaining time
  useEffect(() => {
    updateCooldown()
    const interval = setInterval(updateCooldown,1000);  
    return clearInterval(interval); 
  },[]);

  const handleScraperLastRun = () => {
    const now = Date.now()
    localStorage.setItem("scraperLastRun", now.toString());
    updateCooldown();
  }

  // node server is running test
    const [message,setMessage] = useState<string>("");
    useEffect(() => {
        fetch("/api/test")
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch((err) => {
            console.error("error fetching data:",err)
        })
    },[]);

  // diets managment
  const {diets} = useSelector((state: RootState) => state.diet)
  const [dietBtn,setDietBtn] = useState<boolean>(false);
  const [updateDietBtn,setUpdateDietBtn] = useState<boolean>(false);
  const [newDiet,setNewDiet] = useState<Diet>({planName: "",duration: 30,goal: ""});

  //load diet info from db (need to implement to parent component to load for the entire application)
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

  // users managment
  const [createBtn,setCreateBtn] = useState(false);
  const [updateBtn,setUpdateBtn] = useState(false);
  const [userPanelClicked,setUserPanelClicked] = useState(false);

  const [newUser,setNewUser] = useState<User>({
    userName: '',
    password: '',
    userEmail: '',
    role: '',
    foodItems: []});
  const [users,setUsers] = useState<User[]>();

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

  // load users and users manage functions
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

  // check for admin is logged in
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token || isExpiredToken(token)) {
        alert("Session expired or invalid. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 10000); 
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div id='adminpage'>
      <h1>AdminPage</h1>
      <div id='controls'>
        <ControlPanel nodeServerRunning={message}/>
        <button className='btn' onClick={() => {
          setPopulateBtn(prev => !prev);
          setUpdateBtn(false);
          setDietBtn(false);
          setUserPanelClicked(false);}}>Populate the db with food & recipes</button>

        <button className='btn' onClick={() => {
          manageUsers();
          setUserPanelClicked(prev => !prev);
          setUpdateBtn(false);
          setCreateBtn(false);
          setDietBtn(false);
          setPopulateBtn(false);}
          }>Manage users</button>

        <button className='btn' onClick={() => {
          setDietBtn(prev => !prev);
          setUserPanelClicked(false);
          setUpdateBtn(false);
          setPopulateBtn(false);}}>Create new diet plan</button>
      </div>
        {/* populate db btns */}
        {populateBtn && <div id='populatedb'>
          <ScraperButton cooldown={globalCooldown} onScraperRun={handleScraperLastRun} sourceName='fruits'/>
          <ScraperButton cooldown={globalCooldown} onScraperRun={handleScraperLastRun} sourceName='seeds'/>
          <ScraperButton cooldown={globalCooldown} onScraperRun={handleScraperLastRun} sourceName='recipes'/> 
          <ScraperButton cooldown={globalCooldown} onScraperRun={handleScraperLastRun} sourceName='vegetables'/>
          <ScraperButton cooldown={globalCooldown} onScraperRun={handleScraperLastRun} sourceName='herbs'/>
          <ScraperButton cooldown={globalCooldown} onScraperRun={handleScraperLastRun} sourceName='restItems'/>
        </div>}

        {/* manage diet plans */}
        {dietBtn && <div id='manageadmindiets'>
          <form onSubmit={(e) => {e.preventDefault();handleDietSubmit()}}>
          <label className='label'>Name: </label>
          <input value={newDiet.planName} onChange={(e) => setNewDiet((prev) => ({...prev,planName: e.target.value}))}/>
          <label className='label'>Duration in days: </label>
          <input placeholder='40' min={0} value={newDiet.duration} onChange={(e) => setNewDiet((prev) => ({...prev,duration: Number(e.target.value)}))}/>
          <label className='label'>Goal: </label>
          <input value={newDiet.goal} onChange={(e) => setNewDiet((prev) => ({...prev,goal: e.target.value}))}/>
          {updateDietBtn ? <button type='submit'>Update</button> : <button className='btn' type='submit'>Add plan</button>}
          </form></div>}
          {dietBtn && diets && <div id='admindiets'>{ diets.map((diet,i) => (
            <div id='admindiet' key={i}>
              <button className='smallbtn' onClick={() => {setUpdateDietBtn(prev => !prev);updateDietPlan(diet._id!)}}>Update</button>
              <button className='smallbtn' onClick={() => deleteDietPlan(diet._id!)}>❌</button>
              <h3>{diet.planName}</h3>
              <h4>{diet.duration} days</h4>
              <p>{diet.goal}</p>
            </div>
          ))}</div>}

        {/* create user */}
        {createBtn && <div className='adminform'>
          <form onSubmit={(e) => {e.preventDefault(); handleCreateUser()}}>
          <label className='label'>Name:</label>
          <input value={newUser.userName} onChange={(e) => setNewUser(prev => ({...prev,userName:  e.target.value}))} id='newusername'/>
          <label className='label'>Pass:</label>
          <input value={newUser.password} onChange={(e) => setNewUser(prev => ({...prev,password:  e.target.value}))} id='newuserpassword'/>
          <label className='label'>Role:</label>
          <input value={newUser.role} onChange={(e) => setNewUser(prev => ({...prev,role:  e.target.value}))} id='newuserrole'/>
          <label className='label'>Mail:</label>
          <input value={newUser.userEmail} onChange={(e) => setNewUser(prev => ({...prev,userEmail:  e.target.value}))} id='newusermail'/>
          <button className='smallbtn' type='submit'>Create</button>
          <button className='smallbtn' onClick={() => setCreateBtn(false)}>Cancel❌</button>
          </form></div>}

          {/* update user */}
          {!createBtn && updateBtn && <div className='adminform'>
          <form onSubmit={(e) => {e.preventDefault(); handleUpdateUser(newUser._id!)}}>
          <label className='label'>Name:</label>
          <input value={newUser.userName} onChange={(e) => setNewUser(prev => ({...prev,userName:  e.target.value}))} id='newusername'/>
          <label className='label'>Pass:</label>
          <input placeholder='Leave empty to keep same password' value={newUser.password} onChange={(e) => setNewUser(prev => ({...prev,password:  e.target.value}))} id='newuserpassword'/>
          <label className='label'>Role:</label>
          <input value={newUser.role} onChange={(e) => setNewUser(prev => ({...prev,role:  e.target.value}))} id='newuserrole'/>
          <label className='label'>Mail:</label>
          <input value={newUser.userEmail} onChange={(e) => setNewUser(prev => ({...prev,userEmail:  e.target.value}))} id='newusermail'/>
          <button className='smallbtn' type='submit'>Update</button>
          <button className='smallbtn' onClick={() => setUpdateBtn(false)}>Cancel❌</button>
          </form></div>}

          {/* user list */}
        {userPanelClicked && <div id='userspanel'>
          <button className='smallbtn' onClick={() => setCreateBtn(prev => !prev)}>CREATE NEW USER</button>
          {users ? users.map((user) => (
            <div id='newuser' key={user._id}>
              <h2>{user._id}</h2>
              <h2>{user.role}</h2>
              <h2>{user.userEmail}</h2>
              {user.userName === localStorage.getItem("user") ? <h2 style={{color: "red"}}>{`CURRENT ACC ${user.userName}`}</h2>: <h2>{user.userName}</h2>}
              <h2>{user.password}</h2>
              <h3>Items on acc: {user.foodItems?.length}</h3>
              <button className='smallbtn' onClick={() => handleDeleteUser(user._id!)}>DELETE USER</button>
              <button className='smallbtn' onClick={() => {setUpdateBtn(prev => !prev);loadUserToUpdate(user)}}>UPDATE USER</button>
            </div>
          )) : <p>No data.</p>}
          </div>}
    </div>
  )
}

export default AdminPage
import React, { useEffect, useState } from 'react'
// import {jwtDecode} from "jwt-decode"
import {useDispatch, useSelector}  from 'react-redux';
import {login, logout} from '../reduxstore/authSlice'
import {useNavigate} from 'react-router-dom'
import type { RootState } from '../reduxstore/store';
import { clearUserItems, deleteUserItem, setError, setLoading, setUserItems } from '../reduxstore/userItemsSlice';



interface CustomJwtPayload {
    role: string;
    // Add other JWT properties you use
    sub?: string;
    exp?: number;
    iat?: number;
}

interface login{
    userName: string
    password: string
}

interface register{
    userName: string
    password: string
    userEmail: string
}

const LoginPage : React.FC = () => {

    const {userItems,loading,error} = useSelector((state: RootState) => state.userItems);

    // manage user data

    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);
    const token = localStorage.getItem("token");


    const [registerBtn,setRegisterBtn] = useState(false);
    const [loginUser,setLoginUser] = useState<login>({userName: "",password: ""})
    const [registerUser,setRegisterUser] = useState<register>({userName: "",password: "",userEmail: ""})
    const [loginLoading,setLoginLoading] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        const formId : string = e.target.id
        e.preventDefault()
        setLoginLoading(true)
        if(formId === "loginform"){
            try{
                const res = await fetch("/api/auth/login",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(loginUser)});
                if(res.ok){
                    
                    // console.log("user login successfully.")
                    // const loginToken = await res.json()
                    // const decoded = jwtDecode<CustomJwtPayload>(loginToken.token)
                    // localStorage.setItem("token",loginToken.token);
                    // localStorage.setItem("role",decoded.role)
                    localStorage.setItem("user",loginUser.userName);

                    const { token } = await res.json();
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    dispatch(login({ token, role: payload.role }));
                    setLoginLoading(false)
                } else if(!res.ok){
                    setLoginLoading(false)
                    throw new Error("Login has failed");
                }
                // CANT RES TO JSON 2x, IT ONLY CAN BE DONE ONCE, OTHERWISE THROWS AN ERROR
                // const { token } = await res.json();
                // const payload = JSON.parse(atob(token.split('.')[1]));
                // dispatch(login({ token, role: payload.role }));


                // handle navigation here when page is ready ti use, need to create LOGINPAGE
                navigate("/")
            }catch(err){
                console.log(err)
            } finally {
                setLoginUser({userName: "",password: ""})
            }
        } else if(formId === "registerform"){
            try{
                const res = await fetch("/api/auth/register",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(registerUser)})
                if(res.ok){
                    const registerToken = await res.json();
                    console.log("user registered successfully.",registerToken)
                    setLoginLoading(false)
                } else{
                    console.log("failed to register new user.")
                }

            }catch(err){
                console.log(err)
            } finally {
                setRegisterUser({userName: "",password: "",userEmail: ""})
            }
        }
        


    }

    // load user items

    const loadUserItems = async () => {
        if(!token){
            console.log("No token available.")
            return;
        }
        dispatch(setLoading(true));
        try {
            const res = await fetch("/api/users/me/foods",{method: "GET",   
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if(res.ok){
                const data = await res.json();
                dispatch(setUserItems(data))
            } else {
                dispatch(setError("Failed to load user items."))
            }

            
        } catch (error) {
            dispatch(setError('Error loading user items'));
            console.log(error);
        }
    }

    useEffect(() => {
        if(isAuthenticated){
            loadUserItems();
        }
    },[isAuthenticated])

    // remove item from user items

    const handleRemoveUserItem = async (id: string) => {
        try {
            console.log(id)
            const res = await fetch(`/api/users/me/foods/${id}`,{method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if(res.ok){
                dispatch(deleteUserItem(id))
            } else {
                console.log("failed to remove food from db")
            }
            
        } catch (error) {
            console.log("error removing food")
        }
    }

    // EXTRACT THE PAYLOAD FROM JWT TOKEN

    // function parseJwt(token : string) {
    // var base64Url = token.split('.')[1];
    // var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    //     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    // }).join(''));

    // return JSON.parse(jsonPayload);
    // }

  return (
    <div>  
        {/* load */}
        {loading && <p>Loading your food items</p>}
        {loginLoading && registerBtn ? <div>Waiting for registration..</div> : loginLoading && !registerBtn ? <div>Waiting for login..</div> : null}
        {/* logout */}
        {isAuthenticated ? <button onClick={() => {
            dispatch(logout());
            dispatch(clearUserItems());
            localStorage.removeItem("token");
            localStorage.removeItem("role");}}>Logout</button> :     
        <div>
        {!registerBtn && <div id='login'>
            <p>Login</p>
            <form id='loginform' onSubmit={handleSubmit}>
            <label htmlFor='logininput'>ENTER YOUR USERNAME:</label>
            <input minLength={3}  onChange={(e) => setLoginUser((prev) => ({...prev,userName: e.target.value}))} value={loginUser.userName} id='logininput'/>
            <label htmlFor='passwordlogininput' >ENTER YOUR PASSWORD:</label>
            <input type='password'  onChange={(e) => setLoginUser((prev) => ({...prev,password: e.target.value}))} value={loginUser.password} id='passwordlogininput'/>
            <button type='submit' id='loginbtn'>LOGIN HERE</button>
            </form>
        </div>}
        {registerBtn && <div id='register'>
            <p>Register</p>
            <form id='registerform' onSubmit={handleSubmit}>
            <label htmlFor='registerinput'>ENTER USERNAME:</label>
            <input minLength={3}  onChange={(e) => setRegisterUser((prev) => ({...prev,userName: e.target.value}))} id='registerinput' value={registerUser.userName}/>
            <label htmlFor='passwordregisterinput'>ENTER PASSWORD:</label>
            <input type='password'  onChange={(e) => setRegisterUser((prev) => ({...prev,password: e.target.value}))} value={registerUser.password} id='passwordregisterinput'/>
            <label htmlFor='emailinput'>ENTER YOUR EMAIL:</label>
            <input type='email' onChange={(e) => setRegisterUser((prev) => ({...prev,userEmail: e.target.value}))} value={registerUser.userEmail} id='emailinput'/>
            <button type='submit' id='registerbtn'>REGISTER HERE</button>
            </form>
        </div>}
        <button onClick={() => setRegisterBtn(prev => !prev)}>{registerBtn ? "login to existing account⬇️" : "register new account"}</button>
    </div>}
    {userItems ? <ul>{userItems.map((item,i) => (
        <li key={i}>
            {/* need to display clickable component like in recipe detail */}
            <h3>{item.name}</h3>
            <button onClick={() => handleRemoveUserItem(item._id)}>❌ remove</button>
        </li>
    ))}</ul> : "No user items."}
    </div>
  )
}

export default LoginPage
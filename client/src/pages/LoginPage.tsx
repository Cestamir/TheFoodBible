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

interface Login{
    userName: string
    password: string
}

interface Register{
    userName: string
    password: string
    userEmail: string
}

const LoginPage : React.FC = () => {

    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);

    const [registerBtn,setRegisterBtn] = useState(false);
    const [loginUser,setLoginUser] = useState<Login>({userName: "",password: ""})
    const [registerUser,setRegisterUser] = useState<Register>({userName: "",password: "",userEmail: ""})
    const [loginLoading,setLoginLoading] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleSubmit = async (e: React.FormEvent) => {
        const formId = (e.target as HTMLFormElement).id
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
                navigate("/login")
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
    <div id='loginpage'>
        <div id='loginload'>
            {loginLoading && registerBtn ? <div>Waiting for registration..</div> : loginLoading && !registerBtn ? <div>Waiting for login..</div> : null}
        </div>
        {/* logout */}
        {isAuthenticated && token ? <button id='logoutbtn' onClick={() => {
            dispatch(logout());
            dispatch(clearUserItems());
            localStorage.removeItem("token");
            localStorage.removeItem("role");}}>Logout</button> :     
        <div id='loginforms'>
        {!registerBtn && <div id='login'>
            <h3>Login</h3>
            <form id='loginform' onSubmit={handleSubmit}>
            <label htmlFor='logininput'>ENTER YOUR USERNAME:</label>
            <input minLength={3}  onChange={(e) => setLoginUser((prev) => ({...prev,userName: e.target.value}))} value={loginUser.userName} id='logininput'/>
            <label htmlFor='passwordlogininput' >ENTER YOUR PASSWORD:</label>
            <input type='password'  onChange={(e) => setLoginUser((prev) => ({...prev,password: e.target.value}))} value={loginUser.password} id='passwordlogininput'/>
            <button type='submit' className='loginbtn submit' id='loginbtn'>LOGIN HERE</button>
            </form>
        </div>}
        {registerBtn && <div id='register'>
            <h3>Register</h3>
            <form id='registerform' onSubmit={handleSubmit}>
            <label htmlFor='registerinput'>ENTER USERNAME:</label>
            <input minLength={3}  onChange={(e) => setRegisterUser((prev) => ({...prev,userName: e.target.value}))} id='registerinput' value={registerUser.userName}/>
            <label htmlFor='passwordregisterinput'>ENTER PASSWORD:</label>
            <input type='password'  onChange={(e) => setRegisterUser((prev) => ({...prev,password: e.target.value}))} value={registerUser.password} id='passwordregisterinput'/>
            <label htmlFor='emailinput'>ENTER YOUR EMAIL:</label>
            <input type='email' onChange={(e) => setRegisterUser((prev) => ({...prev,userEmail: e.target.value}))} value={registerUser.userEmail} id='emailinput'/>
            <button className='loginbtn submit' type='submit' id='registerbtn'>REGISTER HERE</button>
            </form>
        </div>}
        <button className='loginbtn' onClick={() => setRegisterBtn(prev => !prev)}>{registerBtn ? "login to account ⬇" : "new account"}</button>
    </div>}
    </div>
  )
}

export default LoginPage
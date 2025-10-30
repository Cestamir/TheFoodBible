import React, { useState } from 'react'
import {useDispatch, useSelector}  from 'react-redux';
import {login, logout} from '../reduxstore/authSlice'
import {useNavigate} from 'react-router-dom'
import type { RootState } from '../reduxstore/store';
import { clearUserItems} from '../reduxstore/userItemsSlice';

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

    // redux
    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // utils
    const [registerBtn,setRegisterBtn] = useState<boolean>(false);
    const [loginLoading,setLoginLoading] = useState<boolean>(false)

    // initial states of users
    const [loginUser,setLoginUser] = useState<Login>({userName: "",password: ""})
    const [registerUser,setRegisterUser] = useState<Register>({userName: "",password: "",userEmail: ""})


    const handleSubmit = async (e: React.FormEvent) => {
        const formId = (e.target as HTMLFormElement).id
        e.preventDefault()
        setLoginLoading(true)
        if(formId === "loginform"){
            try{
                const res = await fetch("/api/auth/login",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(loginUser)});
                if(res.ok){

                    localStorage.setItem("user",loginUser.userName);

                    const { token } = await res.json();
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    dispatch(login({ token, role: payload.role }));
                    setLoginLoading(false)

                } else if(!res.ok){
                    setLoginLoading(false)
                    throw new Error("Login has failed");
                }

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

  return (
    <div id='loginpage'>
        <div id='loginload'>
            {loginLoading && registerBtn ? <div>Waiting for registration..</div> : loginLoading && !registerBtn ? <div>Waiting for login..</div> : null}
        </div>

        {/* logout or login/register */}
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

        {/* switch between login/register */}
        <button className='loginbtn' onClick={() => setRegisterBtn(prev => !prev)}>{registerBtn ? "login to account ⬇" : "new account"}</button>
    </div>}
    </div>
  )
}

export default LoginPage
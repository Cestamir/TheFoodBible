import React, { useState } from 'react'
// import {jwtDecode} from "jwt-decode"
import {useDispatch, useSelector}  from 'react-redux';
import {login, logout} from '../reduxstore/authSlice'
import {useNavigate} from 'react-router-dom'
import type { RootState } from '../reduxstore/store';



interface CustomJwtPayload {
    role: string;
    // Add other JWT properties you use
    sub?: string;
    exp?: number;
    iat?: number;
}

// need to make it a single page for login or register
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

    const {isAuthenticated,role} = useSelector((state: RootState) => state.auth);


    const [registerBtn,setRegisterBtn] = useState(false);
    const [loginUser,setLoginUser] = useState<login>({userName: "",password: ""})
    const [registerUser,setRegisterUser] = useState<register>({userName: "",password: "",userEmail: ""})
    const [loginLoading,setLoginLoading] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e: any) => {
        const inputId = e.target.id
        const val = e.target.value;
        switch(inputId){
            case "logininput":
                setLoginUser((prev) => ({
                    ...prev,userName: val
                }))
                break;
            case "registerinput":
                setRegisterUser((prev) => ({
                    ...prev,userName: val
                }))
                break;
            case "passwordlogininput":
                setLoginUser((prev) => ({
                    ...prev,password: val
                }))
                break;
            case "passwordregisterinput":
                setRegisterUser((prev) => ({
                    ...prev,password: val
                }))
                break;
            case "emailinput":
                setRegisterUser((prev) => ({
                    ...prev,userEmail: val
                }))
                break;
            default: null;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        const formId = e.target.id
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
                    const { token } = await res.json();
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    dispatch(login({ token, role: payload.role }));
                    setLoginLoading(false)
                } else if(!res.ok){
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
    <>  
        {loginLoading ? <div>Waiting for login/register ..</div> : isAuthenticated ? <button onClick={() => dispatch(logout()) }>Logout</button> :     
        <div>
        {!registerBtn && <div id='login'>
            <p>Login</p>
            <form id='loginform' onSubmit={handleSubmit}>
            <label htmlFor='logininput'>ENTER YOUR USERNAME:</label>
            <input minLength={3} onChange={handleChange} value={loginUser.userName} id='logininput'/>
            <label htmlFor='passwordlogininput' >ENTER YOUR PASSWORD:</label>
            <input type='password' onChange={handleChange} value={loginUser.password} id='passwordlogininput'/>
            <button type='submit' id='loginbtn'>LOGIN HERE</button>
            </form>
        </div>}
        {registerBtn && <div id='register'>
            <p>Register</p>
            <form id='registerform' onSubmit={handleSubmit}>
            <label htmlFor='registerinput'>ENTER USERNAME:</label>
            <input minLength={3} onChange={handleChange} value={registerUser.userName} id='registerinput'/>
            <label htmlFor='passwordregisterinput'>ENTER PASSWORD:</label>
            <input type='password' onChange={handleChange} value={registerUser.password} id='passwordregisterinput'/>
            <label htmlFor='emailinput'>ENTER YOUR EMAIL:</label>
            <input type='email' onChange={handleChange} value={registerUser.userEmail} id='emailinput'/>
            <button type='submit' id='registerbtn'>REGISTER HERE</button>
            </form>
        </div>}
        <button onClick={() => setRegisterBtn(prev => !prev)}>{registerBtn ? "login to existing account⬇️" : "register new account"}</button>
    </div>}
    </>
  )
}

export default LoginPage
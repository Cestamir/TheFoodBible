import React, { useState } from 'react'

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

const LoginPage = () => {


    const [registerBtn,setRegisterBtn] = useState(false);
    const [loginUser,setLoginUser] = useState<login>({userName: "",password: ""})
    const [registerUser,setRegisterUser] = useState<register>({userName: "",password: "",userEmail: ""})

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
        if(formId === "loginform"){
            try{
                const res = await fetch("/api/auth/login",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(loginUser)})
                if(res.ok){
                    const login = await res.json();
                    console.log("user login successfully token: ",login)
                } else{
                    console.log("failed to login")
                }

            }catch(err){
                console.log(err)
            } finally {
                setLoginUser({userName: "",password: ""})
            }
        } else if(formId === "registerform"){
            try{
                const res = await fetch("/api/auth/register",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(registerUser)})
                if(res.ok){
                    const register = await res.json();
                    console.log("user registered successfully token: ",register)
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
    <div>
        {!registerBtn && <div id='login'>
            <p>Login</p>
            <form id='loginform' onSubmit={handleSubmit}>
            <label>USERNAME:</label>
            <input minLength={3} onChange={handleChange} value={loginUser.userName} id='logininput'/>
            <label>PASSWORD:</label>
            <input onChange={handleChange} value={loginUser.password} id='passwordlogininput'/>
            <button type='submit' id='loginbtn'>LOGIN HERE</button>
            </form>
        </div>}
        {registerBtn && <div id='register'>
            <p>Register</p>
            <form id='registerform' onSubmit={handleSubmit}>
            <label>USERNAME:</label>
            <input minLength={3} onChange={handleChange} value={registerUser.userName} id='registerinput'/>
            <label>PASSWORD:</label>
            <input onChange={handleChange} value={registerUser.password} id='passwordregisterinput'/>
            <label>USER EMAIL:</label>
            <input type='email' onChange={handleChange} value={registerUser.userEmail} id='emailinput'/>
            <button type='submit' id='registerbtn'>REGISTER HERE</button>
            </form>
        </div>}
        <button onClick={() => setRegisterBtn(prev => !prev)}>{registerBtn ? "login to existing account⬇️" : "register new user⬇️"}</button>
    </div>
  )
}

export default LoginPage
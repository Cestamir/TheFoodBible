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
    //     Error: secretOrPrivateKey must have a value
    // at module.exports [as sign] (/Users/mp/Desktop/THEFOODGUIDEBOOK/server/node_modules/jsonwebtoken/sign.js:111:20)
    // at loginUser (file:///Users/mp/Desktop/THEFOODGUIDEBOOK/server/src/controllers/authController.js:31:23)
        const formId = e.target.id
        let reqToSend;
        e.preventDefault()
        if(formId === "loginform"){
            reqToSend = loginUser;
        } else if(formId === "registerform"){
            reqToSend = registerUser;
        }
        try{
            const res = await fetch("/api/auth",{method: "POST",headers: {"Content-Type" : "application/json"},body: JSON.stringify(reqToSend)})
            if(res.ok){
                console.log("user login successfully")
            } else{
                console.log("failed to login")
            }

        }catch(err){
            console.log(err)
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
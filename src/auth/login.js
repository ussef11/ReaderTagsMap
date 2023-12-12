/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import "./login.css"
import { authcontext } from "../helper/authcontext";

export const Login = () => {
    const  [messsage  , setmesssage]  = useState({message : "" , background : ""  , show :false})
    const {username  , setUsername} = useContext(authcontext)
    const {navigate , setNavigate} = useContext(authcontext)
    const {userid, setUserid} = useContext(authcontext)
    const [password  , setPassword] = useState('')



  const handlelogin = ()=>{
        // console.log(username , password)
        // const items = JSON.parse(localStorage.getItem("username"));
        // const authdata = JSON.stringify([{username:username  , password: password}])
        // localStorage.setItem("Auth",authdata);

     
        console.log(username, password);
        if(username   != null  && password !=null){

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Cookie", "frontend_lang=fr_FR");
            var raw = JSON.stringify({
                "username": username,
                "password": password,
                });
        
                var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
                };
        
                fetch("http://192.168.100.50:5000/api/getusers", requestOptions)
                .then(response => response.json())
                .then(result =>{ 
                    
                  
                    if(result.data[0].username ==  username && result.data[0].password){
                        console.log(result.data[0].username)
                        setUserid(result.data[0].id)
                        setNavigate('home')
                    }
                
                })
                .catch(error => {
                    setmesssage({ background : "red" , message: "incorrect !",  show :true })
                    setTimeout(() => {
                      setmesssage({show : false})
                    }, 
                    2000);
                });
                // 
        }
        // const storedCredentials = JSON.parse(localStorage.getItem("Auth")) || [];
        // const existingUser = storedCredentials.find(cred => cred.username === username);
        // if (existingUser) {
        // console.log("User already exists");
        // } else {
        // const newCredentials = [...storedCredentials, { username, password }];
        // localStorage.setItem("Auth", JSON.stringify(newCredentials));
        // console.log("User added successfully");
        // }



  }

  return (
    <div style={{background:'aliceblue'}} className="login-page">
      <div style={{display:'block'}}> 
          <div className={`alert  ${messsage.show ? "" : 'hidden'} `} style={{background : messsage.background , marginBottom:"20px"}}> 
          <p> {messsage.message} </p>   </div>

    <div className="form">
      
    <div className="top">
            <h1>Login Page</h1>
        </div>
      {/* <form className="register-form">
      <input type="text" placeholder="name"/>
      <input type="password" placeholder="password"/>
      <input type="text" placeholder="email address"/>
      <button>create</button>
      <p className="message">Already registered? <a href="#">Sign In</a></p>
    </form> */}
    <div className="login-form">
   
      <input  value={username}  onChange={(e)=>{setUsername(e.target.value)}} type="text" placeholder="username"/>
      <input    value={password}  onChange={(e)=>{setPassword(e.target.value)}} type="password" placeholder="password"/>
      <button  onClick={handlelogin} >login</button>
    
    </div>
  </div>
  </div>
</div>
  );
};

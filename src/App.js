/* eslint-disable no-unused-vars */
import logo from "./logo.svg";
import "./App.css";
import Map from "./map"
import { Login } from "./auth/login";
import { authcontext } from "./helper/authcontext";
import { useState } from "react";
import Camera from "./camera";

function App() {
  const [username, setUsername] = useState('')
  const [userid, setUserid] = useState('')
  const [navigate, setNavigate] = useState('login')
  return (

    <authcontext.Provider value={{ username, setUsername, navigate, setNavigate, userid, setUserid }}>
      <div>
        {/* <Map/> */}

        {/* <Login /> */}

        {navigate !== 'login' ? <Map />
          :
          <Login />}

      </div>
    </authcontext.Provider>
  );
}

export default App;

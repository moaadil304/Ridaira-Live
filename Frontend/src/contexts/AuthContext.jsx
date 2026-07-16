import axios, { HttpStatusCode } from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment.js";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // const navigate = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === HttpStatusCode.Created) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });

      console.log("Status:", request.status);
      console.log("Response:", request.data);

       
      localStorage.setItem("token", request.data.token);

      console.log("Saved Token:", localStorage.getItem("token"));

      return true;
    } catch (err) {
      console.log("Login Error:", err);
      return false;
    }
  };
 

  const getHistoryOfUser = async () =>{
    try{
      let request = await client.get("/get_all_activity" ,{
        params :{
          token : localStorage.getItem("token")
        }
      });
      return request.data;
    }catch(err){
      throw err;
    }
  }

  const  addToUserHistory = async(meetingCode)=>{
    try{
      let request = await client.post("/add_to_activity" , {
        token : localStorage.getItem("token"),
        meeting_code : meetingCode
      })

      console.log("Add History Response:", request.data);

      return request
    }catch(e){
      console.error("Add History Error:", e.response?.data || e);
        throw e;
    }
  }

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

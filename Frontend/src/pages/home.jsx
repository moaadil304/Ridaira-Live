import React from 'react'
import { useState, useContext } from "react";
import Button from "@mui/material/Button";
import withAuth  from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import IconButton from '@mui/material/IconButton';
import RestoreIcon from "@mui/icons-material/Restore";
import TextField from '@mui/material/TextField';
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode , setMeetingCode] = useState("");

  const{ addToUserHistory} = useContext(AuthContext);

  let handleJoinVideoCall = async() =>{

    console.log("Meeting Code:", meetingCode);
    
    await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`)

  }
  // return (
  //   <>
  //     <div className="navBar">
  //       {/* <div style={{ display: "flex", alignItems: "center" }}>
  //         <h2>Apna Video Call</h2>
  //       </div> */}

  //       <div className="navLeft">
  //         <h2>Ridaira Meet</h2>
  //       </div>

  //       <div style={{ display: "flex", alignItems: "center" }}>
  //         <IconButton
  //           onClick={() => {
  //             navigate("/history");
  //           }}
  //         >
  //           <RestoreIcon />
  //         </IconButton>
  //         <p>History</p>
  //         <Button
  //           onClick={() => {
  //             localStorage.removeItem("token");
  //             navigate("/auth");
  //           }}
  //         >
  //           Logout
  //         </Button>
  //       </div>
  //     </div>

  //     <div className="meetContainer">
  //       <div className="leftPanel">
  //         <h2>Providing Quality video CAll Just Like Quality Education </h2>
  //         <div style={{ display: "flex", gap: "10px" }}>
  //           <TextField
  //             onChange={(e) => setMeetingCode(e.target.value)}
  //             id="outlineed-basic"
  //             label="meeting Code"
  //             variant="outlined"
  //           />
  //           <Button onClick={handleJoinVideoCall} variant="contained">
  //             Join
  //           </Button>
  //         </div>
  //       </div>
  //       <div className="rightPanel">
  //         <img srcSet="/logo3.png" alt="" />
  //       </div>
  //     </div>
  //   </>
  // );

  return (
    <>
      <div className="navBar">
        <div className="navLeft">
          <h2>Ridaira Meet</h2>
        </div>

        <div className="navRight">
          <IconButton
            onClick={() => {
              navigate("/history");
            }}
          >
            <RestoreIcon />
          </IconButton>

          <p>History</p>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <h2>Connect Beyond Distance</h2>

          <p className="meetingText">
            Start or join HD video meetings in one click. Stay connected with
            your team, friends, and loved ones—anytime, anywhere.
          </p>

          <div className="joinBox">
            <TextField
              fullWidth
              label="Meeting Code"
              variant="outlined"
              onChange={(e) => setMeetingCode(e.target.value)}
            />

            <Button
              variant="contained"
              size="large"
              onClick={handleJoinVideoCall}
            >
              Join
            </Button>
          </div>
        </div>

        <div className="rightPanel">
          <img src="/logo3.png" alt="Video Meeting" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);

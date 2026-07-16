import './App.css'
import {Route , BrowserRouter as Router , Routes} from 'react-router-dom';
import LandingPage from './pages/landing.jsx';
import Authentication from './pages/authentication.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import axios, { HttpStatusCode } from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoMeetComponent from "./pages/VideoMeet";
import HomeComponent from './pages/home.jsx';
import History from "./pages/history.jsx";

function App() {
   
  return (
    <>
      <Router>
        <AuthProvider>

          <Routes>

            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />

            <Route path="/home" element ={<HomeComponent/>} />
            <Route path='/history' element ={<History/>} />
            <Route path='/:url' element ={<VideoMeetComponent/>}/>

          </Routes>

        </AuthProvider>
      </Router>
    </>
  );
}

export default App

import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Ridaira Live</h2>
        </div>

        <div className="navList">
          <p onClick={() => navigate("/aadilkhan")}>Join as Guest</p>

          <p onClick={() => navigate("/auth")}>Register</p>

          <div role="button" onClick={() => navigate("/auth")}>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div className="landingContent">
          <h1>
            <span style={{ color: "#D97500" }}>Connect</span> with your Loved
            Ones
          </h1>


          <p className="landingDescription">
            Experience crystal-clear video calls and secure meetings. Stay
            connected with family, friends, and teams—anytime, anywhere.
          </p>

          <div role="button">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>

        <div className="landingImage">
          <img src="/mobile.png" alt="Ridaira Live" />
        </div>
      </div>
    </div>
  );
}

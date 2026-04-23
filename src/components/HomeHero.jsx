import React from "react";
import "./HomeHero.css";
import heroVideo from "../assets/movemateytmp.mp4";

export default function HomeHero() {
  return (
    <div className="hero-container">
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="hero-dim-overlay"></div>

      <div className="hero-overlay">
        <h1 className="hero-title">
          Reliable Logistics <br /> Partner.
        </h1>

        <p className="hero-subtitle">
          Making moving easier by connecting you with reliable transport agencies.
        </p>

        {/* <button className="get-started-btn">
          Get Started
        </button> */}
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import HomeHero from "../components/HomeHero";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Half-screen Hero Video */}
      <HomeHero />

      {/* Content below hero */}
      <div className="text-center mt-8 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Simplify Your Moving Experience with MoveMate
        </h2>
        <button
  onClick={() => navigate("/select-user")}
  className="group bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-800 transition-all"
>
  Get Started
  <span className="inline-block ml-2 transform transition-transform group-hover:translate-x-1">
    →
  </span>
</button>

      </div>
    </div>
  );
}
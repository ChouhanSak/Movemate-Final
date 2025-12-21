import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="text-center mt-20">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Simplify Your Moving Experience with MoveMate
      </h2>
      <p className="text-gray-600 mb-8">
        Connect customers, transport agencies, and site managers seamlessly.
      </p>

      <button
        onClick={() => navigate("/select-user")}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl"
      >
        Get Started
      </button>
    </div>
  );
}

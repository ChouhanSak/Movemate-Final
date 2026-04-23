import { useLocation, useNavigate } from "react-router-dom";
import smallTruck from "../assets/smalltruck.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const isLoginMode = mode === "login";

  const isLogin = path.includes("/login");
  const isSignup = path.includes("/signup");
  const isSelectUser = path === "/select-user";

  const isCustomer = path.includes("/customer");
  const isAgency = path.includes("/agency");

  return (
    <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">

      {/* ================= LEFT LOGO ================= */}
      {isSelectUser ? (
        /* -------- SELECT USER PAGE (NEW HEADER) -------- */
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl">
            <img src={smallTruck} alt="MoveMate Logo" className="w-6 h-6" />
          </div>

          <div className="flex flex-col leading-tight">
            <h1 className="text-xl font-bold text-gray-900">MoveMate</h1>
            <span className="text-sm text-gray-500 -mt-1">
              Goods Transportation Platform
            </span>
          </div>
        </div>
      ) : (
        /* -------- DEFAULT OLD HEADER -------- */
        <h1
          className="text-2xl font-bold text-purple-700 cursor-pointer"
          onClick={() => navigate("/")}
        >
          MoveMate
        </h1>
      )}

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex items-center gap-4">

        {isLogin && (
          <>
            <span className="text-sm text-gray-600">
              Don’t have an account?
            </span>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-xl"
              onClick={() =>
                navigate(isCustomer ? "/signup/customer" : "/signup/agency")
              }
            >
              Sign Up
            </button>
          </>
        )}

        {isSignup && (
          <>
            <span className="text-sm text-gray-600">
              Already have an account?
            </span>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-xl"
              onClick={() =>
                navigate(isCustomer ? "/login/customer" : "/login/agency")
              }
            >
              Sign In
            </button>
          </>
        )}

        {isSelectUser && !isLoginMode && (
          <>
            <span className="text-sm text-gray-600">
              Already have an account?
            </span>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-xl"
              onClick={() => navigate("/select-user?mode=login")}
            >
              Sign In
            </button>
          </>
        )}

        {isSelectUser && isLoginMode && (
          <>
            <span className="text-sm text-gray-600">
              Don’t have an account?
            </span>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-xl"
              onClick={() => navigate("/select-user")}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
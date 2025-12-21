import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  // READ MODE FROM URL
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode"); // "login" | null
  const isLoginMode = mode === "login";

  // PAGE DETECTION
  const isLogin = path.includes("/login");
  const isSignup = path.includes("/signup");
  const isSelectUser = path === "/select-user";

  const isCustomer = path.includes("/customer");
  const isAgency = path.includes("/agency");

  return (
    <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">

      {/* LOGO */}
      <h1
        className="text-2xl font-bold text-purple-700 cursor-pointer"
        onClick={() => navigate("/")}
      >
        MoveMate
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* LOGIN PAGE */}
        {isLogin && (
          <>
            <span className="text-sm text-gray-600">
              Don’t have an account?
            </span>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-xl"
              onClick={() =>
                navigate(
                  isCustomer
                    ? "/signup/customer"
                    : "/signup/agency"
                )
              }
            >
              Sign Up
            </button>
          </>
        )}

        {/* SIGNUP PAGE */}
        {isSignup && (
          <>
            <span className="text-sm text-gray-600">
              Already have an account?
            </span>
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded-xl"
              onClick={() =>
                navigate(
                  isCustomer
                    ? "/login/customer"
                    : "/login/agency"
                )
              }
            >
              Sign In
            </button>
          </>
        )}

        {/* SELECT USER – SIGNUP MODE */}
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

        {/* SELECT USER – LOGIN MODE */}
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

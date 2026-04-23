import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff, ArrowLeft, Info } from "lucide-react";

import { auth, db } from "../Firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function SiteManagerLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const uid = userCred.user.uid;

      const snap = await getDoc(doc(db, "siteManagers", uid));

      if (!snap.exists()) {
        Swal.fire({
          icon: "error",
          title: "Account Not Found",
          text: "No site manager record found.",
          width: "320px",
        });
        setLoading(false);
        return;
      }

      const userData = snap.data();

      Swal.fire({
        title: "Login Successful!",
        text: `Welcome, ${userData.fullName || "Site Manager"} 👋`,
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        allowEscapeKey: false,
        width: "330px",
      }).then(() => {
        navigate("/site-manager-dashboard");
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        width: "320px",
      });
    }

    setLoading(false);
  };

  if (!showLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-10">
        <h1 className="text-4xl font-bold mb-4 text-purple-700">Welcome, Site Manager</h1>
        <p className="text-gray-700 text-center max-w-lg mb-8">
          Monitor operations, manage users, and ensure smooth platform management.
        </p>
        <Button
          className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition text-lg"
          onClick={() => setShowLogin(true)}
        >
          Go to Login
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/")}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-6">

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogin(false)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Site Manager Login</CardTitle>
            <p className="text-sm text-blue-100">Platform administration access</p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <Label>Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-6 h-10 px-3"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex items-start gap-3">
              <Info className="text-blue-600 mt-1 w-5 h-5" />
              <div>
                <p className="font-semibold text-blue-800">Manager Portal</p>
                <p className="text-sm text-blue-700">Monitor operations & user management.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

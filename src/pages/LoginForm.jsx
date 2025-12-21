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
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

export default function LoginForm({ userType }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const uid = userCred.user.uid;

      // Pick collection based on userType
      let collectionName = userType === "customer" ? "customers" : "agencies";

      const snap = await getDoc(doc(db, collectionName, uid));

      if (!snap.exists()) {
        Swal.fire({
          icon: "error",
          title: "Account Not Found",
          text: `No ${userType} record found.`,
          width: "320px",
        });
        setLoading(false);
        return;
      }

      const userData = snap.data();

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: `Welcome, ${userData.fullName || "User"} 👋`,
        width: "330px",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        // ✅ Navigate to dashboard based on userType
        if (userType === "customer") navigate("/customer-dashboard");
        else if (userType === "agency") navigate("/agency-dashboard");
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

  const getTitle = () => userType === "customer" ? "Customer Login" : "Agency Login";
  const getSubtitle = () => userType === "customer" ? "Access your shipment dashboard" : "Manage your transport services";
  const getPortalInfo = () => userType === "customer"
    ? { title: "Customer Portal", desc: "Track shipments, manage bookings and more." }
    : { title: "Agency Portal", desc: "Manage deliveries and logistics efficiently." };

  const portalInfo = getPortalInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* ✅ Back button navigates home */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/select-user")} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <p className="text-sm text-blue-100">{getSubtitle()}</p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit}>
              
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

              <Button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <p className="text-center text-sm mt-4">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate(userType === "customer" ? "/signup/customer" : "/signup/agency")}
                className="text-purple-600 hover:underline font-medium"
              >
                Create your account
              </button>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex items-start gap-3">
              <Info className="text-blue-600 mt-1 w-5 h-5" />
              <div>
                <p className="font-semibold text-blue-800">{portalInfo.title}</p>
                <p className="text-sm text-blue-700">{portalInfo.desc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

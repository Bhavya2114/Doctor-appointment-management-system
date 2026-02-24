import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { assets } from "../assets/assets";

const Login = () => {
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setName("");
    setEmail("");
    setPassword("");
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!backendUrl) {
      toast.error("Backend URL not configured");
      return;
    }

    setLoading(true);

    try {
      if (authMode === "signup") {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          setToken(data.token);
          toast.success("Account created successfully");
        } else toast.error(data.message);
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          setToken(data.token);
          toast.success("Login successful");
        } else toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!backendUrl) {
      toast.error("Backend URL not configured");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/google-login`,
        { token: firebaseToken }
      );

      if (data.success) {
        setToken(data.token);
        toast.success("Google login successful");
      } else toast.error(data.message);
    } catch {
      toast.error("Google login failed");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

 return (
  <form onSubmit={onSubmitHandler} className="min-h-screen flex">

    {/* LEFT PANEL */}
    <div className="hidden md:flex w-1/2 gradient-main text-white flex-col justify-center px-20 relative">

      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-10">
        <h1 className="text-6xl font-semibold mb-8 leading-tight">
          Smart Healthcare <br /> Appointment System
        </h1>

        <ul className="space-y-4 text-white/90 text-lg">
          <li>✔ Easy doctor discovery</li>
          <li>✔ Instant appointment booking</li>
          <li>✔ Real-time availability</li>
          <li>✔ Secure & fast experience</li>
        </ul>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6">

      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 justify-center cursor-pointer"
        >
          <img src={assets.logo} className="w-9" />
          <p className="text-2xl font-semibold text-primary">Medlink</p>
          
        </div>
       

        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {authMode === "login" ? "Login" : "Create Account"}
        </h1>

        {authMode === "signup" && (
          <input
            placeholder="Full Name"
            className="input-box"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        )}

        <input
          placeholder="Email"
          className="input-box"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input-box mb-5"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        <button
          disabled={loading}
          className="w-full py-3 rounded-lg text-white btn-primary font-semibold hover:scale-105 transition"
        >
          {loading
            ? "Please wait..."
            : authMode === "login"
            ? "LOGIN"
            : "REGISTER"}
        </button>

        <p
          onClick={() => switchMode(authMode === "login" ? "signup" : "login")}
          className="text-primary mt-4 cursor-pointer text-sm text-center hover:underline"
        >
          {authMode === "login"
            ? "Don’t have account? Register"
            : "Already have account? Login"}
        </p>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="px-3 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-lg hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5"
          />
          Continue with Google
        </button>

      </div>
    </div>
  </form>
);
};

export default Login;
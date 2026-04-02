import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api.config";
import { motion } from "motion/react";
import { Activity, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 2. Main Tab Redirect logic (checking params on mount) - keeping for normal redirect if any
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Clean URL to remove tokens securely without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        onLogin(user, token);
      } catch (err) {
        console.error("Failed to parse user data from redirect", err);
      }
    }
  }, [onLogin]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          onLogin(data.user, data.token);
        } else {
          setIsLogin(true);
        }
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-none shadow-2xl shadow-black/40 overflow-hidden">
          <CardContent className="p-10">
            <div className="flex flex-col items-center mb-10">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6"
              >
                <Activity className="text-white w-8 h-8" />
              </motion.div>
              <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">
                Digital Resource Utilization System
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <Input
                  label="Username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<UserIcon className="w-4 h-4" />}
                  required
                />
              )}
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20"
              >
                {isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>



            <div className="text-center mt-10">
              <p className="text-text-secondary text-xs font-bold">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 font-black uppercase tracking-widest hover:text-blue-400 transition-colors ml-1"
                >
                  {isLogin ? "Register now" : "Sign in here"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-40">
          <ShieldCheck className="w-3 h-3" />
          Secure Enterprise Authentication
        </div>
      </motion.div>
    </div>
  );
};

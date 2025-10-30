import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService, supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if identifier is email, phone, or username
      let email = identifier;
      
      // If not an email, search for user by username or phone
      if (!identifier.includes('@')) {
        const { data: users, error: searchError } = await supabase
          .from('users')
          .select('email')
          .or(`username.eq.${identifier},phone_number.eq.${identifier}`)
          .single();

        if (searchError || !users) {
          toast.error('User not found. Please check your username/phone/email.');
          setIsLoading(false);
          return;
        }
        
        email = users.email;
      }

      const { data, error } = await authService.signIn(email, password);

      if (error) {
        toast.error('Invalid credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const profile = await authService.getUserProfile(data.user.id);
        if (profile && !profile.onboarding_completed) {
          navigate("/onboarding");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `https://quickshow2.netlify.app/reset-password`,
    });

    if (error) {
      toast.error('Failed to send reset email. Please try again.');
    } else {
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-900/10 to-pink-900/10" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
      }} />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => navigate("/")} className="text-3xl font-bold">
            <span className="text-primary">Q</span>
            <span className="text-white">uickShow</span>
          </button>
          <Button
            variant="ghost"
            onClick={() => navigate("/signup")}
            className="text-white hover:text-primary"
          >
            Don't have an account? Sign Up
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 shadow-2xl">
            {!showForgotPassword ? (
              <>
                <h2 className="text-3xl font-bold mb-2 text-white text-center">Welcome Back</h2>
                <p className="text-gray-400 text-center mb-8">Sign in to continue watching</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email, Username, or Phone</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter email, username, or phone"
                        className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                        required
                      />
                    </div>
                  </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-lg rounded-xl shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900/50 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const { error } = await authService.signInWithGoogle();
                      if (error) {
                        toast.error("Failed to sign in with Google");
                      }
                    }}
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-800/50 border-gray-700 hover:bg-gray-800 text-white"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>

                  <p className="text-center text-sm text-gray-400 mt-6">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="text-primary hover:underline font-semibold"
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-2 text-white text-center">Reset Password</h2>
                  <p className="text-gray-400 text-center mb-8">
                    {resetSent ? "Check your email for reset link" : "Enter your email to receive a reset link"}
                  </p>

                  {!resetSent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="pl-12 h-14 bg-gray-800/50 border-gray-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-lg rounded-xl shadow-lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-gray-300">
                        We've sent a password reset link to <span className="text-primary font-semibold">{resetEmail}</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Didn't receive the email? Check your spam folder or try again.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                      setResetEmail("");
                    }}
                    className="w-full text-center text-sm text-primary hover:underline font-semibold mt-6"
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

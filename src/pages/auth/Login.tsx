import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  let [showMail,setshowMail]= useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  let checkmailId = (e: { target: { value: React.SetStateAction<string>; }; })=>{
      let un = e.target.value;
      let flag = ("@")
      setEmail(e.target.value)
      if(!flag){
       setshowMail("invalid email")
      }
      else{
        setshowMail("")
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-10 rounded-xl shadow-2xl auth-container">
        <div>
          <div className="flex justify-center">
            <Heart className="h-16 w-16 text-pink-500 animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white">IRA</h2>
          <p className="mt-2 text-center text-lg text-pink-100">
            Integrated Reproductive Assistant
          </p>
          <h3 className="mt-6 text-center text-2xl font-bold text-white">Welcome Back!</h3>
          <p style={{color:"red"}}>{showMail}</p>    {/*for invalid email */}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-pink-500" />
              <input
                id="email-address"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="auth-input appearance-none rounded-t-lg relative block w-full px-10 py-3 border border-pink-300 placeholder-pink-400 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={checkmailId}
              />
              {/* <input 
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="auth-input appearance-none rounded-t-lg relative block w-full px-10 py-3 border border-pink-300 placeholder-pink-400 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              */}
            </div>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-5 w-5 text-pink-500" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="auth-input appearance-none rounded-b-lg relative block w-full px-10 py-3 border border-pink-300 placeholder-pink-400 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-pink-100 hover:text-white transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="auth-button group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-pink-100">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-white hover:text-pink-200 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6 border-t border-pink-200/30 pt-6">
          <div className="flex flex-col items-center space-y-4">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
              alt="Women's Health"
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
            <p className="text-sm text-pink-100 text-center">
              Your personal health companion for a better tomorrow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
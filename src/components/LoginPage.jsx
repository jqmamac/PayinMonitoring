import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = Object.values(snapshot.val());
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          onLogin(user);
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid username or password",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Database connection error or no users found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while logging in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-yellow-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/30 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 rounded-full">
              <Shield className="w-8 h-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-center text-gray-400 mb-8">Payin Monitoring System</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                placeholder="Enter password"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/50"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
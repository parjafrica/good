import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to Google OAuth through backend
    window.location.href = '/api/auth/google';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Please check your credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'google') {
      handleGoogleLogin();
    } else {
      toast({
        title: "Coming Soon",
        description: `${provider} login will be available soon!`,
        variant: "default",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Sign in to Granada OS
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaGoogle className="mr-3 text-red-500" size={20} />
                  Continue with Google
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaGithub className="mr-3" size={20} />
                  Continue with GitHub
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => handleSocialLogin('linkedin')}
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaLinkedin className="mr-3" size={20} />
                  Continue with LinkedIn
                </Button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <motion.form
              onSubmit={handleEmailLogin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <MdEmail className="mr-2" size={20} />
                {isLoading ? 'Signing in...' : 'Sign in with Email'}
              </Button>
            </motion.form>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
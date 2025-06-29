import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaGithub, FaLinkedin, FaUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleRegister = () => {
    setIsLoading(true);
    // Redirect to Google OAuth through backend
    window.location.href = '/api/auth/google?register=true';
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }),
      });

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Welcome to Granada OS! Redirecting to dashboard...",
          variant: "default",
        });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.message || "Please try again",
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

  const handleSocialRegister = (provider: string) => {
    if (provider === 'google') {
      handleGoogleRegister();
    } else {
      toast({
        title: "Coming Soon",
        description: `${provider} registration will be available soon!`,
        variant: "default",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-8">
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
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Join Granada OS
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Create your account and start securing funding
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
                  onClick={() => handleSocialRegister('google')}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaGoogle className="mr-3 text-red-500" size={20} />
                  Sign up with Google
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => handleSocialRegister('github')}
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaGithub className="mr-3" size={20} />
                  Sign up with GitHub
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => handleSocialRegister('linkedin')}
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaLinkedin className="mr-3" size={20} />
                  Sign up with LinkedIn
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
                  Or create account with email
                </span>
              </div>
            </div>

            {/* Email Registration Form */}
            <motion.form
              onSubmit={handleEmailRegister}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="h-12"
                  disabled={isLoading}
                />
                <Input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-12"
                disabled={isLoading}
              />
              
              <Select 
                value={formData.userType} 
                onChange={(e) => handleInputChange('userType', e.target.value)}
                disabled={isLoading}
                placeholder="Select account type"
                className="h-12"
              >
                <SelectItem value="student">Student / Researcher</SelectItem>
                <SelectItem value="organization">NGO / Organization</SelectItem>
                <SelectItem value="business">Business / Startup</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </Select>
              
              <Input
                type="password"
                placeholder="Create password (min 8 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="h-12"
                disabled={isLoading}
              />
              
              <Input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="h-12"
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                disabled={isLoading || !formData.userType}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FaUser className="mr-2" size={18} />
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
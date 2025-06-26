import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Home, Search, ArrowLeft, ExternalLink, HelpCircle, Compass } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleSearchOpportunities = () => {
    navigate('/donor-discovery');
  };

  const handleGetHelp = () => {
    navigate('/human-help');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main 404 Section */}
        <div className="mb-12">
          <div className="relative">
            {/* Animated 404 Text */}
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent opacity-20 select-none">
              404
            </h1>
            
            {/* Floating Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-float">
                <Compass className="w-24 h-24 text-blue-500 opacity-60" />
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oops! The page you're looking for seems to have wandered off. 
              Let's help you find your way back to discovering funding opportunities.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Go to Dashboard */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={handleGoHome}>
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Home className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Dashboard</CardTitle>
              <CardDescription>Return to your main dashboard</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Search Opportunities */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={handleSearchOpportunities}>
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Find Opportunities</CardTitle>
              <CardDescription>Discover new funding opportunities</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={handleSearchOpportunities}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Search Funding
              </Button>
            </CardContent>
          </Card>

          {/* Get Help */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={handleGetHelp}>
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Get Help</CardTitle>
              <CardDescription>Contact our expert support team</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={handleGetHelp}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Get Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Quick Navigation</CardTitle>
            <CardDescription>Popular pages you might be looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/proposals')}
              >
                <ExternalLink className="w-5 h-5 mb-2" />
                <span className="text-sm">Proposals</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/ai-assistant')}
              >
                <HelpCircle className="w-5 h-5 mb-2" />
                <span className="text-sm">AI Assistant</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/documents')}
              >
                <ExternalLink className="w-5 h-5 mb-2" />
                <span className="text-sm">Documents</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/settings')}
              >
                <ExternalLink className="w-5 h-5 mb-2" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Go Back Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <p className="text-sm text-gray-500">
            or contact support if you think this is an error
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 opacity-20">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl animate-pulse"></div>
        </div>
        <div className="fixed bottom-20 right-10 opacity-20">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
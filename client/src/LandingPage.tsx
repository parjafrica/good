import React from 'react';
import { Link } from 'react-router-dom'; // For CTA buttons
import { Zap, Bot, SearchDollar, FileText, BookOpen, Briefcase, Users, BarChart3, Lightbulb, UserPlus, Settings2, Target } from 'lucide-react'; // Added more icons

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Granada: AI-Powered Pathways to Funding, Careers, and Academic Success.
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
            Granada is your intelligent partner, leveraging advanced AI to help NGOs secure funding, students excel academically, job seekers land their dream careers, and businesses thrive. Discover a smarter way to achieve your ambitions.
          </p>
          <div className="space-x-4">
            <Link
              to="/register" // Assuming '/register' is the signup route
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
            >
              Get Started Free
            </Link>
            <Link
              to="/features" // Placeholder for a features page or section
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Explore Granada
            </Link>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Navigating Complexity, Simplified by AI.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The path to achieving your goals can be challenging. Granada offers a unified platform with specialized AI engines to tackle these challenges head-on, providing personalized support and actionable insights.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* NGO Pain Point */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">For NGOs</h3>
              <p className="text-gray-700">
                Overwhelmed by grant applications and donor research? Granada streamlines the entire funding lifecycle, from discovery to proposal.
              </p>
            </div>
            {/* Student Pain Point */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-purple-600 mb-3">For Students</h3>
              <p className="text-gray-700">
                Struggling with academic writing or finding the right research path? Granada provides AI-powered academic tools to enhance your studies.
              </p>
            </div>
            {/* Job Seeker Pain Point */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-green-600 mb-3">For Job Seekers</h3>
              <p className="text-gray-700">
                Finding it hard to stand out in the job market or build a compelling resume? Granada's Career Suite is your unfair advantage.
              </p>
            </div>
            {/* Business Pain Point */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-yellow-600 mb-3">For Businesses</h3>
              <p className="text-gray-700">
                Need to manage projects efficiently or discover new growth opportunities? Granada offers intelligent solutions for smart management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Your Intelligent Toolkit for Success.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Granada offers a suite of powerful, AI-driven tools designed to meet your specific needs and help you achieve your objectives efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature: Genesis Engine */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100 text-blue-600">
                <Lightbulb size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Genesis Engine</h3>
              <p className="text-gray-600">
                AI-driven insights and idea generation for any project or goal. Kickstart your initiatives with intelligent suggestions.
              </p>
            </div>

            {/* Feature: Intelligent Bot Assistant */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-purple-100 text-purple-600">
                <Bot size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Intelligent Bot Assistant</h3>
              <p className="text-gray-600">
                Your personal AI helper for navigating Granada, answering questions, and accomplishing tasks seamlessly.
              </p>
            </div>
            
            {/* Feature: Donor Discovery & Management */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100 text-green-600">
                <SearchDollar size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Donor Discovery & Management</h3>
              <p className="text-gray-600">
                AI-matched funding opportunities and streamlined donor relationship tracking for NGOs.
              </p>
            </div>

            {/* Feature: AI Proposal Generator */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-yellow-100 text-yellow-700">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">AI Proposal Generator</h3>
              <p className="text-gray-600">
                Craft compelling, data-driven grant proposals in a fraction of the time with our intelligent writing assistant.
              </p>
            </div>

            {/* Feature: Academic Suite */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-indigo-100 text-indigo-600">
                <BookOpen size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Academic Suite</h3>
              <p className="text-gray-600">
                AI-powered writing assistance, research tools, and academic resource discovery for students and researchers.
              </p>
            </div>

            {/* Feature: Career Suite */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-pink-100 text-pink-600">
                <Briefcase size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Career Suite</h3>
              <p className="text-gray-600">
                AI resume builder, job matching, interview preparation, and skill development resources for job seekers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Tailored to Audience Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Success, Tailored to Your World.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Granada is designed to meet the unique needs of diverse users. Discover how our platform can empower you.
            </p>
          </div>

          {/* Tab-like structure - simple implementation for now */}
          {/* We can enhance this with actual tab components later if needed */}
          <div className="space-y-12">

            {/* For NGOs */}
            <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">Amplify Your Impact, Secure More Funding. (For NGOs)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8 text-lg">
                <li>Increase funding success rates with AI-powered proposal generation.</li>
                <li>Save countless hours on donor research and administrative tasks.</li>
                <li>Build stronger donor relationships with streamlined management tools.</li>
                <li>Gain data-backed insights for strategic decision-making.</li>
              </ul>
              <Link
                to="/solutions/ngo" // Placeholder route
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Explore NGO Solutions
              </Link>
            </div>

            {/* For Students */}
            <div className="p-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-purple-700 mb-6">Excel in Your Studies, Build a Bright Future. (For Students)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8 text-lg">
                <li>Improve writing quality and research efficiency with AI academic tools.</li>
                <li>Enhance research capabilities and discover relevant academic resources.</li>
                <li>Boost your grades and deepen your understanding of complex subjects.</li>
                <li>Prepare effectively for your future career with integrated skill-building.</li>
              </ul>
              <Link
                to="/solutions/student" // Placeholder route
                className="inline-block bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition duration-300"
              >
                Discover Student Tools
              </Link>
            </div>

            {/* For Job Seekers */}
            <div className="p-8 bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-green-700 mb-6">Navigate Your Career Path with Confidence. (For Job Seekers)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8 text-lg">
                <li>Craft outstanding resumes and applications that get noticed.</li>
                <li>Discover job opportunities perfectly matched to your skills and aspirations.</li>
                <li>Improve your interview skills with AI-powered preparation tools.</li>
                <li>Accelerate your career progression with targeted skill development.</li>
              </ul>
              <Link
                to="/solutions/jobseeker" // Placeholder route
                className="inline-block bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Launch Your Career
              </Link>
            </div>

            {/* For Businesses/Entrepreneurs */}
            <div className="p-8 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-yellow-700 mb-6">Drive Growth, Manage Smarter. (For Businesses)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8 text-lg">
                <li>Execute projects with greater efficiency and intelligent insights.</li>
                <li>Develop data-driven strategies for sustainable growth.</li>
                <li>Access potential funding, partnerships, and new market opportunities.</li>
                <li>Streamline operations and optimize resource allocation.</li>
              </ul>
              <Link
                to="/solutions/business" // Placeholder route
                className="inline-block bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-yellow-700 transition duration-300"
              >
                Grow Your Business
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof/Testimonials Section (Placeholder) */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Trusted by Changemakers and Achievers.
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-12">
            See what our users are saying about how Granada has helped them achieve their goals. (Testimonials coming soon!)
          </p>
          {/* Placeholder for testimonial cards or carousel */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3">
              <p className="text-gray-700 italic">"Granada has revolutionized how we approach grant writing..."</p>
              <p className="mt-4 font-semibold text-blue-600">- Placeholder NGO Director</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3">
              <p className="text-gray-700 italic">"The Academic Suite saved me countless hours on my thesis research..."</p>
              <p className="mt-4 font-semibold text-purple-600">- Placeholder Student</p>
            </div>
            {/* Add more placeholder testimonials if desired */}
          </div>
        </div>
      </section>

      {/* How It Works / Getting Started Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Get Started in 3 Simple Steps.
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Joining Granada and accessing our powerful AI tools is quick and easy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1: Sign Up */}
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 text-blue-600">
                <UserPlus size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">1. Sign Up</h3>
              <p className="text-gray-600">
                Create your free Granada account in minutes to unlock a world of intelligent assistance.
              </p>
            </div>
            {/* Step 2: Personalize */}
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 text-purple-600">
                <Settings2 size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">2. Personalize</h3>
              <p className="text-gray-600">
                Tell us about your goals and needs, and our AI will tailor your Granada experience and tools.
              </p>
            </div>
            {/* Step 3: Achieve */}
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 text-green-600">
                <Target size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">3. Achieve</h3>
              <p className="text-gray-600">
                Access powerful tools, generate insights, and start making significant progress immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Approach?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join the Granada community today and experience the future of intelligent support. Unlock your potential and achieve your goals faster than ever before.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 font-bold py-4 px-10 rounded-lg shadow-xl hover:bg-gray-100 transition duration-300 text-lg"
          >
            Sign Up Now for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Granada</h5>
              <p className="text-sm">Empowering NGOs, students, job seekers, and businesses with AI-driven solutions.</p>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/documentation" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
              {/* Placeholder for Social Media Icons */}
              <div className="mt-4 flex space-x-4">
                  <p className="text-sm">Social Media (icons placeholder)</p>
                {/* Example: <a href="#" className="hover:text-white"><Facebook size={20}/></a> */}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Granada. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Make sure to import these icons from lucide-react if not already
// import { UserPlus, Settings2, Target } from 'lucide-react';
// Potentially add social media icons like Facebook, Twitter, LinkedIn from lucide-react

export default LandingPage;
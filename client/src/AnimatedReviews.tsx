import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  organization: string;
  avatar: string;
  rating: number;
  text: string;
  amount: string;
  color: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Chen",
    organization: "Tech for Good Initiative",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c74c?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Granada OS helped us secure $2.3M from the Gates Foundation for our education platform in just 3 months!",
    amount: "$2.3M",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 2,
    name: "Dr. James Mukasa",
    organization: "Kampala Health Innovations",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The expert-powered proposal writing saved us weeks of work. We got funded by USAID on our first attempt!",
    amount: "$850K",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    name: "Maria Santos",
    organization: "Sustainable Agriculture Co.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Found the perfect climate grant through their database. The expert guidance was invaluable!",
    amount: "$1.2M",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    name: "Alex Thompson",
    organization: "Youth Empowerment Network",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "As a student, I never thought I could get a scholarship. Granada OS made it happen - $50K for my PhD!",
    amount: "$50K",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    name: "Dr. Amina Hassan",
    organization: "Women in STEM Foundation",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The personalized matching algorithm connected us with donors we never knew existed. Amazing results!",
    amount: "$680K",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 6,
    name: "Robert Kim",
    organization: "Clean Energy Startup",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Series A funding secured in record time. The platform's business intelligence is next level!",
    amount: "$3.5M",
    color: "from-teal-500 to-blue-500"
  }
];

export default function AnimatedReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentReview = reviews[currentIndex];

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentReview.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`bg-gradient-to-br ${currentReview.color} p-1 rounded-2xl shadow-2xl`}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 backdrop-blur-sm bg-opacity-95">
              <div className="flex items-start space-x-3">
                <motion.img
                  src={currentReview.avatar}
                  alt={currentReview.name}
                  className="w-12 h-12 rounded-full object-cover"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {currentReview.name}
                    </h4>
                    <motion.div
                      className={`text-2xl font-bold bg-gradient-to-r ${currentReview.color} bg-clip-text text-transparent`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      {currentReview.amount}
                    </motion.div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {currentReview.organization}
                  </p>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.2 }}
                      >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="relative"
                  >
                    <Quote className="absolute -top-1 -left-1 w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-700 dark:text-gray-300 pl-4 leading-relaxed">
                      {currentReview.text}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress indicator */}
      <div className="flex justify-center mt-2 space-x-1">
        {reviews.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
            animate={{ scale: index === currentIndex ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
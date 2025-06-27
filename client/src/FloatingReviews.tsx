import { useEffect, useState } from 'react';

const REVIEWS = [
  "🎓 Sarah M. - Got $450K PhD fellowship at Oxford + living allowance!",
  "🏥 David R. - USAID grant $320K serving 75,000 patients across Uganda",
  "💡 Maria L. - $85K startup capital → $2M Series A in 18 months!",
  "🌱 Robert M. - EU grant $280K → Patent approved, startup founded!",
  "📚 Grace W. - $65K AI certification → Google senior engineer (400% salary jump)",
  "🎯 Fatima A. - Ford Foundation $150K → 2,000 girls completed education",
  "🏭 Michael O. - World Bank $500K → 200 jobs created, 15 countries export",
  "🔬 James K. - Gates Foundation $450K → Impacted 50,000+ farmers, Nature magazine featured",
  "💰 Ahmed S. - $275K climate tech grant → Licensed to 12 countries globally",
  "🌍 Linda T. - UN Women $185K → Program scaled to 8 African countries",
  "🎪 Carlos M. - EU Horizon $320K → Breakthrough carbon capture technology",
  "⚡ Expert matching found perfect funder in 3 days - $95K secured!",
  "🏆 Platform AI identified hidden opportunity - $240K approved!",
  "📈 Proposal optimization increased success rate by 340%!",
  "💎 Found 15 matching funders in 1 hour vs months of manual search",
  "🚀 Expert guidance = 89% approval rate vs 12% industry average",
  "⏰ Saved 6 months research time → focused on actual project",
  "🔥 Algorithm matched personality → perfect cultural fit funder",
  "✨ From idea to funded in 2 weeks → $180K development grant",
  "🎯 Expert network connected to decision makers → fast approval",
  "🌟 Platform insights revealed perfect timing → $425K secured",
  "💫 Hidden database opportunities → 5x more options discovered",
  "📊 Data-driven approach → 67% higher funding amounts received",
  "🔄 Personalized recommendations → 4.5x faster approval process",
  "🏅 Expert coaching → presentation skills improved, $320K won",
  "📚 Knowledge base access → competitive advantage in proposals",
  "🌍 Global network reach → accessed international opportunities",
  "💡 Innovation matching → perfect tech-forward funder alignment",
  "🎪 Creative project support → arts funding $125K breakthrough",
  "✅ End-to-end guidance → stress-free funding journey completed"
];

const REVIEW_COLORS = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)', // Blue to Purple
  'linear-gradient(135deg, #10b981, #3b82f6)', // Green to Blue  
  'linear-gradient(135deg, #f59e0b, #ef4444)', // Orange to Red
  'linear-gradient(135deg, #8b5cf6, #ec4899)', // Purple to Pink
  'linear-gradient(135deg, #06b6d4, #10b981)', // Cyan to Green
  'linear-gradient(135deg, #f59e0b, #8b5cf6)', // Orange to Purple
];

export default function FloatingReviews() {
  const [reviews, setReviews] = useState<Array<{
    id: string;
    text: string;
    color: string;
    delay: number;
    left: string;
    animation: string;
  }>>([]);

  useEffect(() => {
    // Create 15 floating reviews with random properties for better performance
    const floatingReviews = Array.from({ length: 15 }, (_, index) => ({
      id: `floating-review-${index}-${Date.now()}`,
      text: REVIEWS[Math.floor(Math.random() * REVIEWS.length)],
      color: REVIEW_COLORS[Math.floor(Math.random() * REVIEW_COLORS.length)],
      delay: index * 0.8, // Stagger the animations
      left: `${5 + (index * 6) % 90}%`, // Spread across screen width
      animation: `float-review${(index % 3) + 1}` // Cycle through 3 animation types
    }));

    setReviews(floatingReviews);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="floating-review"
          style={{
            background: review.color,
            animationDelay: `${review.delay}s`,
            left: review.left,
            animationName: review.animation
          }}
        >
          {review.text}
        </div>
      ))}
    </div>
  );
}
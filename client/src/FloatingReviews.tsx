import { useEffect, useState } from 'react';

const REVIEWS = [
  "Got $50K grant for my startup! 🚀",
  "Amazing! Found 12 grants in 1 hour ⚡",
  "Secured $150K funding for our NGO 💰",
  "Life-changing platform! Got scholarship ✨",
  "Expert help was incredible! $80K grant 🎯",
  "Found EU funding worth €200K! 🇪🇺",
  "Brilliant Expert matching! Got funded 🤖",
  "Saved months of research time ⏰",
  "Perfect match for our project! $75K 💡",
  "Outstanding support team! Got $45K 👏",
  "Revolutionary platform! $120K secured 🌟",
  "Found hidden opportunities! $65K 💎",
  "Game-changer for nonprofits! $95K 📈",
  "Incredible matching algorithm! $55K 🔥",
  "Best funding platform ever! $180K 🏆",
  "Discovered perfect grants! $85K 🎪",
  "Expert guidance = success! $110K 🚀",
  "Amazing results in 2 weeks! $70K ⚡",
  "Found multiple funders! $125K 💰",
  "Life-saving for students! $35K ✨",
  "Perfect for East Africa! $90K 🌍",
  "Incredible database! Found $105K 📚",
  "Expert recommendations perfect! $60K 🎯",
  "Outstanding platform! $140K 🏅",
  "Changed our organization! $85K 🔄",
  "Found dream funder! $75K 💫",
  "Expert analysis amazing! $95K 📊",
  "Revolutionary for startups! $115K 🚀",
  "Perfect grant matches! $50K ✅",
  "Incredible success rate! $130K 📈"
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
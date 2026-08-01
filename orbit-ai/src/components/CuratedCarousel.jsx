import { useRef } from 'react';
import { Link } from 'react-router-dom';

const RESOURCES = [
  { title: 'Atomic Habits', desc: 'Tiny changes, remarkable results. Build better habits with proven strategies.', tag: 'Book', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', emoji: '📖' },
  { title: 'Morning Meditation', desc: 'Start each day with 10 minutes of guided mindfulness meditation.', tag: 'Wellness', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', emoji: '🧘' },
  { title: 'Creative Writing Workshop', desc: 'Unlock your creative potential through structured writing exercises.', tag: 'Creativity', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', emoji: '✍️' },
  { title: 'Financial Freedom Path', desc: 'A step-by-step guide to building wealth and financial independence.', tag: 'Finance', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', emoji: '💰' },
  { title: 'The Growth Podcast', desc: 'Weekly conversations with people who transformed their lives.', tag: 'Podcast', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', emoji: '🎙️' },
  { title: 'Strength Training 101', desc: 'Build functional strength with progressive overload programs.', tag: 'Fitness', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', emoji: '💪' },
  { title: 'Mindful Parenting', desc: 'Raise confident, emotionally intelligent children with presence.', tag: 'Family', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', emoji: '👨👧' },
  { title: 'Deep Work Mastery', desc: 'Achieve more in less time through focused, distraction-free work.', tag: 'Career', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', emoji: '🎯' },
  { title: 'Plant-Based Nutrition', desc: 'Fuel your body with evidence-based plant-forward meal plans.', tag: 'Health', gradient: 'linear-gradient(135deg, #96fbc4, #f9f586)', emoji: '🥗' },
  { title: 'Relationship Blueprint', desc: 'Build deeper connections through effective communication patterns.', tag: 'Relationships', gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', emoji: '❤️' },
];

export default function CuratedCarousel() {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="l-carousel" id="curated">
      <div className="l-carousel-header">
        <h2 className="l-carousel-title">AETHER recommends</h2>
        <div className="l-carousel-arrows">
          <button onClick={() => scroll('left')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button onClick={() => scroll('right')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
        <Link to="/explore" className="l-pill">View All</Link>
      </div>
      <div className="l-carousel-track" ref={trackRef}>
        {RESOURCES.map((r, i) => (
          <div key={i} className="l-carousel-card">
            <div className="l-card-img" style={{ background: r.gradient, height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
              {r.emoji}
            </div>
            <div className="l-card-body">
              <span className="l-card-tag">{r.tag}</span>
              <h3 className="l-card-title">{r.title}</h3>
              <p className="l-card-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.desc}</p>
            </div>
            <div className="l-card-footer">
              <Link to="/explore" className="l-pill">Explore</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

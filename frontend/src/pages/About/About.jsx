import React, { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  // Refs for scroll animation elements
  const headerRef = useRef(null);
  const missionRef = useRef(null);
  const valueRef = useRef(null);
  const teamRef = useRef(null);
  const statsRef = useRef(null);
  const techRef = useRef(null);

  useEffect(() => {
    // Observer for animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all section refs
    const refs = [headerRef, missionRef, valueRef, teamRef, statsRef, techRef];
    refs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      refs.forEach(ref => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  return (
    <div className="about-page">
      <div className="about-header fade-in" ref={headerRef}>
        <div className="hero-content">
          <h1>Discover Saudi Arabia</h1>
          <p className="subtitle">Explore the beauty and culture of our Kingdom with the ultimate tourism platform</p>
          <p className="hero-description">Let the journey begin through a seamless, AI-powered experience that brings Saudi Arabia's vibrant cities, hidden gems, and authentic culture to your fingertips.</p>
          <div className="animated-divider"></div>
        </div>
      </div>

      <div className="about-content">
        <section className="mission-section slide-in-right" ref={missionRef}>
          <div className="section-icon">
            <i className="bi bi-rocket-takeoff"></i>
          </div>
          <div className="section-content">
            <h2>🚀 Our Mission</h2>
            <p>
              At Hala Saudi, our mission is to revolutionize travel planning in Saudi Arabia through cutting-edge AI technology. 
              We aim to offer tourists a personalized, hassle-free journey—combining cultural richness, real-time itinerary updates, 
              and user-centric design. By bridging tradition with technology, we empower travelers to explore, connect, and create 
              lifelong memories.
            </p>
          </div>
        </section>

        <section className="values-section slide-in-left" ref={valueRef}>
          <div className="section-icon">
            <i class="bi bi-star"></i>
          </div>
          <div className="section-content">
            <h2>🌟 Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <i className="bi bi-heart-fill"></i>
                <h3>Authenticity</h3>
                <p>We reflect the essence of Saudi culture and hospitality through every user experience.</p>
              </div>
              <div className="value-item">
                <i className="bi bi-shield-check"></i>
                <h3>Reliability</h3>
                <p>We provide accurate, up-to-date travel data through secure and trustworthy systems.</p>
              </div>
              <div className="value-item">
                <i className="bi bi-globe2"></i>
                <h3>Inclusivity</h3>
                <p>We make travel accessible for all, supporting multi-language interfaces and inclusive design.</p>
              </div>
              <div className="value-item">
                <i className="bi bi-lightning-charge"></i>
                <h3>Innovation</h3>
                <p>We continuously improve our platform using user feedback, advanced features, and scalable tech.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section fade-in" ref={statsRef}>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number counter">1000+</div>
              <div className="stat-label">Destinations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number counter">50,000+</div>
              <div className="stat-label">Happy Travelers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number counter">2000+</div>
              <div className="stat-label">Restaurants</div>
            </div>
            <div className="stat-item">
              <div className="stat-number counter">500+</div>
              <div className="stat-label">Hotels</div>
            </div>
          </div>
        </section>

        <section className="tech-section slide-in-right" ref={techRef}>
          <div className="section-icon">
            <i className="bi bi-cpu"></i>
          </div>
          <div className="section-content">
            <h2>💻 Our Technology</h2>
            <p>
              We leverage advanced technologies to make every traveler's journey smooth and intelligent:
            </p>
            <div className="tech-features">
              <div className="tech-feature">
                <i className="bi bi-robot"></i>
                <h3>AI-Powered Trip Planning</h3>
                <p>Personalized itineraries generated using traveler preferences, time, and location data.</p>
              </div>
              <div className="tech-feature">
                <i className="bi bi-map"></i>
                <h3>Interactive Maps</h3>
                <p>Visual navigation that helps users explore attractions, events, and services with ease.</p>
              </div>
              <div className="tech-feature">
                <i className="bi bi-calendar-check"></i>
                <h3>Smart Itineraries</h3>
                <p>Real-time itinerary updates based on weather, traffic, and event changes.</p>
              </div>
              <div className="tech-feature">
                <i className="bi bi-chat-dots"></i>
                <h3>Virtual Assistant</h3>
                <p>A responsive chatbot that guides users across the platform and answers travel questions on the go.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="team-section fade-in-up" ref={teamRef}>
          <h2>Meet Our Team</h2>
          <div className="team-cta">
            <a href="/developers" className="team-link pulse-animation">
              <i className="bi bi-people"></i> Meet The Team
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
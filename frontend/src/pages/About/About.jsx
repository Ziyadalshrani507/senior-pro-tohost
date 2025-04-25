import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Us</h1>
        <p>Discover, plan, and enjoy travel experiences with ease.</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At Tourism Platform, our mission is to provide a seamless way for users to explore and plan their travel experiences. We aim to connect travelers with unique destinations, restaurants, and activities that create unforgettable memories.
          </p>
        </section>

        <section className="credibility-section">
          <h2>Why Choose Us?</h2>
          <ul>
            <li>Comprehensive travel guides and recommendations.</li>
            <li>Easy-to-use platform for planning trips.</li>
            <li>Trusted by thousands of travelers worldwide.</li>
          </ul>
        </section>

        <section className="flexibility-section">
          <h2>Backend Flexibility</h2>
          <p>
            Our platform is designed with flexibility in mind, allowing for easy updates and content management to ensure the most accurate and up-to-date information for our users.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
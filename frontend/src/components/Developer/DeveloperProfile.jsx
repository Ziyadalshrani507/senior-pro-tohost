import React from 'react';
import './DeveloperProfile.css';

const DeveloperProfile = ({ developer }) => {
  if (!developer) {
    return <div className="developer-profile-loading">Loading developer profile...</div>;
  }

  const { user, photo, major, description } = developer;
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Developer';
  const photoUrl = photo ? `${process.env.VITE_API_URL || ''}${photo}` : user?.profilePicture?.data || '/default-profile.png';

  return (
    <div className="developer-profile">
      <div className="developer-header">
        <div className="developer-photo-container">
          <img 
            src={photoUrl} 
            alt={fullName} 
            className="developer-photo" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-profile.png';
            }}
          />
        </div>
        <div className="developer-info">
          <h1 className="developer-name">{fullName}</h1>
          <h3 className="developer-major">{major}</h3>
        </div>
      </div>

      <div className="developer-sections">
        <section className="developer-section">
          <h2 className="section-title">About Me</h2>
          <div className="section-content">
            <p className="developer-description">{description}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeveloperProfile;
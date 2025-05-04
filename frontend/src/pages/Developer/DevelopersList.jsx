import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getAllDevelopers } from '../../services/developerService';
import './DevelopersList.css';

const DevelopersList = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setLoading(true);
        const data = await getAllDevelopers();
        setDevelopers(data);
      } catch (err) {
        console.error('Error fetching developers:', err);
        setError(err.message || 'Failed to load developers');
        toast.error('Failed to load developers');
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  if (loading) {
    return <div className="developers-loading">Loading developers...</div>;
  }

  if (error) {
    return (
      <div className="developers-error">
        <h2>Error Loading Developers</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="no-developers">
        <h2>No Developers Found</h2>
        <p>There are currently no developer profiles.</p>
        {isAdmin && (
          <Link to="/developer/profile" className="create-profile-btn">Create Developer Profile</Link>
        )}
      </div>
    );
  }

  return (
    <div className="developers-list-page">
      <div className="developers-list-container">
        <h1 className="developers-list-title">Our Developers</h1>
        
        <div className="developers-grid">
          {developers.map((developer) => {
            const { _id, user, photo, major } = developer;
            const fullName = user ? `${user.firstName} ${user.lastName}` : 'Developer';
            const photoUrl = photo 
              ? `${process.env.VITE_API_URL || ''}${photo}` 
              : user?.profilePicture?.data || '/default-profile.png';
            
            return (
              <Link to={`/developers/${_id}`} key={_id} className="developer-card">
                <div className="developer-card-photo">
                  <img 
                    src={photoUrl} 
                    alt={fullName} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-profile.png';
                    }}
                  />
                </div>
                <div className="developer-card-info">
                  <h3 className="developer-card-name">{fullName}</h3>
                  <p className="developer-card-major">{major}</p>
                </div>
              </Link>
            );
          })}
        </div>
        
        {isAdmin && (
          <div className="developers-actions">
            <Link to="/developer/profile" className="create-profile-btn">Create Your Developer Profile</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopersList;
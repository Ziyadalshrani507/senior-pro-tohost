import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getDeveloperById, getDeveloperProfile } from '../../services/developerService';
import DeveloperProfile from '../../components/Developer/DeveloperProfile';
import DeveloperProfileForm from '../../components/Developer/DeveloperProfileForm';
import './DeveloperPage.css';

const DeveloperPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !id;

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let developerData;
        
        if (isOwnProfile) {
          // Get current user's developer profile
          try {
            developerData = await getDeveloperProfile();
          } catch (err) {
            if (err.message === 'Developer profile not found') {
              // If profile doesn't exist, show form to create it
              setIsEditing(true);
              setLoading(false);
              return;
            } else {
              throw err;
            }
          }
        } else {
          // Get developer by ID
          developerData = await getDeveloperById(id);
        }
        
        setDeveloper(developerData);
      } catch (err) {
        console.error('Error fetching developer:', err);
        setError(err.message || 'Failed to load developer profile');
        toast.error(err.message || 'Failed to load developer profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloper();
  }, [id, isOwnProfile]);

  const handleUpdateDeveloper = (updatedDeveloper) => {
    setDeveloper(updatedDeveloper);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="developer-page-loading">Loading developer profile...</div>;
  }

  if (error && !isEditing) {
    return (
      <div className="developer-page-error">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Only admins can edit developer profiles
  const canEdit = user && user.role === 'admin';

  return (
    <div className="developer-page">
      <div className="developer-page-container">
        {isEditing ? (
          <>
            <h1 className="developer-page-title">
              {developer ? 'Edit Developer Profile' : 'Create Developer Profile'}
            </h1>
            <DeveloperProfileForm 
              developerData={developer} 
              onUpdate={handleUpdateDeveloper} 
            />
            {developer && (
              <button 
                className="cancel-edit-btn" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <DeveloperProfile developer={developer} />
            {canEdit && (
              <div className="developer-actions">
                <button 
                  className="edit-profile-btn" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeveloperPage;
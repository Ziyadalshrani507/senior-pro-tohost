import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaPencilAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import FavoritesSection from '../../components/FavoritesSection/FavoritesSection';
import ReviewsSection from '../../components/ReviewsSection/ReviewsSection';
import ItinerariesSection from '../../components/ItinerariesSection/ItinerariesSection';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('My Profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = getApiBaseUrl();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user exists in auth context
        if (!currentUser) {
          throw new Error('No authentication data found');
        }

        const userId = currentUser.id || currentUser._id;

        if (!userId) {
          throw new Error('User ID not found');
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          credentials: 'include', // Include cookies in the request
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Session expired. Please login again');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        if (!userData) {
          throw new Error('Invalid user data received');
        }

        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error(error.message || 'Failed to load user data');
        if (error.message.includes('authentication') || error.message.includes('User ID')) {
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [API_BASE_URL, navigate, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile/picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }
      
      const { profilePicture } = await response.json();
      setUser(prev => ({
        ...prev,
        profilePicture
      }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user || !currentUser) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="sidebar">
        <ul className="nav-tabs">
          {['My Profile', 'Favorites', 'Reviews', 'Itineraries'].map((tab) => (
            <li
              key={tab}
              className={`nav-item ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="profile-header">
          <div className="profile-photo-section">
            {user.profilePicture ? (
              <img
                src={user.profilePicture.data ? 
                  `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}` : 
                  user.profilePicture}
                alt="Profile"
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo">
                <FaUser size={50} color="#666" />
              </div>
            )}
            <button
              className="photo-edit-button"
              onClick={handlePhotoClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : <FaPencilAlt />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{`${user.firstName || ''} ${user.lastName || ''}`}</h1>
            <p className="profile-contact">{user.phone || 'No phone number added'}</p>
            {!isEditing && (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {selectedTab === 'My Profile' && (
          isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">Save Changes</button>
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      phone: user.phone || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone || 'No phone number added'}</p>
            </div>
          )
        )}
        {selectedTab === 'Favorites' && <FavoritesSection />}
        {selectedTab === 'Reviews' && (
          <ReviewsSection userId={currentUser._id} />
        )}
        {selectedTab === 'Itineraries' && (
          <ItinerariesSection userId={currentUser._id} />
        )}
      </div>
    </div>
  );
};

export default Profile;

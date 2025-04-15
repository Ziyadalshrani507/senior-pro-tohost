import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaPencilAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to view your profile');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const userData = await response.json();
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.message || 'Failed to load profile');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsUploading(true);
    try {
      const response = await fetch('/api/user/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }
      
      await fetchUserProfile();
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="sidebar">
        <ul className="nav-tabs">
          {['My Profile', 'Favorites', 'Itineraries', 'Reviews'].map((tab) => (
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
                src={user.profilePicture}
                alt="Profile"
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo">
                <FaUser size={50} color="#666" />
              </div>
            )}
            <button className="photo-upload-button" onClick={handlePhotoClick}>
              <FaPencilAlt />
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
            <h1 className="profile-name">{`${user.firstName} ${user.lastName}`}</h1>
            <p className="profile-contact">{user.phone || 'No phone number added'}</p>
            {!isEditing && (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="content-area">
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
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control"
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
                <button type="submit" className="save-button">Save Changes</button>
                <button
                  type="button"
                  className="save-button cancel-button"
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
              </form>
            ) : (
              <div className="profile-details">
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone || 'No phone number added'}</p>
              </div>
            )
          )}
          {selectedTab === 'Favorites' && (
            <div>Favorites content will go here</div>
          )}
          {selectedTab === 'Itineraries' && (
            <div>Itineraries content will go here</div>
          )}
          {selectedTab === 'Reviews' && (
            <div>Reviews content will go here</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

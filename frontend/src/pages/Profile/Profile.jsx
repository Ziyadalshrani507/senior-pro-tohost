import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Reviews');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
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
      toast.error('Failed to load profile');
    }
  };

  const handleEditToggle = (e) => {
    e.preventDefault(); // Prevent any default button behavior
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      
      const result = await response.json();
      setUser(result.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handlePictureClick = () => {
    fileInputRef.current.click();
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG and GIF files are allowed');
      return;
    }

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

      if (!response.ok) throw new Error('Failed to upload picture');
      const result = await response.json();
      setUser(prev => ({ ...prev, profilePicture: result.profilePicture }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePictureDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      const response = await fetch('/api/user/profile/picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete picture');
      setUser(prev => ({ ...prev, profilePicture: null }));
      toast.success('Profile picture deleted successfully');
    } catch (error) {
      console.error('Error deleting picture:', error);
      toast.error('Failed to delete profile picture');
    }
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="profile-sidebar">
        <div className="profile-info">
          <div className="profile-picture-container">
            <div 
              className="profile-picture" 
              onClick={handlePictureClick}
              style={{ 
                backgroundImage: user.profilePicture?.data 
                  ? `url(data:${user.profilePicture.contentType};base64,${user.profilePicture.data})` 
                  : 'none' 
              }}
            >
              {!user.profilePicture && (
                <div className="profile-picture-placeholder">
                  {user.firstName ? user.firstName[0].toUpperCase() : '?'}
                </div>
              )}
              {isUploading && <div className="upload-overlay">Uploading...</div>}
              <div className="profile-picture-hover">
                <i className="bi bi-camera"></i>
                <span>Change Picture</span>
              </div>
            </div>
            {user.profilePicture && (
              <button 
                className="delete-picture-button"
                onClick={handlePictureDelete}
                title="Delete profile picture"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePictureUpload}
              accept="image/jpeg,image/png,image/gif"
              style={{ display: 'none' }}
            />
          </div>
          <div className="user-details">
            <h2>{`${user.firstName || ''} ${user.lastName || ''}`}</h2>
            <p className="user-email">{user.email}</p>
            <p className="user-phone">{user.phone || 'No phone number'}</p>
          </div>
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
              <div className="profile-actions">
                <button className="save-button" onClick={handleSubmit}>Save Changes</button>
                <button className="cancel-button" onClick={handleEditToggle}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-actions">
              <button className="edit-button" onClick={handleEditToggle}>Edit Profile</button>
            </div>
          )}
        </div>
      </div>
      <main className="content-area">
        <div className="content-header">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-dropdown"
          >
            <option value="Reviews">Reviews</option>
            <option value="Itineraries">Itineraries</option>
            <option value="Favorites">Favorites</option>
          </select>
        </div>
        <div className="content-grid">
          {selectedCategory === 'Reviews' && (
            <div className="reviews-grid">
              <p>Your reviews will appear here</p>
            </div>
          )}
          {selectedCategory === 'Itineraries' && (
            <div className="itineraries-grid">
              <div className="grid-item">
                <div className="item-image"></div>
                <h3>Itinerary Title</h3>
                <p>Description</p>
              </div>
              <div className="grid-item">
                <div className="item-image"></div>
                <h3>Itinerary Title</h3>
                <p>Description</p>
              </div>
              <div className="grid-item">
                <div className="item-image"></div>
                <h3>Itinerary Title</h3>
                <p>Description</p>
              </div>
            </div>
          )}
          {selectedCategory === 'Favorites' && (
            <div className="favorites-grid">
              <p>Your favorites will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;

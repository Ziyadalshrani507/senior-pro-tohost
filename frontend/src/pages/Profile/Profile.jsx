import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
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
          <div className="profile-info">
            <h2 className="profile-name">{`${user.firstName} ${user.lastName}`}</h2>
           
          </div>
        </div>

        <div className="profile-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{user.firstName}</p>
              )}
            </div>

            <div className="form-group">
              <label>Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{user.lastName}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <p>{user.email}</p>
              )}
            </div>

            <div className="form-group">
              <label>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{user.phone || 'Not set'}</p>
              )}
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="edit-button"
                  onClick={handleEditToggle}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

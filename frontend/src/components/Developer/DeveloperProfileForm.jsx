import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { updateDeveloperProfile, uploadDeveloperPhoto } from '../../services/developerService';
import './DeveloperProfileForm.css';

const DeveloperProfileForm = ({ developerData, onUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    major: '',
    description: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form when developerData changes
  useEffect(() => {
    if (developerData) {
      setFormData({
        major: developerData.major || '',
        description: developerData.description || ''
      });
      
      if (developerData.photo) {
        setPhotoPreview(`${process.env.VITE_API_URL || ''}${developerData.photo}`);
      }
    }
  }, [developerData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update developer profile
      const updatedDeveloper = await updateDeveloperProfile(formData);

      // Upload photo if selected
      if (photoFile) {
        await uploadDeveloperPhoto(photoFile);
      }

      toast.success('Developer profile updated successfully');
      
      // Call the onUpdate callback with the updated data
      if (onUpdate) {
        onUpdate({ ...updatedDeveloper, photo: photoFile ? URL.createObjectURL(photoFile) : developerData?.photo });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update developer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="developer-profile-form">
      <h2>Developer Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group photo-upload">
          <label htmlFor="photo">Profile Photo</label>
          <div className="photo-container">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">No photo selected</div>
            )}
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="major">Major/Specialty</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description/Bio</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default DeveloperProfileForm;
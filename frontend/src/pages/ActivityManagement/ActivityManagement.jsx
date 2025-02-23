import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ActivityManagement.css';

const ActivityManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingActivity, setEditingActivity] = useState(null);
  const [schemaOptions, setSchemaOptions] = useState({
    cities: [],
    types: [],
    categories: []
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationCity: '',
    type: '',
    cost: '',
    categories: [],
    pictureUrls: [''],
    rating: null,
    isActivity: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchActivities();
    fetchSchemaOptions();
  }, [user, navigate]);

  useEffect(() => {
    const filtered = activities.filter(activity => 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.locationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredActivities(filtered);
  }, [searchTerm, activities]);

  const fetchSchemaOptions = async () => {
    try {
      const response = await fetch('/api/destinations/schema-options');
      if (!response.ok) {
        throw new Error('Failed to fetch schema options');
      }
      const data = await response.json();
      setSchemaOptions(data);
    } catch (err) {
      setError('Failed to load schema options: ' + err.message);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/destinations/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'categories') {
      const category = value;
      setFormData(prev => ({
        ...prev,
        categories: checked
          ? [...prev.categories, category]
          : prev.categories.filter(c => c !== category)
      }));
    } else if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: checked ? value : ''
      }));
    } else if (name === 'pictureUrls') {
      const urls = value.split(',').map(url => url.trim()).filter(url => url);
      setFormData(prev => ({
        ...prev,
        [name]: urls
      }));
    } else if (name === 'cost' || name === 'rating') {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUrlChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleAddImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: [...prev.pictureUrls, '']
    }));
  };

  const handleRemoveImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingActivity
        ? `/api/destinations/activities/${editingActivity._id}`
        : '/api/destinations/activities';
      
      const method = editingActivity ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save activity');
      }

      setSuccess(editingActivity ? 'Activity updated successfully!' : 'Activity created successfully!');
      setEditingActivity(null);
      resetForm();
      fetchActivities();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      const response = await fetch(`/api/destinations/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete activity');
      }

      setSuccess('Activity deleted successfully!');
      fetchActivities();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      locationCity: activity.locationCity,
      type: activity.type,
      cost: activity.cost,
      categories: activity.categories || [],
      pictureUrls: activity.pictureUrls || [''],
      rating: activity.rating || 0,
      isActivity: true
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      locationCity: '',
      type: '',
      cost: '',
      categories: [],
      pictureUrls: [''],
      rating: 0,
      isActivity: true
    });
  };

  return (
    <div className="activity-management-container">
      <div className="activity-form-section">
        <h2>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-group">
            <label htmlFor="name">Activity Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationCity">City*</label>
            <select
              id="locationCity"
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a city</option>
              {schemaOptions.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Type*</label>
            <div className="checkbox-group">
              {schemaOptions.types.map(type => (
                <div key={type} className="checkbox-item">
                  <input
                    type="radio"
                    id={`type-${type}`}
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor={`type-${type}`}>{type}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="cost" className="form-label">Cost (SAR)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                id="cost"
                name="cost"
                value={formData.cost === null ? '' : formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter cost (0 for free activities)"
              />
              {formData.cost === 0 && (
                <span className="input-group-text text-success">Free!</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating (0-5)</label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Categories</label>
            <div className="checkbox-group">
              {schemaOptions.categories.map(category => (
                <div key={category} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    name="categories"
                    value={category}
                    checked={formData.categories.includes(category)}
                    onChange={handleChange}
                  />
                  <label htmlFor={`category-${category}`}>{category}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Image URLs:</label>
            <div className="image-urls-container">
              {formData.pictureUrls.map((url, index) => (
                <div key={index} className="image-url-input">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder="Enter image URL"
                  />
                  {formData.pictureUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="remove-url-btn"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="add-url-btn"
              >
                <i className="bi bi-plus"></i> Add Another Image URL
              </button>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </button>
            {editingActivity && (
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setEditingActivity(null);
                  resetForm();
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="activities-list-section">
        <h2>Existing Activities</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="activities-grid">
          {filteredActivities.map(activity => (
            <div key={activity._id} className="activity-card">
              {activity.pictureUrls && activity.pictureUrls[0] && (
                <div className="activity-image">
                  <img 
                    src={activity.pictureUrls[0]} 
                    alt={activity.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              )}
              <div className="activity-content">
                <h3>{activity.name}</h3>
                <p className="activity-description">{activity.description}</p>
                <div className="activity-details">
                  <span><i className="bi bi-geo-alt"></i> {activity.locationCity}</span>
                  <span><i className="bi bi-tag"></i> {activity.type}</span>
                  <span><i className="bi bi-currency-dollar"></i> {activity.cost === 0 ? 'Free' : `${activity.cost} SAR`}</span>
                  {activity.rating > 0 && (
                    <span><i className="bi bi-star-fill"></i> {activity.rating.toFixed(1)}</span>
                  )}
                </div>
                {activity.categories && activity.categories.length > 0 && (
                  <div className="activity-categories">
                    {activity.categories.map(category => (
                      <span key={category} className="category-tag">{category}</span>
                    ))}
                  </div>
                )}
                <div className="activity-actions">
                  <button onClick={() => handleEdit(activity)} className="btn-edit">
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button onClick={() => handleDelete(activity._id)} className="btn-delete">
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityManagement;

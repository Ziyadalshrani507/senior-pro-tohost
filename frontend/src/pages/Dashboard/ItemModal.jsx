import React, { useState, useEffect } from 'react';
import { FaTimes, FaLink, FaTrash } from 'react-icons/fa';
import MapPicker from '../../components/MapPicker/MapPicker';
import './ItemModal.css';

const ItemModal = ({ item, type, onSave, onClose, schemaOptions }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationCity: '',
    pictureUrls: [],
    coordinates: {
      type: 'Point',
      coordinates: null // [longitude, latitude]
    },
    // Destination specific fields
    type: '',
    cost: '',
    categories: [],
    // Restaurant specific fields
    cuisine: '',
    priceRange: '',
    address: '',
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    openingHours: ''
  });

  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        categories: item.categories || [],
        contact: item.contact || { phone: '', email: '', website: '' },
        coordinates: item.coordinates || { type: 'Point', coordinates: null }
      });
    } else {
      resetForm();
    }
  }, [item]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      locationCity: '',
      pictureUrls: [],
      coordinates: {
        type: 'Point',
        coordinates: null
      },
      type: '',
      cost: '',
      categories: [],
      cuisine: '',
      priceRange: '',
      address: '',
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      openingHours: ''
    });
    setImageUrl('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.locationCity?.trim()) newErrors.locationCity = 'City is required';

    if (type === 'destinations') {
      if (!formData.type?.trim()) newErrors.type = 'Type is required';
      if (!formData.cost?.toString().trim()) newErrors.cost = 'Cost is required';
      if (!formData.coordinates?.coordinates) newErrors.coordinates = 'Location on map is required';
    } else {
      if (!formData.cuisine?.trim()) newErrors.cuisine = 'Cuisine is required';
      if (!formData.priceRange?.trim()) newErrors.priceRange = 'Price range is required';
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
      if (!formData.contact?.phone?.trim()) newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        ...(item?._id && { _id: item._id })
      });
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
      setErrors({ submit: 'Error saving item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleImageAdd = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        pictureUrls: [...prev.pictureUrls, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.filter((_, i) => i !== index)
    }));
  };

  const handleMapPositionChange = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        type: 'Point',
        coordinates
      }
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>{item ? 'Edit' : 'Add New'} {type === 'destinations' ? 'Destination' : 'Restaurant'}</h2>
        
        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>City *</label>
            <select
              name="locationCity"
              value={formData.locationCity}
              onChange={handleInputChange}
              className={errors.locationCity ? 'error' : ''}
            >
              <option value="">Select a city</option>
              {schemaOptions?.cities?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.locationCity && <span className="error-message">{errors.locationCity}</span>}
          </div>

          {type === 'destinations' && (
            <>
              <div className="form-group">
                <label>Location on Map *</label>
                <MapPicker
                  position={formData.coordinates?.coordinates}
                  onPositionChange={handleMapPositionChange}
                />
                {errors.coordinates && <span className="error-message">{errors.coordinates}</span>}
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="">Select a type</option>
                  {schemaOptions?.types?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Cost (SAR) *</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className={errors.cost ? 'error' : ''}
                  min="0"
                />
                {errors.cost && <span className="error-message">{errors.cost}</span>}
              </div>

              <div className="form-group">
                <label>Categories</label>
                <div className="categories-grid">
                  {schemaOptions?.categories?.map(category => (
                    <label key={category} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {type !== 'destinations' && (
            <>
              <div className="form-group">
                <label>Cuisine *</label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  className={errors.cuisine ? 'error' : ''}
                >
                  <option value="">Select cuisine</option>
                  {schemaOptions?.cuisines?.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                {errors.cuisine && <span className="error-message">{errors.cuisine}</span>}
              </div>

              <div className="form-group">
                <label>Price Range *</label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className={errors.priceRange ? 'error' : ''}
                >
                  <option value="">Select price range</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Luxury)</option>
                </select>
                {errors.priceRange && <span className="error-message">{errors.priceRange}</span>}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Contact Information</label>
                <div className="contact-fields">
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                  
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleInputChange}
                  />
                  
                  <input
                    type="url"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Opening Hours</label>
                <textarea
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Images</label>
            <div className="image-input">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className={errors.imageUrl ? 'error' : ''}
              />
              <button type="button" onClick={handleImageAdd}>
                <FaLink /> Add
              </button>
            </div>
            {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
            
            <div className="image-list">
              {formData.pictureUrls.map((url, index) => (
                <div key={index} className="image-item">
                  <img src={url} alt={`${formData.name} ${index + 1}`} />
                  <button type="button" onClick={() => handleImageRemove(index)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;

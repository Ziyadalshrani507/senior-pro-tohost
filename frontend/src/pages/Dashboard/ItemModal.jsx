import React, { useState, useEffect } from 'react';
import { FaTimes, FaLink, FaTrash } from 'react-icons/fa';
import './ItemModal.css';

const ItemModal = ({ item, type, onSave, onClose, schemaOptions }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationCity: '',
    pictureUrls: [],
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
        contact: item.contact || { phone: '', email: '', website: '' }
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
      // toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        // If editing, include the _id
        ...(item?._id && { _id: item._id })
      });
      onClose();
      resetForm();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
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
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUrlAdd = () => {
    if (!imageUrl.trim()) return;
    
    try {
      new URL(imageUrl);
      setFormData(prev => ({
        ...prev,
        pictureUrls: [...prev.pictureUrls, imageUrl]
      }));
      setImageUrl('');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageUrl;
        return newErrors;
      });
    } catch (e) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL' }));
    }
  };

  const handleImageDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      pictureUrls: prev.pictureUrls.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter(cat => cat !== value)
        : [...prev.categories, value]
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Enter description"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>City *</label>
            <select
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              className={errors.locationCity ? 'error' : ''}
            >
              <option value="">Select a city</option>
              {schemaOptions.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.locationCity && <span className="error-text">{errors.locationCity}</span>}
          </div>

          {type === 'destinations' ? (
            <>
              <div className="form-group">
                <label>Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={errors.type ? 'error' : ''}
                  placeholder="e.g., Historical, Natural, Cultural"
                />
                {errors.type && <span className="error-text">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label>Cost *</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={errors.cost ? 'error' : ''}
                  placeholder="Enter cost"
                  min="0"
                />
                {errors.cost && <span className="error-text">{errors.cost}</span>}
              </div>

              <div className="form-group">
                <label>Categories</label>
                <select
                  multiple
                  value={formData.categories}
                  onChange={handleCategoryChange}
                >
                  {schemaOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Cuisine *</label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className={errors.cuisine ? 'error' : ''}
                >
                  <option value="">Select cuisine</option>
                  {schemaOptions.cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                {errors.cuisine && <span className="error-text">{errors.cuisine}</span>}
              </div>

              <div className="form-group">
                <label>Price Range *</label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleChange}
                  className={errors.priceRange ? 'error' : ''}
                >
                  <option value="">Select price range</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Luxury)</option>
                </select>
                {errors.priceRange && <span className="error-text">{errors.priceRange}</span>}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Enter full address"
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Contact Information</label>
                <div className="contact-fields">
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contact.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Phone number *"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                  
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contact.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                  
                  <input
                    type="url"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleChange}
                    placeholder="Website URL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Opening Hours</label>
                <textarea
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Fri: 9 AM - 10 PM&#10;Sat-Sun: 10 AM - 11 PM"
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
              <button type="button" onClick={handleImageUrlAdd}>
                <FaLink /> Add
              </button>
            </div>
            {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
            
            <div className="image-list">
              {formData.pictureUrls.map((url, index) => (
                <div key={index} className="image-item">
                  <img src={url} alt={`${formData.name} ${index + 1}`} />
                  <button type="button" onClick={() => handleImageDelete(index)}>
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

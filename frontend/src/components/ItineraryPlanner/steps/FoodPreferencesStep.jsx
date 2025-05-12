import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useItinerary } from '../../../context/ItineraryContext';
import { getApiBaseUrl } from '../../../utils/apiBaseUrl';
import './Steps.css';

const FoodPreferencesStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useItinerary();
  const [activeTab, setActiveTab] = useState('cuisines');
  const [loading, setLoading] = useState(true);
  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [error, setError] = useState(null);
  const [currentCuisinePage, setCurrentCuisinePage] = useState(0);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);
  const itemsPerPage = 6;

  // Icon mapping for cuisines
  const cuisineIconMap = {
    'Saudi Arabian': '🍽️',
    'Middle Eastern': '🥙',
    'Lebanese': '🧆',
    'Egyptian': '🍲',
    'Turkish': '🥘',
    'Moroccan': '🍲',
    'Italian': '🍝',
    'Indian': '🍛',
    'Chinese': '🥢',
    'Japanese': '🍣',
    'American': '🍔',
    'French': '🥐',
    'Greek': '🫒',
    'Spanish': '🥘',
    'Thai': '🍜',
    'Vietnamese': '🍜',
    'Korean': '🍚',
    // Default icon for other cuisines
    'default': '🍴'
  };

  // Icon mapping for categories
  const categoryIconMap = {
    'Fine Dining': '✨',
    'Casual Dining': '🪑',
    'Fast Food': '🍟',
    'Cafe': '☕',
    'Buffet': '🍱',
    'Family Style': '👨‍👩‍👧‍👦',
    'Halal': '🍖',
    'Vegetarian': '🥗',
    'Seafood': '🦞',
    'Street Food': '🛒',
    'Rooftop': '🏙️',
    'Organic': '🌱',
    'Bakery': '🥖',
    'Dessert': '🍰',
    'Vegan': '🥬',
    'Barbecue': '🔥',
    'Steakhouse': '🥩',
    // Default icon for other categories
    'default': '🍴'
  };

  // Fetch cuisine and category options from API
  // Reset pagination when tab changes
  useEffect(() => {
    if (activeTab === 'cuisines') {
      setCurrentCuisinePage(0);
    } else {
      setCurrentCategoryPage(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiBaseUrl = getApiBaseUrl();
        const response = await axios.get('/restaurants/schema-options');
        
        if (response.data) {
          // Process cuisines
          const cuisines = response.data.cuisines || [];
          const processedCuisines = cuisines.map(cuisine => ({
            id: cuisine.toLowerCase().replace(/\s+/g, '_'),
            label: cuisine,
            icon: cuisineIconMap[cuisine] || cuisineIconMap.default
          }));
          
          // Process categories
          const categories = response.data.categories || [];
          const processedCategories = categories.map(category => ({
            id: category.toLowerCase().replace(/\s+/g, '_'),
            label: category,
            icon: categoryIconMap[category] || categoryIconMap.default
          }));
          
          setCuisineOptions(processedCuisines);
          setCategoryOptions(processedCategories);
        }
      } catch (err) {
        console.error('Error fetching food preferences options:', err);
        setError('Failed to load cuisine and category options. Please try again.');
        
        // Fallback options if API fails
        setCuisineOptions([
          { id: 'saudi_arabian', label: 'Saudi Arabian', icon: '🍽️' },
          { id: 'middle_eastern', label: 'Middle Eastern', icon: '🥙' },
          { id: 'lebanese', label: 'Lebanese', icon: '🧆' },
          { id: 'italian', label: 'Italian', icon: '🍝' },
        ]);
        
        setCategoryOptions([
          { id: 'fine_dining', label: 'Fine Dining', icon: '✨' },
          { id: 'casual_dining', label: 'Casual Dining', icon: '🪑' },
          { id: 'halal', label: 'Halal', icon: '🍖' },
          { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, []);

  const toggleCuisine = (cuisine) => {
    const updatedCuisines = formData.foodPreferences?.cuisines?.includes(cuisine)
      ? formData.foodPreferences?.cuisines?.filter(c => c !== cuisine)
      : [...(formData.foodPreferences?.cuisines || []), cuisine];
    
    updateFormData({ 
      foodPreferences: { 
        ...formData.foodPreferences,
        cuisines: updatedCuisines 
      } 
    });
  };

  const toggleCategory = (category) => {
    const updatedCategories = formData.foodPreferences?.categories?.includes(category)
      ? formData.foodPreferences?.categories?.filter(c => c !== category)
      : [...(formData.foodPreferences?.categories || []), category];
    
    updateFormData({ 
      foodPreferences: { 
        ...formData.foodPreferences, 
        categories: updatedCategories 
      } 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Allow proceeding even if no food preferences selected
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>What food do you prefer?</h2>
      <p>Help us choose restaurants that match your taste</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="tab-container">
        <div 
          className={`tab ${activeTab === 'cuisines' ? 'active' : ''}`}
          onClick={() => setActiveTab('cuisines')}
        >
          Cuisines
        </div>
        <div 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Dining Styles
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-container-spinner"></div>
          <p>Loading food preference options...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
      
        {activeTab === 'cuisines' && (
          <>
            <div className="food-preferences-grid">
              {cuisineOptions
                .slice(currentCuisinePage * itemsPerPage, (currentCuisinePage + 1) * itemsPerPage)
                .map((option) => (
                  <div
                    key={option.id}
                    className={`preference-card ${formData.foodPreferences?.cuisines?.includes(option.id) ? 'selected' : ''}`}
                    onClick={() => toggleCuisine(option.id)}
                  >
                    <div className="preference-icon">{option.icon}</div>
                    <div className="preference-label">{option.label}</div>
                  </div>
                ))}
            </div>
            
            {cuisineOptions.length > itemsPerPage && (
              <div className="pagination-controls">
                <button 
                  className="pagination-button prev" 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event propagation
                    setCurrentCuisinePage(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentCuisinePage === 0}
                  type="button" // Explicitly set as button type to avoid form submission
                >
                  <i className="bi bi-chevron-left"></i> Previous
                </button>
                
                <span className="page-indicator">
                  Page {currentCuisinePage + 1} of {Math.ceil(cuisineOptions.length / itemsPerPage)}
                </span>
                
                <button 
                  className="pagination-button next" 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event propagation
                    setCurrentCuisinePage(prev => Math.min(Math.ceil(cuisineOptions.length / itemsPerPage) - 1, prev + 1));
                  }}
                  disabled={currentCuisinePage >= Math.ceil(cuisineOptions.length / itemsPerPage) - 1}
                  type="button" // Explicitly set as button type to avoid form submission
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="food-preferences-grid">
              {categoryOptions
                .slice(currentCategoryPage * itemsPerPage, (currentCategoryPage + 1) * itemsPerPage)
                .map((option) => (
                  <div
                    key={option.id}
                    className={`preference-card ${formData.foodPreferences?.categories?.includes(option.id) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(option.id)}
                  >
                    <div className="preference-icon">{option.icon}</div>
                    <div className="preference-label">{option.label}</div>
                  </div>
                ))}
            </div>
            
            {categoryOptions.length > itemsPerPage && (
              <div className="pagination-controls">
                <button 
                  className="pagination-button prev" 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event propagation
                    setCurrentCategoryPage(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentCategoryPage === 0}
                  type="button" // Explicitly set as button type to avoid form submission
                >
                  <i className="bi bi-chevron-left"></i> Previous
                </button>
                
                <span className="page-indicator">
                  Page {currentCategoryPage + 1} of {Math.ceil(categoryOptions.length / itemsPerPage)}
                </span>
                
                <button 
                  className="pagination-button next" 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event propagation
                    setCurrentCategoryPage(prev => Math.min(Math.ceil(categoryOptions.length / itemsPerPage) - 1, prev + 1));
                  }}
                  disabled={currentCategoryPage >= Math.ceil(categoryOptions.length / itemsPerPage) - 1}
                  type="button" // Explicitly set as button type to avoid form submission
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
        
        <div className="navigation-buttons">
          <button type="button" onClick={prevStep} className="prev-button">
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default FoodPreferencesStep;

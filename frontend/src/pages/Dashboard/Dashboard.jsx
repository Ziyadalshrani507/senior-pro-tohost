import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaSort, FaSpinner, FaExclamationTriangle, FaStar, FaMapMarkerAlt, FaUtensils, FaRoute, FaHotel } from 'react-icons/fa';
import ItemModal from './ItemModal';
import DashboardStats from './DashboardStats';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { useDebounce } from '../../hooks/useDebounce';
import './Dashboard.css';

const ITEMS_PER_PAGE = 12;
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const Dashboard = () => {
  const { token } = useAuth();
  const [state, setState] = useState({
    activeTab: 'destinations',
    allItems: [],
    filteredItems: [],
    loading: true,
    error: null,
    stats: {
      destinations: { total: 0, avgRating: 0, activeItems: 0 },
      restaurants: { total: 0, avgRating: 0, activeItems: 0 },
      hotels: { total: 0, avgRating: 0, activeItems: 0 },
      tours: { total: 0, avgRating: 0, activeItems: 0 }
    },
    filters: {
      search: '',
      city: '',
      cuisine: '',
      priceRange: '',
      rating: '',
      popularity: '',
      locationCity: '',
      sortBy: 'name',
      page: 1,
      hotelClass: '',
      amenities: ''
    },
    selectedItems: [],
    isModalOpen: false,
    currentItem: null,
    schemaOptions: {
      cities: [],
      cuisines: [],
      categories: [],
      types: [],
      hotelClasses: [],
      amenities: []
    },
    isDeleting: false
  });

  const createAction = (type, payload) => {
    setState(prev => ({ ...prev, ...payload }));
  };

  // Fetch schema options for dropdowns
  const fetchSchemaOptions = useCallback(async () => {
    try {
      const endpoint = `${API_BASE_URL}/api/${state.activeTab}/schema-options`;
      
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch schema options');
      }
      
      const options = await response.json();
      createAction('SET_SCHEMA_OPTIONS', { schemaOptions: options });
    } catch (err) {
      console.error('Schema options error:', err);
      toast.error('Failed to load filter options');
    }
  }, [state.activeTab, token]);

  // Fetch all data at once
  const fetchData = useCallback(async () => {
    try {
      createAction('SET_LOADING', { loading: true });
      createAction('SET_ERROR', { error: null });
      
      const endpoint = `${API_BASE_URL}/api/${state.activeTab}`;
      
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch ${state.activeTab}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats based on endpoint type
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.items) {
        items = data.items;
      } else if (data.restaurants && state.activeTab === 'restaurants') {
        // Special handling for restaurants endpoint which returns {restaurants: [...]} format
        items = data.restaurants;
      } else if (data[state.activeTab]) {
        // Handle {[endpoint]: [...]} format (e.g., {hotels: [...]})
        items = data[state.activeTab];
      } else {
        // Fallback - try to find any array in the response
        const arrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
        if (arrayProps.length > 0) {
          items = data[arrayProps[0]];
        }
      }
      
      // Store all items
      createAction('SET_ALL_ITEMS', { allItems: items });
      
      // Calculate stats
      const totalItems = items.length;
      const activeItems = items.filter(item => !item.isDeleted).length;
      
      // Handle both object and number rating formats
      const avgRating = items.reduce((acc, item) => {
        let ratingValue = 0;
        if (item.rating) {
          if (typeof item.rating === 'object' && item.rating.average !== undefined) {
            ratingValue = item.rating.average;
          } else if (!isNaN(parseFloat(item.rating))) {
            ratingValue = parseFloat(item.rating);
          }
        }
        return acc + ratingValue;
      }, 0) / (totalItems || 1);
      
      createAction('SET_STATS', {
        stats: {
          ...state.stats,
          [state.activeTab]: {
            total: totalItems,
            activeItems,
            avgRating: Number(avgRating.toFixed(1))
          }
        }
      });

    } catch (err) {
      console.error('Fetch error:', err);
      createAction('SET_ERROR', { error: err.message });
      toast.error(`Error fetching ${state.activeTab}: ${err.message}`);
    } finally {
      createAction('SET_LOADING', { loading: false });
    }
  }, [state.activeTab, token]);

  // Client-side filtering and sorting logic
  const applyFilters = useCallback(() => {
    let filtered = [...state.allItems];

    // Apply search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.locationCity?.toLowerCase().includes(searchLower) ||
        item.categories?.some(cat => cat.toLowerCase().includes(searchLower)) ||
        item.amenities?.some(amenity => amenity.toLowerCase().includes(searchLower))
      );
    }

    // Apply type-specific filters
    if (state.activeTab === 'destinations') {
      if (state.filters.city) {
        filtered = filtered.filter(item => item.locationCity === state.filters.city);
      }
      if (state.filters.popularity) {
        filtered = filtered.filter(item => {
          const rating = item.rating || 0;
          switch (state.filters.popularity) {
            case 'high': return rating >= 4;
            case 'medium': return rating >= 3 && rating < 4;
            case 'low': return rating < 3;
            default: return true;
          }
        });
      }
    } else if (state.activeTab === 'restaurants') {
      // Restaurant filters
      if (state.filters.cuisine) {
        filtered = filtered.filter(item => item.cuisine === state.filters.cuisine);
      }
      if (state.filters.priceRange) {
        filtered = filtered.filter(item => item.priceRange === state.filters.priceRange);
      }
      if (state.filters.rating) {
        filtered = filtered.filter(item => item.rating >= Number(state.filters.rating));
      }
      if (state.filters.locationCity) {
        filtered = filtered.filter(item => item.locationCity === state.filters.locationCity);
      }
    } else if (state.activeTab === 'hotels') {
      // Hotel filters
      if (state.filters.hotelClass) {
        filtered = filtered.filter(item => item.hotelClass === state.filters.hotelClass);
      }
      if (state.filters.priceRange) {
        filtered = filtered.filter(item => item.priceRange === state.filters.priceRange);
      }
      if (state.filters.rating) {
        filtered = filtered.filter(item => item.rating >= Number(state.filters.rating));
      }
      if (state.filters.locationCity) {
        filtered = filtered.filter(item => item.locationCity === state.filters.locationCity);
      }
      if (state.filters.amenities) {
        filtered = filtered.filter(item => item.amenities?.includes(state.filters.amenities));
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price':
          return (a.priceRange?.length || 0) - (b.priceRange?.length || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Update filtered items
    createAction('SET_FILTERED_ITEMS', { filteredItems: filtered });
  }, [state.allItems, state.filters, state.activeTab]);

  // Handle editing an item
  const handleEdit = useCallback((item) => {
    // Ensure proper image handling by properly processing image URLs from both fields
    let processedItem = { ...item };

    if (state.activeTab === 'restaurants') {
      // For restaurants, ensure we use all available images from any field
      // This handles backward compatibility with old data format
      const allImages = [
        ...(Array.isArray(item.images) ? item.images : []),
        ...(Array.isArray(item.pictureUrls) ? item.pictureUrls : [])
      ];
      
      // Remove duplicates
      const uniqueImages = [...new Set(allImages)];
      
      // Set only the images field as per the Restaurant schema
      processedItem.images = uniqueImages;
      
      console.log('Edit restaurant with images:', uniqueImages);
    }
    
    createAction('SET_CURRENT_ITEM', { currentItem: processedItem });
    createAction('SET_MODAL_OPEN', { isModalOpen: true });
  }, [state.activeTab]);

  // Handle saving an item (create or update)
  const handleSave = useCallback(async (formData) => {
    try {
      const isEditing = !!formData._id;
      const endpoint = `${API_BASE_URL}/api/${state.activeTab}`;
      const url = isEditing ? `${endpoint}/${formData._id}` : endpoint;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save item');
      }

      // Parse the response JSON - CRITICAL: This can only be done ONCE per response
      // After you call response.json() once, you can't call it again on the same response
      const savedItem = await response.json();
      console.log('Received saved item from server:', savedItem);
      
      // Process the saved item to ensure images are properly handled
      let processedSavedItem = savedItem;
      
      if (state.activeTab === 'restaurants') {
        // Get all images from any field for backward compatibility
        const allImages = [
          ...(Array.isArray(savedItem.images) ? savedItem.images : []),
          ...(Array.isArray(savedItem.pictureUrls) ? savedItem.pictureUrls : [])
        ];
        
        // Remove duplicates
        const uniqueImages = [...new Set(allImages)];
        
        // Create a processed version with the correct field
        processedSavedItem = {
          ...savedItem,
          images: uniqueImages
        };
        
        console.log('Saved restaurant with images:', uniqueImages);
      }

      // Update local state with the processed item
      createAction('SET_ALL_ITEMS', {
        allItems: isEditing 
          ? state.allItems.map(item => item._id === processedSavedItem._id ? processedSavedItem : item)
          : [...state.allItems, processedSavedItem]
      });

      toast.success(`Item ${isEditing ? 'updated' : 'created'} successfully`);
      createAction('SET_MODAL_OPEN', { isModalOpen: false });
      createAction('SET_CURRENT_ITEM', { currentItem: null });
      
      // Refresh data to update stats
      fetchData();

    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message);
      throw error;
    }
  }, [state.activeTab, state.allItems, token, fetchData]);

  // Handle deleting items
  const handleDelete = useCallback(async (itemIds) => {
    if (!window.confirm('Are you sure you want to delete the selected items?')) {
      return;
    }

    try {
      createAction('SET_DELETING', { isDeleting: true });
      const endpoint = `${API_BASE_URL}/api/${state.activeTab}`;

      const deletePromises = itemIds.map(id =>
        fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(async response => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete item');
          }
          return response;
        })
      );

      await Promise.all(deletePromises);

      // Update local state
      createAction('SET_ALL_ITEMS', {
        allItems: state.allItems.filter(item => !itemIds.includes(item._id))
      });

      toast.success('Items deleted successfully');
      fetchData(); // Refresh data and stats

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete items: ' + error.message);
    } finally {
      createAction('SET_DELETING', { isDeleting: false });
    }
  }, [state.activeTab, state.allItems, token, fetchData]);

  // Effect to apply filters whenever filters or items change
  useEffect(() => {
    applyFilters();
  }, [state.filters, state.allItems, applyFilters]);

  // Effect to fetch data when tab changes
  useEffect(() => {
    fetchData();
    fetchSchemaOptions();
  }, [state.activeTab, fetchData, fetchSchemaOptions]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const start = (state.filters.page - 1) * ITEMS_PER_PAGE;
    return state.filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [state.filteredItems, state.filters.page]);

  const totalPages = Math.ceil(state.filteredItems.length / ITEMS_PER_PAGE);

  // Dashboard tabs
  const tabButtons = [
    { key: 'destinations', label: 'Destinations', icon: <FaMapMarkerAlt /> },
    { key: 'restaurants', label: 'Restaurants', icon: <FaUtensils /> },
    { key: 'hotels', label: 'Hotels', icon: <FaHotel /> },
    { key: 'tours', label: 'Tours', icon: <FaRoute /> }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="tab-buttons">
          {tabButtons.map(tab => (
            <button 
              key={tab.key}
              className={state.activeTab === tab.key ? 'active' : ''} 
              onClick={() => createAction('SET_ACTIVE_TAB', { activeTab: tab.key })}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="dashboard-actions">
          <button
            className="add-btn"
            onClick={() => createAction('SET_MODAL_OPEN', { isModalOpen: true })}
            title="Add new item"
          >
            <FaPlus /> Add New
          </button>
        </div>
      </div>

      <DashboardStats 
        stats={state.stats[state.activeTab]} 
        type={state.activeTab}
      />

      <FilterPanel
        type={state.activeTab}
        filters={state.filters}
        schemaOptions={state.schemaOptions}
        onFilterChange={(key, value) => createAction('SET_FILTERS', { 
          filters: { ...state.filters, [key]: value, page: 1 } 
        })}
        onResetFilters={() => createAction('SET_FILTERS', { 
          filters: { search: '', city: '', cuisine: '', priceRange: '', rating: '', 
                    popularity: '', locationCity: '', sortBy: 'name', page: 1, 
                    hotelClass: '', amenities: '' } 
        })}
      />

      {state.loading ? (
        <div className="loading">
          <FaSpinner className="spinner" /> Loading...
        </div>
      ) : state.error ? (
        <div className="error">
          <FaExclamationTriangle /> {state.error}
        </div>
      ) : (
        <>
          <div className="items-grid">
            {paginatedItems.map(item => (
              <div key={item._id} className="item-card">
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)}><FaEdit /></button>
                    <button onClick={() => handleDelete([item._id])}><FaTrash /></button>
                  </div>
                </div>
                <div className="item-content">
                  <p>{item.description}</p>
                  <div className="item-meta">
                    <span><FaMapMarkerAlt /> {item.locationCity}</span>
                    {item.rating && (
                      <span>
                        <FaStar />
                        {typeof item.rating === 'object' && item.rating.average !== undefined
                          ? parseFloat(item.rating.average).toFixed(1)
                          : parseFloat(item.rating || 0).toFixed(1)}
                      </span>
                    )}
                    {item.priceRange && <span>{item.priceRange}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={state.filters.page === 1}
                onClick={() => createAction('SET_FILTERS', { 
                  filters: { ...state.filters, page: state.filters.page - 1 } 
                })}
              >
                Previous
              </button>
              <span>Page {state.filters.page} of {totalPages}</span>
              <button 
                disabled={state.filters.page === totalPages}
                onClick={() => createAction('SET_FILTERS', { 
                  filters: { ...state.filters, page: state.filters.page + 1 } 
                })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {state.isModalOpen && (
        <ItemModal
          item={state.currentItem}
          type={state.activeTab}
          schemaOptions={state.schemaOptions}
          onSave={handleSave}
          onClose={() => {
            createAction('SET_MODAL_OPEN', { isModalOpen: false });
            createAction('SET_CURRENT_ITEM', { currentItem: null });
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

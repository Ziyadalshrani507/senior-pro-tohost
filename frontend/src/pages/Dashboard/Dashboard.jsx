import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaSort, FaSpinner, FaExclamationTriangle, FaStar, FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';
import ItemModal from './ItemModal';
import DashboardStats from './DashboardStats';
import { useDebounce } from '../../hooks/useDebounce';
import './Dashboard.css';

const ITEMS_PER_PAGE = 12;

const Dashboard = () => {
  const { token } = useAuth();
  const [state, setState] = useState({
    activeTab: 'destinations',
    items: [],
    loading: true,
    error: null,
    stats: {
      destinations: { total: 0, avgRating: 0, activeItems: 0 },
      restaurants: { total: 0, avgRating: 0, activeItems: 0 }
    },
    filters: {
      search: '',
      city: '',
      type: '',
      sortBy: 'name',
      page: 1
    },
    selectedItems: [],
    isModalOpen: false,
    currentItem: null,
    schemaOptions: {
      cities: [],
      types: [],
      categories: []
    },
    isDeleting: false
  });

  const createAction = (type, payload) => {
    setState(prev => ({ ...prev, ...payload }));
  };

  // Use custom debounce hook
  const debouncedSearch = useDebounce();

  // Fetch schema options for dropdowns
  const fetchSchemaOptions = useCallback(async () => {
    try {
      const endpoint = `/api/dashboard/schema-options?type=${state.activeTab}`;
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch schema options');
      
      const options = await response.json();
      createAction('SET_SCHEMA_OPTIONS', {
        schemaOptions: options || { cities: [], types: [], categories: [] }
      });
    } catch (err) {
      console.error('Error fetching schema options:', err);
      toast.error('Failed to load form options');
      // Set default empty options to prevent map errors
      createAction('SET_SCHEMA_OPTIONS', {
        schemaOptions: { cities: [], types: [], categories: [] }
      });
    }
  }, [state.activeTab, token]);

  const fetchData = useCallback(async () => {
    try {
      createAction('SET_LOADING', { loading: true });
      createAction('SET_ERROR', { error: null });
      
      const endpoint = state.activeTab === 'destinations' ? '/api/destinations' : '/api/restaurants';
      const queryParams = new URLSearchParams({
        search: state.filters.search,
        city: state.filters.city,
        type: state.filters.type,
        sort: state.filters.sortBy,
        page: state.filters.page,
        limit: ITEMS_PER_PAGE
      });

      const response = await fetch(`${endpoint}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      
      // Update items
      createAction('SET_ITEMS', { items: data.items || data });
      
      // Calculate stats
      const totalItems = data.total || data.length;
      const activeItems = data.items?.filter(item => !item.isDeleted).length || data.filter(item => !item.isDeleted).length;
      const avgRating = data.items?.reduce((acc, item) => acc + (item.rating || 0), 0) / totalItems || 
                       data.reduce((acc, item) => acc + (item.rating || 0), 0) / totalItems;
      
      createAction('SET_STATS', {
        stats: {
          ...state.stats,
          [state.activeTab]: {
            total: totalItems,
            activeItems,
            avgRating: avgRating || 0
          }
        }
      });

    } catch (err) {
      createAction('SET_ERROR', { error: err.message });
      toast.error(`Error fetching ${state.activeTab}: ${err.message}`);
    } finally {
      createAction('SET_LOADING', { loading: false });
    }
  }, [state.activeTab, state.filters, token]);

  // Memoized handlers
  const handleSearch = useCallback(
    (value) => {
      debouncedSearch(() => {
        createAction('SET_FILTERS', {
          filters: { ...state.filters, search: value, page: 1 }
        });
      });
    },
    [debouncedSearch, state.filters]
  );

  const handleFilterChange = useCallback((key, value) => {
    createAction('SET_FILTERS', {
      filters: { ...state.filters, [key]: value, page: 1 }
    });
  }, [state.filters]);

  const handleEdit = useCallback((item) => {
    createAction('SET_CURRENT_ITEM', { currentItem: item });
    createAction('SET_MODAL_OPEN', { isModalOpen: true });
  }, []);

  const handleSave = useCallback(async (formData) => {
    try {
      const endpoint = state.activeTab === 'destinations' ? '/api/destinations' : '/api/restaurants';
      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id ? `${endpoint}/${formData._id}` : endpoint;

      const response = await fetch(url, {
        method,
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

      toast.success(`${state.activeTab.slice(0, -1)} ${formData._id ? 'updated' : 'created'} successfully`);
      fetchData();
      createAction('SET_MODAL_OPEN', { isModalOpen: false });
      createAction('SET_CURRENT_ITEM', { currentItem: null });
    } catch (err) {
      toast.error(err.message);
    }
  }, [state.activeTab, token, fetchData]);

  const handleDelete = useCallback(async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) return;

    try {
      createAction('SET_DELETING', { isDeleting: true });
      const endpoint = state.activeTab === 'destinations' ? '/api/destinations' : '/api/restaurants';
      
      const deletePromises = ids.map(id =>
        fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      await Promise.all(deletePromises);
      
      toast.success(`${ids.length} item(s) deleted successfully`);
      createAction('SET_SELECTED_ITEMS', { selectedItems: [] });
      fetchData();
    } catch (err) {
      toast.error(`Failed to delete items: ${err.message}`);
    } finally {
      createAction('SET_DELETING', { isDeleting: false });
    }
  }, [state.activeTab, token, fetchData]);

  // Effects
  useEffect(() => {
    fetchData();
    fetchSchemaOptions();
  }, [fetchData, fetchSchemaOptions]);

  useEffect(() => {
    createAction('SET_SELECTED_ITEMS', { selectedItems: [] });
  }, [state.activeTab]);

  // Render helpers
  const renderFilters = () => (
    <div className="search-filters">
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search by name..."
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      <select
        value={state.filters.city}
        onChange={(e) => handleFilterChange('city', e.target.value)}
      >
        <option value="">All Cities</option>
        {(state.schemaOptions.cities || []).map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {state.activeTab === 'destinations' && (
        <select
          value={state.filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          {(state.schemaOptions.types || []).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}

      <select
        value={state.filters.sortBy}
        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
      >
        <option value="name">Name</option>
        <option value="rating">Rating</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>
  );

  const renderItems = () => (
    <section className="items-grid">
      {state.loading ? (
        <div className="loading">
          <div className="loading-spinner" />
          <p>Loading {state.activeTab}...</p>
        </div>
      ) : state.items.length === 0 ? (
        <div className="empty-state">
          <p>No {state.activeTab} found. Try adjusting your filters or add a new item.</p>
        </div>
      ) : (
        state.items.map(item => (
          <div key={item._id} className="item-card">
            <input
              type="checkbox"
              checked={state.selectedItems.includes(item._id)}
              onChange={() => {
                createAction('SET_SELECTED_ITEMS', {
                  selectedItems: state.selectedItems.includes(item._id)
                    ? state.selectedItems.filter(id => id !== item._id)
                    : [...state.selectedItems, item._id]
                });
              }}
              className="item-checkbox"
            />
            <div className="image-container">
              {item.pictureUrls?.[0] ? (
                <img 
                  src={item.pictureUrls[0]} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/no-image.jpg';
                  }}
                />
              ) : (
                <div className="no-image">
                  <span>No image available</span>
                </div>
              )}
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.locationCity}</p>
              <div className="item-rating">
                <FaStar /> {item.rating?.toFixed(1) || 'N/A'}
              </div>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)} title="Edit">
                <FaEdit />
              </button>
              <button 
                onClick={() => handleDelete([item._id])}
                disabled={state.isDeleting}
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );

  return (
    <div className="dashboard-container">
      {state.error && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <span>{state.error}</span>
        </div>
      )}

      <DashboardStats stats={state.stats} activeTab={state.activeTab} />

      <nav className="dashboard-nav">
        <div className="tab-buttons">
          <button
            className={`tab-button ${state.activeTab === 'destinations' ? 'active' : ''}`}
            onClick={() => createAction('SET_ACTIVE_TAB', { activeTab: 'destinations' })}
          >
            <FaMapMarkerAlt /> Destinations
          </button>
          <button
            className={`tab-button ${state.activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => createAction('SET_ACTIVE_TAB', { activeTab: 'restaurants' })}
          >
            <FaUtensils /> Restaurants
          </button>
        </div>
      </nav>

      <section className="dashboard-controls">
        {renderFilters()}
        <div className="action-buttons">
          <button 
            className="add-button" 
            onClick={() => {
              createAction('SET_CURRENT_ITEM', { currentItem: null });
              createAction('SET_MODAL_OPEN', { isModalOpen: true });
            }}
          >
            <FaPlus /> Add New
          </button>
          {state.selectedItems.length > 0 && (
            <button 
              className="delete-button" 
              onClick={() => handleDelete(state.selectedItems)}
              disabled={state.isDeleting}
            >
              {state.isDeleting ? <FaSpinner className="spin" /> : <FaTrash />}
              Delete Selected ({state.selectedItems.length})
            </button>
          )}
        </div>
      </section>

      {renderItems()}

      <ItemModal
        isOpen={state.isModalOpen}
        onClose={() => {
          createAction('SET_MODAL_OPEN', { isModalOpen: false });
          createAction('SET_CURRENT_ITEM', { currentItem: null });
        }}
        item={state.currentItem}
        type={state.activeTab}
        onSave={handleSave}
        schemaOptions={state.schemaOptions}
      />
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaSort, FaSpinner, FaExclamationTriangle, FaStar, FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';
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
      restaurants: { total: 0, avgRating: 0, activeItems: 0 }
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
      page: 1
    },
    selectedItems: [],
    isModalOpen: false,
    currentItem: null,
    schemaOptions: {
      cities: [],
      cuisines: [],
      categories: [],
      types: []
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
      const items = Array.isArray(data) ? data : data.items || [];
      
      // Store all items
      createAction('SET_ALL_ITEMS', { allItems: items });
      
      // Calculate stats
      const totalItems = items.length;
      const activeItems = items.filter(item => !item.isDeleted).length;
      const avgRating = items.reduce((acc, item) => acc + (item.rating || 0), 0) / totalItems || 0;
      
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
        item.categories?.some(cat => cat.toLowerCase().includes(searchLower))
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
    } else {
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
    createAction('SET_CURRENT_ITEM', { currentItem: item });
    createAction('SET_MODAL_OPEN', { isModalOpen: true });
  }, []);

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

      const savedItem = await response.json();

      // Update local state
      createAction('SET_ALL_ITEMS', {
        allItems: isEditing 
          ? state.allItems.map(item => item._id === savedItem._id ? savedItem : item)
          : [...state.allItems, savedItem]
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="tab-buttons">
          <button 
            className={state.activeTab === 'destinations' ? 'active' : ''} 
            onClick={() => createAction('SET_ACTIVE_TAB', { activeTab: 'destinations' })}
          >
            <FaMapMarkerAlt /> Destinations
          </button>
          <button 
            className={state.activeTab === 'restaurants' ? 'active' : ''} 
            onClick={() => createAction('SET_ACTIVE_TAB', { activeTab: 'restaurants' })}
          >
            <FaUtensils /> Restaurants
          </button>
        </div>

        <div className="dashboard-actions">
          <button
            className="add-btn"
            onClick={() => handleEdit(null)}
            title="Add new item"
          >
            <FaPlus /> Add New
          </button>
          {state.selectedItems.length > 0 && (
            <button
              className="delete-btn"
              onClick={() => handleDelete(state.selectedItems)}
              disabled={state.isDeleting}
            >
              {state.isDeleting ? <FaSpinner className="spinner" /> : <FaTrash />}
              Delete Selected ({state.selectedItems.length})
            </button>
          )}
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
                    popularity: '', locationCity: '', sortBy: 'name', page: 1 } 
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
                    {item.rating && <span><FaStar /> {item.rating.toFixed(1)}</span>}
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
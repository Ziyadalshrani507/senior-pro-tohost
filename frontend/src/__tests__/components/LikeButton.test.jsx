import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LikeButton from '../../components/LikeButton/LikeButton';
import * as authUtils from '../../utils/authUtils';
import * as api from '../../services/api';

// Mock the API calls and auth functions
vi.mock('../../services/api', () => ({
  toggleLike: vi.fn(),
  getPlaceLikeStatus: vi.fn()
}));

vi.mock('../../utils/authUtils', () => ({
  isAuthenticated: vi.fn(),
  getAuthToken: vi.fn()
}));

describe('LikeButton Component', () => {
  const defaultProps = {
    placeId: '123456789',
    placeType: 'destination'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default to logged out state
    authUtils.isAuthenticated.mockReturnValue(false);
    authUtils.getAuthToken.mockReturnValue(null);
    
    // Default API responses
    api.toggleLike.mockResolvedValue({
      success: true,
      isLiked: true,
      likeCount: 1
    });
    
    api.getPlaceLikeStatus.mockResolvedValue({
      success: true,
      isLiked: false,
      likeCount: 0
    });
  });

  it('should render the like button in initial state', async () => {
    render(
      <BrowserRouter>
        <LikeButton {...defaultProps} />
      </BrowserRouter>
    );

    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toBeInTheDocument();

    // Should show empty heart icon by default
    expect(likeButton.querySelector('.bi-heart')).toBeInTheDocument();
    expect(likeButton.querySelector('.bi-heart-fill')).not.toBeInTheDocument();
  });

  it('should show login prompt when clicked while not authenticated', async () => {
    render(
      <BrowserRouter>
        <LikeButton {...defaultProps} />
      </BrowserRouter>
    );

    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);

    // Should show login prompt modal
    const loginPrompt = await screen.findByTestId('login-prompt-modal');
    expect(loginPrompt).toBeInTheDocument();
    expect(screen.getByText(/Please log in to like/i)).toBeInTheDocument();
    
    // No API call should be made
    expect(api.toggleLike).not.toHaveBeenCalled();
  });

  it('should toggle like when authenticated user clicks', async () => {
    // Mock authenticated user
    authUtils.isAuthenticated.mockReturnValue(true);
    authUtils.getAuthToken.mockReturnValue('fake-token');

    render(
      <BrowserRouter>
        <LikeButton {...defaultProps} />
      </BrowserRouter>
    );

    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);

    // Should call API to toggle like
    expect(api.toggleLike).toHaveBeenCalledWith(
      defaultProps.placeType,
      defaultProps.placeId,
      expect.any(String) // token
    );

    // Should show filled heart after liking
    await waitFor(() => {
      expect(likeButton.querySelector('.bi-heart-fill')).toBeInTheDocument();
    });
  });

  it('should show filled heart when place is already liked', async () => {
    // Mock authenticated user
    authUtils.isAuthenticated.mockReturnValue(true);
    authUtils.getAuthToken.mockReturnValue('fake-token');
    
    // Mock that the place is already liked
    api.getPlaceLikeStatus.mockResolvedValue({
      success: true,
      isLiked: true,
      likeCount: 1
    });

    render(
      <BrowserRouter>
        <LikeButton {...defaultProps} />
      </BrowserRouter>
    );

    // Should show filled heart for already liked place
    await waitFor(() => {
      const likeButton = screen.getByTestId('like-button');
      expect(likeButton.querySelector('.bi-heart-fill')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock authenticated user
    authUtils.isAuthenticated.mockReturnValue(true);
    authUtils.getAuthToken.mockReturnValue('fake-token');
    
    // Mock API error
    api.toggleLike.mockRejectedValue(new Error('API Error'));
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <LikeButton {...defaultProps} />
      </BrowserRouter>
    );

    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);

    // Should log error but not crash
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show accurate like count for admins', async () => {
    // Mock admin user
    authUtils.isAuthenticated.mockReturnValue(true);
    authUtils.getAuthToken.mockReturnValue('fake-token');
    
    // Mock that the place has 5 likes
    api.getPlaceLikeStatus.mockResolvedValue({
      success: true,
      isLiked: true,
      likeCount: 5
    });

    render(
      <BrowserRouter>
        <LikeButton {...defaultProps} showCount={true} />
      </BrowserRouter>
    );

    // Should show the like count
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});

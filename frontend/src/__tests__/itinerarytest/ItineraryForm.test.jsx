import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItineraryForm from '../../components/ItineraryPlanner/ItineraryForm';

// Import safeguards to prevent real API calls
import '../../test/safeguards';

// Mock the steps
vi.mock('../../components/ItineraryPlanner/steps/DestinationStep', () => ({
  default: () => <div data-testid="destination-step">Destination Step</div>
}));

vi.mock('../../components/ItineraryPlanner/steps/DurationStep', () => ({
  default: () => <div data-testid="duration-step">Duration Step</div>
}));

vi.mock('../../components/ItineraryPlanner/steps/InterestsStep', () => ({
  default: () => <div data-testid="interests-step">Interests Step</div>
}));

vi.mock('../../components/ItineraryPlanner/steps/FoodPreferencesStep', () => ({
  default: () => <div data-testid="food-preferences-step">Food Preferences Step</div>
}));

vi.mock('../../components/ItineraryPlanner/steps/BudgetStep', () => ({
  default: () => <div data-testid="budget-step">Budget Step</div>
}));

vi.mock('../../components/ItineraryPlanner/steps/TravelersStep', () => ({
  default: () => <div data-testid="travelers-step">Travelers Step</div>
}));

vi.mock('../../components/ItineraryPlanner/steps/ReviewStep', () => ({
  default: () => <div data-testid="review-step">Review Step</div>
}));

// Mock the Itinerary Context
const mockContext = {
  currentStep: 1,
  setCurrentStep: vi.fn(),
  formData: {},
  updateFormData: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  generateItinerary: vi.fn(),
  isGenerating: false,
  itinerary: null,
  error: null
};

vi.mock('../../context/ItineraryContext', () => ({
  useItinerary: () => mockContext
}));

describe('ItineraryForm Component', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    // Reset mock functions
    mockContext.setCurrentStep.mockReset();
    mockContext.updateFormData.mockReset();
    mockContext.nextStep.mockReset();
    mockContext.prevStep.mockReset();
    mockContext.generateItinerary.mockReset();
    
    // Reset context values
    mockContext.currentStep = 1;
    mockContext.isGenerating = false;
    mockContext.itinerary = null;
    mockContext.error = null;
    
    console.log('🔒 Test environment initialized - No real API calls will be made');
  });

  it('renders the form with correct step 1 (Destination)', () => {
    mockContext.currentStep = 1;
    
    render(<ItineraryForm />);
    
    // Check progress bar is at correct position
    const progressBar = document.querySelector('.progress');
    expect(progressBar).toHaveStyle({ width: `${(1 / 7) * 100}%` });
    
    // Check step indicators are showing correctly
    const stepIndicators = document.querySelectorAll('.step');
    expect(stepIndicators).toHaveLength(7);
    expect(stepIndicators[0]).toHaveClass('active');
    expect(stepIndicators[1]).not.toHaveClass('active');
    
    // Check the correct step is rendered
    expect(screen.getByTestId('destination-step')).toBeInTheDocument();
  });

  it('renders the form with correct step 2 (Duration)', () => {
    mockContext.currentStep = 2;
    
    render(<ItineraryForm />);
    
    // Check progress bar is at correct position
    const progressBar = document.querySelector('.progress');
    expect(progressBar).toHaveStyle({ width: `${(2 / 7) * 100}%` });
    
    // Check step indicators are showing correctly
    const stepIndicators = document.querySelectorAll('.step');
    expect(stepIndicators[0]).toHaveClass('active');
    expect(stepIndicators[1]).toHaveClass('active');
    expect(stepIndicators[2]).not.toHaveClass('active');
    
    // Check the correct step is rendered
    expect(screen.getByTestId('duration-step')).toBeInTheDocument();
  });

  it('renders the form with correct step 3 (Interests)', () => {
    mockContext.currentStep = 3;
    
    render(<ItineraryForm />);
    
    // Check step indicators and content
    const stepIndicators = document.querySelectorAll('.step');
    expect(stepIndicators[2]).toHaveClass('active');
    expect(screen.getByTestId('interests-step')).toBeInTheDocument();
  });

  it('renders the form with correct step 4 (Food Preferences)', () => {
    mockContext.currentStep = 4;
    
    render(<ItineraryForm />);
    
    // Check step indicators and content
    const stepIndicators = document.querySelectorAll('.step');
    expect(stepIndicators[3]).toHaveClass('active');
    expect(screen.getByTestId('food-preferences-step')).toBeInTheDocument();
  });

  it('renders the form with correct step 5 (Budget)', () => {
    mockContext.currentStep = 5;
    
    render(<ItineraryForm />);
    
    // Check step indicators and content
    const stepIndicators = document.querySelectorAll('.step');
    expect(stepIndicators[4]).toHaveClass('active');
    expect(screen.getByTestId('budget-step')).toBeInTheDocument();
  });

  it('renders the form with correct step 6 (Travelers)', () => {
    mockContext.currentStep = 6;
    
    render(<ItineraryForm />);
    
    // Check step indicators and content
    const stepIndicators = document.querySelectorAll('.step');
    expect(stepIndicators[5]).toHaveClass('active');
    expect(screen.getByTestId('travelers-step')).toBeInTheDocument();
  });

  it('renders the form with correct step 7 (Review)', () => {
    mockContext.currentStep = 7;
    
    render(<ItineraryForm />);
    
    // Check progress bar is at 100%
    const progressBar = document.querySelector('.progress');
    expect(progressBar).toHaveStyle({ width: '100%' });
    
    // Check all step indicators are active
    const stepIndicators = document.querySelectorAll('.step');
    stepIndicators.forEach(indicator => {
      expect(indicator).toHaveClass('active');
    });
    
    // Check the review step is rendered
    expect(screen.getByTestId('review-step')).toBeInTheDocument();
  });
});

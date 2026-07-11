import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PersonalizedPlanForm } from '@/components/forms/PersonalizedPlanForm';

// Mock I18n Context to bypass actual translations
jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en'
  })
}));

describe('PersonalizedPlanForm', () => {
  const mockOnPlanGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render form fields properly with accessible labels', () => {
    render(<PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />);
    expect(screen.getByLabelText('locationLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('familySizeLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('vulnerabilitiesLabel')).toBeInTheDocument();
  });

  it('should successfully submit form and call onPlanGenerated callback', async () => {
    const mockResponse = {
      preparednessPlan: "Action Plan",
      emergencyChecklists: [],
      safetyRecommendations: []
    };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    render(<PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />);

    // Simulate user input
    fireEvent.change(screen.getByLabelText('locationLabel'), { target: { value: 'Chennai' } });
    fireEvent.change(screen.getByLabelText('familySizeLabel'), { target: { value: '3' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

    // Verify loading state appears
    expect(screen.getByRole('button', { name: 'submittingButton' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnPlanGenerated).toHaveBeenCalledWith(mockResponse);
    });

    // Verify correct payload was sent, including the i18n language flag
    expect(global.fetch).toHaveBeenCalledWith('/api/preparedness-plan', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        location: 'Chennai',
        familySize: 3,
        vulnerabilities: [],
        language: 'en'
      })
    }));
  });

  it('should throw fatalError to trigger ErrorBoundary when API fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });

    class TestBoundary extends React.Component<any, { hasError: boolean }> {
      state = { hasError: false };
      static getDerivedStateFromError() { return { hasError: true }; }
      componentDidCatch() {}
      render() { return this.state.hasError ? <div>Caught Error Boundary Triggered</div> : this.props.children; }
    }

    render(
      <TestBoundary>
        <PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />
      </TestBoundary>
    );

    fireEvent.change(screen.getByLabelText('locationLabel'), { target: { value: 'Kolkata' } });
    fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

    await waitFor(() => {
      expect(screen.getByText('Caught Error Boundary Triggered')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PersonalizedPlanForm } from '@/components/forms/PersonalizedPlanForm';

// Mock I18n Context with type-safe return
jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: jest.fn(),
  }),
}));

describe('PersonalizedPlanForm', () => {
  const mockOnPlanGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render all form fields with accessible labels', () => {
    render(<PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />);
    expect(screen.getByLabelText('locationLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('familySizeLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('vulnerabilitiesLabel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'submitButton' })).toBeInTheDocument();
  });

  it('should submit the form and call onPlanGenerated with phased response', async () => {
    const mockResponse = {
      preparednessPlan: {
        before: 'Prepare supplies',
        during: 'Stay safe',
        after: 'Recover',
      },
      emergencyChecklists: {
        before: ['Buy kit'],
        during: ['Stay indoors'],
        after: ['Check damage'],
      },
      safetyRecommendations: ['Keep meds ready'],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />);

    fireEvent.change(screen.getByLabelText('locationLabel'), { target: { value: 'Chennai' } });
    fireEvent.change(screen.getByLabelText('familySizeLabel'), { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

    await waitFor(() => {
      expect(mockOnPlanGenerated).toHaveBeenCalledWith(mockResponse);
    });

    // Verify correct payload with language field
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/preparedness-plan',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          location: 'Chennai',
          familySize: 3,
          vulnerabilities: [],
          language: 'en',
        }),
      })
    );
  });

  it('should trigger ErrorBoundary when API returns non-ok response', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    class TestBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      state = { hasError: false };
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      componentDidCatch() {}
      render() {
        return this.state.hasError ? (
          <div>ErrorBoundary Activated</div>
        ) : (
          this.props.children
        );
      }
    }

    render(
      <TestBoundary>
        <PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />
      </TestBoundary>
    );

    fireEvent.change(screen.getByLabelText('locationLabel'), { target: { value: 'Kolkata' } });
    fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

    await waitFor(() => {
      expect(screen.getByText('ErrorBoundary Activated')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});

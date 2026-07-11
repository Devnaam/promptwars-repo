import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PersonalizedPlanForm } from '@/components/forms/PersonalizedPlanForm';

const setLocaleMock = jest.fn();

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: setLocaleMock,
  }),
}));

describe('PersonalizedPlanForm', () => {
  const mockOnPlanGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders all form fields with accessible labels', () => {
    render(<PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />);

    expect(screen.getByLabelText('locationLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('familySizeLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('vulnerabilitiesLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('languageLabel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'submitButton' })).toBeInTheDocument();
  });

  it('submits the form and calls onPlanGenerated with phased response', async () => {
    const mockResponse = {
      preparednessPlan: {
        before: 'Prepare supplies',
        during: 'Stay safe',
        after: 'Recover',
      },
      travelAdvisory: 'Avoid low-lying roads.',
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

  it('shows a local error message when API returns non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    render(<PersonalizedPlanForm onPlanGenerated={mockOnPlanGenerated} />);

    fireEvent.change(screen.getByLabelText('locationLabel'), { target: { value: 'Kolkata' } });
    fireEvent.click(screen.getByRole('button', { name: 'submitButton' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('errorMessage');
    });

    expect(mockOnPlanGenerated).not.toHaveBeenCalled();
  });
});

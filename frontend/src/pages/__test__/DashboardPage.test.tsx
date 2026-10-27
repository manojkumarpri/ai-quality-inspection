import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../DashboardPage';
import * as dashboardApi from '../../services/dashboard.api';

vi.mock('../../services/dashboard.api', () => ({
  getDashboardKPIs: vi.fn(),
}));

describe('DashboardPage Component', () => {
  const mockKpis = {
    totalInspected: 10,
    passed: 6,
    rejected: 4,
    defectRate: 40,
    aiAcceptanceRate: 80,
    defectBreakdown: [
      { defectType: 'Scratch', count: 1 },
      { defectType: 'Dent', count: 2 },
      { defectType: 'Paint Issue', count: 1 },
      { defectType: 'Missing Component', count: 0 },
      { defectType: 'No Defect', count: 6 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.spyOn(dashboardApi, 'getDashboardKPIs').mockReturnValue(new Promise(() => {})); 
    render(<DashboardPage />);
    expect(screen.getByText(/aggregating executive quality metrics/i)).toBeInTheDocument();
  });

  it('renders KPI summary cards and defect breakdown when data loads', async () => {
    vi.spyOn(dashboardApi, 'getDashboardKPIs').mockResolvedValue(mockKpis);
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Executive Quality & Performance Analytics')).toBeInTheDocument();
    });

    // Verify KPI metrics matching exact component strings
    expect(screen.getByText('10')).toBeInTheDocument(); // Total inspected
    expect(screen.getByText('40%')).toBeInTheDocument(); // Defect rate
    expect(screen.getByText('80%')).toBeInTheDocument(); // AI acceptance rate
    expect(screen.getByText('6')).toBeInTheDocument(); // Passed count

    // Verify Defect Category Breakdown categories
    expect(screen.getByText('Scratch')).toBeInTheDocument();
    expect(screen.getByText('Dent')).toBeInTheDocument();
    expect(screen.getByText('Paint Issue')).toBeInTheDocument();
    expect(screen.getByText('Missing Component')).toBeInTheDocument();
  });
});
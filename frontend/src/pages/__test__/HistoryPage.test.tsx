import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistoryPage from '../HistoryPage';
import * as inspectionsApi from '../../services/inspections.api';

vi.mock('../../services/inspections.api', () => ({
  getInspections: vi.fn(),
  fetchInspectionImage: vi.fn(),
}));

describe('HistoryPage Component', () => {
  const mockInspections = [
    {
      id: 'insp-1',
      batchId: 'batch-123',
      batchCode: 'BATCH-001',
      productName: 'Steel Bracket',
      aiPredictedDefectType: 'Dent',
      aiConfidence: 0.83,
      finalDefectType: 'Paint Issue',
      wasOverridden: true,
      inspector: 'Priya Singh',
      inspectedAt: '2026-08-03T09:14:00Z',
      imageUrl: 's3://mock-image.jpg',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inspection audit trail list correctly with overrides and confidence scores', async () => {
    vi.spyOn(inspectionsApi, 'getInspections').mockResolvedValue(mockInspections);
    vi.spyOn(inspectionsApi, 'fetchInspectionImage').mockResolvedValue('blob:http://localhost/mock-blob');

    render(<HistoryPage />);

    expect(await screen.findByText('BATCH-001')).toBeInTheDocument();
    expect(screen.getByText('Steel Bracket')).toBeInTheDocument();
    expect(screen.getByText('Priya Singh')).toBeInTheDocument();
    expect(screen.getByText('83.0% confidence')).toBeInTheDocument();
    expect(screen.getByText('Human Override')).toBeInTheDocument();
    
    // Use getAllByText since 'Paint Issue' is present in both the table row and the filter dropdown
    const paintIssueElements = screen.getAllByText('Paint Issue');
    expect(paintIssueElements.length).toBeGreaterThan(0);
  });

  it('renders empty state message when no inspections match the criteria', async () => {
    vi.spyOn(inspectionsApi, 'getInspections').mockResolvedValue([]);

    render(<HistoryPage />);

    expect(await screen.findByText('No inspection records found')).toBeInTheDocument();
  });

  it('triggers filter change when selecting a defect filter dropdown', async () => {
    const getInspectionsSpy = vi.spyOn(inspectionsApi, 'getInspections').mockResolvedValue([]);
    render(<HistoryPage />);

    await screen.findByText('No inspection records found');

    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'Scratch' } });

    expect(getInspectionsSpy).toHaveBeenCalledWith({ defectType: 'Scratch' });
  });
});
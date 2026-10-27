import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InspectPage from '../InspectPage';
import * as batchesApi from '../../services/batches.api';
import * as inspectionsApi from '../../services/inspections.api';

vi.mock('../../services/batches.api', () => ({
  getBatches: vi.fn(),
}));

vi.mock('../../services/inspections.api', () => ({
  predictDefect: vi.fn(),
  submitInspection: vi.fn(),
}));

describe('InspectPage Component', () => {
  const mockBatches = [
    { 
      id: 'b1', 
      batchCode: 'BATCH-001', 
      productName: 'Steel Bracket', 
      productionLine: 'Line 3',
      createdAt: '2026-08-03T08:00:00Z'
    },
  ];

  const mockPrediction = {
    predictionId: 'pred-999',
    batchId: 'b1',
    imageRef: 'img-ref',
    imageUrl: 's3://image.jpg',
    predictedDefectType: 'Scratch',
    confidence: 0.95,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows a Quality Engineer to run AI analysis and submit an inspection', async () => {
    vi.spyOn(batchesApi, 'getBatches').mockResolvedValue(mockBatches);
    vi.spyOn(inspectionsApi, 'predictDefect').mockResolvedValue(mockPrediction);
    
    // Mock submitInspection to return a valid InspectionRecord matching backend types
    vi.spyOn(inspectionsApi, 'submitInspection').mockResolvedValue({
      id: 'insp-new',
      batchId: 'b1',
      batchCode: 'BATCH-001',
      productName: 'Steel Bracket',
      aiPredictedDefectType: 'Scratch',
      aiConfidence: 0.95,
      finalDefectType: 'Scratch',
      wasOverridden: false,
      inspector: 'Quality Engineer',
      inspectedAt: '2026-10-27T11:34:00Z',
      imageUrl: 's3://image.jpg',
    });

    const { container } = render(<InspectPage isQualityEngineer={true} />);

    // Wait for batches to load
    expect(await screen.findByText(/BATCH-001/i)).toBeInTheDocument();

    // Simulate file upload safely using container query for the file input
    const file = new File(['dummy content'], 'unit-photo.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    // Click Run AI Analysis
    const runAiBtn = screen.getByRole('button', { name: /Run AI Defect Analysis/i });
    fireEvent.click(runAiBtn);

    // Wait for AI results to populate in PredictionReview
    await waitFor(() => {
      expect(screen.getByText('95.0%')).toBeInTheDocument();
    });

    // Commit Inspection
    const commitBtn = screen.getByRole('button', { name: /Confirm & Commit Inspection/i });
    fireEvent.click(commitBtn);

    await waitFor(() => {
      expect(inspectionsApi.submitInspection).toHaveBeenCalledTimes(1);
    });
  });

  it('displays supervisor read-only warning when user is not a quality engineer', async () => {
    vi.spyOn(batchesApi, 'getBatches').mockResolvedValue(mockBatches);

    render(<InspectPage isQualityEngineer={false} />);

    expect(await screen.findByText(/Supervisor Read-Only Mode Active/i)).toBeInTheDocument();
  });
});
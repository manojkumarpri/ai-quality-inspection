import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PredictionReview from '../PredictionReview';

describe('PredictionReview Component', () => {
  const mockPrediction = {
    predictionId: 'pred-123',
    batchId: 'batch-123',
    imageRef: 'ref-xyz',
    imageUrl: 's3://mock-image.jpg',
    predictedDefectType: 'Dent',
    confidence: 0.83,
  };

  it('renders placeholder state when prediction is null', () => {
    render(
      <PredictionReview
        prediction={null}
        finalDefect=""
        onDefectChange={() => {}}
        comments=""
        onCommentsChange={() => {}}
        onSubmit={() => {}}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('Awaiting AI Vision Analysis')).toBeInTheDocument();
  });

  it('renders AI prediction results and calculates human override status', () => {
    render(
      <PredictionReview
        prediction={mockPrediction}
        finalDefect="Paint Issue" // Different from AI 'Dent' -> Triggers override
        onDefectChange={() => {}}
        comments=""
        onCommentsChange={() => {}}
        onSubmit={() => {}}
        isSubmitting={false}
      />
    );

    const dentElements = screen.getAllByText('Dent');
    expect(dentElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('83.0%')).toBeInTheDocument();
    expect(screen.getByText(/Human Override Detected/i)).toBeInTheDocument();
  });

  it('calls onSubmit when confirm button is clicked', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(
      <PredictionReview
        prediction={mockPrediction}
        finalDefect="Dent"
        onDefectChange={() => {}}
        comments="Looks good"
        onCommentsChange={() => {}}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirm & Commit Inspection/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
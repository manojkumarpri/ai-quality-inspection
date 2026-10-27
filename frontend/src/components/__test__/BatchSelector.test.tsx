import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BatchSelector from '../BatchSelector';
import { Batch } from '../../types/api';

describe('BatchSelector Component', () => {
  const mockBatches: Batch[] = [
    {
      id: 'b1',
      batchCode: 'BATCH-001',
      productName: 'Steel Bracket',
      productionLine: 'Line A',
      createdAt: '2026-10-27T08:00:00Z',
    },
    {
      id: 'b2',
      batchCode: 'BATCH-002',
      productName: 'Aluminum Housing',
      productionLine: 'Line B',
      createdAt: '2026-10-27T09:00:00Z',
    },
  ];

  it('renders batch selector with combobox and batch options correctly', () => {
    render(
      <BatchSelector
        batches={mockBatches}
        selectedBatchId=""
        onBatchChange={() => {}}
      />
    );

    // Verify the combobox exists
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // Verify that the batch options are present by matching their unique batch codes
    expect(screen.getByText(/BATCH-001/i)).toBeInTheDocument();
    expect(screen.getByText(/BATCH-002/i)).toBeInTheDocument();
  });

  it('triggers onBatchChange when a batch is chosen', () => {
    const handleBatchChange = vi.fn();

    render(
      <BatchSelector
        batches={mockBatches}
        selectedBatchId=""
        onBatchChange={handleBatchChange}
      />
    );

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'b1' } });

    expect(handleBatchChange).toHaveBeenCalledWith('b1');
  });
});
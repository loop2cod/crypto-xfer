import { render, screen } from '@testing-library/react';
import TransferTimeline from '../transfer-timeline';
import { TransferResponse } from '@/services/transfer';

// Mock the useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockTransfer: TransferResponse = {
  id: '123',
  transfer_id: 'TXF-123',
  user_id: 'user-123',
  type: 'crypto_to_fiat',
  amount: 1000,
  fee: 50,
  net_amount: 950,
  currency: 'USD',
  status: 'completed',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T12:00:00Z',
  completed_at: '2024-01-01T12:00:00Z',
  status_history: [
    {
      to_status: 'pending',
      timestamp: '2024-01-01T10:00:00Z',
      changed_by: 'system',
      changed_by_name: 'System',
      message: 'Transfer created',
    },
    {
      to_status: 'crypto_deposited',
      timestamp: '2024-01-01T10:30:00Z',
      changed_by: 'system',
      changed_by_name: 'System',
      message: 'Crypto deposit detected',
    },
    {
      to_status: 'completed',
      timestamp: '2024-01-01T12:00:00Z',
      changed_by: 'admin',
      changed_by_name: 'Admin User',
      message: 'Transfer completed successfully',
    },
  ],
};

describe('TransferTimeline', () => {
  it('renders timeline with status history', () => {
    render(<TransferTimeline transfer={mockTransfer} />);
    
    // Check that status labels are rendered
    expect(screen.getByText('Transfer Created')).toBeInTheDocument();
    expect(screen.getByText('Crypto Deposit Detected')).toBeInTheDocument();
    expect(screen.getByText('Transfer Completed')).toBeInTheDocument();
    
    // Check that timestamps are rendered
    expect(screen.getByText('1/1/2024, 10:00:00 AM')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024, 10:30:00 AM')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024, 12:00:00 PM')).toBeInTheDocument();
    
    // Check that changed_by information is shown
    expect(screen.getByText('Changed by: System')).toBeInTheDocument();
    expect(screen.getByText('Changed by: Admin User')).toBeInTheDocument();
    
    // Check that messages are shown
    expect(screen.getByText('Transfer created')).toBeInTheDocument();
    expect(screen.getByText('Crypto deposit detected')).toBeInTheDocument();
    expect(screen.getByText('Transfer completed successfully')).toBeInTheDocument();
  });

  it('renders fallback timeline when no status history', () => {
    const transferWithoutHistory: TransferResponse = {
      ...mockTransfer,
      status_history: undefined,
    };
    
    render(<TransferTimeline transfer={transferWithoutHistory} />);
    
    // Should show basic timeline
    expect(screen.getByText('Transfer Created')).toBeInTheDocument();
    expect(screen.getByText('Transfer Completed')).toBeInTheDocument();
  });

  it('shows crypto transaction hash for relevant statuses', () => {
    const transferWithTxHash: TransferResponse = {
      ...mockTransfer,
      crypto_tx_hash: '0x1234567890abcdef',
    };
    
    render(<TransferTimeline transfer={transferWithTxHash} />);
    
    // Should show transaction hash for crypto_deposited status
    expect(screen.getByText('TX: 0x1234567890abcdef')).toBeInTheDocument();
  });
});
import { v4 as uuidv4 } from 'uuid';
import { IPayment } from '../types';
import * as paymentService from './paymentService';

// Simulate network delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

// Mock Razorpay configuration
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export const initializeMockRazorpay = () => {
  // Mock Razorpay object
  window.Razorpay = class MockRazorpay {
    constructor(private options: RazorpayOptions) {}

    open() {
      console.log('[MockRazorpay] Payment modal opened');
      
      // Simulate payment processing
      const processPayment = async () => {
        console.log('[MockRazorpay] Processing payment...');
        await simulateNetworkDelay();
        
        // 90% success rate for testing
        const isSuccess = Math.random() < 0.9;
        
        if (isSuccess) {
          const mockResponse = {
            razorpay_payment_id: `pay_${uuidv4()}`,
            razorpay_order_id: this.options.order_id || `order_${uuidv4()}`,
            razorpay_signature: `mock_signature_${uuidv4()}`,
          };
          console.log('[MockRazorpay] Payment successful', mockResponse);
          this.options.handler(mockResponse);
        } else {
          console.log('[MockRazorpay] Payment failed');
          if (this.options.modal?.ondismiss) {
            this.options.modal.ondismiss();
          }
        }
      };

      // Show mock payment UI
      if (window.confirm('Mock Payment Gateway\n\nClick OK to simulate successful payment or Cancel to simulate failure')) {
        processPayment();
      } else if (this.options.modal?.ondismiss) {
        this.options.modal.ondismiss();
      }
    }
  };
};

// Check if running in test environment
export const isTestEnv = () => {
  return process.env.NODE_ENV === 'test';
};

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  if (isTestEnv() || typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // If already loaded
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.warn('Failed to load Razorpay script, using mock implementation');
      initializeMockRazorpay();
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create a payment order
export const createRazorpayOrder = async (amount: number): Promise<{ id: string }> => {
  await simulateNetworkDelay();
  return {
    id: `order_${uuidv4()}`,
  };
};

// Verify payment signature
export const verifyPaymentSignature = async (): Promise<boolean> => {
  await simulateNetworkDelay();
  return true; // Always return true in mock
};

// Format amount to paise (Razorpay's format)
export const formatAmount = (amount: number): number => {
  return amount * 100; // Convert to paise
};

export const processPayment = async (
  amount: number,
  currency: string,
  user: { name?: string; email?: string; contact?: string },
  onSuccess: (response: any) => Promise<void>,
  onError: (error: Error) => void,
  onDismiss: () => void,
  paymentId?: string
) => {
  // Initialize mock Razorpay if not already initialized
  if (!window.Razorpay) {
    console.log('Initializing mock Razorpay...');
    initializeMockRazorpay();
  }
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }
    
    // In a real implementation, you would create an order on your server first
    const order = await createRazorpayOrder(amount);
    
    const options: RazorpayOptions = {
      key: 'mock_key',
      amount: formatAmount(amount),
      currency: currency,
      name: 'YourShikshak',
      description: 'Payment for tutoring services',
      order_id: order.id,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.contact,
      },
      theme: {
        color: '#4f46e5',
      },
      handler: async (response) => {
        try {
          // Update payment status in the backend
          const payment = await mockPaymentStatusUpdate(
            paymentId, // Use the provided payment ID
            'paid',
            response.razorpay_payment_id
          );
          await onSuccess(payment);
        } catch (error) {
          console.error('Payment processing error:', error);
          onError(error as Error);
        }
      },
      modal: {
        ondismiss: onDismiss,
      },
    };

    // Initialize Razorpay
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Error initializing payment:', error);
    onError(error as Error);
  }
};

export const mockPaymentStatusUpdate = async (
  paymentId: string,
  status: 'paid' | 'failed',
  transactionId: string
): Promise<IPayment> => {
  try {
    // For failed payments, we'll keep the status as PENDING in the backend
    // since the backend doesn't have a FAILED status
    const backendStatus = status === 'paid' ? 'PAID' : 'PENDING';
    const notes = status === 'paid' 
      ? 'Paid via mock payment gateway' 
      : 'Payment attempt failed via mock payment gateway';

    const response = await paymentService.updatePaymentStatus(paymentId, {
      status: backendStatus,
      paymentMethod: 'UPI', // Using UPI as the payment method since it's a valid option
      transactionId: status === 'paid' ? transactionId : undefined,
      notes
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Failed to update payment status:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    throw error;
  }
};

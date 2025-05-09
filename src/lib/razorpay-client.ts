// Define a type for the Razorpay object
interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
    animation?: boolean;
    backdropclose?: boolean;
    escape?: boolean;
  };
  handler?: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  on: (event: string, handler: Function) => void;
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Declare Razorpay on the window object
declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

// Now use these types in your code
let razorpayPromise: Promise<RazorpayConstructor> | null = null;

export const loadRazorpay = (): Promise<RazorpayConstructor> => {
  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(window.Razorpay);
      };
      document.body.appendChild(script);
    });
  }
  return razorpayPromise;
};

let razorpayPromise: Promise<any> | null = null;

export const loadRazorpay = () => {
  if (!razorpayPromise) {
    razorpayPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve((window as any).Razorpay);
      };      document.body.appendChild(script);
    });
  }
  return razorpayPromise;
};

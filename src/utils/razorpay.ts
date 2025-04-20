export const initializeRazorpay = (options: any) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      reject(false);
    };
    document.body.appendChild(script);
  });
};

export const displayRazorpay = async (amount: number, orderId: string, onSuccess: () => void) => {
  const res = await initializeRazorpay();

  if (!res) {
    alert('Razorpay SDK failed to load');
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: 'INR',
    name: 'IRA Health',
    description: 'Women\'s Health Products',
    order_id: orderId,
    handler: function (response: any) {
      onSuccess();
    },
    prefill: {
      name: 'User Name',
      email: 'user@example.com',
      contact: '9999999999'
    },
    theme: {
      color: '#9333EA'
    }
  };

  const paymentObject = new (window as any).Razorpay(options);
  paymentObject.open();
};
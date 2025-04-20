import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CartItem, Address } from '../../types';
import { ShoppingBag, CreditCard, Check, ArrowLeft, MapPin } from 'lucide-react';
import { formatToINR } from '../../utils/currency';
import { displayRazorpay } from '../../utils/razorpay';

const Checkout: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card');
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: userProfile?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: ''
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    }
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartQuery = query(
        collection(db, 'carts'),
        where('userId', '==', currentUser?.uid)
      );
      
      const querySnapshot = await getDocs(cartQuery);
      
      if (!querySnapshot.empty) {
        const cartDoc = querySnapshot.docs[0];
        const cartData = cartDoc.data();
        setCartItems(cartData.items || []);
        setCartId(cartDoc.id);
      } else {
        setCartItems([]);
        setCartId(null);
      }
      
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      const sampleCartItems: CartItem[] = [
        {
          productId: '1',
          name: 'Organic Cotton Pads',
          price: 8.99,
          quantity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1628259212737-9f64a8e0d29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          productId: '3',
          name: 'Iron & Vitamin B Complex',
          price: 19.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ];
      
      setCartItems(sampleCartItems);
      setCartId('sample-cart-id');
      
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };
  
  const calculateShipping = () => {
    return 5.99;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingForm = () => {
    return (
      shippingAddress.fullName &&
      shippingAddress.addressLine1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.postalCode &&
      shippingAddress.country &&
      shippingAddress.phone
    );
  };

  const validatePaymentForm = () => {
    if (paymentMethod === 'credit_card') {
      return (
        cardDetails.cardNumber &&
        cardDetails.cardholderName &&
        cardDetails.expiryDate &&
        cardDetails.cvv
      );
    }
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (validateShippingForm()) {
        setStep(2);
      }
    } else {
      if (validatePaymentForm()) {
        await placeOrder();
      }
    }
  };

  const placeOrder = async () => {
    if (!currentUser || !cartId) return;
    
    try {
      setProcessing(true);
      
      const orderData = {
        userId: currentUser.uid,
        items: cartItems,
        total: calculateTotal(),
        status: 'pending',
        shippingAddress,
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const orderId = `order_${Date.now()}`;
      
      await displayRazorpay(
        calculateTotal(),
        orderId,
        async () => {
          if (cartId !== 'sample-cart-id') {
            await deleteDoc(doc(db, 'carts', cartId));
          }
          
          navigate('/order-success/demo-order-id');
        }
      );
      
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty. Add some products before checkout.</p>
        <Link to="/shop" className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">
          <ShoppingBag className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <ShoppingBag className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-semibold mr-3">
                  1
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Shipping Information</h2>
                {step > 1 && (
                  <Check className="ml-2 h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            
            {step === 1 && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleShippingChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-base font-medium text-gray-800">Shipping Method</h3>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center">
                      <input
                        id="standard-shipping"
                        name="shipping-method"
                        type="radio"
                        defaultChecked={true}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <label htmlFor="standard-shipping" className="ml-3 block text-sm font-medium text-gray-700">
                        Standard Shipping (5-7 business days)
                      </label>
                      <span className="ml-auto font-medium">{formatToINR(5.99)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-semibold mr-3">
                  2
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                {step > 2 && (
                  <Check className="ml-2 h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            
            {step === 2 && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="credit-card"
                      name="payment-method"
                      type="radio"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit Card
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="paypal"
                      name="payment-method"
                      type="radio"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                      PayPal
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'credit_card' && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="md:col-span-2">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={cardDetails.cardholderName}
                          onChange={handleCardChange}
                          placeholder="John Doe"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-xs text-gray-500">
                      This is a demo application. No actual payment will be processed.
                    </p>
                  </div>
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="border p-4 rounded-md">
                    <p className="text-gray-600">
                      You will be redirected to PayPal to complete your payment after clicking "Place Order".
                    </p>
                    <p className="mt-4 text-xs text-gray-500">
                      This is a demo application. No actual payment will be processed.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              {step === 1 ? (
                <Link to="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Cart
                </Link>
              ) : (
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Shipping
                </button>
              )}
              
              <button
                onClick={handleNextStep}
                disabled={processing || (step === 1 && !validateShippingForm()) || (step === 2 && !validatePaymentForm())}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : step === 1 ? (
                  'Continue to Payment'
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {cartItems.map(item => (
                <div key={item.productId} className="flex items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {formatToINR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">{formatToINR(calculateSubtotal())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="text-gray-800">{formatToINR(calculateTax())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">{formatToINR(calculateShipping())}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-red-600">{formatToINR(calculateTotal())}</span>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              <p>By placing your order, you agree to our terms and conditions and privacy policy.</p>
              <p className="mt-2">All transactions are secure and encrypted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
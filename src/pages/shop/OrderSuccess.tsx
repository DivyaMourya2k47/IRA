import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Order } from '../../types';
import { CheckCircle, Package, Home, Calendar, ArrowRight } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userProfile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser && id) {
      fetchOrder();
    }
  }, [currentUser, id]);
  
  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      if (id === 'demo-order-id') {
        // For demo purposes, create a sample order
        const sampleOrder: Order = {
          id: 'demo-order-id',
          userId: currentUser?.uid || 'demo-user',
          items: [
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
          ],
          total: 43.97,
          status: 'pending',
          shippingAddress: {
            fullName: userProfile?.name || 'Jane Doe',
            addressLine1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'United States',
            phone: '555-123-4567'
          },
          paymentMethod: 'credit_card',
          paymentId: 'demo-payment-123',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setOrder(sampleOrder);
      } else {
        // Fetch real order from Firestore
        const orderDoc = await getDoc(doc(db, 'orders', id));
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data() as Order;
          setOrder({
            ...orderData,
            id: orderDoc.id
          });
        } else {
          // If order not found, redirect to shop
          console.error('Order not found');
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // Delivery in 5 days
    
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-600">Order not found.</p>
        <Link to="/shop" className="mt-4 inline-flex items-center text-red-600 hover:text-red-800">
          <ArrowRight className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{order.status}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-medium text-gray-800 mb-3">Items</h3>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">
                    ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-800">
                    ${(order.total - order.items.reduce((total, item) => total + (item.price * item.quantity), 0) - 5.99).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">$5.99</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 mt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-red-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Shipping Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-3">
                    <Home className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Shipping Address</h3>
                  </div>
                  <div className="text-gray-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-3">
                    <Package className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Shipping Method</h3>
                  </div>
                  <p className="text-gray-600">Standard Shipping</p>
                  <p className="text-gray-600 mt-1">$5.99</p>
                  
                  <div className="flex items-center mt-4 mb-3">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Estimated Delivery</h3>
                  </div>
                  <p className="text-gray-600">{getEstimatedDeliveryDate()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Thank You!</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Your order has been confirmed and will be shipped soon. We'll send you a shipping confirmation email once your order has been shipped.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="block w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-center"
              >
                Return to Dashboard
              </Link>
              
              <Link
                to="/shop"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-center"
              >
                Continue Shopping
              </Link>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Questions about your order?
              </p>
              <a href="#" className="text-sm font-medium text-red-600 hover:text-red-800">
                Contact Customer Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
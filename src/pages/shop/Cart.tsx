import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CartItem } from '../../types';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatToINR } from '../../utils/currency';

const Cart: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      setLoading(false);
      setCartItems([]);
    }
  }, [currentUser]);
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (!currentUser?.uid) {
        setCartItems([]);
        return;
      }

      const cartRef = doc(db, 'carts', currentUser.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        setCartItems(cartData.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  const updateCartItem = async (productId: string, newQuantity: number) => {
    if (!currentUser?.uid || updating) return;
    
    try {
      setUpdating(true);
      
      const cartRef = doc(db, 'carts', currentUser.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) return;

      const cartData = cartSnap.data();
      const updatedItems = cartData.items.map((item: CartItem) => {
        if (item.productId === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: new Date()
      });
      
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  const removeCartItem = async (productId: string) => {
    if (!currentUser?.uid || updating) return;
    
    try {
      setUpdating(true);
      
      const cartRef = doc(db, 'carts', currentUser.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) return;

      const cartData = cartSnap.data();
      const itemToRemove = cartData.items.find((item: CartItem) => item.productId === productId);
      
      if (!itemToRemove) return;

      // Remove the item from the array
      await updateDoc(cartRef, {
        items: arrayRemove(itemToRemove),
        updatedAt: new Date()
      });

      // Check if cart is now empty
      const updatedCartSnap = await getDoc(cartRef);
      if (updatedCartSnap.exists() && updatedCartSnap.data().items.length === 0) {
        await deleteDoc(cartRef);
      }

      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Error removing cart item:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <ShoppingCart className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
        </div>
      </div>
      
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Cart Items ({cartItems.length})</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <div key={item.productId} className="p-6 flex flex-col sm:flex-row">
                    <div className="sm:w-24 h-24 flex-shrink-0 overflow-hidden rounded-md mb-4 sm:mb-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="sm:ml-6 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-800">
                            <Link to={`/shop/product/${item.productId}`} className="hover:text-red-600">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {formatToINR(item.price)} each
                          </p>
                        </div>
                        <p className="text-base font-medium text-gray-800">
                          {formatToINR(item.price * item.quantity)}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateCartItem(item.productId, Math.max(1, item.quantity - 1))}
                            disabled={updating || item.quantity <= 1}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItem(item.productId, Math.min(10, item.quantity + 1))}
                            disabled={updating || item.quantity >= 10}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeCartItem(item.productId)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <Link to="/shop" className="inline-flex items-center text-red-600 hover:text-red-800">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">{formatToINR(calculateSubtotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-gray-800">{formatToINR(calculateTax())}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-red-600">{formatToINR(calculateTotal())}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
              
              <div className="mt-6 text-xs text-gray-500">
                <p>Shipping costs will be calculated at checkout.</p>
                <p className="mt-1">By proceeding to checkout, you agree to our terms and conditions.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
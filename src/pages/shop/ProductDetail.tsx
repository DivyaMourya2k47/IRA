import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product, CartItem } from '../../types';
import { ShoppingBag, ShoppingCart, Plus, Minus, ArrowLeft, Heart } from 'lucide-react';
import { formatToINR } from '../../utils/currency';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { toast } from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'description' | 'details' | 'reviews'>('description');
  
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);
  
  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        const productData = productDoc.data() as Product;
        setProduct({
          ...productData,
          id: productDoc.id
        });
        
        fetchRelatedProducts(productData.category, productId);
      } else {
        const sampleProduct: Product = {
          id: productId,
          name: 'Organic Cotton Pads',
          description: 'Eco-friendly, chemical-free cotton pads for a comfortable period. These pads are made from 100% organic cotton, free from chlorine, dyes, and synthetic materials. They provide excellent absorption while being gentle on your skin and the environment.',
          price: 8.99,
          images: [
            'https://shorturl.at/cqWYX',
            'https://tinyurl.com/3fvzxzk7',
            'https://tinyurl.com/3yjfujfw'
          ],
          category: 'menstrual',
          tags: ['organic', 'eco-friendly', 'pads'],
          inStock: true,
          rating: 4.8,
          details: {
            ingredients: ['100% Organic Cotton', 'Biodegradable materials'],
            usage: 'Change every 4-6 hours or as needed',
            benefits: [
              'Chemical-free and hypoallergenic',
              'Excellent absorption',
              'Eco-friendly and biodegradable',
              'Soft and comfortable'
            ],
            warnings: [
              'For external use only',
              'If irritation occurs, discontinue use'
            ]
          }
        };
        
        setProduct(sampleProduct);
        fetchRelatedProducts('menstrual', productId);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRelatedProducts = async (category: string, currentProductId: string) => {
    try {
      const relatedQuery = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('inStock', '==', true)
      );
      
      const querySnapshot = await getDocs(relatedQuery);
      const relatedData: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentProductId) {
          const data = doc.data() as Product;
          relatedData.push({
            ...data,
            id: doc.id
          });
        }
      });
      
      setRelatedProducts(relatedData.slice(0, 3));
      
      if (relatedData.length === 0) {
        const sampleRelated: Product[] = [
          {
            id: '2',
            name: 'Menstrual Cup',
            description: 'Reusable silicone menstrual cup for up to 12 hours of protection.',
            price: 24.99,
            images: ['https://tinyurl.com/4nkz9n9a'],
            category: 'menstrual',
            tags: ['reusable', 'eco-friendly', 'cup'],
            inStock: true,
            rating: 4.7
          },
          {
            id: '8',
            name: 'Period Underwear',
            description: 'Absorbent, leak-proof underwear that can replace pads and tampons.',
            price: 32.99,
            images: ['https://tinyurl.com/cztwzj9s'],
            category: 'menstrual',
            tags: ['reusable', 'eco-friendly', 'underwear'],
            inStock: true,
            rating: 4.7
          }
        ];
        
        setRelatedProducts(sampleRelated);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };
  
  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };
  
  const addToCart = async () => {
    if (!currentUser || !product) return;
    
    try {
      setAddingToCart(true);
      
      const cartQuery = query(
        collection(db, 'carts'),
        where('userId', '==', currentUser.uid)
      );
      
      const cartSnapshot = await getDocs(cartQuery);
      
      if (cartSnapshot.empty) {
        await addDoc(collection(db, 'carts'), {
          userId: currentUser.uid,
          items: [{
            productId: product.id,
            quantity: quantity,
            price: product.price,
            name: product.name,
            imageUrl: product.images[0]
          }],
          updatedAt: new Date()
        });
      } else {
        const cartDoc = cartSnapshot.docs[0];
        const cartData = cartDoc.data();
        const cartItems = cartData.items || [];
        
        const existingItemIndex = cartItems.findIndex((item: CartItem) => item.productId === product.id);
        
        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += quantity;
        } else {
          cartItems.push({
            productId: product.id,
            quantity: quantity,
            price: product.price,
            name: product.name,
            imageUrl: product.images[0]
          });
        }
        
        await addDoc(collection(db, 'carts'), {
          userId: currentUser.uid,
          items: cartItems,
          updatedAt: new Date()
        });
      }
      
      toast.success('Added to cart!');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-600">Product not found.</p>
        <Link to="/shop" className="mt-4 inline-flex items-center text-red-600 hover:text-red-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shop
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <Link to="/shop" className="text-gray-600 hover:text-gray-800 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ShoppingBag className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Product Details</h1>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6">
            <div className="mb-4">
              <Swiper
                modules={[Navigation, Thumbs, Zoom]}
                thumbs={{ swiper: thumbsSwiper }}
                navigation
                zoom
                className="h-80 rounded-lg"
              >
                {product.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="swiper-zoom-container">
                      <img
                        src={image}
                        alt={`${product.name} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Navigation, Thumbs]}
              watchSlidesProgress
              slidesPerView={4}
              spaceBetween={10}
              className="h-20"
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="h-full cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-red-500">
                    <img
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      ({product.rating?.toFixed(1)})
                    </span>
                  </div>
                  <span className="ml-4 text-sm text-gray-500 capitalize">
                    Category: {product.category}
                  </span>
                </div>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-red-500">
                <Heart className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-2xl font-bold text-red-600 mb-4">
              {formatToINR(product.price)}
            </div>
            
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setSelectedTab('description')}
                  className={`px-4 py-2 rounded-md ${
                    selectedTab === 'description'
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`px-4 py-2 rounded-md ${
                    selectedTab === 'details'
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setSelectedTab('reviews')}
                  className={`px-4 py-2 rounded-md ${
                    selectedTab === 'reviews'
                      ? 'bg-red-100 text-red-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Reviews
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                {selectedTab === 'description' && (
                  <p className="text-gray-700">{product.description}</p>
                )}
                
                {selectedTab === 'details' && product.details && (
                  <div className="space-y-4">
                    {product.details.ingredients && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Ingredients</h3>
                        <ul className="list-disc list-inside text-gray-700">
                          {product.details.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {product.details.usage && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Usage Instructions</h3>
                        <p className="text-gray-700">{product.details.usage}</p>
                      </div>
                    )}
                    
                    {product.details.benefits && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Benefits</h3>
                        <ul className="list-disc list-inside text-gray-700">
                          {product.details.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {product.details.warnings && (
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Warnings</h3>
                        <ul className="list-disc list-inside text-gray-700">
                          {product.details.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedTab === 'reviews' && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Reviews coming soon!</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <span className="text-gray-700 mr-4">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-1 border-l border-r">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={addToCart}
                disabled={addingToCart}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Related Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <Link
                key={relatedProduct.id}
                to={`/shop/product/${relatedProduct.id}`}
                className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-md font-semibold text-gray-800">{relatedProduct.name}</h3>
                    <span className="font-bold text-red-600">{formatToINR(relatedProduct.price)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-1">{relatedProduct.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
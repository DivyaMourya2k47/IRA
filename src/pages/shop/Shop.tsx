import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, where, orderBy, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product } from '../../types';
import { ShoppingBag, Search, Filter, ShoppingCart, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatToINR } from '../../utils/currency';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { toast } from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Shop: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'menstrual', name: 'Menstrual Products' },
    { id: 'supplements', name: 'Supplements' },
    { id: 'skincare', name: 'Skincare' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'books', name: 'Books & Education' }
  ];
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(
        collection(db, 'products'),
        where('inStock', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(productsQuery);
      const productsData: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Product;
        productsData.push({
          ...data,
          id: doc.id
        });
      });
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // For demo purposes, add some sample products if Firestore fetch fails
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Organic Cotton Pads',
          description: 'Eco-friendly, chemical-free cotton pads for a comfortable period.',
          price: 8.99,
          images: [
            'https://shorturl.at/cqWYX',
            'https://tinyurl.com/3fvzxzk7',
            'https://tinyurl.com/3yjfujfw'
          ],
          category: 'menstrual',
          tags: ['organic', 'eco-friendly', 'pads'],
          inStock: true,
          rating: 4.8
        },
        {
          id: '2',
          name: 'Menstrual Cup',
          description: 'Reusable silicone menstrual cup for up to 12 hours of protection.',
          price: 24.99,
          images: [
            'https://tinyurl.com/4nkz9n9a',
            'https://tinyurl.com/ywzevxut',
            'https://tinyurl.com/3cucmxj3'
          ],
          category: 'menstrual',
          tags: ['reusable', 'eco-friendly', 'cup'],
          inStock: true,
          rating: 4.7
        },
        {
          id: '3',
          name: 'Iron & Vitamin B Complex',
          description: 'Supplement to support energy levels and reduce fatigue during menstruation.',
          price: 19.99,
          images: [
            'https://tinyurl.com/5h5p8tae',
            'https://tinyurl.com/5xurwwmf',
            'https://tinyurl.com/yjzjn2zy'
          ],
          category: 'supplements',
          tags: ['iron', 'vitamins', 'energy'],
          inStock: true,
          rating: 4.5
        },
        {
          id: '4',
          name: 'PCOS Support Supplement',
          description: 'Natural supplement to help manage PCOS symptoms and support hormonal balance.',
          price: 29.99,
          images: [
            'https://tinyurl.com/435h4t3c',
            'https://tinyurl.com/wadjzrpy',
            'https://tinyurl.com/3kk83tyv'
          ],
          category: 'supplements',
          tags: ['pcos', 'hormonal balance', 'natural'],
          inStock: true,
          rating: 4.6
        },
        {
          id: '5',
          name: 'Heating Pad',
          description: 'Electric heating pad for menstrual cramp relief with multiple heat settings.',
          price: 34.99,
          images: [
            'https://tinyurl.com/y63upfbh',
            'https://tinyurl.com/5axh9y5s',
            'https://tinyurl.com/h43ubx38'
          ],
          category: 'wellness',
          tags: ['pain relief', 'cramps', 'heat therapy'],
          inStock: true,
          rating: 4.9
        },
        {
          id: '6',
          name: 'Period Tracking Journal',
          description: 'Beautiful journal designed to track your cycle, symptoms, and mood.',
          price: 14.99,
          images: [
            'https://tinyurl.com/4xx23wsb',
            'https://tinyurl.com/ys5d9axz',
            'https://tinyurl.com/2s3ct5zc'
          ],
          category: 'books',
          tags: ['journal', 'tracking', 'self-care'],
          inStock: true,
          rating: 4.4
        },
        {
          id: '7',
          name: 'Acne Treatment Serum',
          description: 'Targeted treatment for hormonal acne with salicylic acid and tea tree oil.',
          price: 22.99,
          images: [
            'https://tinyurl.com/487hfecn',
            'https://tinyurl.com/59h2xd4v',
            'https://tinyurl.com/nh2jspjp'
          ],
          category: 'skincare',
          tags: ['acne', 'hormonal', 'treatment'],
          inStock: true,
          rating: 4.3
        },
        {
          id: '8',
          name: 'Period Underwear',
          description: 'Absorbent, leak-proof underwear that can replace pads and tampons.',
          price: 32.99,
          images: [
            'https://tinyurl.com/cztwzj9s',
            'https://tinyurl.com/37j9bcep',
            'https://tinyurl.com/3vzjtjhj'
          ],
          category: 'menstrual',
          tags: ['reusable', 'eco-friendly', 'underwear'],
          inStock: true,
          rating: 4.7
        }
      ];
      
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };
  
  const filterProducts = () => {
    let filtered = [...products];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const addToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));

      const cartRef = doc(db, 'carts', currentUser.uid);
      const cartItem = {
        productId: product.id,
        quantity: 1,
        price: product.price,
        name: product.name,
        imageUrl: product.images[0],
        addedAt: new Date()
      };

      await setDoc(
        cartRef,
        {
          userId: currentUser.uid,
          items: arrayUnion(cartItem),
          updatedAt: new Date()
        },
        { merge: true }
      );

      toast.success('Added to cart!');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
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
        <div className="flex items-center mb-4">
          <ShoppingBag className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Shop</h1>
        </div>
        <p className="text-gray-600">
          Browse and purchase menstrual products, supplements, and women's health essentials.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Search className="h-5 w-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Search</h2>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <Filter className="h-5 w-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
              </div>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      selectedCategory === category.id
                        ? 'bg-red-100 text-red-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/cart"
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span className="font-medium">View Cart</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative"
                >
                  <Link to={`/shop/product/${product.id}`}>
                    <div className="relative h-48">
                      <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        navigation={{
                          prevEl: `.prev-${product.id}`,
                          nextEl: `.next-${product.id}`,
                        }}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        loop={true}
                        className="h-full group-hover:opacity-90 transition-opacity duration-300"
                      >
                        {product.images.map((image, index) => (
                          <SwiperSlide key={index}>
                            <img
                              src={image}
                              alt={`${product.name} - View ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <button className={`prev-${product.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                        <ChevronLeft className="h-4 w-4 text-gray-800" />
                      </button>
                      <button className={`next-${product.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                        <ChevronRight className="h-4 w-4 text-gray-800" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link to={`/shop/product/${product.id}`}>
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
                          {product.name}
                        </h3>
                      </Link>
                      <span className="font-bold text-red-600">{formatToINR(product.price)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
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
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.rating?.toFixed(1)})
                        </span>
                      </div>
                      <div className="ml-auto flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => addToCart(e, product)}
                      disabled={addingToCart[product.id]}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-300 disabled:opacity-50"
                    >
                      {addingToCart[product.id] ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Adding...
                        </div>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-600">No products found matching your criteria. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
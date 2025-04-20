import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Activity, 
  ShoppingBag, 
  Clock, 
  ArrowRight,
  ChevronDown,
  Bell,
  Phone,
  Shield
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CycleData, BMIData, Appointment } from '../types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Disclosure, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);

  const healthTips = [
    {
      title: "Stay Hydrated",
      image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      description: "Drink at least 8 glasses of water daily for optimal health."
    },
    {
      title: "Regular Exercise",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      description: "30 minutes of daily exercise can improve your overall well-being."
    },
    {
      title: "Balanced Diet",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
      description: "Include a variety of fruits, vegetables, and whole grains in your diet."
    }
  ];

  const quickActions = [
    {
      title: "Track Period",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
      link: "/cycle-tracker"
    },
    {
      title: "Book Appointment",
      icon: Clock,
      color: "bg-green-100 text-green-600",
      link: "/appointments"
    },
    {
      title: "Check BMI",
      icon: Activity,
      color: "bg-blue-100 text-blue-600",
      link: "/bmi-calculator"
    },
    {
      title: "Shop Products",
      icon: ShoppingBag,
      color: "bg-red-100 text-red-600",
      link: "/shop"
    }
  ];

  const faqs = [
    {
      question: "How often should I track my cycle?",
      answer: "It's recommended to track your cycle daily for the most accurate predictions and insights. Regular tracking helps identify patterns and potential irregularities."
    },
    {
      question: "What's a normal cycle length?",
      answer: "A typical menstrual cycle can range from 21 to 35 days, with 28 days being average. However, what's 'normal' varies from person to person."
    },
    {
      question: "When should I see a doctor?",
      answer: "Consult a healthcare provider if you experience irregular periods, severe pain, heavy bleeding, or if your cycle length varies significantly."
    }
  ];

  // Helpline numbers for women in India
  const helplineNumbers = [
    {
      name: "Women Helpline (All India)",
      number: "1091",
      description: "24/7 helpline for women in distress"
    },
    {
      name: "National Commission for Women",
      number: "7827170170",
      description: "Complaints related to women's rights violations"
    },
    {
      name: "Police Emergency",
      number: "100",
      description: "For immediate police assistance"
    },
    {
      name: "Child Helpline",
      number: "1098",
      description: "For children in need of care and protection"
    },
    {
      name: "Medical Emergency",
      number: "108",
      description: "Ambulance and emergency medical services"
    },
    {
      name: "RPF / GRP Helpline in Train",
      number: "182",
      description: "Ambulance and emergency medical services"
    }
  ];
  
  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch latest cycle data
      const cycleQuery = query(
        collection(db, 'cycles'),
        where('userId', '==', currentUser?.uid ?? ''),
        orderBy('startDate', 'desc'),
        limit(1)
      );
      
      const cycleSnapshot = await getDocs(cycleQuery);
      if (!cycleSnapshot.empty) {
        setCycleData(cycleSnapshot.docs[0].data() as CycleData);
      }
      
      // Fetch latest BMI data
      const bmiQuery = query(
        collection(db, 'bmiRecords'),
        where('userId', '==', currentUser?.uid ?? ''),
        orderBy('date', 'desc'),
        limit(1)
      );
      
      const bmiSnapshot = await getDocs(bmiQuery);
      if (!bmiSnapshot.empty) {
        setBmiData(bmiSnapshot.docs[0].data() as BMIData);
      }
      
      // Fetch upcoming appointment
      const now = new Date().toISOString().split('T')[0];
      const appointmentQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', currentUser?.uid ?? ''),
        where('date', '>=', now),
        where('status', '==', 'scheduled'),
        orderBy('date'),
        limit(1)
      );
      
      const appointmentSnapshot = await getDocs(appointmentQuery);
      if (!appointmentSnapshot.empty) {
        setUpcomingAppointment(appointmentSnapshot.docs[0].data() as Appointment);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 px-8 py-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {userProfile?.name || currentUser?.email?.split('@')[0]}
            </h1>
            <p className="text-purple-100">Your personal health companion</p>
          </motion.div>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} p-4 rounded-lg transition-transform hover:scale-105`}
              >
                <action.icon className="h-6 w-6 mb-2" />
                <span className="font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Helpline Section - NEW */}
      <div className="bg-red-50 border border-red-100 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Women's Helpline Numbers (India)</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helplineNumbers.map((helpline, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <Phone className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{helpline.name}</h4>
                    <a 
                      href={`tel:${helpline.number}`}
                      className="text-xl font-bold text-red-600 hover:text-red-800 block my-1"
                    >
                      {helpline.number}
                    </a>
                    <p className="text-sm text-gray-600">{helpline.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>These helplines are available 24/7 for emergencies and support.</p>
          </div>
        </div>
      </div>

      {/* Health Tips Carousel */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Health Tips</h2>
        </div>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          navigation
          className="health-tips-swiper"
        >
          {healthTips.map((tip, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-64">
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                    <p className="text-sm">{tip.description}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cycle Tracking Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Cycle Tracking</h3>
              </div>
              <Link to="/cycle-tracker" className="text-purple-600 hover:text-purple-800">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {cycleData ? (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Current cycle started</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {new Date(cycleData.startDate).toLocaleDateString()}
                  </div>
                </div>
                {cycleData.predictedNextStart && (
                  <div>
                    <div className="text-sm text-gray-600">Next period predicted</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {new Date(cycleData.predictedNextStart).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Start tracking your cycle today</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* BMI Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">BMI Status</h3>
              </div>
              <Link to="/bmi-calculator" className="text-blue-600 hover:text-blue-800">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {bmiData ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {bmiData.bmi.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    {bmiData.category}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Height</span>
                    <span className="font-medium">{bmiData.height} cm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">{bmiData.weight} kg</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Calculate your BMI</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Appointments Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
              </div>
              <Link to="/appointments" className="text-green-600 hover:text-green-800">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingAppointment ? (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Next appointment</div>
                  <div className="font-semibold text-gray-800">
                    {upcomingAppointment.doctorName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(upcomingAppointment.date).toLocaleDateString()} at{' '}
                    {upcomingAppointment.time}
                  </div>
                </div>
                <Link
                  to="/appointments"
                  className="inline-flex items-center text-green-600 hover:text-green-800"
                >
                  View details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming appointments</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Disclosure key={index}>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-left text-gray-800 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-50">
                      <span className="font-medium">{faq.question}</span>
                      <ChevronDown
                        className={`${
                          open ? 'transform rotate-180' : ''
                        } w-5 h-5 text-purple-500`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-600">
                        {faq.answer}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-24 right-4 p-4 bg-white rounded-xl shadow-lg"
      >
        <div className="flex items-center text-gray-800">
          <Bell className="h-5 w-5 text-purple-600 mr-2" />
          <span className="font-medium">Stay updated with your health journey</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
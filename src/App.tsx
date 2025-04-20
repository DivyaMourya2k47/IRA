import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Toast } from './components/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/Profile';
import CycleTracker from './pages/CycleTracker';
import BMICalculator from './pages/BMICalculator';
import DiseaseDetection from './pages/DiseaseDetection';
import Shop from './pages/shop/Shop';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import OrderSuccess from './pages/shop/OrderSuccess';
import Appointments from './pages/Appointments';
import DietPlanner from './pages/DietPlanner';
import HealthInsights from './pages/HealthInsights';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ChatBot from './components/ChatBot/ChatBox';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toast />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const AppContent = () => {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/cycle-tracker" element={<PrivateRoute><Layout><CycleTracker /></Layout></PrivateRoute>} />
        <Route path="/bmi-calculator" element={<PrivateRoute><Layout><BMICalculator /></Layout></PrivateRoute>} />
        <Route path="/disease-detection" element={<PrivateRoute><Layout><DiseaseDetection /></Layout></PrivateRoute>} />
        <Route path="/shop" element={<PrivateRoute><Layout><Shop /></Layout></PrivateRoute>} />
        <Route path="/shop/product/:id" element={<PrivateRoute><Layout><ProductDetail /></Layout></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Layout><Cart /></Layout></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Layout><Checkout /></Layout></PrivateRoute>} />
        <Route path="/order-success/:id" element={<PrivateRoute><Layout><OrderSuccess /></Layout></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Layout><Appointments /></Layout></PrivateRoute>} />
        <Route path="/diet-planner" element={<PrivateRoute><Layout><DietPlanner /></Layout></PrivateRoute>} />
        <Route path="/health-insights" element={<PrivateRoute><Layout><HealthInsights /></Layout></PrivateRoute>} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatBot />
    </>
  );
};

export default App;
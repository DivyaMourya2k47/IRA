import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Settings, 
  Save, 
  Camera, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  Heart, 
  Mail, 
  Clock,
  Shield,
  ChevronRight,
  Key,
  Download,
  Check 
} from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    medicalConditions: '',
    allergies: '',
    medications: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        height: userProfile.height ? userProfile.height.toString() : '',
        weight: userProfile.weight ? userProfile.weight.toString() : '',
        medicalConditions: userProfile.medicalConditions ? userProfile.medicalConditions.join(', ') : '',
        allergies: userProfile.allergies ? userProfile.allergies.join(', ') : '',
        medications: userProfile.medications ? userProfile.medications.join(', ') : ''
      });
    } else if (currentUser) {
      setFormData({
        ...formData,
        email: currentUser.email || '',
        name: currentUser.displayName || ''
      });
    }
  }, [userProfile, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const updatedProfile = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(item => item.trim()) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(item => item.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(item => item.trim()) : []
      };
      
      await updateUserProfile(updatedProfile);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                  <Camera className="h-4 w-4 text-purple-600" />
                </button>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">{formData.name || 'Welcome!'}</h1>
                <div className="flex items-center mt-2">
                  <Mail className="h-4 w-4 mr-2" />
                  <p>{formData.email}</p>
                </div>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-2" />
                  <p>Member since {currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).getFullYear() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="text-center px-6 py-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <p className="text-2xl font-bold">28</p>
                <p className="text-sm">Days Tracked</p>
              </div>
              <div className="text-center px-6 py-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm">Profile Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <User className="h-5 w-5 text-purple-600 mr-2" />
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Height"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Weight"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health Information Section */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <Heart className="h-5 w-5 text-purple-600 mr-2" />
                      Health Information
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Conditions
                        </label>
                        <textarea
                          name="medicalConditions"
                          value={formData.medicalConditions}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Enter medical conditions (comma separated)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allergies
                        </label>
                        <textarea
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Enter allergies (comma separated)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Medications
                        </label>
                        <textarea
                          name="medications"
                          value={formData.medications}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Enter current medications (comma separated)"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Stats and Settings */}
          <div className="space-y-8">
            {/* Health Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Activity className="h-5 w-5 text-purple-600 mr-2" />
                Health Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 mb-1">BMI</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formData.height && formData.weight
                      ? (Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2)).toFixed(1)
                      : '-'}
                  </p>
                </div>
                <div className="bg-pink-50 rounded-xl p-4">
                  <p className="text-sm text-pink-600 mb-1">Cycle Length</p>
                  <p className="text-2xl font-bold text-pink-700">28 days</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-indigo-600 mb-1">Last Check-up</p>
                  <p className="text-2xl font-bold text-indigo-700">2 months</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4">
                  <p className="text-sm text-rose-600 mb-1">Risk Level</p>
                  <p className="text-2xl font-bold text-rose-700">Low</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Settings className="h-5 w-5 text-purple-600 mr-2" />
                Account Settings
              </h2>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-700">Privacy Settings</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-700">Change Password</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-700">Export Data</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                These features will be available soon
              </p>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-6">Quick Links</h2>
              <div className="space-y-3">
                <a href="/appointments" className="block px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Book Appointment</span>
                  </div>
                </a>
                <a href="/cycle-tracker" className="block px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-3" />
                    <span>Track Cycle</span>
                  </div>
                </a>
                <a href="/health-insights" className="block px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-3" />
                    <span>View Health Insights</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
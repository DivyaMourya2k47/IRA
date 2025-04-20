import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BMIData } from '../types';
import { Activity, BarChart2, ArrowRight } from 'lucide-react';

const BMICalculator: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [height, setHeight] = useState<number>(userProfile?.height || 165);
  const [weight, setWeight] = useState<number>(userProfile?.weight || 60);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [bmiHistory, setBmiHistory] = useState<BMIData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      fetchBmiHistory();
    }
  }, [currentUser]);
  
  const fetchBmiHistory = async () => {
    try {
      setHistoryLoading(true);
      const bmiQuery = query(
        collection(db, 'bmiRecords'),
        where('userId', '==', currentUser?.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(bmiQuery);
      const bmiData: BMIData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as BMIData;
        bmiData.push({
          ...data,
          id: doc.id
        });
      });
      
      setBmiHistory(bmiData);
      
    } catch (error) {
      console.error('Error fetching BMI history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  const calculateBMI = () => {
    if (height && weight) {
      // BMI formula: weight (kg) / (height (m))^2
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      setBmi(bmiValue);
      
      // Determine BMI category
      if (bmiValue < 18.5) {
        setBmiCategory('underweight');
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        setBmiCategory('normal');
      } else if (bmiValue >= 25 && bmiValue < 30) {
        setBmiCategory('overweight');
      } else {
        setBmiCategory('obese');
      }
    }
  };
  
  const saveBMI = async () => {
    if (!currentUser || bmi === null) return;
    
    try {
      setLoading(true);
      
      const bmiData: Omit<BMIData, 'id'> = {
        userId: currentUser.uid,
        date: new Date().toISOString().split('T')[0],
        height,
        weight,
        bmi,
        category: bmiCategory as 'underweight' | 'normal' | 'overweight' | 'obese'
      };
      
      await addDoc(collection(db, 'bmiRecords'), bmiData);
      
      // Refresh BMI history
      fetchBmiHistory();
      
    } catch (error) {
      console.error('Error saving BMI:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getBmiCategoryColor = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'text-blue-600';
      case 'normal':
        return 'text-green-600';
      case 'overweight':
        return 'text-yellow-600';
      case 'obese':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getBmiCategoryBg = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'bg-blue-50';
      case 'normal':
        return 'bg-green-50';
      case 'overweight':
        return 'bg-yellow-50';
      case 'obese':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">BMI Calculator</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Calculate your Body Mass Index (BMI) to check if your weight is healthy for your height.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Calculate Your BMI</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="100"
                  max="250"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min="30"
                  max="300"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={calculateBMI}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Calculate BMI
              </button>
              
              {bmi !== null && (
                <button
                  onClick={saveBMI}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Results'}
                </button>
              )}
            </div>
            
            {bmi !== null && (
              <div className={`mt-8 p-6 rounded-lg ${getBmiCategoryBg(bmiCategory)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Your BMI Result</h3>
                    <p className={`text-lg font-bold mt-1 ${getBmiCategoryColor(bmiCategory)}`}>
                      {bmi.toFixed(1)} - <span className="capitalize">{bmiCategory}</span>
                    </p>
                  </div>
                  <div className={`text-5xl font-bold ${getBmiCategoryColor(bmiCategory)}`}>
                    {bmi.toFixed(1)}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800">What this means:</h4>
                  {bmiCategory === 'underweight' && (
                    <p className="text-gray-600 mt-1">
                      Your BMI suggests you are underweight. This may indicate malnutrition or other health problems. Consider consulting with a healthcare professional.
                    </p>
                  )}
                  {bmiCategory === 'normal' && (
                    <p className="text-gray-600 mt-1">
                      Your BMI is within the normal range. This suggests you have a healthy weight for your height. Maintain a balanced diet and regular physical activity.
                    </p>
                  )}
                  {bmiCategory === 'overweight' && (
                    <p className="text-gray-600 mt-1">
                      Your BMI suggests you are overweight. This may increase your risk of health problems. Consider making lifestyle changes and consulting with a healthcare professional.
                    </p>
                  )}
                  {bmiCategory === 'obese' && (
                    <p className="text-gray-600 mt-1">
                      Your BMI suggests you are obese. This increases your risk of various health problems. It's recommended to consult with a healthcare professional for personalized advice.
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800">Recommendations:</h4>
                  <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                    {bmiCategory === 'underweight' && (
                      <>
                        <li>Increase your calorie intake with nutrient-rich foods</li>
                        <li>Include protein-rich foods in your diet</li>
                        <li>Consider strength training to build muscle mass</li>
                        <li>Consult with a nutritionist for a personalized meal plan</li>
                      </>
                    )}
                    {bmiCategory === 'normal' && (
                      <>
                        <li>Maintain a balanced diet with plenty of fruits and vegetables</li>
                        <li>Stay physically active with regular exercise</li>
                        <li>Get regular health check-ups</li>
                        <li>Focus on overall wellness, not just weight</li>
                      </>
                    )}
                    {bmiCategory === 'overweight' && (
                      <>
                        <li>Gradually increase physical activity</li>
                        <li>Focus on a balanced diet with portion control</li>
                        <li>Reduce intake of processed foods and sugary drinks</li>
                        <li>Set realistic weight loss goals (0.5-1 kg per week)</li>
                      </>
                    )}
                    {bmiCategory === 'obese' && (
                      <>
                        <li>Consult with a healthcare professional before starting any weight loss program</li>
                        <li>Focus on gradual, sustainable lifestyle changes</li>
                        <li>Increase physical activity as recommended by your doctor</li>
                        <li>Consider working with a dietitian for a personalized meal plan</li>
                        <li>Monitor other health markers like blood pressure and cholesterol</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">BMI History</h2>
            </div>
            
            {historyLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : bmiHistory.length > 0 ? (
              <div className="space-y-4">
                {bmiHistory.map((record) => (
                  <div key={record.id} className={`p-3 rounded-lg ${getBmiCategoryBg(record.category)}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-800 font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        <p className={`text-sm font-semibold capitalize ${getBmiCategoryColor(record.category)}`}>
                          {record.category}
                        </p>
                      </div>
                      <div className="text-2xl font-bold">{record.bmi.toFixed(1)}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Height: {record.height} cm | Weight: {record.weight} kg
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 py-4">No BMI history available. Calculate and save your BMI to track changes over time.</p>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">BMI Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">What is BMI?</h3>
                <p className="text-gray-600 text-sm">
                  Body Mass Index (BMI) is a value derived from a person's weight and height. It provides a simple numeric measure of a person's thickness or thinness.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">BMI Categories</h3>
                <ul className="text-sm space-y-1 mt-1">
                  <li className="text-blue-600">Underweight: BMI less than 18.5</li>
                  <li className="text-green-600">Normal weight: BMI 18.5 to 24.9</li>
                  <li className="text-yellow-600">Overweight: BMI 25 to 29.9</li>
                  <li className="text-red-600">Obesity: BMI 30 or greater</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800">Limitations</h3>
                <p className="text-gray-600 text-sm">
                  BMI is a screening tool, not a diagnostic tool. It doesn't account for factors like muscle mass, bone density, or body composition. Always consult with healthcare professionals for a comprehensive health assessment.
                </p>
              </div>
              
              <div className="pt-2">
                <Link to="/health-insights" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                  View more health insights
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
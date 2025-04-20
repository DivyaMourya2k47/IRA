import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BMIData, CycleData, DiseaseRiskAssessment } from '../types';
import { BarChart2, Calendar, Activity, Heart, ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HealthInsights: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bmiHistory, setBmiHistory] = useState<BMIData[]>([]);
  const [cycleHistory, setCycleHistory] = useState<CycleData[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<DiseaseRiskAssessment[]>([]);
  const [insights, setInsights] = useState<{
    bmi: string[];
    cycle: string[];
    risk: string[];
    general: string[];
  }>({
    bmi: [],
    cycle: [],
    risk: [],
    general: []
  });
  
  useEffect(() => {
    if (currentUser) {
      fetchHealthData();
    }
  }, [currentUser]);
  
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch BMI history
      const bmiQuery = query(
        collection(db, 'bmiRecords'),
        where('userId', '==', currentUser?.uid),
        orderBy('date', 'asc')
      );
      
      const bmiSnapshot = await getDocs(bmiQuery);
      const bmiData: BMIData[] = [];
      
      bmiSnapshot.forEach((doc) => {
        const data = doc.data() as BMIData;
        bmiData.push({
          ...data,
          id: doc.id
        });
      });
      
      setBmiHistory(bmiData);
      
      // Fetch cycle history
      const cycleQuery = query(
        collection(db, 'cycles'),
        where('userId', '==', currentUser?.uid),
        orderBy('startDate', 'asc')
      );
      
      const cycleSnapshot = await getDocs(cycleQuery);
      const cycleData: CycleData[] = [];
      
      cycleSnapshot.forEach((doc) => {
        const data = doc.data() as CycleData;
        cycleData.push({
          ...data,
          id: doc.id
        });
      });
      
      setCycleHistory(cycleData);
      
      // Fetch risk assessments
      const riskQuery = query(
        collection(db, 'diseaseAssessments'),
        where('userId', '==', currentUser?.uid),
        orderBy('date', 'desc')
      );
      
      const riskSnapshot = await getDocs(riskQuery);
      const riskData: DiseaseRiskAssessment[] = [];
      
      riskSnapshot.forEach((doc) => {
        const data = doc.data() as DiseaseRiskAssessment;
        riskData.push({
          ...data,
          id: doc.id
        });
      });
      
      setRiskAssessments(riskData);
      
      // Generate insights based on the data
      generateInsights(bmiData, cycleData, riskData);
      
    } catch (error) {
      console.error('Error fetching health data:', error);
      
      // For demo purposes, create sample data
      const sampleBmiData = generateSampleBmiData();
      const sampleCycleData = generateSampleCycleData();
      const sampleRiskData = generateSampleRiskData();
      
      setBmiHistory(sampleBmiData);
      setCycleHistory(sampleCycleData);
      setRiskAssessments(sampleRiskData);
      
      // Generate insights based on sample data
      generateInsights(sampleBmiData, sampleCycleData, sampleRiskData);
      
    } finally {
      setLoading(false);
    }
  };
  
  const generateSampleBmiData = (): BMIData[] => {
    const today = new Date();
    const bmiData: BMIData[] = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      
      let weight = 60;
      let bmi = 22;
      let category: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
      
      if (i === 1) {
        weight = 62;
        bmi = 22.8;
      } else if (i === 2) {
        weight = 64;
        bmi = 23.5;
        category = 'normal';
      } else if (i === 3) {
        weight = 66;
        bmi = 24.2;
        category = 'normal';
      } else if (i === 4) {
        weight = 68;
        bmi = 25;
        category = 'overweight';
      } else if (i === 5) {
        weight = 70;
        bmi = 25.7;
        category = 'overweight';
      }
      
      bmiData.push({
        id: `sample-bmi-${i}`,
        userId: currentUser?.uid || 'sample-user',
        date: date.toISOString().split('T')[0],
        height: 165,
        weight,
        bmi,
        category
      });
    }
    
    return bmiData.reverse();
  };
  
  const generateSampleCycleData = (): CycleData[] => {
    const today = new Date();
    const cycleData: CycleData[] = [];
    
    for (let i = 0; i < 6; i++) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (i * 28) - 10);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 5);
      
      const duration = 28 + (i % 3 - 1); // 27, 28, or 29 days
      
      cycleData.push({
        id: `sample-cycle-${i}`,
        userId: currentUser?.uid || 'sample-user',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration,
        days: [],
        predictedNextStart: new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    return cycleData.reverse();
  };
  
  const generateSampleRiskData = (): DiseaseRiskAssessment[] => {
    const today = new Date();
    const riskData: DiseaseRiskAssessment[] = [];
    
    const conditions: ('breast_cancer' | 'pcos' | 'pcod')[] = ['breast_cancer', 'pcos', 'pcod'];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i * 2);
      
      const condition = conditions[i % 3];
      let riskScore = 30;
      
      if (condition === 'pcos') {
        riskScore = 45;
      } else if (condition === 'pcod') {
        riskScore = 25;
      }
      
      riskData.push({
        id: `sample-risk-${i}`,
        userId: currentUser?.uid || 'sample-user',
        date: date.toISOString().split('T')[0],
        condition,
        riskScore,
        symptoms: ['Irregular periods', 'Fatigue'],
        recommendations: [
          'Maintain a healthy diet',
          'Exercise regularly',
          'Consult with a healthcare professional'
        ]
      });
    }
    
    return riskData;
  };
  
  const generateInsights = (bmiData: BMIData[], cycleData: CycleData[], riskData: DiseaseRiskAssessment[]) => {
    const insights = {
      bmi: [] as string[],
      cycle: [] as string[],
      risk: [] as string[],
      general: [
        'Stay hydrated by drinking at least 8 glasses of water daily',
        'Aim for 7-9 hours of quality sleep each night',
        'Practice stress-reduction techniques like meditation or deep breathing',
        'Include a variety of fruits and vegetables in your diet for essential nutrients'
      ]
    };
    
    // BMI insights
    if (bmiData.length > 0) {
      const latestBmi = bmiData[bmiData.length - 1];
      
      if (latestBmi.category === 'underweight') {
        insights.bmi.push('Your BMI indicates you are underweight. Consider consulting with a nutritionist for a personalized plan to reach a healthy weight.');
        insights.bmi.push('Focus on nutrient-dense foods and consider adding strength training to your exercise routine.');
      } else if (latestBmi.category === 'normal') {
        insights.bmi.push('Your BMI is within the normal range. Keep up the good work with your healthy lifestyle habits!');
      } else if (latestBmi.category === 'overweight') {
        insights.bmi.push('Your BMI indicates you are overweight. Small, sustainable changes to diet and exercise can help you reach a healthier weight.');
        insights.bmi.push('Consider incorporating more physical activity into your daily routine and focusing on portion control.');
      } else if (latestBmi.category === 'obese') {
        insights.bmi.push('Your BMI indicates obesity, which increases risk for various health conditions. Consider consulting with a healthcare provider.');
        insights.bmi.push('Focus on gradual, sustainable lifestyle changes rather than rapid weight loss for long-term success.');
      }
      
      if (bmiData.length > 1) {
        const previousBmi = bmiData[bmiData.length - 2];
        const bmiChange = latestBmi.bmi - previousBmi.bmi;
        
        if (Math.abs(bmiChange) > 1) {
          if (bmiChange > 0 && (latestBmi.category === 'overweight' || latestBmi.category === 'obese')) {
            insights.bmi.push(`Your BMI has increased by ${bmiChange.toFixed(1)} points since your last measurement. Consider reviewing your diet and exercise habits.`);
          } else if (bmiChange > 0 && latestBmi.category === 'normal') {
            insights.bmi.push(`Your BMI has increased by ${bmiChange.toFixed(1)} points but remains in the normal range. Continue monitoring your health habits.`);
          } else if (bmiChange < 0 && (previousBmi.category === 'overweight' || previousBmi.category === 'obese')) {
            insights.bmi.push(`Great progress! Your BMI has decreased by ${Math.abs(bmiChange).toFixed(1)} points since your last measurement.`);
          } else if (bmiChange < 0 && latestBmi.category === 'underweight') {
            insights.bmi.push(`Your BMI has decreased by ${Math.abs(bmiChange).toFixed(1)} points and is now in the underweight range. Consider consulting with a healthcare provider.`);
          }
        }
      }
    } else {
      insights.bmi.push('No BMI data available. Calculate your BMI to receive personalized insights.');
    }
    
    // Cycle insights
    if (cycleData.length > 0) {
      const latestCycle = cycleData[cycleData.length - 1];
      const today = new Date();
      const cycleStartDate = new Date(latestCycle.startDate);
      const daysSinceCycleStart = Math.floor((today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (latestCycle.duration) {
        if (latestCycle.duration < 21) {
          insights.cycle.push('Your last cycle was shorter than average. Short cycles can sometimes indicate hormonal imbalances or stress.');
        } else if (latestCycle.duration > 35) {
          insights.cycle.push('Your last cycle was longer than average. Long cycles can sometimes be related to hormonal changes, stress, or other factors.');
        } else {
          insights.cycle.push('Your cycle length is within the normal range, which is a positive indicator of reproductive health.');
        }
      }
      
      if (cycleData.length > 2) {
        const cycleLengths = cycleData.slice(-3).map(cycle => cycle.duration || 28);
        const avgCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
        const cycleVariation = Math.max(...cycleLengths) - Math.min(...cycleLengths);
        
        if (cycleVariation > 7) {
          insights.cycle.push('Your cycle length has varied significantly in recent months. This can be normal, but if it concerns you, consider discussing it with a healthcare provider.');
        } else {
          insights.cycle.push('Your cycle has been relatively consistent in recent months, which is a positive sign of hormonal balance.');
        }
        
        insights.cycle.push(`Based on your history, your average cycle length is ${Math.round(avgCycleLength)} days.`);
      }
      
      if (latestCycle.predictedNextStart) {
        const nextStartDate = new Date(latestCycle.predictedNextStart);
        const daysUntilNextCycle = Math.floor((nextStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilNextCycle > 0) {
          insights.cycle.push(`Your next cycle is predicted to start in approximately ${daysUntilNextCycle} days.`);
        } else if (daysUntilNextCycle < 0 && daysUntilNextCycle > -5) {
          insights.cycle.push('Your period appears to be late. This can be due to various factors including stress, exercise, or hormonal changes.');
        } else if (daysUntilNextCycle < -5) {
          insights.cycle.push('Your period appears to be significantly delayed. If this is unusual for you, consider consulting with a healthcare provider.');
        }
      }
      
      // Phase-specific insights
      if (daysSinceCycleStart < 0) {
        insights.cycle.push('You are currently in your pre-menstrual phase. This is a good time to focus on self-care and stress management.');
      } else if (daysSinceCycleStart < 5) {
        insights.cycle.push('You are currently in your menstrual phase. Focus on iron-rich foods and gentle exercise to support your body.');
      } else if (daysSinceCycleStart < 14) {
        insights.cycle.push('You are currently in your follicular phase. Energy levels are typically higher during this time, making it ideal for more intense workouts.');
      } else {
        insights.cycle.push('You are currently in your luteal phase. You may experience changes in energy and mood. Prioritize balanced nutrition and adequate rest.');
      }
    } else {
      insights.cycle.push('No cycle data available. Track your cycle to receive personalized insights.');
    }
    
    // Risk assessment insights
    if (riskData.length > 0) {
      const latestRisk = riskData[0]; // Already sorted by date desc
      
      if (latestRisk.riskScore < 30) {
        insights.risk.push(`Your risk assessment for ${latestRisk.condition.replace('_', ' ')} shows a low risk level. Continue with preventive health measures.`);
      } else if (latestRisk.riskScore < 70) {
        insights.risk.push(`Your risk assessment for ${latestRisk.condition.replace('_', ' ')} shows a moderate risk level. Consider the recommended lifestyle modifications.`);
      } else {
        insights.risk.push(`Your risk assessment for ${latestRisk.condition.replace('_', ' ')} shows a high risk level. It's recommended to consult with a healthcare provider.`);
      }
      
      if (latestRisk.recommendations.length > 0) {
        insights.risk.push(`Key recommendation: ${latestRisk.recommendations[0]}`);
      }
      
      if (riskData.length > 1 && riskData[0].condition === riskData[1].condition) {
        const riskChange = riskData[0].riskScore - riskData[1].riskScore;
        
        if (riskChange > 5) {
          insights.risk.push(`Your risk for ${latestRisk.condition.replace('_', ' ')} has increased since your last assessment. Review the recommendations and consider consulting a healthcare provider.`);
        } else if (riskChange < -5) {
          insights.risk.push(`Your risk for ${latestRisk.condition.replace('_', ' ')} has decreased since your last assessment. Your health changes appear to be having a positive impact.`);
        }
      }
    } else {
      insights.risk.push('No risk assessment data available. Complete a health assessment to receive personalized insights.');
    }
    
    // Correlations and holistic insights
    if (bmiData.length > 0 && cycleData.length > 0) {
      const latestBmi = bmiData[bmiData.length - 1];
      
      if (latestBmi.category === 'underweight' && cycleData.some(cycle => (cycle.duration || 28) > 35)) {
        insights.general.push('Being underweight can sometimes affect menstrual regularity. Maintaining a healthy weight may help regulate your cycle.');
      } else if ((latestBmi.category === 'overweight' || latestBmi.category === 'obese') && cycleData.some(cycle => (cycle.duration || 28) > 35)) {
        insights.general.push('Higher body weight can sometimes affect menstrual regularity. Gradual weight management may help improve cycle regularity.');
      }
    }
    
    if (riskData.some(risk => risk.condition === 'pcos' && risk.riskScore > 50) && bmiData.length > 0) {
      const latestBmi = bmiData[bmiData.length - 1];
      if (latestBmi.category === 'overweight' || latestBmi.category === 'obese') {
        insights.general.push('Weight management can be particularly beneficial for managing PCOS symptoms. Even a modest 5-10% weight reduction can help improve hormonal balance.');
      }
    }
    
    setInsights(insights);
  };
  
  const getBmiChartData = () => {
    if (bmiHistory.length === 0) return null;
    
    return {
      labels: bmiHistory.map(record => new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'BMI',
          data: bmiHistory.map(record => record.bmi),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3
        }
      ]
    };
  };
  
  const getCycleChartData = () => {
    if (cycleHistory.length === 0) return null;
    
    return {
      labels: cycleHistory.map(cycle => new Date(cycle.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Cycle Length (days)',
          data: cycleHistory.map(cycle => cycle.duration || 28),
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.5)',
          tension: 0.3
        }
      ]
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };
  
  const getRiskLevelColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getRiskLevelBg = (score: number) => {
    if (score < 30) return 'bg-green-100';
    if (score < 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  const bmiChartData = getBmiChartData();
  const cycleChartData = getCycleChartData();
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <BarChart2 className="h-6 w-6 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Health Insights</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Personalized health insights based on your tracked data and patterns.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Insights</h2>
            
            <div className="space-y-6">
              {insights.bmi.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Activity className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">BMI & Weight</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.bmi.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <Link to="/bmi-calculator" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                      Go to BMI Calculator
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
              
              {insights.cycle.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-pink-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Menstrual Cycle</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.cycle.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-pink-600 mr-2">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <Link to="/cycle-tracker" className="inline-flex items-center text-sm font-medium text-pink-600 hover:text-pink-800">
                      Go to Cycle Tracker
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
              
              {insights.risk.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Heart className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Health Risk Assessment</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.risk.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <Link to="/disease-detection" className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800">
                      Go to Health Assessment
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
              
              {insights.general.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <BarChart2 className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">General Wellness</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.general.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-600 mr-2">•</span>
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Summary</h2>
            
            <div className="space-y-4">
              {bmiHistory.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-800">Current BMI</h3>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {bmiHistory[bmiHistory.length - 1].bmi.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    Category: {bmiHistory[bmiHistory.length - 1].category}
                  </p>
                  
                  {bmiHistory.length > 1 && (
                    <div className="mt-2 flex items-center text-sm">
                      {bmiHistory[bmiHistory.length - 1].bmi > bmiHistory[bmiHistory.length - 2].bmi ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-600">
                            +{(bmiHistory[bmiHistory.length - 1].bmi - bmiHistory[bmiHistory.length - 2].bmi).toFixed(1)} from last measurement
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">
                            {(bmiHistory[bmiHistory.length - 1].bmi - bmiHistory[bmiHistory.length - 2].bmi).toFixed(1)} from last measurement
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {cycleHistory.length > 0 && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-pink-600 mr-2" />
                      <h3 className="font-medium text-gray-800">Cycle Status</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Last period: {new Date(cycleHistory[cycleHistory.length - 1].startDate).toLocaleDateString()}
                    </p>
                    
                    {cycleHistory[cycleHistory.length - 1].predictedNextStart && (
                      <p className="text-sm text-gray-600">
                        Next predicted period: {new Date(cycleHistory[cycleHistory.length - 1].predictedNextStart).toLocaleDateString()}
                      </p>
                    )}
                    
                    {cycleHistory.length > 1 && (
                      <p className="text-sm text-gray-600">
                        Average cycle length: {Math.round(cycleHistory.slice(-3).reduce((sum, cycle) => sum + (cycle.duration || 28), 0) / Math.min(cycleHistory.length, 3))} days
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {riskAssessments.length > 0 && (
                <div className={`p-4 ${getRiskLevelBg(riskAssessments[0].riskScore)} rounded-lg`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="font-medium text-gray-800">Latest Risk Assessment</h3>
                    </div>
                    <span className={`text-xl font-bold ${getRiskLevelColor(riskAssessments[0].riskScore)}`}>
                      {riskAssessments[0].riskScore}%
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 capitalize mb-1">
                    Condition: {riskAssessments[0].condition.replace('_', ' ')}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    Date: {new Date(riskAssessments[0].date).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Health Reminders</h3>
                </div>
                
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Schedule your annual gynecological exam</li>
                  <li>• Update your health assessments regularly</li>
                  <li>• Track your cycle consistently for better insights</li>
                  <li>• Monitor your BMI every 1-2 months</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bmiChartData && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">BMI Trend</h2>
            </div>
            
            <div className="h-64">
              <Line data={bmiChartData} options={chartOptions} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">BMI Categories</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Underweight: &lt;18.5</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Normal: 18.5-24.9</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Overweight: 25-29.9</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Obese: ≥30</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {cycleChartData && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-pink-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Cycle Length Trend</h2>
            </div>
            
            <div className="h-64">
              <Line data={cycleChartData} options={chartOptions} />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Cycle Length Reference</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Short: &lt;21 days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Normal: 21-35 days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Long: &gt;35 days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">Average: 28 days</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthInsights;
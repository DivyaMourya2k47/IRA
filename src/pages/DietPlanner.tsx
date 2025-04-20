import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MealPlan } from '../types';
import { Utensils, Check, AlertTriangle } from 'lucide-react';

const DietPlanner: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dietType, setDietType] = useState<string>('balanced');
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [generating, setGenerating] = useState(false);
  
  const dietTypes = [
    { id: 'balanced', name: 'Balanced Diet' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'vegan', name: 'Vegan' },
    { id: 'low_carb', name: 'Low Carb' },
    { id: 'high_protein', name: 'High Protein' },
    { id: 'keto', name: 'Ketogenic' }
  ];
  
  const healthGoalOptions = [
    { id: 'weight_loss', name: 'Weight Loss' },
    { id: 'weight_gain', name: 'Weight Gain' },
    { id: 'maintenance', name: 'Weight Maintenance' },
    { id: 'pcos_management', name: 'PCOS Management' },
    { id: 'hormone_balance', name: 'Hormone Balance' },
    { id: 'energy_boost', name: 'Energy Boost' },
    { id: 'immune_support', name: 'Immune Support' }
  ];
  
  useEffect(() => {
    if (currentUser) {
      fetchMealPlans();
    }
  }, [currentUser]);
  
  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      const plansQuery = query(
        collection(db, 'mealPlans'),
        where('userId', '==', currentUser?.uid),
        orderBy('startDate', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(plansQuery);
      const plansData: MealPlan[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as MealPlan;
        plansData.push({
          ...data,
          id: doc.id
        });
      });
      
      setMealPlans(plansData);
      
      if (plansData.length > 0) {
        setSelectedPlan(plansData[0]);
      }
      
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      
      // For demo purposes, create a sample meal plan
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 6);
      
      const samplePlan: MealPlan = {
        id: 'sample-plan-1',
        userId: currentUser?.uid || 'sample-user',
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        targetCalories: 2000,
        dietType: 'balanced',
        healthGoals: ['weight_loss', 'energy_boost'],
        dailyPlans: {
          [today.toISOString().split('T')[0]]: {
            breakfast: {
              name: 'Greek Yogurt Parfait',
              ingredients: ['Greek yogurt', 'Mixed berries', 'Granola', 'Honey'],
              nutritionalInfo: {
                calories: 350,
                protein: 20,
                carbs: 45,
                fat: 10
              },
              imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            lunch: {
              name: 'Quinoa Salad with Grilled Chicken',
              ingredients: ['Quinoa', 'Grilled chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil', 'Lemon juice'],
              nutritionalInfo: {
                calories: 450,
                protein: 35,
                carbs: 40,
                fat: 15
              },
              imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            dinner: {
              name: 'Baked Salmon with Roasted Vegetables',
              ingredients: ['Salmon fillet', 'Broccoli', 'Carrots', 'Red bell pepper', 'Olive oil', 'Garlic', 'Lemon'],
              nutritionalInfo: {
                calories: 500,
                protein: 40,
                carbs: 25,
                fat: 25
              },
              imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            snacks: [
              {
                name: 'Apple with Almond Butter',
                ingredients: ['Apple', 'Almond butter'],
                nutritionalInfo: {
                  calories: 200,
                  protein: 5,
                  carbs: 25,
                  fat: 10
                }
              },
              {
                name: 'Protein Smoothie',
                ingredients: ['Protein powder', 'Banana', 'Almond milk', 'Spinach'],
                nutritionalInfo: {
                  calories: 250,
                  protein: 20,
                  carbs: 30,
                  fat: 5
                }
              }
            ]
          }
        }
      };
      
      // Add more days to the sample plan
      for (let i = 1; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        samplePlan.dailyPlans[dateStr] = {
          breakfast: {
            name: i % 2 === 0 ? 'Avocado Toast with Eggs' : 'Oatmeal with Fruits and Nuts',
            ingredients: i % 2 === 0 ? 
              ['Whole grain bread', 'Avocado', 'Eggs', 'Salt', 'Pepper'] : 
              ['Oats', 'Almond milk', 'Banana', 'Berries', 'Walnuts', 'Cinnamon'],
            nutritionalInfo: {
              calories: i % 2 === 0 ? 400 : 350,
              protein: i % 2 === 0 ? 20 : 10,
              carbs: i % 2 === 0 ? 30 : 50,
              fat: i % 2 === 0 ? 25 : 10
            },
            imageUrl: i % 2 === 0 ? 
              'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
              'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          lunch: {
            name: i % 3 === 0 ? 'Mediterranean Wrap' : (i % 3 === 1 ? 'Lentil Soup with Whole Grain Bread' : 'Tuna Salad Sandwich'),
            ingredients: i % 3 === 0 ? 
              ['Whole wheat wrap', 'Hummus', 'Feta cheese', 'Cucumber', 'Tomato', 'Olives'] : 
              (i % 3 === 1 ? ['Lentils', 'Carrots', 'Celery', 'Onion', 'Garlic', 'Whole grain bread'] : 
              ['Tuna', 'Greek yogurt', 'Whole grain bread', 'Lettuce', 'Tomato']),
            nutritionalInfo: {
              calories: i % 3 === 0 ? 450 : (i % 3 === 1 ? 400 : 420),
              protein: i % 3 === 0 ? 20 : (i % 3 === 1 ? 25 : 30),
              carbs: i % 3 === 0 ? 50 : (i % 3 === 1 ? 45 : 40),
              fat: i % 3 === 0 ? 20 : (i % 3 === 1 ? 10 : 15)
            },
            imageUrl: i % 3 === 0 ? 
              'https://images.unsplash.com/photo-1540914124281-342587941389?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
              (i % 3 === 1 ? 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
              'https://images.unsplash.com/photo-1554433607-66b5efe9d304?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')
          },
          dinner: {
            name: i % 4 === 0 ? 'Stir-Fried Tofu with Vegetables' : (i % 4 === 1 ? 'Grilled Chicken with Sweet Potato' : 
              (i % 4 === 2 ? 'Turkey Meatballs with Zucchini Noodles' : 'Vegetable Curry with Brown Rice')),
            ingredients: i % 4 === 0 ? 
              ['Tofu', 'Broccoli', 'Bell peppers', 'Carrots', 'Soy sauce', 'Ginger', 'Garlic'] : 
              (i % 4 === 1 ? ['Chicken breast', 'Sweet potato', 'Asparagus', 'Olive oil', 'Herbs'] : 
              (i % 4 === 2 ? ['Ground turkey', 'Zucchini', 'Tomato sauce', 'Garlic', 'Italian herbs'] : 
              ['Chickpeas', 'Cauliflower', 'Spinach', 'Coconut milk', 'Curry powder', 'Brown rice'])),
            nutritionalInfo: {
              calories: i % 4 === 0 ? 400 : (i % 4 === 1 ? 450 : (i % 4 === 2 ? 420 : 500)),
              protein: i % 4 === 0 ? 25 : (i % 4 === 1 ? 40 : (i % 4 === 2 ? 35 : 20)),
              carbs: i % 4 === 0 ? 30 : (i % 4 === 1 ? 35 : (i % 4 === 2 ? 20 : 60)),
              fat: i % 4 === 0 ? 20 : (i % 4 === 1 ? 15 : (i % 4 === 2 ? 20 : 20))
            },
            imageUrl: i % 4 === 0 ? 
              'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
              (i % 4 === 1 ? 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
              (i % 4 === 2 ? 'https://images.unsplash.com/photo-1529042410759-befb1204b468?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
              'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'))
          },
          snacks: [
            {
              name: i % 2 === 0 ? 'Greek Yogurt with Berries' : 'Hummus with Vegetable Sticks',
              ingredients: i % 2 === 0 ? ['Greek yogurt', 'Mixed berries', 'Honey'] : ['Hummus', 'Carrot sticks', 'Cucumber sticks', 'Bell pepper sticks'],
              nutritionalInfo: {
                calories: i % 2 === 0 ? 150 : 200,
                protein: i % 2 === 0 ? 15 : 8,
                carbs: i % 2 === 0 ? 20 : 25,
                fat: i % 2 === 0 ? 3 : 10
              }
            }
          ]
        };
      }
      
      setMealPlans([samplePlan]);
      setSelectedPlan(samplePlan);
      
    } finally {
      setLoading(false);
    }
  };
  
  const handleHealthGoalChange = (goalId: string) => {
    setHealthGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };
  
  const generateMealPlan = async () => {
    if (!currentUser) return;
    
    try {
      setGenerating(true);
      
      // In a real application, this would call an API to generate a meal plan
      // For demo purposes, we'll simulate a delay and then create a sample plan
      setTimeout(async () => {
        try {
          const today = new Date();
          const endDate = new Date(today);
          endDate.setDate(today.getDate() + 6);
          
          const newPlan: Omit<MealPlan, 'id'> = {
            userId: currentUser.uid,
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            targetCalories: calorieTarget,
            dietType,
            healthGoals,
            dailyPlans: {}
          };
          
          // Generate sample meals for each day
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            newPlan.dailyPlans[dateStr] = {
              breakfast: {
                name: dietType === 'vegan' ? 'Vegan Smoothie Bowl' : 'Protein Oatmeal',
                ingredients: dietType === 'vegan' ? 
                  ['Banana', 'Berries', 'Plant milk', 'Chia seeds', 'Granola'] : 
                  ['Oats', 'Protein powder', 'Almond milk', 'Banana', 'Peanut butter'],
                nutritionalInfo: {
                  calories: 350,
                  protein: dietType === 'vegan' ? 10 : 25,
                  carbs: 45,
                  fat: 12
                },
                imageUrl: dietType === 'vegan' ? 
                  'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
                  'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
              },
              lunch: {
                name: dietType === 'keto' ? 'Avocado Chicken Salad' : 'Quinoa Buddha Bowl',
                ingredients: dietType === 'keto' ? 
                  ['Chicken breast', 'Avocado', 'Mixed greens', 'Olive oil', 'Lemon juice'] : 
                  ['Quinoa', 'Roasted vegetables', 'Chickpeas', 'Tahini dressing'],
                nutritionalInfo: {
                  calories: 450,
                  protein: 30,
                  carbs: dietType === 'keto' ? 10 : 50,
                  fat: dietType === 'keto' ? 35 : 15
                },
                imageUrl: dietType === 'keto' ? 
                  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
              },
              dinner: {
                name: dietType === 'vegetarian' ? 'Vegetable Stir Fry with Tofu' : 'Grilled Salmon with Asparagus',
                ingredients: dietType === 'vegetarian' ? 
                  ['Tofu', 'Broccoli', 'Bell peppers', 'Carrots', 'Brown rice', 'Soy sauce'] : 
                  ['Salmon fillet', 'Asparagus', 'Lemon', 'Olive oil', 'Garlic'],
                nutritionalInfo: {
                  calories: 500,
                  protein: 35,
                  carbs: dietType === 'low_carb' ? 15 : 40,
                  fat: 20
                },
                imageUrl: dietType === 'vegetarian' ? 
                  'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : 
                  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
              },
              snacks: [
                {
                  name: dietType === 'high_protein' ? 'Protein Shake' : 'Mixed Nuts',
                  ingredients: dietType === 'high_protein' ? 
                    ['Protein powder', 'Almond milk', 'Banana'] : 
                    ['Almonds', 'Walnuts', 'Cashews'],
                  nutritionalInfo: {
                    calories: 200,
                    protein: dietType === 'high_protein' ? 25 : 8,
                    carbs: 15,
                    fat: dietType === 'high_protein' ? 5 : 15
                  }
                }
              ]
            };
          }
          
          // In a real app, we would save this to Firestore
          // For demo purposes, we'll just update the local state
          const newPlanWithId = {
            ...newPlan,
            id: `new-plan-${Date.now()}`
          };
          
          setMealPlans(prev => [newPlanWithId, ...prev]);
          setSelectedPlan(newPlanWithId);
          
        } catch (error) {
          console.error('Error generating meal plan:', error);
        } finally {
          setGenerating(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setGenerating(false);
    }
  };
  
  const getDatesInRange = (startDate: string, endDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  const getTotalNutrition = (date: string) => {
    if (!selectedPlan || !selectedPlan.dailyPlans[date]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const dailyPlan = selectedPlan.dailyPlans[date];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // Add breakfast
    if (dailyPlan.breakfast) {
      totalCalories += dailyPlan.breakfast.nutritionalInfo.calories;
      totalProtein += dailyPlan.breakfast.nutritionalInfo.protein;
      totalCarbs += dailyPlan.breakfast.nutritionalInfo.carbs;
      totalFat += dailyPlan.breakfast.nutritionalInfo.fat;
    }
    
    // Add lunch
    if (dailyPlan.lunch) {
      totalCalories += dailyPlan.lunch.nutritionalInfo.calories;
      totalProtein += dailyPlan.lunch.nutritionalInfo.protein;
      totalCarbs += dailyPlan.lunch.nutritionalInfo.carbs;
      totalFat += dailyPlan.lunch.nutritionalInfo.fat;
    }
    
    // Add dinner
    if (dailyPlan.dinner) {
      totalCalories += dailyPlan.dinner.nutritionalInfo.calories;
      totalProtein += dailyPlan.dinner.nutritionalInfo.protein;
      totalCarbs += dailyPlan.dinner.nutritionalInfo.carbs;
      totalFat += dailyPlan.dinner.nutritionalInfo.fat;
    }
    
    // Add snacks
    if (dailyPlan.snacks) {
      dailyPlan.snacks.forEach(snack => {
        totalCalories += snack.nutritionalInfo.calories;
        totalProtein += snack.nutritionalInfo.protein;
        totalCarbs += snack.nutritionalInfo.carbs;
        totalFat += snack.nutritionalInfo.fat;
      });
    }
    
    return { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <Utensils className="h-6 w-6 text-yellow-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Diet Planner</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Get personalized meal plans based on your health data and nutritional needs.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Your Meal Plan</h2>
                  <div className="text-sm text-gray-600">
                    {new Date(selectedPlan.startDate).toLocaleDateString()} - {new Date(selectedPlan.endDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                  {getDatesInRange(selectedPlan.startDate, selectedPlan.endDate).map(date => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded-md whitespace-nowrap ${
                        selectedDate === date
                          ? 'bg-yellow-100 text-yellow-800 font-medium'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedPlan.dailyPlans[selectedDate] ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Breakfast</h3>
                      <div className="flex">
                        {selectedPlan.dailyPlans[selectedDate].breakfast.imageUrl && (
                          <div className="w-24 h-24 rounded-md overflow-hidden mr-4">
                            <img
                              src={selectedPlan.dailyPlans[selectedDate].breakfast.imageUrl}
                              alt={selectedPlan.dailyPlans[selectedDate].breakfast.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800">{selectedPlan.dailyPlans[selectedDate].breakfast.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedPlan.dailyPlans[selectedDate].breakfast.ingredients.join(', ')}
                          </p>
                          <div className="mt-2 flex space-x-3 text-xs">
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].breakfast.nutritionalInfo.calories}</span> cal
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].breakfast.nutritionalInfo.protein}g</span> protein
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].breakfast.nutritionalInfo.carbs}g</span> carbs
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].breakfast.nutritionalInfo.fat}g</span> fat
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Lunch</h3>
                      <div className="flex">
                        {selectedPlan.dailyPlans[selectedDate].lunch.imageUrl && (
                          <div className="w-24 h-24 rounded-md overflow-hidden mr-4">
                            <img
                              src={selectedPlan.dailyPlans[selectedDate].lunch.imageUrl}
                              alt={selectedPlan.dailyPlans[selectedDate].lunch.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800">{selectedPlan.dailyPlans[selectedDate].lunch.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedPlan.dailyPlans[selectedDate].lunch.ingredients.join(', ')}
                          </p>
                          <div className="mt-2 flex space-x-3 text-xs">
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].lunch.nutritionalInfo.calories}</span> cal
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].lunch.nutritionalInfo.protein}g</span> protein
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].lunch.nutritionalInfo.carbs}g</span> carbs
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].lunch.nutritionalInfo.fat}g</span> fat
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Dinner</h3>
                      <div className="flex">
                        {selectedPlan.dailyPlans[selectedDate].dinner.imageUrl && (
                          <div className="w-24 h-24 rounded-md overflow-hidden mr-4">
                            <img
                              src={selectedPlan.dailyPlans[selectedDate].dinner.imageUrl}
                              alt={selectedPlan.dailyPlans[selectedDate].dinner.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800">{selectedPlan.dailyPlans[selectedDate].dinner.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedPlan.dailyPlans[selectedDate].dinner.ingredients.join(', ')}
                          </p>
                          <div className="mt-2 flex space-x-3 text-xs">
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].dinner.nutritionalInfo.calories}</span> cal
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].dinner.nutritionalInfo.protein}g</span> protein
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].dinner.nutritionalInfo.carbs}g</span> carbs
                            </span>
                            <span className="text-gray-700">
                              <span className="font-medium">{selectedPlan.dailyPlans[selectedDate].dinner.nutritionalInfo.fat}g</span> fat
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Snacks</h3>
                      <div className="space-y-4">
                        {selectedPlan.dailyPlans[selectedDate].snacks.map((snack, index) => (
                          <div key={index} className="flex">
                            <div>
                              <h4 className="font-medium text-gray-800">{snack.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {snack.ingredients.join(', ')}
                              </p>
                              <div className="mt-2 flex space-x-3 text-xs">
                                <span className="text-gray-700">
                                  <span className="font-medium">{snack.nutritionalInfo.calories}</span> cal
                                </span>
                                <span className="text-gray-700">
                                  <span className="font-medium">{snack.nutritionalInfo.protein}g</span> protein
                                </span>
                                <span className="text-gray-700">
                                  <span className="font-medium">{snack.nutritionalInfo.carbs}g</span> carbs
                                </span>
                                <span className="text-gray-700">
                                  <span className="font-medium">{snack.nutritionalInfo.fat}g</span> fat
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Nutrition Summary</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {getTotalNutrition(selectedDate).calories}
                        </div>
                        <div className="text-sm text-gray-600">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {getTotalNutrition(selectedDate).protein}g
                        </div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {getTotalNutrition(selectedDate).carbs}g
                        </div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {getTotalNutrition(selectedDate).fat}g
                        </div>
                        <div className="text-sm text-gray-600">Fat</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Daily Target: </span>
                          <span className="font-medium">{selectedPlan.targetCalories} calories</span>
                        </div>
                        <div className="text-sm">
                          <span className={getTotalNutrition(selectedDate).calories > selectedPlan.targetCalories ? 'text-red-600' : 'text-green-600'}>
                            {getTotalNutrition(selectedDate).calories > selectedPlan.targetCalories ? '+' : ''}
                            {getTotalNutrition(selectedDate).calories - selectedPlan.targetCalories} calories
                          </span>
                          {' from target'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No meal plan available for this date.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Utensils className="h-12 w-12 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Meal Plan Available</h2>
              <p className="text-gray-600 mb-6">
                You don't have any meal plans yet. Generate a personalized meal plan based on your preferences.
              </p>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate New Meal Plan</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 mb-1">
                  Diet Type
                </label>
                <select
                  id="dietType"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
                >
                  {dietTypes.map(diet => (
                    <option key={diet.id} value={diet.id}>{diet.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="calorieTarget" className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Calorie Target
                </label>
                <input
                  type="number"
                  id="calorieTarget"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(Number(e.target.value))}
                  min="1200"
                  max="4000"
                  step="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Goals (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {healthGoalOptions.map(goal => (
                    <div key={goal.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={goal.id}
                        checked={healthGoals.includes(goal.id)}
                        onChange={() => handleHealthGoalChange(goal.id)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label htmlFor={goal.id} className="ml-2 block text-sm text-gray-700">
                        {goal.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={generateMealPlan}
                disabled={generating}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md flex items-center justify-center disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Utensils className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </button>
            </div>
          </div>
          
          {mealPlans.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Meal Plans</h2>
              
              <div className="space-y-3">
                {mealPlans.map((plan, index) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left p-3 rounded-md ${
                      selectedPlan?.id === plan.id
                        ? 'bg-yellow-100 border border-yellow-300'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">
                          {index === 0 ? 'Current Plan' : `Plan ${mealPlans.length - index}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      {selectedPlan?.id === plan.id && (
                        <Check className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        {plan.targetCalories} cal
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                        {plan.dietType.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Nutrition Tips</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">Stay hydrated:</span> Drink at least 8 glasses of water daily, especially before meals.
              </p>
              <p>
                <span className="font-medium text-gray-700">Eat mindfully:</span> Pay attention to hunger and fullness cues, and avoid distractions while eating.
              </p>
              <p>
                <span className="font-medium text-gray-700">Include protein:</span> Aim to include a source of protein with each meal to help maintain muscle mass and feel fuller longer.
              </p>
              <p>
                <span className="font-medium text-gray-700">Fiber is essential:</span> Include plenty of fruits, vegetables, and whole grains for digestive health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanner;
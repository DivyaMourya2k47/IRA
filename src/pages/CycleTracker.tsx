import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Calendar from 'react-calendar';
import { format, addDays, differenceInDays } from 'date-fns';
// Removed Firestore imports
// import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
// import { db } from '../firebase/config';
import { CycleData, CycleDay } from '../types';
import { Calendar as CalendarIcon, Plus, Edit, Save, X, Moon, Sun, Cloud, Droplets, Activity } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const LOCAL_STORAGE_KEY = 'cycleTrackerCycles';

const CycleTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date());
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CycleDay>({
    date: format(date, 'yyyy-MM-dd'),
    flow: 'none',
    symptoms: [],
    mood: 'neutral',
    notes: '',
  });

  // Add new images for cycle phases
  const cyclePhaseImages = {
    menstrual: 'https://images.unsplash.com/photo-1584473457409-ae5c91d211ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    follicular: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ovulation: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    luteal: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  };

  const moodIcons = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    irritable: '😠',
    neutral: '😐'
  };

  const symptoms = [
    {
      name: 'Cramps',
      icon: <Activity className="h-4 w-4" />,
      category: 'pain'
    },
    {
      name: 'Headache',
      icon: <Activity className="h-4 w-4" />,
      category: 'pain'
    },
    {
      name: 'Bloating',
      icon: <Cloud className="h-4 w-4" />,
      category: 'physical'
    },
    {
      name: 'Fatigue',
      icon: <Moon className="h-4 w-4" />,
      category: 'physical'
    },
    {
      name: 'Breast Tenderness',
      icon: <Activity className="h-4 w-4" />,
      category: 'pain'
    },
    {
      name: 'Acne',
      icon: <Cloud className="h-4 w-4" />,
      category: 'physical'
    },
    {
      name: 'Backache',
      icon: <Activity className="h-4 w-4" />,
      category: 'pain'
    },
    {
      name: 'Nausea',
      icon: <Cloud className="h-4 w-4" />,
      category: 'physical'
    },
    {
      name: 'Insomnia',
      icon: <Moon className="h-4 w-4" />,
      category: 'sleep'
    },
    {
      name: 'Dizziness',
      icon: <Cloud className="h-4 w-4" />,
      category: 'physical'
    },
    {
      name: 'Cravings',
      icon: <Sun className="h-4 w-4" />,
      category: 'other'
    },
    {
      name: 'Mood Swings',
      icon: <Cloud className="h-4 w-4" />,
      category: 'emotional'
    }
  ];

  const getCurrentPhase = (cycleStartDate: Date, currentDate: Date) => {
    const daysSinceCycleStart = differenceInDays(currentDate, cycleStartDate);
    
    if (daysSinceCycleStart <= 5) {
      return {
        name: 'Menstrual Phase',
        description: 'Your period is active. Focus on rest and self-care.',
        image: cyclePhaseImages.menstrual
      };
    } else if (daysSinceCycleStart <= 13) {
      return {
        name: 'Follicular Phase',
        description: 'Your body is preparing for ovulation. Energy levels are typically higher.',
        image: cyclePhaseImages.follicular
      };
    } else if (daysSinceCycleStart <= 17) {
      return {
        name: 'Ovulation Phase',
        description: 'Peak fertility window. You may feel more energetic and social.',
        image: cyclePhaseImages.ovulation
      };
    } else {
      return {
        name: 'Luteal Phase',
        description: 'Post-ovulation phase. You may experience PMS symptoms.',
        image: cyclePhaseImages.luteal
      };
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCycles();
    }
  }, [currentUser]);
  
  // Helper functions to read/write cycles from/to localStorage
  const readCyclesFromLocalStorage = (): CycleData[] => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as CycleData[];
    } catch {
      return [];
    }
  };

  const writeCyclesToLocalStorage = (cyclesToStore: CycleData[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cyclesToStore));
  };

  const fetchCycles = async () => {
    try {
      setLoading(true);
      // Read cycles from localStorage
      const cyclesData = readCyclesFromLocalStorage().filter(cycle => cycle.userId === currentUser?.uid);
      // Sort by startDate descending
      cyclesData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      setCycles(cyclesData);
      
      // Set current cycle
      if (cyclesData.length > 0) {
        const latestCycle = cyclesData[0];
        setCurrentCycle(latestCycle);
      } else {
        setCurrentCycle(null);
      }
      
    } catch (error) {
      console.error('Error fetching cycles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (value: any, _event: any) => {
    if (!value || Array.isArray(value)) return;
    const newDate = value as Date;
    setDate(newDate);
    setFormData({
      ...formData,
      date: format(newDate, 'yyyy-MM-dd')
    });
    
    // Check if there's data for this date
    if (currentCycle) {
      const dayData = currentCycle.days.find(day => day.date === format(newDate, 'yyyy-MM-dd'));
      if (dayData) {
        setFormData(dayData);
        setShowForm(true);
      } else {
        setFormData({
          date: format(newDate, 'yyyy-MM-dd'),
          flow: 'none',
          symptoms: [],
          mood: 'neutral',
          notes: '',
        });
      }
    }
  };
  
  // Fix type errors for flow and mood updates by explicitly typing values
  const updateFlow = (flow: 'none' | 'light' | 'medium' | 'heavy') => {
    setFormData(prev => ({
      ...prev,
      flow
    }));
  };
  
  const updateMood = (mood: 'neutral' | 'happy' | 'sad' | 'anxious' | 'irritable') => {
    setFormData(prev => ({
      ...prev,
      mood
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSymptomChange = (symptom: string) => {
    setFormData(prev => {
      const symptoms = prev.symptoms || [];
      if (symptoms.includes(symptom)) {
        return {
          ...prev,
          symptoms: symptoms.filter(s => s !== symptom)
        };
      } else {
        return {
          ...prev,
          symptoms: [...symptoms, symptom]
        };
      }
    });
  };
  
  const startNewCycle = async () => {
    if (!currentUser) return;
    
    try {
      const newCycle: CycleData = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        startDate: format(date, 'yyyy-MM-dd'),
        cycleLength: 28, // Default cycle length
        periodLength: 5, // Default period length
        days: [{
          date: format(date, 'yyyy-MM-dd'),
          flow: 'medium', // Default to medium flow for first day
          symptoms: [],
          mood: 'neutral',
          notes: '',
        }],
        predictedNextStart: '',
      };
      
      // Calculate predicted end date based on average cycle length
      if (cycles.length >= 2) {
        const lastCycles = cycles.slice(0, Math.min(3, cycles.length));
        const avgDuration = lastCycles.reduce((sum, cycle) => {
          return sum + (cycle.duration || 28);
        }, 0) / lastCycles.length;
        
        newCycle.predictedNextStart = format(addDays(date, Math.round(avgDuration)), 'yyyy-MM-dd');
      } else {
        // Default to 28 days if not enough data
        newCycle.predictedNextStart = format(addDays(date, 28), 'yyyy-MM-dd');
      }
      
      // If there was a current cycle, update its end date and duration in localStorage
      if (currentCycle) {
        const duration = differenceInDays(date, new Date(currentCycle.startDate));
        const updatedCycles = cycles.map(cycle => {
          if (cycle.id === currentCycle.id) {
            return {
              ...cycle,
              endDate: format(date, 'yyyy-MM-dd'),
              duration: duration
            };
          }
          return cycle;
        });
        writeCyclesToLocalStorage(updatedCycles);
        setCycles(updatedCycles);
      }
      
      // Add new cycle to localStorage
      const updatedCycles = [newCycle, ...cycles];
      writeCyclesToLocalStorage(updatedCycles);
      setCycles(updatedCycles);
      setCurrentCycle(newCycle);

      alert('Cycle saved successfully.');
      
    } catch (error) {
      console.error('Error starting new cycle:', error);
      alert('Failed to start new cycle. Please try again.');
    }
  };
  
  const saveDay = async () => {
    if (!currentUser || !currentCycle) return;
    
    try {
      // Check if this day already exists in the current cycle
      const existingDayIndex = currentCycle.days.findIndex(day => day.date === formData.date);
      
      let updatedDays;
      if (existingDayIndex >= 0) {
        // Update existing day
        updatedDays = [...currentCycle.days];
        updatedDays[existingDayIndex] = formData;
      } else {
        // Add new day
        updatedDays = [...currentCycle.days, formData];
      }
      
      // Update the cycle in localStorage
      const updatedCycles = cycles.map(cycle => {
        if (cycle.id === currentCycle.id) {
          return {
            ...cycle,
            days: updatedDays
          };
        }
        return cycle;
      });
      writeCyclesToLocalStorage(updatedCycles);
      setCycles(updatedCycles);
      
      // Update local state
      setCurrentCycle({
        ...currentCycle,
        days: updatedDays
      });
      
      setShowForm(false);
      alert('Day saved successfully.');
      
    } catch (error) {
      console.error('Error saving day:', error);
      alert('Failed to save day. Please try again.');
    }
  };
  
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (!currentCycle) return '';
    
    const dayData = currentCycle.days.find(day => day.date === dateStr);
    
    if (!dayData) return '';
    
    let className = 'relative';
    
    // Add flow indicator
    if (dayData.flow === 'light') {
      className += ' bg-red-100';
    } else if (dayData.flow === 'medium') {
      className += ' bg-red-200';
    } else if (dayData.flow === 'heavy') {
      className += ' bg-red-300';
    }
    
    return className;
  };
  
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (!currentCycle) return null;
    
    const dayData = currentCycle.days.find(day => day.date === dateStr);
    
    if (!dayData) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        {dayData.mood === 'happy' && <span className="text-xs">😊</span>}
        {dayData.mood === 'sad' && <span className="text-xs">😢</span>}
        {dayData.mood === 'anxious' && <span className="text-xs">😰</span>}
        {dayData.mood === 'irritable' && <span className="text-xs">😠</span>}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Cycle Tracker</h1>
          </div>
          <button
            onClick={() => startNewCycle()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Start New Cycle
          </button>
        </div>
        
        {currentCycle && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {Object.entries(cyclePhaseImages).map(([phase, image]) => (
              <div key={phase} className="relative overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={phase}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white font-medium capitalize">{phase} Phase</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
            </div>
            
            <div className="cycle-calendar">
              <Calendar
                onChange={handleDateChange}
                value={date}
                tileClassName={getTileClassName}
                tileContent={getTileContent}
                className="w-full border-none"
              />
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Light Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Medium Flow</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-300 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Heavy Flow</span>
              </div>
            </div>
          </div>

          {currentCycle && (
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Cycle Overview</h2>
              
              {currentCycle.startDate && (
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Cycle Started</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {format(new Date(currentCycle.startDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    {currentCycle.predictedNextStart && (
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Next Period Predicted</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {format(new Date(currentCycle.predictedNextStart), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentCycle.startDate && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Current Phase</h3>
                  {(() => {
                    const phase = getCurrentPhase(
                      new Date(currentCycle.startDate),
                      new Date()
                    );
                    return (
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="h-48 relative">
                          <img
                            src={phase.image}
                            alt={phase.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <div className="text-white">
                              <h4 className="text-xl font-semibold">{phase.name}</h4>
                              <p className="mt-1">{phase.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {showForm ? 'Edit Day' : 'Day Details'}
                </h2>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {showForm ? (
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="text-gray-800 font-medium">
                    {format(date, 'MMMM d, yyyy')}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flow
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['none', 'light', 'medium', 'heavy'].map(flow => {
                      const typedFlow = flow as 'none' | 'light' | 'medium' | 'heavy';
                      return (
                        <button
                          key={flow}
                          type="button"
                          onClick={() => updateFlow(typedFlow)}
                          className={`p-2 rounded-md border flex items-center justify-center ${
                            formData.flow === typedFlow
                              ? 'bg-purple-100 border-purple-500 text-purple-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Droplets className={`h-4 w-4 mr-1 ${
                            formData.flow === typedFlow ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <span className="capitalize">{flow}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mood
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(moodIcons).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => updateMood(mood as 'neutral' | 'happy' | 'sad' | 'anxious' | 'irritable')}
                        className={`p-2 rounded-md border flex items-center justify-center ${
                          formData.mood === mood
                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xl mr-1">{emoji}</span>
                        <span className="capitalize text-sm">{mood}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map(symptom => (
                      <div key={symptom.name} className="flex items-center">
                        <input
                          type="checkbox"
                          id={symptom.name}
                          checked={(formData.symptoms || []).includes(symptom.name)}
                          onChange={() => handleSymptomChange(symptom.name)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={symptom.name} className="ml-2 flex items-center text-sm text-gray-700">
                          {symptom.icon}
                          <span className="ml-1">{symptom.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
                    placeholder="Add any additional notes here..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveDay}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Selected date: <span className="font-semibold">{format(date, 'MMMM d, yyyy')}</span>
                </p>
                
                {currentCycle && currentCycle.days.find(day => day.date === format(date, 'yyyy-MM-dd')) ? (
                  <div>
                    {formData.flow !== 'none' && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Flow</h3>
                        <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full ${
                          formData.flow === 'light' ? 'bg-red-100 text-red-800' :
                          formData.flow === 'medium' ? 'bg-red-200 text-red-800' :
                          'bg-red-300 text-red-800'
                        }`}>
                          <Droplets className="h-4 w-4 mr-1" />
                          <span className="capitalize">{formData.flow}</span>
                        </div>
                      </div>
                    )}
                    
                    {formData.mood && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Mood</h3>
                        <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                          <span className="text-xl mr-1">{moodIcons[formData.mood]}</span>
                          <span className="capitalize">{formData.mood}</span>
                        </div>
                      </div>
                    )}
                    
                    {formData.symptoms && formData.symptoms.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Symptoms</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.symptoms.map(symptom => {
                            const symptomData = symptoms.find(s => s.name === symptom);
                            return (
                              <div
                                key={symptom}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800"
                              >
                                {symptomData?.icon}
                                <span className="ml-1">{symptom}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {formData.notes && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                        <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md">
                          {formData.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No data for this date. Click Edit to add details.</p>
                )}
              </div>
            )}
          </div>
          
          {cycles.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <div className="mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Cycle History</h2>
              </div>
              
              <div className="space-y-4">
                {cycles.slice(0, 5).map((cycle, index) => (
                  <div
                    key={cycle.id}
                    className="bg-white border rounded-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Cycle {cycles.length - index}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Started: {format(new Date(cycle.startDate), 'MMM d, yyyy')}
                          </p>
                          {cycle.endDate && (
                            <p className="text-sm text-gray-600">
                              Ended: {format(new Date(cycle.endDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        {cycle.duration && (
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {cycle.duration} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;
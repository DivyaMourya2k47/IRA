import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, AlertTriangle, Activity, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: 'pcos' | 'pcod' | 'breast_cancer';
  weight: number;
}

interface Assessment {
  category: 'pcos' | 'pcod' | 'breast_cancer';
  score: number;
  recommendations: string[];
}

const DiseaseDetection: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedCondition, setSelectedCondition] = useState<'pcos' | 'pcod' | 'breast_cancer'>('pcos');
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);

  const conditions = [
    {
      id: 'pcos',
      name: 'PCOS Risk Assessment',
      description: 'Evaluate your risk for Polycystic Ovary Syndrome',
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'pcod',
      name: 'PCOD Risk Assessment',
      description: 'Check your risk for Polycystic Ovarian Disease',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'breast_cancer',
      name: 'Breast Cancer Risk Assessment',
      description: 'Early detection screening questionnaire',
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ];

  const questions: Question[] = [
    // PCOS Questions
    {
      id: 'irregular_periods',
      text: 'Do you have irregular menstrual periods?',
      category: 'pcos',
      weight: 2
    },
    {
      id: 'weight_gain',
      text: 'Have you experienced unexplained weight gain or difficulty losing weight?',
      category: 'pcos',
      weight: 1.5
    },
    {
      id: 'acne',
      text: 'Do you have persistent acne?',
      category: 'pcos',
      weight: 1
    },
    {
      id: 'hair_growth',
      text: 'Do you have excessive hair growth on face, chest, or other areas?',
      category: 'pcos',
      weight: 1.5
    },
    {
      id: 'hair_loss',
      text: 'Have you experienced hair thinning or male-pattern baldness?',
      category: 'pcos',
      weight: 1
    },
    // PCOD Questions
    {
      id: 'pelvic_pain',
      text: 'Do you experience pelvic pain during menstruation?',
      category: 'pcod',
      weight: 2
    },
    {
      id: 'mood_swings',
      text: 'Do you have severe mood swings before or during periods?',
      category: 'pcod',
      weight: 1
    },
    {
      id: 'fatigue',
      text: 'Do you experience unusual fatigue or low energy?',
      category: 'pcod',
      weight: 1.5
    },
    {
      id: 'skin_darkening',
      text: 'Have you noticed darkening of skin in certain areas?',
      category: 'pcod',
      weight: 1
    },
    // Breast Cancer Questions
    {
      id: 'breast_lump',
      text: 'Have you noticed any lumps in your breasts?',
      category: 'breast_cancer',
      weight: 3
    },
    {
      id: 'breast_changes',
      text: 'Have you noticed any changes in breast size or shape?',
      category: 'breast_cancer',
      weight: 2
    },
    {
      id: 'nipple_discharge',
      text: 'Have you experienced any unusual nipple discharge?',
      category: 'breast_cancer',
      weight: 2
    },
    {
      id: 'breast_pain',
      text: 'Do you have persistent breast pain?',
      category: 'breast_cancer',
      weight: 1.5
    }
  ];

  const handleAnswerChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateRisk = () => {
    setLoading(true);
    
    // Get relevant questions for selected condition
    const relevantQuestions = questions.filter(q => q.category === selectedCondition);
    
    // Calculate total possible score
    const maxScore = relevantQuestions.reduce((sum, q) => sum + q.weight, 0);
    
    // Calculate user's score
    const userScore = relevantQuestions.reduce((sum, q) => {
      return sum + (answers[q.id] ? q.weight : 0);
    }, 0);
    
    // Convert to percentage
    const riskScore = (userScore / maxScore) * 100;
    
    // Generate recommendations based on risk level
    const recommendations = generateRecommendations(selectedCondition, riskScore);
    
    setAssessment({
      category: selectedCondition,
      score: riskScore,
      recommendations
    });
    
    setLoading(false);
  };

  const generateRecommendations = (condition: string, score: number): string[] => {
    const baseRecommendations = [
      'Schedule regular check-ups with your healthcare provider',
      'Maintain a healthy diet and exercise routine',
      'Keep track of your symptoms and changes'
    ];

    if (score > 70) {
      return [
        'Consult a healthcare provider immediately',
        'Consider comprehensive medical screening',
        ...baseRecommendations
      ];
    } else if (score > 40) {
      return [
        'Schedule a consultation with a healthcare provider',
        'Monitor your symptoms closely',
        ...baseRecommendations
      ];
    } else {
      return [
        'Continue with routine health screenings',
        'Maintain awareness of any changes',
        ...baseRecommendations
      ];
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { text: 'High Risk', color: 'text-red-600', bg: 'bg-red-100' };
    if (score >= 40) return { text: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const resetAssessment = () => {
    setAnswers({});
    setAssessment(null);
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <Heart className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Health Risk Assessment</h1>
        </div>
        <p className="text-gray-600 mt-2">
          Early detection is key. Complete this assessment to understand your health risks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {conditions.map(condition => (
          <div
            key={condition.id}
            onClick={() => {
              setSelectedCondition(condition.id as any);
              resetAssessment();
            }}
            className={`bg-white shadow rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
              selectedCondition === condition.id ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div className="h-48 overflow-hidden">
              <img
                src={condition.image}
                alt={condition.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800">{condition.name}</h3>
              <p className="text-gray-600 mt-2">{condition.description}</p>
            </div>
          </div>
        ))}
      </div>

      {!assessment ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {conditions.find(c => c.id === selectedCondition)?.name}
          </h2>

          <div className="space-y-6">
            {questions
              .filter(q => q.category === selectedCondition)
              .map(question => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 mb-3">{question.text}</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleAnswerChange(question.id, true)}
                      className={`px-4 py-2 rounded-md ${
                        answers[question.id] === true
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswerChange(question.id, false)}
                      className={`px-4 py-2 rounded-md ${
                        answers[question.id] === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={calculateRisk}
            disabled={loading || Object.keys(answers).length === 0}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Calculating...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Calculate Risk
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Assessment Results</h2>
            <button
              onClick={resetAssessment}
              className="text-gray-600 hover:text-gray-800"
            >
              Start Over
            </button>
          </div>

          <div className={`p-6 rounded-lg ${getRiskLevel(assessment.score).bg}`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Risk Level</h3>
                <p className={`text-2xl font-bold ${getRiskLevel(assessment.score).color}`}>
                  {getRiskLevel(assessment.score).text}
                </p>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {Math.round(assessment.score)}%
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full ${
                  assessment.score >= 70
                    ? 'bg-red-600'
                    : assessment.score >= 40
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${assessment.score}%` }}
              ></div>
            </div>

            <div className="mt-6">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-medium text-gray-800">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                This assessment is for informational purposes only and should not be considered as medical advice. Always consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
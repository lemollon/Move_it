import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home, ArrowLeft, Send, Bot, User, CheckCircle, Circle, AlertCircle,
  FileText, DollarSign, Calendar, MapPin, Users, Building2, Shield,
  ChevronRight, Download, Edit, Save, X, Clock, Sparkles
} from 'lucide-react';

export default function ContractInfoCollector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactionId } = useParams();
  const messagesEndRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  // Questions organized by section
  const sections = [
    {
      id: 'property',
      title: 'Property Information',
      icon: Building2,
      questions: [
        { id: 'address', question: 'What is the complete property address including city, state, and ZIP code?', field: 'propertyAddress', type: 'text' },
        { id: 'legal_desc', question: 'Do you have the legal description of the property? (If not, we\'ll obtain it from the title company)', field: 'legalDescription', type: 'text', optional: true },
        { id: 'property_type', question: 'What type of property is this? (Single Family, Condo, Townhouse, Land, Multi-Family)', field: 'propertyType', type: 'choice', options: ['Single Family', 'Condo', 'Townhouse', 'Land', 'Multi-Family'] },
        { id: 'included', question: 'List any items that will be included with the sale (appliances, fixtures, etc.)', field: 'includedItems', type: 'text' },
        { id: 'excluded', question: 'Are there any items that will be excluded from the sale?', field: 'excludedItems', type: 'text', optional: true }
      ]
    },
    {
      id: 'buyer',
      title: 'Buyer Information',
      icon: Users,
      questions: [
        { id: 'buyer_name', question: 'What is the full legal name of the buyer(s)?', field: 'buyerName', type: 'text' },
        { id: 'buyer_email', question: 'What is the buyer\'s email address?', field: 'buyerEmail', type: 'email' },
        { id: 'buyer_phone', question: 'What is the buyer\'s phone number?', field: 'buyerPhone', type: 'phone' },
        { id: 'buyer_address', question: 'What is the buyer\'s current mailing address?', field: 'buyerAddress', type: 'text' },
        { id: 'buyer_entity', question: 'Will the buyer be purchasing as an individual, married couple, or entity (LLC, Trust)?', field: 'buyerEntity', type: 'choice', options: ['Individual', 'Married Couple', 'LLC', 'Trust', 'Corporation'] }
      ]
    },
    {
      id: 'seller',
      title: 'Seller Information',
      icon: Users,
      questions: [
        { id: 'seller_name', question: 'What is the full legal name of the seller(s)?', field: 'sellerName', type: 'text' },
        { id: 'seller_email', question: 'What is the seller\'s email address?', field: 'sellerEmail', type: 'email' },
        { id: 'seller_phone', question: 'What is the seller\'s phone number?', field: 'sellerPhone', type: 'phone' },
        { id: 'seller_entity', question: 'Is the seller an individual, married couple, or entity?', field: 'sellerEntity', type: 'choice', options: ['Individual', 'Married Couple', 'LLC', 'Trust', 'Estate', 'Corporation'] }
      ]
    },
    {
      id: 'price',
      title: 'Price & Terms',
      icon: DollarSign,
      questions: [
        { id: 'sale_price', question: 'What is the agreed-upon sale price?', field: 'salePrice', type: 'currency' },
        { id: 'earnest_money', question: 'How much earnest money will the buyer provide?', field: 'earnestMoney', type: 'currency' },
        { id: 'earnest_holder', question: 'Who will hold the earnest money? (Title company name)', field: 'earnestHolder', type: 'text' },
        { id: 'option_fee', question: 'What is the option fee amount? (For the unrestricted right to terminate)', field: 'optionFee', type: 'currency' },
        { id: 'option_days', question: 'How many days for the option period? (Typically 7-10 days)', field: 'optionDays', type: 'number' }
      ]
    },
    {
      id: 'financing',
      title: 'Financing Details',
      icon: Building2,
      questions: [
        { id: 'financing_type', question: 'How will the purchase be financed?', field: 'financingType', type: 'choice', options: ['Conventional Loan', 'FHA Loan', 'VA Loan', 'USDA Loan', 'Cash', 'Seller Financing', 'Assumption'] },
        { id: 'down_payment', question: 'What is the down payment amount or percentage?', field: 'downPayment', type: 'text' },
        { id: 'loan_approval', question: 'Has the buyer been pre-approved for a loan? If yes, by which lender?', field: 'loanApproval', type: 'text' },
        { id: 'financing_deadline', question: 'By what date must the buyer obtain loan approval? (Typically 21-30 days)', field: 'financingDeadline', type: 'date' }
      ]
    },
    {
      id: 'closing',
      title: 'Closing Details',
      icon: Calendar,
      questions: [
        { id: 'closing_date', question: 'What is the desired closing date?', field: 'closingDate', type: 'date' },
        { id: 'title_company', question: 'Which title company will handle the closing?', field: 'titleCompany', type: 'text' },
        { id: 'title_policy', question: 'Who will pay for the owner\'s title policy? (Seller is typical in Texas)', field: 'titlePolicyPayer', type: 'choice', options: ['Seller', 'Buyer', 'Split'] },
        { id: 'survey', question: 'Will a new survey be required or will an existing survey be used?', field: 'surveyType', type: 'choice', options: ['New Survey Required', 'Existing Survey', 'Not Applicable'] },
        { id: 'possession', question: 'When will the buyer take possession? (At closing is typical)', field: 'possession', type: 'choice', options: ['At Closing', 'Before Closing (Specify)', 'After Closing (Specify)'] }
      ]
    },
    {
      id: 'contingencies',
      title: 'Contingencies & Special Terms',
      icon: Shield,
      questions: [
        { id: 'inspection', question: 'Will there be a home inspection contingency?', field: 'inspectionContingency', type: 'choice', options: ['Yes', 'No', 'Waived'] },
        { id: 'appraisal', question: 'Will there be an appraisal contingency?', field: 'appraisalContingency', type: 'choice', options: ['Yes', 'No', 'Waived with Gap Coverage'] },
        { id: 'sale_contingency', question: 'Is this sale contingent on the buyer selling their current home?', field: 'saleContingency', type: 'choice', options: ['Yes', 'No'] },
        { id: 'repairs', question: 'Are there any agreed-upon repairs the seller will complete?', field: 'agreedRepairs', type: 'text', optional: true },
        { id: 'special_terms', question: 'Are there any other special terms or conditions to include?', field: 'specialTerms', type: 'text', optional: true }
      ]
    }
  ];

  // Flatten all questions
  const allQuestions = sections.flatMap(section =>
    section.questions.map(q => ({ ...q, sectionId: section.id, sectionTitle: section.title }))
  );

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      addBotMessage(
        "Welcome to the Move-it Contract Information Collector! I'll help gather all the information needed for your attorney to prepare the purchase contract. Let's start with some basic property information.",
        true
      );
      setTimeout(() => {
        askQuestion(0);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text, isGreeting = false) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      text,
      isGreeting
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text
    }]);
  };

  const askQuestion = (index) => {
    if (index >= allQuestions.length) {
      // All questions completed
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(
          "Excellent! I've collected all the necessary information. You can review the summary and make any edits before sending it to your attorney."
        );
        setShowSummary(true);
      }, 1000);
      return;
    }

    const question = allQuestions[index];
    const prevQuestion = index > 0 ? allQuestions[index - 1] : null;

    // Check if entering a new section
    if (!prevQuestion || prevQuestion.sectionId !== question.sectionId) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(`Great! Now let's gather the ${question.sectionTitle.toLowerCase()}.`);
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addBotMessage(question.question);
            setCurrentStep(index);
          }, 800);
        }, 500);
      }, 800);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(question.question);
        setCurrentStep(index);
      }, 800);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() && !allQuestions[currentStep]?.optional) return;

    const currentQuestion = allQuestions[currentStep];
    const answer = userInput.trim() || 'Not provided';

    addUserMessage(answer);
    setCollectedInfo(prev => ({
      ...prev,
      [currentQuestion.field]: answer
    }));
    setUserInput('');

    // Acknowledge and move to next question
    setTimeout(() => {
      const acknowledgments = [
        "Got it!",
        "Perfect, thank you!",
        "Noted.",
        "Great!",
        "Thanks for that information.",
        "Understood."
      ];
      const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(ack);
        setTimeout(() => {
          askQuestion(currentStep + 1);
        }, 500);
      }, 500);
    }, 300);
  };

  const handleOptionSelect = (option) => {
    const currentQuestion = allQuestions[currentStep];

    addUserMessage(option);
    setCollectedInfo(prev => ({
      ...prev,
      [currentQuestion.field]: option
    }));

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage("Got it!");
        setTimeout(() => {
          askQuestion(currentStep + 1);
        }, 500);
      }, 500);
    }, 300);
  };

  const skipQuestion = () => {
    const currentQuestion = allQuestions[currentStep];
    if (currentQuestion.optional) {
      addUserMessage("Skip");
      setCollectedInfo(prev => ({
        ...prev,
        [currentQuestion.field]: 'Not provided'
      }));
      setTimeout(() => {
        askQuestion(currentStep + 1);
      }, 500);
    }
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / allQuestions.length) * 100);
  };

  const getSectionProgress = () => {
    return sections.map(section => {
      const sectionQuestions = allQuestions.filter(q => q.sectionId === section.id);
      const answeredCount = sectionQuestions.filter(q => collectedInfo[q.field]).length;
      return {
        ...section,
        total: sectionQuestions.length,
        answered: answeredCount,
        complete: answeredCount === sectionQuestions.length
      };
    });
  };

  const formatCurrency = (value) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const currentQuestion = allQuestions[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <Home className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-blue-900">Move-it</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">AI Contract Info Collector</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar - Progress */}
        <aside className="w-72 bg-white shadow-sm hidden lg:block">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-blue-600">{getProgressPercentage()}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Sections</h3>
            <div className="space-y-3">
              {getSectionProgress().map(section => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      section.complete ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {section.complete ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <Icon className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      <span className={`text-sm font-medium ${
                        section.complete ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {section.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {section.answered}/{section.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Attorney Prepared</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This information will be sent to a licensed Texas real estate attorney who will prepare your contract.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white shadow-sm border border-gray-100'
                    }`}
                  >
                    <p className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
                      {message.text}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Choice Options */}
              {currentQuestion?.type === 'choice' && !isTyping && !showSummary && (
                <div className="ml-11 flex flex-wrap gap-2">
                  {currentQuestion.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          {!showSummary && currentQuestion?.type !== 'choice' && (
            <div className="border-t bg-white p-4">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                  <input
                    type={currentQuestion?.type === 'email' ? 'email' : currentQuestion?.type === 'date' ? 'date' : 'text'}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={currentQuestion?.optional ? 'Type your answer or skip...' : 'Type your answer...'}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isTyping}
                  />
                  {currentQuestion?.optional && (
                    <button
                      type="button"
                      onClick={skipQuestion}
                      className="px-4 py-3 text-gray-500 hover:text-gray-700"
                      disabled={isTyping}
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isTyping || (!userInput.trim() && !currentQuestion?.optional)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Summary View */}
          {showSummary && (
            <div className="border-t bg-white p-6 max-h-[60vh] overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Information Summary</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Send to Attorney
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {sections.map(section => {
                    const Icon = section.icon;
                    const sectionQuestions = allQuestions.filter(q => q.sectionId === section.id);
                    return (
                      <div key={section.id} className="bg-gray-50 rounded-xl p-5">
                        <div className="flex items-center mb-4">
                          <Icon className="w-5 h-5 text-blue-600 mr-2" />
                          <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sectionQuestions.map(q => (
                            <div key={q.id}>
                              <p className="text-xs text-gray-500 uppercase mb-1">
                                {q.field.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="font-medium text-gray-900">
                                {collectedInfo[q.field] || 'Not provided'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Ready for Attorney Review</p>
                      <p className="text-sm text-green-700 mt-1">
                        Once submitted, a licensed Texas real estate attorney will review this information and prepare your purchase contract within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

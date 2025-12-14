import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, Building2, ArrowRight, Shield, Clock, DollarSign, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const navigate = useNavigate();

  const userTypes = [
    {
      id: 'seller',
      title: 'I Want to Sell',
      description: 'List your property and save thousands with our 2% fee',
      icon: Home,
      color: 'bg-blue-500',
      path: '/register?role=seller'
    },
    {
      id: 'buyer',
      title: 'I Want to Buy',
      description: 'Find your dream home and make offers directly',
      icon: Users,
      color: 'bg-green-500',
      path: '/register?role=buyer'
    },
    {
      id: 'vendor',
      title: 'Service Provider',
      description: 'Join as a title company, inspector, attorney, or appraiser',
      icon: Briefcase,
      color: 'bg-purple-500',
      path: '/register?role=vendor'
    },
    {
      id: 'investor',
      title: 'Investor / Wholesaler',
      description: 'Access deals and streamline your investment process',
      icon: Building2,
      color: 'bg-orange-500',
      path: '/register?role=buyer'
    }
  ];

  const benefits = [
    { icon: DollarSign, title: 'Save $19,400 Average', description: 'Pay only 2% vs traditional 6% realtor fees' },
    { icon: Clock, title: '30-Day Close Guarantee', description: 'Our streamlined process gets you to closing faster' },
    { icon: Shield, title: 'Attorney-Backed', description: 'Licensed Texas attorneys handle all contracts' },
    { icon: CheckCircle, title: 'Full Transaction Support', description: 'Everything you need in one platform' }
  ];

  const howItWorks = [
    { step: 1, title: 'Create Your Listing', description: 'Our AI helps you create a professional listing with photos and descriptions' },
    { step: 2, title: 'Connect with Buyers', description: 'Receive and manage offers directly through the platform' },
    { step: 3, title: 'Choose Your Vendors', description: 'Select from vetted title companies, inspectors, and attorneys' },
    { step: 4, title: 'Close in 30 Days', description: 'Our transaction management keeps everything on track' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Move-it</h2>
              <p className="text-gray-600">Your Virtual Realtor</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold mb-2">Important Notice:</p>
              <ul className="space-y-2">
                <li>• Move-it is a marketplace that facilitates connections between buyers, sellers, and service providers.</li>
                <li>• We do not represent any party in the transaction.</li>
                <li>• All contracts are prepared by licensed Texas real estate attorneys.</li>
                <li>• Payments are made directly between consumers and vendors.</li>
              </ul>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">Move-it</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            Your Virtual Realtor
          </h1>
          <p className="text-2xl text-blue-600 font-semibold mb-2">
            Sell Smart. Move Fast.
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save thousands with our 2% transaction fee. Close in 30 days.
            Everything you need to buy or sell property in Texas.
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            How can we help you today?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(type.path)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-400 text-left group"
                >
                  <div className={`${type.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-900 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            Why Choose Move-it?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-200" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-blue-200 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Save Thousands?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of Texans who have used Move-it to buy and sell property without traditional realtor fees.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Move-it</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p className="mb-2">Move-it is a marketplace facilitating connections. We do not represent any party.</p>
            <p>&copy; 2024 Move-it. All rights reserved. Licensed to operate in Texas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

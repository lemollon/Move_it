import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone, Building, FileText, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, error: authError } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    // Vendor specific
    businessName: '',
    vendorType: '',
    licenseNumber: '',
    serviceAreas: []
  });

  const roles = [
    { id: 'seller', label: 'Seller', description: 'List and sell your property' },
    { id: 'buyer', label: 'Buyer', description: 'Find and purchase property' },
    { id: 'vendor', label: 'Service Provider', description: 'Offer services to buyers and sellers' }
  ];

  const vendorTypes = [
    { id: 'title_company', label: 'Title Company' },
    { id: 'home_inspector', label: 'Home Inspector' },
    { id: 'attorney', label: 'Real Estate Attorney' },
    { id: 'appraiser', label: 'Appraiser' }
  ];

  const serviceAreaOptions = [
    'Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso',
    'Arlington', 'Plano', 'Corpus Christi', 'Lubbock'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const toggleServiceArea = (area) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }));
  };

  const validateStep = () => {
    if (step === 1 && !role) {
      setError('Please select a role');
      return false;
    }
    if (step === 2) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your name');
        return false;
      }
      if (!formData.email) {
        setError('Please enter your email');
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    if (step === 3 && role === 'vendor') {
      if (!formData.businessName || !formData.vendorType || !formData.licenseNumber) {
        setError('Please fill in all business information');
        return false;
      }
      if (formData.serviceAreas.length === 0) {
        setError('Please select at least one service area');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 2 && role !== 'vendor') {
        handleSubmit();
      } else if (step === 3) {
        handleSubmit();
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const userData = {
      email: formData.email,
      password: formData.password,
      role: role,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone
    };

    if (role === 'vendor') {
      userData.vendor_info = {
        business_name: formData.businessName,
        vendor_type: formData.vendorType,
        license_number: formData.licenseNumber,
        service_areas: formData.serviceAreas
      };
    }

    const result = await register(userData);

    if (result.success) {
      switch (role) {
        case 'seller':
          navigate('/seller');
          break;
        case 'buyer':
          navigate('/buyer');
          break;
        case 'vendor':
          navigate('/vendor');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">Move-it</span>
          </Link>
        </div>
      </header>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].slice(0, role === 'vendor' ? 3 : 2).map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < (role === 'vendor' ? 3 : 2) && (
                  <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">Join Move-it</h2>
              <p className="text-center text-gray-600 mb-8">Select how you'd like to use Move-it</p>

              <div className="space-y-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      role === r.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{r.label}</div>
                    <div className="text-sm text-gray-600">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">Create Account</h2>
              <p className="text-center text-gray-600 mb-8">Enter your personal information</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vendor Info (only for vendors) */}
          {step === 3 && role === 'vendor' && (
            <div>
              <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">Business Information</h2>
              <p className="text-center text-gray-600 mb-8">Tell us about your business</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="Your Business LLC"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    name="vendorType"
                    value={formData.vendorType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                  >
                    <option value="">Select your service type</option>
                    {vendorTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                      placeholder="Your license number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreaOptions.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleServiceArea(area)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.serviceAreas.includes(area)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-medium">Free 30-Day Trial</p>
                  <p className="text-green-700 text-sm">Start receiving leads immediately. Upgrade anytime for premium placement.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 ${
                step === 1 ? 'w-full' : 'ml-auto'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : step === 1 ? (
                'Continue'
              ) : step === 2 && role !== 'vendor' ? (
                'Create Account'
              ) : step === 3 ? (
                'Create Account'
              ) : (
                'Continue'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="text-center text-sm text-gray-500">
          Move-it is a marketplace facilitating connections. We do not represent any party.
        </div>
      </footer>
    </div>
  );
}

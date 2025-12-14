import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home, Search, Heart, FileText, MessageSquare, Bell, Settings, LogOut,
  MapPin, Bed, Bath, Square, DollarSign, Filter, Grid, List, ChevronDown,
  X, Send, Clock, CheckCircle, AlertCircle, Star, Phone, Mail, Calendar,
  Building2, Droplets, GraduationCap, Shield, TrendingUp, Eye, HeartOff
} from 'lucide-react';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [favorites, setFavorites] = useState([1, 3]);

  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    minSqft: '',
    maxSqft: ''
  });

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    amount: '',
    earnestMoney: '',
    closingDays: '30',
    contingencies: ['inspection', 'financing'],
    message: ''
  });

  // Demo properties data
  const [properties] = useState([
    {
      id: 1,
      address: '4521 Oak Valley Dr',
      city: 'Dallas',
      state: 'TX',
      zip: '75287',
      price: 425000,
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 2450,
      yearBuilt: 2018,
      propertyType: 'Single Family',
      photos: ['/api/placeholder/800/600'],
      description: 'Beautiful modern home in sought-after neighborhood. Open floor plan with chef\'s kitchen, quartz counters, and stainless appliances.',
      features: ['Pool', 'Updated Kitchen', '2-Car Garage', 'Smart Home'],
      daysOnMarket: 5,
      sellerMotivation: 'Relocating for work',
      schoolDistrict: 'Plano ISD',
      taxes: 8500,
      hoa: 150,
      floodZone: 'Zone X (Minimal Risk)',
      mud: 'N/A'
    },
    {
      id: 2,
      address: '8932 Maple Creek Ln',
      city: 'Frisco',
      state: 'TX',
      zip: '75034',
      price: 575000,
      bedrooms: 5,
      bathrooms: 3.5,
      sqft: 3200,
      yearBuilt: 2020,
      propertyType: 'Single Family',
      photos: ['/api/placeholder/800/600'],
      description: 'Stunning new construction in master-planned community. Premium lot with greenbelt views. Media room, game room, covered patio.',
      features: ['Greenbelt', 'Media Room', '3-Car Garage', 'Premium Lot'],
      daysOnMarket: 12,
      sellerMotivation: 'Upsizing',
      schoolDistrict: 'Frisco ISD',
      taxes: 11500,
      hoa: 200,
      floodZone: 'Zone X (Minimal Risk)',
      mud: 'MUD #5 - $0.25/sqft'
    },
    {
      id: 3,
      address: '1205 Downtown Blvd #1802',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 650000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1450,
      yearBuilt: 2022,
      propertyType: 'Condo',
      photos: ['/api/placeholder/800/600'],
      description: 'Luxury high-rise living with panoramic city views. Floor-to-ceiling windows, chef\'s kitchen, resort-style amenities.',
      features: ['City Views', 'Concierge', 'Rooftop Pool', 'Gym'],
      daysOnMarket: 8,
      sellerMotivation: 'Investment sale',
      schoolDistrict: 'Austin ISD',
      taxes: 13000,
      hoa: 650,
      floodZone: 'Zone X (Minimal Risk)',
      mud: 'N/A'
    },
    {
      id: 4,
      address: '7788 Ranch Road',
      city: 'McKinney',
      state: 'TX',
      zip: '75070',
      price: 385000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1850,
      yearBuilt: 2015,
      propertyType: 'Single Family',
      photos: ['/api/placeholder/800/600'],
      description: 'Charming ranch-style home on quiet cul-de-sac. Open living, breakfast bar, covered porch. Move-in ready!',
      features: ['Cul-de-sac', 'Covered Porch', 'No HOA', 'Large Yard'],
      daysOnMarket: 3,
      sellerMotivation: 'Estate sale',
      schoolDistrict: 'McKinney ISD',
      taxes: 7200,
      hoa: 0,
      floodZone: 'Zone X (Minimal Risk)',
      mud: 'N/A'
    },
    {
      id: 5,
      address: '3344 Sunset Ridge',
      city: 'Plano',
      state: 'TX',
      zip: '75093',
      price: 520000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      yearBuilt: 2019,
      propertyType: 'Single Family',
      photos: ['/api/placeholder/800/600'],
      description: 'Executive home in gated community. Soaring ceilings, gourmet kitchen, primary suite retreat. Award-winning schools!',
      features: ['Gated Community', 'Study', 'Game Room', 'Sprinkler System'],
      daysOnMarket: 15,
      sellerMotivation: 'Downsizing',
      schoolDistrict: 'Plano ISD',
      taxes: 10400,
      hoa: 275,
      floodZone: 'Zone X (Minimal Risk)',
      mud: 'N/A'
    },
    {
      id: 6,
      address: '901 Lakeview Terrace',
      city: 'Rockwall',
      state: 'TX',
      zip: '75087',
      price: 725000,
      bedrooms: 5,
      bathrooms: 4,
      sqft: 3800,
      yearBuilt: 2017,
      propertyType: 'Single Family',
      photos: ['/api/placeholder/800/600'],
      description: 'Lakefront luxury with private dock. Infinity pool, outdoor kitchen, wine cellar. Breathtaking sunrise views!',
      features: ['Lake View', 'Pool', 'Wine Cellar', 'Private Dock'],
      daysOnMarket: 21,
      sellerMotivation: 'Relocation',
      schoolDistrict: 'Rockwall ISD',
      taxes: 14500,
      hoa: 350,
      floodZone: 'Zone AE (High Risk)',
      mud: 'N/A'
    }
  ]);

  // Demo offers data
  const [myOffers] = useState([
    {
      id: 1,
      propertyAddress: '4521 Oak Valley Dr, Dallas, TX',
      offerAmount: 415000,
      listPrice: 425000,
      status: 'pending',
      submittedDate: '2024-01-10',
      sellerResponse: null,
      expirationDate: '2024-01-13'
    },
    {
      id: 2,
      propertyAddress: '7788 Ranch Road, McKinney, TX',
      offerAmount: 380000,
      listPrice: 385000,
      status: 'countered',
      submittedDate: '2024-01-08',
      sellerResponse: 'Counter: $383,000',
      counterAmount: 383000,
      expirationDate: '2024-01-12'
    },
    {
      id: 3,
      propertyAddress: '2200 Cedar Lane, Richardson, TX',
      offerAmount: 310000,
      listPrice: 325000,
      status: 'rejected',
      submittedDate: '2024-01-05',
      sellerResponse: 'Seller accepted another offer',
      expirationDate: null
    },
    {
      id: 4,
      propertyAddress: '5566 Elm Street, Allen, TX',
      offerAmount: 445000,
      listPrice: 449000,
      status: 'accepted',
      submittedDate: '2024-01-02',
      sellerResponse: 'Congratulations! Offer accepted',
      expirationDate: null
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleFavorite = (propertyId) => {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
      minSqft: '',
      maxSqft: ''
    });
  };

  const filteredProperties = properties.filter(property => {
    if (filters.location && !`${property.city} ${property.zip}`.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false;
    if (filters.bedrooms && property.bedrooms < parseInt(filters.bedrooms)) return false;
    if (filters.bathrooms && property.bathrooms < parseFloat(filters.bathrooms)) return false;
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
    if (filters.minSqft && property.sqft < parseInt(filters.minSqft)) return false;
    if (filters.maxSqft && property.sqft > parseInt(filters.maxSqft)) return false;
    return true;
  });

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'countered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    // In production, this would call the API
    alert(`Offer of ${formatPrice(parseInt(offerForm.amount))} submitted for ${selectedProperty.address}!`);
    setShowOfferModal(false);
    setOfferForm({
      amount: '',
      earnestMoney: '',
      closingDays: '30',
      contingencies: ['inspection', 'financing'],
      message: ''
    });
  };

  const sidebarItems = [
    { id: 'search', label: 'Search Homes', icon: Search },
    { id: 'favorites', label: 'Saved Homes', icon: Heart, badge: favorites.length },
    { id: 'offers', label: 'My Offers', icon: FileText, badge: myOffers.filter(o => o.status === 'pending' || o.status === 'countered').length },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Property Card Component
  const PropertyCard = ({ property, isListView = false }) => {
    const isFavorite = favorites.includes(property.id);

    if (isListView) {
      return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            <div className="w-72 h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="w-16 h-16 text-blue-300" />
              </div>
              <button
                onClick={() => toggleFavorite(property.id)}
                className={`absolute top-3 right-3 p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'} hover:scale-110 transition-transform`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {property.daysOnMarket} days
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}, {property.city}, {property.state}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.propertyType}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-gray-600 my-4">
                <span className="flex items-center"><Bed className="w-4 h-4 mr-1" /> {property.bedrooms} bd</span>
                <span className="flex items-center"><Bath className="w-4 h-4 mr-1" /> {property.bathrooms} ba</span>
                <span className="flex items-center"><Square className="w-4 h-4 mr-1" /> {property.sqft.toLocaleString()} sqft</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Built {property.yearBuilt}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {property.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => { setSelectedProperty(property); setShowOfferModal(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Make Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="w-16 h-16 text-blue-300" />
          </div>
          <button
            onClick={() => toggleFavorite(property.id)}
            className={`absolute top-3 right-3 p-2 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600'} hover:scale-110 transition-transform z-10`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {property.daysOnMarket} days on market
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setSelectedProperty(property)}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" /> Quick View
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {property.propertyType}
            </span>
          </div>
          <p className="text-gray-600 text-sm flex items-center mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </p>
          <div className="flex items-center justify-between text-gray-600 text-sm mb-4 border-t border-b border-gray-100 py-3">
            <span className="flex items-center"><Bed className="w-4 h-4 mr-1" /> {property.bedrooms}</span>
            <span className="flex items-center"><Bath className="w-4 h-4 mr-1" /> {property.bathrooms}</span>
            <span className="flex items-center"><Square className="w-4 h-4 mr-1" /> {property.sqft.toLocaleString()}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedProperty(property)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Details
            </button>
            <button
              onClick={() => { setSelectedProperty(property); setShowOfferModal(true); }}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Make Offer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full z-20">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-blue-900">Move-it</span>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">
                {user?.name?.charAt(0) || 'B'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'Buyer'}</p>
              <p className="text-xs text-gray-500">Home Buyer</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            {/* Search Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Find Your Dream Home</h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="Search by city, ZIP, or neighborhood..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-3 border rounded-xl transition-colors ${
                      showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                        <select
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Min</option>
                          <option value="200000">$200,000</option>
                          <option value="300000">$300,000</option>
                          <option value="400000">$400,000</option>
                          <option value="500000">$500,000</option>
                          <option value="600000">$600,000</option>
                          <option value="750000">$750,000</option>
                          <option value="1000000">$1,000,000</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                        <select
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Max</option>
                          <option value="300000">$300,000</option>
                          <option value="400000">$400,000</option>
                          <option value="500000">$500,000</option>
                          <option value="600000">$600,000</option>
                          <option value="750000">$750,000</option>
                          <option value="1000000">$1,000,000</option>
                          <option value="1500000">$1,500,000</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <select
                          name="bedrooms"
                          value={filters.bedrooms}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                          <option value="5">5+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <select
                          name="bathrooms"
                          value={filters.bathrooms}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                        <select
                          name="propertyType"
                          value={filters.propertyType}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Types</option>
                          <option value="Single Family">Single Family</option>
                          <option value="Condo">Condo</option>
                          <option value="Townhouse">Townhouse</option>
                          <option value="Multi-Family">Multi-Family</option>
                          <option value="Land">Land</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Sqft</label>
                        <select
                          name="minSqft"
                          value={filters.minSqft}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Min</option>
                          <option value="1000">1,000 sqft</option>
                          <option value="1500">1,500 sqft</option>
                          <option value="2000">2,000 sqft</option>
                          <option value="2500">2,500 sqft</option>
                          <option value="3000">3,000 sqft</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Sqft</label>
                        <select
                          name="maxSqft"
                          value={filters.maxSqft}
                          onChange={handleFilterChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Max</option>
                          <option value="1500">1,500 sqft</option>
                          <option value="2000">2,000 sqft</option>
                          <option value="2500">2,500 sqft</option>
                          <option value="3000">3,000 sqft</option>
                          <option value="4000">4,000 sqft</option>
                          <option value="5000">5,000+ sqft</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={clearFilters}
                          className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredProperties.length}</span> homes found
                </p>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Sqft: Large to Small</option>
                </select>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProperties.map(property => (
                    <PropertyCard key={property.id} property={property} isListView />
                  ))}
                </div>
              )}

              {filteredProperties.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search filters</p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 font-medium hover:text-blue-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Saved Homes</h1>
                <p className="text-gray-600 mt-1">
                  {favoriteProperties.length} {favoriteProperties.length === 1 ? 'property' : 'properties'} saved
                </p>
              </div>
            </div>

            {favoriteProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <HeartOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved homes yet</h3>
                <p className="text-gray-600 mb-6">Start browsing and save homes you love</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Search Homes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
                <p className="text-gray-600 mt-1">Track and manage your offers</p>
              </div>
            </div>

            {/* Offer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Offers</p>
                    <p className="text-2xl font-bold text-gray-900">{myOffers.length}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-100" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {myOffers.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-100" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Countered</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {myOffers.filter(o => o.status === 'countered').length}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-100" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Accepted</p>
                    <p className="text-2xl font-bold text-green-600">
                      {myOffers.filter(o => o.status === 'accepted').length}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-100" />
                </div>
              </div>
            </div>

            {/* Offers List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Property</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Your Offer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">List Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Response</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myOffers.map(offer => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Home className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{offer.propertyAddress}</p>
                            <p className="text-sm text-gray-500">Submitted {offer.submittedDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(offer.offerAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{formatPrice(offer.listPrice)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(offer.status)}`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {offer.sellerResponse || 'Awaiting response...'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {offer.status === 'countered' && (
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                              Accept
                            </button>
                            <button className="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                              Counter
                            </button>
                          </div>
                        )}
                        {offer.status === 'pending' && (
                          <button className="px-3 py-1 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50">
                            Withdraw
                          </button>
                        )}
                        {offer.status === 'accepted' && (
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            View Transaction
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Messages</h1>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your messages will appear here</h3>
              <p className="text-gray-600">Communicate directly with sellers about properties you're interested in</p>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Notifications</h1>
            <div className="space-y-4">
              {[
                { icon: Home, title: 'New listing matches your search', desc: '4521 Oak Valley Dr just listed at $425,000', time: '2 hours ago', unread: true },
                { icon: DollarSign, title: 'Price drop alert', desc: '901 Lakeview Terrace price reduced by $25,000', time: '5 hours ago', unread: true },
                { icon: FileText, title: 'Offer update', desc: 'Seller responded to your offer on Ranch Road', time: '1 day ago', unread: false },
                { icon: Star, title: 'New home in saved search', desc: 'A new 4+ bedroom home is available in Frisco', time: '2 days ago', unread: false },
                { icon: Bell, title: 'Open house reminder', desc: '3344 Sunset Ridge open house tomorrow 2-4pm', time: '2 days ago', unread: false }
              ].map((notification, idx) => {
                const Icon = notification.icon;
                return (
                  <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm flex items-start ${notification.unread ? 'border-l-4 border-blue-600' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${notification.unread ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${notification.unread ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-600'}`}>{notification.title}</p>
                      <p className="text-gray-500 text-sm">{notification.desc}</p>
                    </div>
                    <span className="text-gray-400 text-sm">{notification.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" defaultValue={user?.name?.split(' ')[0] || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" defaultValue={user?.name?.split(' ')[1] || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" placeholder="(555) 123-4567" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Search Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
                    <input type="text" placeholder="Dallas, Frisco, Plano..." className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        <option>$300,000 - $500,000</option>
                        <option>$500,000 - $750,000</option>
                        <option>$750,000 - $1,000,000</option>
                        <option>$1,000,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        <option>Single Family</option>
                        <option>Condo/Townhouse</option>
                        <option>Multi-Family</option>
                        <option>Land</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New listings matching my search', checked: true },
                    { label: 'Price drop alerts', checked: true },
                    { label: 'Offer status updates', checked: true },
                    { label: 'Open house reminders', checked: false },
                    { label: 'Market updates', checked: false }
                  ].map((pref, idx) => (
                    <label key={idx} className="flex items-center">
                      <input type="checkbox" defaultChecked={pref.checked} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                      <span className="ml-3 text-gray-700">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6 flex justify-end">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Property Detail Modal */}
      {selectedProperty && !showOfferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Property Header Image */}
            <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="w-24 h-24 text-blue-300" />
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedProperty.id)}
                className={`absolute top-4 left-4 p-2 rounded-full shadow-lg ${
                  favorites.includes(selectedProperty.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                <Heart className={`w-6 h-6 ${favorites.includes(selectedProperty.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="p-8">
              {/* Price and Address */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(selectedProperty.price)}</h2>
                  <p className="text-gray-600 flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-2" />
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                  {selectedProperty.daysOnMarket} days on market
                </span>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Bed className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedProperty.bedrooms}</p>
                  <p className="text-gray-500 text-sm">Bedrooms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedProperty.bathrooms}</p>
                  <p className="text-gray-500 text-sm">Bathrooms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Square className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedProperty.sqft.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Sqft</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedProperty.yearBuilt}</p>
                  <p className="text-gray-500 text-sm">Year Built</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Property</h3>
                <p className="text-gray-600">{selectedProperty.description}</p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.map((feature, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Auto-populated Data */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Property Information (Auto-populated)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <GraduationCap className="w-4 h-4 mr-1" /> School District
                    </div>
                    <p className="font-medium text-gray-900">{selectedProperty.schoolDistrict}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <DollarSign className="w-4 h-4 mr-1" /> Annual Taxes
                    </div>
                    <p className="font-medium text-gray-900">{formatPrice(selectedProperty.taxes)}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Building2 className="w-4 h-4 mr-1" /> HOA
                    </div>
                    <p className="font-medium text-gray-900">
                      {selectedProperty.hoa > 0 ? `${formatPrice(selectedProperty.hoa)}/mo` : 'None'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Droplets className="w-4 h-4 mr-1" /> Flood Zone
                    </div>
                    <p className={`font-medium ${selectedProperty.floodZone.includes('High') ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedProperty.floodZone}
                    </p>
                  </div>
                </div>
                {selectedProperty.mud !== 'N/A' && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <AlertCircle className="w-4 h-4 mr-1" /> MUD (Municipal Utility District)
                    </div>
                    <p className="font-medium text-gray-900">{selectedProperty.mud}</p>
                  </div>
                )}
              </div>

              {/* Monthly Cost Estimate */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Monthly Cost</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mortgage (20% down, 30yr @ 7%)</span>
                    <span className="font-medium">{formatPrice(Math.round((selectedProperty.price * 0.8) * (0.07/12) * Math.pow(1 + 0.07/12, 360) / (Math.pow(1 + 0.07/12, 360) - 1)))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Tax</span>
                    <span className="font-medium">{formatPrice(Math.round(selectedProperty.taxes / 12))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">HOA</span>
                    <span className="font-medium">{selectedProperty.hoa > 0 ? formatPrice(selectedProperty.hoa) : '$0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance (estimated)</span>
                    <span className="font-medium">{formatPrice(Math.round(selectedProperty.price * 0.003 / 12))}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total Estimated</span>
                    <span className="text-blue-600">
                      {formatPrice(
                        Math.round((selectedProperty.price * 0.8) * (0.07/12) * Math.pow(1 + 0.07/12, 360) / (Math.pow(1 + 0.07/12, 360) - 1)) +
                        Math.round(selectedProperty.taxes / 12) +
                        selectedProperty.hoa +
                        Math.round(selectedProperty.price * 0.003 / 12)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
                >
                  Make an Offer
                </button>
                <button className="px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                  <Phone className="w-5 h-5 mr-2" /> Contact Seller
                </button>
                <button className="px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                  <Calendar className="w-5 h-5 mr-2" /> Schedule Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {showOfferModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Make an Offer</h2>
                <p className="text-gray-600">{selectedProperty.address}, {selectedProperty.city}</p>
              </div>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="p-6 space-y-6">
              {/* List Price Reference */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">List Price</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(selectedProperty.price)}</span>
                </div>
              </div>

              {/* Offer Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Offer Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={offerForm.amount}
                    onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-0"
                    placeholder="425,000"
                  />
                </div>
                {offerForm.amount && (
                  <p className={`mt-2 text-sm ${
                    parseInt(offerForm.amount) < selectedProperty.price ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {parseInt(offerForm.amount) < selectedProperty.price
                      ? `${formatPrice(selectedProperty.price - parseInt(offerForm.amount))} below list price (${((1 - parseInt(offerForm.amount) / selectedProperty.price) * 100).toFixed(1)}% under)`
                      : parseInt(offerForm.amount) > selectedProperty.price
                      ? `${formatPrice(parseInt(offerForm.amount) - selectedProperty.price)} above list price`
                      : 'At list price'}
                  </p>
                )}
              </div>

              {/* Earnest Money */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Earnest Money Deposit *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={offerForm.earnestMoney}
                    onChange={(e) => setOfferForm({ ...offerForm, earnestMoney: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                    placeholder="5,000"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Typically 1-3% of purchase price</p>
              </div>

              {/* Closing Timeline */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Desired Closing Timeline
                </label>
                <select
                  value={offerForm.closingDays}
                  onChange={(e) => setOfferForm({ ...offerForm, closingDays: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                >
                  <option value="21">21 Days (Fast Close)</option>
                  <option value="30">30 Days (Standard)</option>
                  <option value="45">45 Days</option>
                  <option value="60">60 Days</option>
                </select>
              </div>

              {/* Contingencies */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Contingencies
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'inspection', label: 'Home Inspection', desc: 'Right to inspect and negotiate repairs' },
                    { id: 'financing', label: 'Financing', desc: 'Contingent on loan approval' },
                    { id: 'appraisal', label: 'Appraisal', desc: 'Contingent on property appraising at purchase price' },
                    { id: 'sale', label: 'Sale of Current Home', desc: 'Must sell current home first' }
                  ].map(item => (
                    <label key={item.id} className="flex items-start p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={offerForm.contingencies.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOfferForm({ ...offerForm, contingencies: [...offerForm.contingencies, item.id] });
                          } else {
                            setOfferForm({ ...offerForm, contingencies: offerForm.contingencies.filter(c => c !== item.id) });
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded mt-0.5"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Personal Message to Seller (Optional)
                </label>
                <textarea
                  value={offerForm.message}
                  onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                  placeholder="Tell the seller why you love their home..."
                />
              </div>

              {/* Move-it Fee Notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Save with Move-it!</p>
                    <p className="text-sm text-green-700">
                      Our 2% transaction fee saves you thousands compared to traditional agents.
                      {offerForm.amount && ` Estimated savings: ${formatPrice(parseInt(offerForm.amount) * 0.04)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Submit Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

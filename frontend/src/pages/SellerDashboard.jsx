import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home, Plus, DollarSign, Eye, Heart, Clock, CheckCircle,
  FileText, MessageSquare, Users, LogOut, Camera, MapPin,
  ChevronRight, AlertCircle, TrendingUp, Calendar, Building,
  Upload, Sparkles, X, Check
} from 'lucide-react';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listingStep, setListingStep] = useState(1);

  // Demo data - would come from API
  const [listings, setListings] = useState([
    {
      id: 1,
      address: '123 Oak Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 485000,
      status: 'active',
      views: 234,
      favorites: 12,
      offers: 3,
      daysOnMarket: 7,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
    }
  ]);

  const [offers, setOffers] = useState([
    {
      id: 1,
      propertyId: 1,
      buyerName: 'John Smith',
      amount: 475000,
      earnestMoney: 10000,
      financingType: 'Conventional',
      closingDate: '2024-02-15',
      status: 'pending',
      submittedAt: '2024-01-10'
    },
    {
      id: 2,
      propertyId: 1,
      buyerName: 'Sarah Johnson',
      amount: 480000,
      earnestMoney: 15000,
      financingType: 'Cash',
      closingDate: '2024-02-01',
      status: 'pending',
      submittedAt: '2024-01-11'
    }
  ]);

  const [newListing, setNewListing] = useState({
    address: '',
    city: '',
    state: 'TX',
    zip: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    yearBuilt: '',
    price: '',
    description: '',
    photos: []
  });

  const stats = [
    { label: 'Active Listings', value: listings.filter(l => l.status === 'active').length, icon: Building, color: 'blue' },
    { label: 'Total Views', value: listings.reduce((acc, l) => acc + l.views, 0), icon: Eye, color: 'green' },
    { label: 'Pending Offers', value: offers.filter(o => o.status === 'pending').length, icon: DollarSign, color: 'yellow' },
    { label: 'Favorites', value: listings.reduce((acc, l) => acc + l.favorites, 0), icon: Heart, color: 'red' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAcceptOffer = (offerId) => {
    setOffers(offers.map(o =>
      o.id === offerId ? { ...o, status: 'accepted' } : o.status === 'pending' ? { ...o, status: 'rejected' } : o
    ));
  };

  const handleRejectOffer = (offerId) => {
    setOffers(offers.map(o =>
      o.id === offerId ? { ...o, status: 'rejected' } : o
    ));
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600'
          };
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colors[stat.color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Ready to List Your Property?</h3>
        <p className="text-blue-100 mb-4">Our AI will help you create a professional listing in minutes</p>
        <button
          onClick={() => setShowCreateListing(true)}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Listing
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Offers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Offers</h3>
            <button onClick={() => setActiveTab('offers')} className="text-blue-600 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {offers.slice(0, 3).map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{offer.buyerName}</div>
                  <div className="text-sm text-gray-500">${offer.amount.toLocaleString()} • {offer.financingType}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Listing Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Listing Performance</h3>
          </div>
          {listings.length > 0 ? (
            <div className="space-y-4">
              {listings.slice(0, 2).map((listing) => (
                <div key={listing.id} className="flex items-center space-x-4">
                  <img
                    src={listing.image}
                    alt={listing.address}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{listing.address}</div>
                    <div className="text-sm text-gray-500">${listing.price.toLocaleString()}</div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center"><Eye className="w-3 h-3 mr-1" />{listing.views}</span>
                      <span className="flex items-center"><Heart className="w-3 h-3 mr-1" />{listing.favorites}</span>
                      <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1" />{listing.offers} offers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No listings yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Savings Calculator */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Savings with Move-it</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Traditional Agent (6%)</div>
            <div className="text-2xl font-bold text-gray-400 line-through">
              ${listings.length > 0 ? (listings[0].price * 0.06).toLocaleString() : '0'}
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Move-it Fee (2%)</div>
            <div className="text-2xl font-bold text-blue-600">
              ${listings.length > 0 ? (listings[0].price * 0.02).toLocaleString() : '0'}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Your Savings</div>
            <div className="text-2xl font-bold text-green-600">
              ${listings.length > 0 ? (listings[0].price * 0.04).toLocaleString() : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Listings</h2>
        <button
          onClick={() => setShowCreateListing(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.address}
                className="w-full h-48 object-cover"
              />
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                listing.status === 'active' ? 'bg-green-500 text-white' :
                listing.status === 'under_contract' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {listing.status.replace('_', ' ').charAt(0).toUpperCase() + listing.status.replace('_', ' ').slice(1)}
              </span>
            </div>
            <div className="p-5">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                ${listing.price.toLocaleString()}
              </div>
              <div className="text-gray-600 mb-3">
                {listing.address}, {listing.city}, {listing.state} {listing.zip}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{listing.views} views</span>
                <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />{listing.favorites}</span>
                <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />{listing.offers} offers</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100">
                  Edit
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
                  View Offers
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Listing Card */}
        <button
          onClick={() => setShowCreateListing(true)}
          className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center py-12 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium">Add New Listing</span>
        </button>
      </div>
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Offers Received</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Offer Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Earnest Money</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Financing</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Closing Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{offer.buyerName}</div>
                    <div className="text-sm text-gray-500">Submitted {offer.submittedAt}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ${offer.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${offer.earnestMoney.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      offer.financingType === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {offer.financingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{offer.closingDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {offer.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCreateListing = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Create New Listing</h2>
            <p className="text-sm text-gray-500">Step {listingStep} of 4</p>
          </div>
          <button onClick={() => { setShowCreateListing(false); setListingStep(1); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="flex mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  listingStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && <div className={`flex-1 h-1 mx-2 ${listingStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Address */}
          {listingStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Property Address</h3>
                  <p className="text-sm text-gray-500">We'll auto-populate property data based on your address</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newListing.address}
                  onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newListing.city}
                    onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="Austin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newListing.state}
                    onChange={(e) => setNewListing({ ...newListing, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="TX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={newListing.zip}
                    onChange={(e) => setNewListing({ ...newListing, zip: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="78701"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {listingStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Building className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Property Details</h3>
                  <p className="text-sm text-gray-500">Tell us about your property</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={newListing.propertyType}
                  onChange={(e) => setNewListing({ ...newListing, propertyType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="single_family">Single Family Home</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi_family">Multi-Family</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={newListing.bedrooms}
                    onChange={(e) => setNewListing({ ...newListing, bedrooms: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newListing.bathrooms}
                    onChange={(e) => setNewListing({ ...newListing, bathrooms: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                  <input
                    type="number"
                    value={newListing.sqft}
                    onChange={(e) => setNewListing({ ...newListing, sqft: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <input
                    type="number"
                    value={newListing.yearBuilt}
                    onChange={(e) => setNewListing({ ...newListing, yearBuilt: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="2010"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {listingStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Camera className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Property Photos</h3>
                  <p className="text-sm text-gray-500">Upload photos of your property</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop photos here</p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                  Browse Files
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">AI Photo Analysis</p>
                  <p className="text-sm text-blue-600">Our AI will analyze your photos to identify features and suggest improvements</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Price & Description */}
          {listingStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Pricing & Description</h3>
                  <p className="text-sm text-gray-500">Set your price and let AI help with the description</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">List Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                    placeholder="485,000"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Suggested price based on comps: <span className="font-semibold text-green-600">$475,000 - $495,000</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Property Description</label>
                  <button className="text-sm text-blue-600 font-medium flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate with AI
                  </button>
                </div>
                <textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  placeholder="Describe your property..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between">
          {listingStep > 1 ? (
            <button
              onClick={() => setListingStep(listingStep - 1)}
              className="px-6 py-3 text-gray-600 font-medium"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => {
              if (listingStep < 4) {
                setListingStep(listingStep + 1);
              } else {
                // Submit listing
                setShowCreateListing(false);
                setListingStep(1);
              }
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {listingStep === 4 ? 'Create Listing' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">Move-it</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, <span className="font-medium">{user?.first_name || 'Seller'}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'listings', label: 'My Listings', icon: Building },
                { id: 'offers', label: 'Offers', icon: DollarSign },
                { id: 'disclosures', label: 'Disclosures', icon: FileText },
                { id: 'transactions', label: 'Transactions', icon: Clock },
                { id: 'messages', label: 'Messages', icon: MessageSquare }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'listings' && renderListings()}
            {activeTab === 'offers' && renderOffers()}
            {activeTab === 'disclosures' && (
              <div className="bg-white rounded-xl p-8 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Seller Disclosures</h3>
                <p className="text-gray-500 mb-6">Complete the required Texas seller disclosure form</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Start Disclosure Form
                </button>
              </div>
            )}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-xl p-8 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Transactions</h3>
                <p className="text-gray-500">Transactions will appear here once an offer is accepted</p>
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Messages</h3>
                <p className="text-gray-500">Messages from buyers will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      {showCreateListing && renderCreateListing()}

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-4">
        <div className="text-center text-sm text-gray-500">
          Move-it is a marketplace facilitating connections. We do not represent any party.
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { vendorsAPI, transactionsAPI, messagesAPI, notificationsAPI } from '@/services/api';
import {
  Home, Briefcase, Users, Star, DollarSign, MessageSquare, Bell, Settings, LogOut,
  MapPin, Phone, Mail, Globe, Clock, CheckCircle, AlertCircle, XCircle, Calendar,
  TrendingUp, Award, Eye, FileText, CreditCard, Crown, Zap, ChevronRight, X,
  Building2, Shield, Target, BarChart3, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Real data from API
  const [vendorProfile, setVendorProfile] = useState({
    businessName: '',
    vendorType: '',
    licenseNumber: '',
    serviceAreas: [],
    subscriptionTier: 'FREE',
    subscriptionEnd: null,
    rating: 0,
    reviewCount: 0,
    completedTransactions: 0
  });

  const [leads, setLeads] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Fetch vendor data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, transactionsRes] = await Promise.all([
        vendorsAPI.getMyProfile().catch(() => ({ data: null })),
        transactionsAPI.getAll().catch(() => ({ data: [] })),
      ]);

      if (profileRes.data) {
        const p = profileRes.data;
        setVendorProfile({
          businessName: p.business_name || 'Your Business',
          vendorType: p.vendor_type || 'Service Provider',
          licenseNumber: p.license_number || '',
          serviceAreas: p.service_areas || [],
          subscriptionTier: p.tier || 'FREE',
          subscriptionEnd: p.subscription_end,
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
          completedTransactions: p.completed_transactions || 0
        });
      }

      // Transform transactions to leads format
      const transformedLeads = (transactionsRes.data || []).map(t => ({
        id: t.id,
        propertyAddress: t.property?.address_line1 + ', ' + t.property?.city + ', ' + t.property?.state || 'Unknown',
        buyerName: t.buyer ? `${t.buyer.first_name} ${t.buyer.last_name}` : 'Unknown',
        sellerName: t.seller ? `${t.seller.first_name} ${t.seller.last_name}` : 'Unknown',
        transactionValue: t.purchase_price || 0,
        serviceNeeded: 'Transaction Services',
        status: t.status === 'closed' ? 'completed' : t.status === 'cancelled' ? 'lost' : 'in_progress',
        createdAt: t.created_at,
        urgency: 'medium',
        closingDate: t.closing_date,
        notes: ''
      }));
      setLeads(transformedLeads);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpgradeTier = async (tier) => {
    try {
      setSubmitting(true);
      await vendorsAPI.upgrade(tier);
      await fetchData();
      setShowUpgradeModal(false);
      alert(`Successfully upgraded to ${tier} tier!`);
    } catch (err) {
      console.error('Error upgrading tier:', err);
      alert(err.response?.data?.message || 'Failed to upgrade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formData = new FormData(e.target);
      await vendorsAPI.updateProfile({
        business_name: formData.get('businessName'),
        license_number: formData.get('licenseNumber'),
        service_areas: formData.get('serviceAreas')?.split(',').map(s => s.trim()) || [],
        bio: formData.get('bio'),
      });
      await fetchData();
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo stats (would come from API aggregation)
  const stats = {
    activeLeads: leads.filter(l => l.status === 'in_progress').length,
    leadsThisMonth: leads.length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'completed').length / leads.length) * 100) : 0,
    revenueThisMonth: leads.filter(l => l.status === 'completed').reduce((acc, l) => acc + (l.transactionValue * 0.01), 0),
    revenueLastMonth: 0,
    avgResponseTime: '2.4 hrs'
  };

  // Subscription tiers
  const subscriptionTiers = [
    {
      id: 'free',
      name: 'FREE',
      price: 0,
      features: [
        'Up to 5 leads/month',
        'Basic profile listing',
        'Standard support',
        'Move-it badge'
      ],
      limitations: [
        'Limited visibility',
        'No priority placement',
        'Basic analytics'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 149,
      features: [
        'Up to 25 leads/month',
        'Enhanced profile',
        'Priority listing',
        'Direct messaging',
        'Analytics dashboard',
        'Email notifications'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 299,
      features: [
        'Unlimited leads',
        'Top placement',
        'Featured vendor badge',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Dedicated account manager'
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'premium': return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-50' };
      case 'standard': return { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' };
      default: return { icon: Shield, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users, badge: leads.filter(l => l.status === 'new').length },
    { id: 'transactions', label: 'Transactions', icon: FileText, badge: leads.filter(l => l.status === 'in_progress').length },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const tierBadge = getTierBadge(vendorProfile.subscriptionTier);
  const TierIcon = tierBadge.icon;

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
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{vendorProfile.businessName}</p>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${tierBadge.bg} ${tierBadge.color} font-medium flex items-center`}>
                  <TierIcon className="w-3 h-3 mr-1" />
                  {vendorProfile.subscriptionTier.charAt(0).toUpperCase() + vendorProfile.subscriptionTier.slice(1)}
                </span>
              </div>
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
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === item.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
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
      <main className="flex-1 ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {vendorProfile.businessName}</h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your business</p>
              </div>
              {vendorProfile.subscriptionTier !== 'premium' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-1" /> +18%
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeLeads}</p>
                <p className="text-gray-500 text-sm">Active Leads</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-1" /> +12%
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.revenueThisMonth)}</p>
                <p className="text-gray-500 text-sm">Revenue This Month</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-gray-500 text-sm">Conversion Rate</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{vendorProfile.rating}</p>
                <p className="text-gray-500 text-sm">{vendorProfile.reviewCount} Reviews</p>
              </div>
            </div>

            {/* Recent Leads & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Leads */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="divide-y">
                  {leads.slice(0, 4).map(lead => (
                    <div key={lead.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 truncate flex-1">{lead.propertyAddress}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status.replace('_', ' ').charAt(0).toUpperCase() + lead.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{lead.serviceNeeded}</span>
                        <span className="font-medium text-gray-900">{formatPrice(lead.transactionValue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="divide-y">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{review.clientName}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                      <p className="text-gray-400 text-xs mt-2">{formatDate(review.date)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
                  <Eye className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm">View Profile</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm">Update Services</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm">Messages</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <p className="text-gray-600 mt-1">Manage and track your service requests</p>
              </div>
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option>All Status</option>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Quoted</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option>All Urgency</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            {/* Lead Stats */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { label: 'New', count: leads.filter(l => l.status === 'new').length, color: 'blue' },
                { label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: 'yellow' },
                { label: 'Quoted', count: leads.filter(l => l.status === 'quoted').length, color: 'purple' },
                { label: 'In Progress', count: leads.filter(l => l.status === 'in_progress').length, color: 'orange' },
                { label: 'Completed', count: leads.filter(l => l.status === 'completed').length, color: 'green' }
              ].map(stat => (
                <div key={stat.label} className={`bg-${stat.color}-50 rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Property</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Closing</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Urgency</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{lead.propertyAddress}</p>
                          <p className="text-sm text-gray-500">Buyer: {lead.buyerName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{lead.serviceNeeded}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{formatPrice(lead.transactionValue)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{formatDate(lead.closingDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getUrgencyColor(lead.urgency)}`}>
                          {lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status.replace('_', ' ').charAt(0).toUpperCase() + lead.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                          >
                            View
                          </button>
                          {lead.status === 'new' && (
                            <button className="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                              Contact
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Active Transactions</h1>
                <p className="text-gray-600 mt-1">Track ongoing transactions</p>
              </div>
            </div>

            <div className="space-y-4">
              {leads.filter(l => l.status === 'in_progress').map(lead => (
                <div key={lead.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{lead.propertyAddress}</h3>
                      <p className="text-gray-600">{lead.serviceNeeded}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      In Progress
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Buyer</p>
                      <p className="font-medium text-gray-900">{lead.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Seller</p>
                      <p className="font-medium text-gray-900">{lead.sellerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Transaction Value</p>
                      <p className="font-medium text-gray-900">{formatPrice(lead.transactionValue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Closing Date</p>
                      <p className="font-medium text-gray-900">{formatDate(lead.closingDate)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600"><strong>Notes:</strong> {lead.notes}</p>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                      Message Parties
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
                <p className="text-gray-600 mt-1">What your clients are saying</p>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-900">{vendorProfile.rating}</p>
                  <div className="flex items-center justify-center my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(vendorProfile.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-500">{vendorProfile.reviewCount} reviews</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = (count / reviews.length) * 100;
                    return (
                      <div key={rating} className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600 w-8">{rating} star</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">{review.clientName}</p>
                      <p className="text-sm text-gray-500">{review.propertyAddress}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{formatDate(review.date)}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Messages</h1>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your messages will appear here</h3>
              <p className="text-gray-600">Communicate with buyers and sellers about your services</p>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
                <p className="text-gray-600 mt-1">Manage your subscription plan</p>
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${tierBadge.bg}`}>
                    <TierIcon className={`w-8 h-8 ${tierBadge.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {vendorProfile.subscriptionTier.charAt(0).toUpperCase() + vendorProfile.subscriptionTier.slice(1)} Plan
                    </h3>
                    <p className="text-gray-600">
                      {vendorProfile.subscriptionTier === 'free'
                        ? 'Free forever'
                        : `$${vendorProfile.subscriptionTier === 'standard' ? '149' : '299'}/month`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Next billing date</p>
                  <p className="font-medium text-gray-900">{formatDate(vendorProfile.subscriptionEnd)}</p>
                </div>
              </div>
            </div>

            {/* Subscription Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionTiers.map(tier => (
                <div
                  key={tier.id}
                  className={`bg-white rounded-xl shadow-sm p-6 relative ${tier.popular ? 'ring-2 ring-purple-600' : ''} ${vendorProfile.subscriptionTier === tier.id ? 'bg-purple-50' : ''}`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                      {tier.price > 0 && <span className="text-gray-500">/month</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tier.limitations?.map((limitation, idx) => (
                      <li key={idx} className="flex items-center text-gray-400">
                        <XCircle className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      vendorProfile.subscriptionTier === tier.id
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : tier.popular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={vendorProfile.subscriptionTier === tier.id}
                  >
                    {vendorProfile.subscriptionTier === tier.id ? 'Current Plan' : tier.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>

            {/* Billing History */}
            <div className="mt-8 bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { date: '2024-01-15', desc: 'Standard Plan - Monthly', amount: 149, status: 'paid' },
                    { date: '2023-12-15', desc: 'Standard Plan - Monthly', amount: 149, status: 'paid' },
                    { date: '2023-11-15', desc: 'Standard Plan - Monthly', amount: 149, status: 'paid' }
                  ].map((bill, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-gray-600">{formatDate(bill.date)}</td>
                      <td className="px-6 py-4 text-gray-900">{bill.desc}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(bill.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input type="text" defaultValue={vendorProfile.businessName} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <input type="text" defaultValue={vendorProfile.vendorType} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input type="text" defaultValue={vendorProfile.licenseNumber} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" placeholder="(555) 123-4567" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
                    <input type="text" defaultValue={vendorProfile.serviceAreas.join(', ')} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    <p className="text-sm text-gray-500 mt-1">Separate multiple areas with commas</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe your services..." />
                  </div>
                </div>
              </div>

              {/* Contact Preferences */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Preferences</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email notifications for new leads', checked: true },
                    { label: 'SMS notifications for urgent leads', checked: true },
                    { label: 'Weekly performance summary', checked: false },
                    { label: 'Marketing emails', checked: false }
                  ].map((pref, idx) => (
                    <label key={idx} className="flex items-center">
                      <input type="checkbox" defaultChecked={pref.checked} className="w-4 h-4 text-purple-600 border-gray-300 rounded" />
                      <span className="ml-3 text-gray-700">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                      <option>Mon-Fri, 9am-5pm</option>
                      <option>Mon-Sat, 8am-6pm</option>
                      <option>7 Days, 8am-8pm</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Time Goal</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                      <option>Within 1 hour</option>
                      <option>Within 4 hours</option>
                      <option>Same day</option>
                      <option>Within 24 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 flex justify-end">
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
                <p className="text-gray-600">{selectedLead.propertyAddress}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedLead.status)}`}>
                  {selectedLead.status.replace('_', ' ').charAt(0).toUpperCase() + selectedLead.status.replace('_', ' ').slice(1)}
                </span>
                <span className={`font-medium ${getUrgencyColor(selectedLead.urgency)}`}>
                  {selectedLead.urgency.charAt(0).toUpperCase() + selectedLead.urgency.slice(1)} Priority
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Buyer</p>
                  <p className="font-medium text-gray-900">{selectedLead.buyerName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Seller</p>
                  <p className="font-medium text-gray-900">{selectedLead.sellerName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Transaction Value</p>
                  <p className="font-medium text-gray-900">{formatPrice(selectedLead.transactionValue)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Closing Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedLead.closingDate)}</p>
                </div>
              </div>

              {/* Service Needed */}
              <div>
                <p className="text-gray-500 text-sm mb-2">Service Requested</p>
                <p className="font-medium text-gray-900 bg-purple-50 px-4 py-3 rounded-lg">
                  {selectedLead.serviceNeeded}
                </p>
              </div>

              {/* Notes */}
              <div>
                <p className="text-gray-500 text-sm mb-2">Notes</p>
                <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">{selectedLead.notes}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  <Phone className="w-4 h-4 inline mr-2" /> Call
                </button>
                <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  <Mail className="w-4 h-4 inline mr-2" /> Email
                </button>
                <button className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                  Send Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
                <p className="text-gray-600">Get more leads and grow your business</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {subscriptionTiers.map(tier => (
                  <div
                    key={tier.id}
                    className={`rounded-xl p-6 ${tier.popular ? 'ring-2 ring-purple-600 bg-purple-50' : 'border border-gray-200'}`}
                  >
                    {tier.popular && (
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium mb-4 inline-block">
                        Recommended
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                      {tier.price > 0 && <span className="text-gray-500">/mo</span>}
                    </div>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-600 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 rounded-lg font-medium ${
                        tier.popular
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tier.price === 0 ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-gray-500 text-sm">
                Cancel anytime. All plans include a 30-day money-back guarantee.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

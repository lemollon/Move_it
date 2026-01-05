import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Eye,
  CheckCircle,
  PenTool,
  Clock,
  Home,
  User,
  Download,
  AlertCircle,
  Calendar,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { buyerAPI } from '../services/api';

export default function BuyerDisclosuresPage() {
  const [stats, setStats] = useState(null);
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, disclosuresRes] = await Promise.all([
        buyerAPI.getDashboardStats(),
        buyerAPI.getDisclosures(),
      ]);
      setStats(statsRes.data.stats);
      setDisclosures(disclosuresRes.data.disclosures);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load disclosures');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisclosures = disclosures.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'acknowledged':
        return 'bg-purple-100 text-purple-800';
      case 'signed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'viewed':
        return <Eye className="w-4 h-4" />;
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4" />;
      case 'signed':
        return <PenTool className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Disclosures</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/buyer-dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Disclosures</h1>
            <p className="text-gray-600 mt-1">
              View and acknowledge property disclosures shared with you
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Needs Review</span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.needsAction}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Acknowledged</span>
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.acknowledged}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Signed</span>
              <PenTool className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.signed}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'viewed', 'acknowledged', 'signed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${disclosures.length})`}
          </button>
        ))}
      </div>

      {/* Disclosures List */}
      {filteredDisclosures.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Disclosures Found</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? "You haven't received any property disclosures yet."
              : `No disclosures with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisclosures.map((disclosure) => (
            <div
              key={disclosure.id}
              className="bg-white rounded-lg border hover:border-blue-300 transition-colors"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Property Image */}
                  <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {disclosure.property?.image ? (
                      <img
                        src={disclosure.property.image}
                        alt={disclosure.property.address}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {disclosure.property?.address || 'Property Address'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {disclosure.property?.city}, {disclosure.property?.state}{' '}
                          {disclosure.property?.zipCode}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          disclosure.status
                        )}`}
                      >
                        {getStatusIcon(disclosure.status)}
                        {disclosure.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>From: {disclosure.seller?.name || 'Seller'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Shared: {new Date(disclosure.sharedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {disclosure.viewCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>Viewed {disclosure.viewCount}x</span>
                        </div>
                      )}
                    </div>

                    {disclosure.message && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2 italic">
                        "{disclosure.message}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 mt-2 md:mt-0">
                    <Link
                      to={`/buyer/disclosure/${disclosure.id}`}
                      className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    {disclosure.pdfUrl && (
                      <a
                        href={disclosure.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Required Banner */}
              {(disclosure.status === 'pending' || disclosure.status === 'viewed') && (
                <div className="px-4 md:px-6 py-3 bg-yellow-50 border-t border-yellow-100 rounded-b-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      {disclosure.status === 'pending'
                        ? 'New disclosure - please review'
                        : 'Review complete - acknowledge to confirm receipt'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

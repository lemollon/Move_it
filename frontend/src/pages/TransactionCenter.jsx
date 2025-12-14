import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { transactionsAPI, documentsAPI, messagesAPI } from '@/services/api';
import {
  Home, ArrowLeft, Clock, FileText, MessageSquare, Users, CheckCircle, Circle,
  AlertCircle, Upload, Download, Eye, Send, Paperclip, Calendar, DollarSign,
  MapPin, Phone, Mail, Building2, Shield, X, ChevronRight, ChevronDown,
  Bell, Settings, MoreVertical, Plus, Check, AlertTriangle, Briefcase, Loader2
} from 'lucide-react';

export default function TransactionCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactionId } = useParams();
  const [activeTab, setActiveTab] = useState('timeline');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Real data from API
  const [transaction, setTransaction] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);

  // Fetch transaction data
  const fetchData = useCallback(async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      const [txnRes, docsRes, msgsRes] = await Promise.all([
        transactionsAPI.getById(transactionId).catch(() => ({ data: null })),
        transactionsAPI.getDocuments(transactionId).catch(() => ({ data: [] })),
        messagesAPI.getByTransaction(transactionId).catch(() => ({ data: [] })),
      ]);

      if (txnRes.data) {
        const t = txnRes.data;
        setTransaction({
          id: t.id,
          propertyAddress: t.property ? `${t.property.address_line1}, ${t.property.city}, ${t.property.state} ${t.property.zip_code}` : 'Unknown Property',
          listPrice: t.property?.list_price || 0,
          salePrice: t.purchase_price || 0,
          status: t.status,
          createdAt: t.created_at,
          expectedClose: t.closing_date,
          daysRemaining: t.closing_date ? Math.max(0, Math.floor((new Date(t.closing_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
          progress: calculateProgress(t.status),
          buyer: {
            name: t.buyer ? `${t.buyer.first_name} ${t.buyer.last_name}` : 'Unknown',
            email: t.buyer?.email || '',
            phone: t.buyer?.phone || ''
          },
          seller: {
            name: t.seller ? `${t.seller.first_name} ${t.seller.last_name}` : 'Unknown',
            email: t.seller?.email || '',
            phone: t.seller?.phone || ''
          }
        });
      }

      setDocuments((docsRes.data || []).map(d => ({
        id: d.id,
        name: d.filename,
        type: d.document_type,
        uploadedBy: d.uploader ? `${d.uploader.first_name} ${d.uploader.last_name}` : 'Unknown',
        date: d.created_at,
        status: d.buyer_signed && d.seller_signed ? 'signed' : d.requires_signature ? 'pending_signature' : 'completed',
        url: d.url
      })));

      setMessages((msgsRes.data || []).map(m => ({
        id: m.id,
        sender: m.sender ? `${m.sender.first_name} ${m.sender.last_name}` : 'Unknown',
        role: m.sender_id === user?.id ? 'You' : 'Other',
        message: m.message,
        time: new Date(m.created_at).toLocaleString(),
        isOwn: m.sender_id === user?.id
      })));
    } catch (err) {
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  }, [transactionId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateProgress = (status) => {
    const stages = ['initiated', 'contract_pending', 'inspection_period', 'appraisal_ordered', 'title_search', 'financing_contingency', 'final_walkthrough', 'closing_scheduled', 'closed'];
    const idx = stages.indexOf(status);
    return idx >= 0 ? Math.round((idx / (stages.length - 1)) * 100) : 0;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !transactionId) return;

    try {
      setSubmitting(true);
      await messagesAPI.send({
        transaction_id: transactionId,
        message: messageText.trim()
      });
      setMessageText('');
      await fetchData();
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      setSubmitting(true);
      await documentsAPI.create({
        transaction_id: transactionId,
        document_type: formData.get('documentType'),
        filename: formData.get('documentName'),
        url: '/placeholder-url', // In production, upload to S3 first
        requires_signature: formData.get('requiresSignature') === 'on'
      });
      setShowUploadModal(false);
      await fetchData();
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Error uploading document:', err);
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignDocument = async (docId) => {
    try {
      setSubmitting(true);
      await documentsAPI.sign(docId);
      await fetchData();
      alert('Document signed successfully!');
    } catch (err) {
      console.error('Error signing document:', err);
      alert(err.response?.data?.message || 'Failed to sign document');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading or no transaction message
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  // Timeline milestones
  const milestones = [
    {
      id: 1,
      title: 'Offer Accepted',
      status: 'completed',
      date: '2024-01-10',
      description: 'Buyer\'s offer of $415,000 was accepted by the seller.',
      tasks: [
        { id: 1, title: 'Submit earnest money', status: 'completed', dueDate: '2024-01-12' },
        { id: 2, title: 'Execute purchase agreement', status: 'completed', dueDate: '2024-01-11' }
      ]
    },
    {
      id: 2,
      title: 'Option Period',
      status: 'completed',
      date: '2024-01-10 - 2024-01-17',
      description: '7-day option period for buyer inspections and due diligence.',
      tasks: [
        { id: 3, title: 'Schedule home inspection', status: 'completed', dueDate: '2024-01-12' },
        { id: 4, title: 'Review inspection report', status: 'completed', dueDate: '2024-01-15' },
        { id: 5, title: 'Negotiate repairs', status: 'completed', dueDate: '2024-01-16' }
      ]
    },
    {
      id: 3,
      title: 'Title & Escrow',
      status: 'in_progress',
      date: '2024-01-15 - Present',
      description: 'Title search and escrow setup in progress.',
      tasks: [
        { id: 6, title: 'Order title commitment', status: 'completed', dueDate: '2024-01-15' },
        { id: 7, title: 'Review title commitment', status: 'in_progress', dueDate: '2024-01-25' },
        { id: 8, title: 'Clear title exceptions', status: 'pending', dueDate: '2024-01-30' }
      ]
    },
    {
      id: 4,
      title: 'Appraisal',
      status: 'in_progress',
      date: '2024-01-18 - Present',
      description: 'Property appraisal ordered by lender.',
      tasks: [
        { id: 9, title: 'Schedule appraisal', status: 'completed', dueDate: '2024-01-18' },
        { id: 10, title: 'Appraisal inspection', status: 'completed', dueDate: '2024-01-22' },
        { id: 11, title: 'Receive appraisal report', status: 'pending', dueDate: '2024-01-28' }
      ]
    },
    {
      id: 5,
      title: 'Loan Processing',
      status: 'pending',
      date: 'Expected: 2024-01-28',
      description: 'Final loan approval and underwriting.',
      tasks: [
        { id: 12, title: 'Submit loan documents', status: 'pending', dueDate: '2024-01-30' },
        { id: 13, title: 'Loan underwriting', status: 'pending', dueDate: '2024-02-05' },
        { id: 14, title: 'Clear to close', status: 'pending', dueDate: '2024-02-10' }
      ]
    },
    {
      id: 6,
      title: 'Final Walkthrough',
      status: 'pending',
      date: 'Expected: 2024-02-14',
      description: 'Buyer\'s final inspection before closing.',
      tasks: [
        { id: 15, title: 'Schedule walkthrough', status: 'pending', dueDate: '2024-02-12' },
        { id: 16, title: 'Complete walkthrough', status: 'pending', dueDate: '2024-02-14' }
      ]
    },
    {
      id: 7,
      title: 'Closing',
      status: 'pending',
      date: 'Expected: 2024-02-15',
      description: 'Sign closing documents and transfer ownership.',
      tasks: [
        { id: 17, title: 'Review closing disclosure', status: 'pending', dueDate: '2024-02-13' },
        { id: 18, title: 'Wire funds', status: 'pending', dueDate: '2024-02-15' },
        { id: 19, title: 'Sign documents', status: 'pending', dueDate: '2024-02-15' },
        { id: 20, title: 'Receive keys', status: 'pending', dueDate: '2024-02-15' }
      ]
    }
  ];

  // Demo vendors (would come from API)
  const vendors = [
    { id: 1, name: 'Premier Title Services', type: 'Title Company', status: 'active', contact: '(214) 555-8888', assignedDate: '2024-01-12' },
    { id: 2, name: 'Texas Home Inspectors', type: 'Inspector', status: 'completed', contact: '(972) 555-9999', assignedDate: '2024-01-12' },
    { id: 3, name: 'Smith & Associates', type: 'Attorney', status: 'active', contact: '(469) 555-7777', assignedDate: '2024-01-10' },
    { id: 4, name: 'Dallas Appraisal Group', type: 'Appraiser', status: 'active', contact: '(214) 555-6666', assignedDate: '2024-01-18' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-500" />;
      case 'pending':
        return <Circle className="w-6 h-6 text-gray-300" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Circle className="w-4 h-4 text-gray-300" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'signed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Signed</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Complete</span>;
      case 'pending_review':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Needs Review</span>;
      case 'pending_signature':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Sign Required</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
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
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{transaction.propertyAddress}</h1>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-gray-600">Transaction ID: {transaction.id}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(transaction.salePrice)}</p>
              <p className="text-gray-500">Sale Price</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Transaction Progress</span>
              <span className="text-sm font-medium text-gray-900">{transaction.progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${transaction.progress}%` }}
              />
            </div>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4 mr-1" /> Closing Date
              </div>
              <p className="font-semibold text-gray-900">{formatDate(transaction.expectedClose)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Clock className="w-4 h-4 mr-1" /> Days Remaining
              </div>
              <p className="font-semibold text-gray-900">{transaction.daysRemaining} days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Users className="w-4 h-4 mr-1" /> Buyer
              </div>
              <p className="font-semibold text-gray-900">{transaction.buyer.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Users className="w-4 h-4 mr-1" /> Seller
              </div>
              <p className="font-semibold text-gray-900">{transaction.seller.name}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'timeline', label: 'Timeline', icon: Clock },
                { id: 'documents', label: 'Documents', icon: FileText, badge: documents.filter(d => d.status === 'pending_review').length },
                { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 },
                { id: 'vendors', label: 'Vendors', icon: Briefcase },
                { id: 'parties', label: 'Parties', icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {/* Connector Line */}
                    {index < milestones.length - 1 && (
                      <div className={`absolute left-3 top-12 w-0.5 h-full -mb-4 ${
                        milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}

                    <div className={`border rounded-xl p-4 ${
                      milestone.status === 'in_progress' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <div
                        className="flex items-start cursor-pointer"
                        onClick={() => setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)}
                      >
                        <div className="mr-4">
                          {getStatusIcon(milestone.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{milestone.date}</span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                                expandedMilestone === milestone.id ? 'rotate-180' : ''
                              }`} />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        </div>
                      </div>

                      {/* Expanded Tasks */}
                      {expandedMilestone === milestone.id && (
                        <div className="mt-4 ml-10 space-y-2">
                          {milestone.tasks.map(task => (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                task.status === 'completed' ? 'bg-green-50' :
                                task.status === 'in_progress' ? 'bg-blue-50' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center">
                                {getTaskStatusIcon(task.status)}
                                <span className={`ml-2 ${
                                  task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'
                                }`}>
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Documents</h3>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                </div>

                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded by {doc.uploadedBy} on {formatDate(doc.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getDocumentStatusBadge(doc.status)}
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="flex flex-col h-[500px]">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-xl p-4 ${
                          msg.isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}>
                          {!msg.isOwn && (
                            <div className="flex items-center mb-2">
                              <span className="font-medium text-sm">{msg.sender}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                msg.role === 'Vendor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {msg.role}
                              </span>
                            </div>
                          )}
                          <p>{msg.message}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3 border-t pt-4">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5 text-gray-400" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}

            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Vendors</h3>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendors.map(vendor => (
                    <div key={vendor.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                            <Briefcase className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                            <p className="text-sm text-gray-500">{vendor.type}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                          vendor.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {vendor.contact}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Assigned: {formatDate(vendor.assignedDate)}
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                          Contact
                        </button>
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parties Tab */}
            {activeTab === 'parties' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buyer */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-600 font-semibold text-lg">
                        {transaction.buyer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{transaction.buyer.name}</h3>
                      <span className="text-sm text-green-600 font-medium">Buyer</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      {transaction.buyer.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3" />
                      {transaction.buyer.phone}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Mail className="w-4 h-4 inline mr-1" /> Email
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Phone className="w-4 h-4 inline mr-1" /> Call
                    </button>
                  </div>
                </div>

                {/* Seller */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold text-lg">
                        {transaction.seller.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{transaction.seller.name}</h3>
                      <span className="text-sm text-blue-600 font-medium">Seller</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      {transaction.seller.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3" />
                      {transaction.seller.phone}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Mail className="w-4 h-4 inline mr-1" /> Email
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Phone className="w-4 h-4 inline mr-1" /> Call
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Alerts */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Upcoming Deadlines</h4>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                <li>• Title commitment review due in 5 days (Jan 25)</li>
                <li>• Appraisal report expected by Jan 28</li>
                <li>• Clear to close needed by Feb 10</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option>Select type...</option>
                  <option>Contract / Amendment</option>
                  <option>Disclosure</option>
                  <option>Inspection Report</option>
                  <option>Title Document</option>
                  <option>Financial Document</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 cursor-pointer transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Drag and drop or click to upload</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

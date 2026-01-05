import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  Droplet,
  Wrench,
  Shield,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Zap,
  Flame,
  Trash2,
} from 'lucide-react';
import { buyerAPI } from '../services/api';

export default function BuyerDisclosureViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledging, setAcknowledging] = useState(false);
  const [signing, setSigning] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showSignModal, setShowSignModal] = useState(false);
  const [signatureForm, setSignatureForm] = useState({
    printedName: '',
    signatureData: '',
  });

  useEffect(() => {
    fetchDisclosure();
  }, [id]);

  const fetchDisclosure = async () => {
    try {
      setLoading(true);
      const response = await buyerAPI.getDisclosure(id);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load disclosure');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      setAcknowledging(true);
      await buyerAPI.acknowledgeDisclosure(id);
      await fetchDisclosure();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to acknowledge disclosure');
    } finally {
      setAcknowledging(false);
    }
  };

  const handleSign = async (e) => {
    e.preventDefault();
    if (!signatureForm.printedName || !signatureForm.signatureData) {
      alert('Please enter your name and draw your signature');
      return;
    }

    try {
      setSigning(true);
      await buyerAPI.signDisclosure(id, {
        printedName: signatureForm.printedName,
        signatureData: signatureForm.signatureData,
      });
      setShowSignModal(false);
      await fetchDisclosure();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sign disclosure');
    } finally {
      setSigning(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'viewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'acknowledged':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <h3 className="font-medium text-red-800">Error Loading Disclosure</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={() => navigate('/buyer/disclosures')}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { sharedDisclosure, disclosure, property, seller } = data;

  const SectionCard = ({ title, icon: Icon, children, sectionKey, hasContent = true }) => {
    const isExpanded = expandedSections[sectionKey] ?? false;

    return (
      <div className="bg-white border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {!hasContent && (
              <span className="text-xs text-gray-400">No data</span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t">
            <div className="pt-4">{children}</div>
          </div>
        )}
      </div>
    );
  };

  const renderYesNo = (value, label) => {
    const isYes = value === true || value === 'yes' || value === 'Y';
    const isNo = value === false || value === 'no' || value === 'N';
    const isUnknown = value === 'unknown' || value === 'U' || value === null || value === undefined;

    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-gray-600">{label}</span>
        <span
          className={`px-2 py-0.5 rounded text-sm font-medium ${
            isYes
              ? 'bg-yellow-100 text-yellow-800'
              : isNo
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isYes ? 'Yes' : isNo ? 'No' : 'Unknown'}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/buyer/disclosures"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Disclosures
        </Link>
      </div>

      {/* Property Overview Card */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-36 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {property?.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.address}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Home className="w-12 h-12 text-gray-300" />
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {property?.address || 'Property Address'}
                </h1>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {property?.city}, {property?.state} {property?.zipCode}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                  sharedDisclosure.status
                )}`}
              >
                {sharedDisclosure.status.charAt(0).toUpperCase() +
                  sharedDisclosure.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {property?.price && (
                <div>
                  <span className="text-gray-500">Price</span>
                  <p className="font-semibold text-gray-900">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
              )}
              {property?.bedrooms && (
                <div>
                  <span className="text-gray-500">Bedrooms</span>
                  <p className="font-semibold text-gray-900">{property.bedrooms}</p>
                </div>
              )}
              {property?.bathrooms && (
                <div>
                  <span className="text-gray-500">Bathrooms</span>
                  <p className="font-semibold text-gray-900">{property.bathrooms}</p>
                </div>
              )}
              {property?.squareFeet && (
                <div>
                  <span className="text-gray-500">Sq Ft</span>
                  <p className="font-semibold text-gray-900">
                    {property.squareFeet.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {seller && (
              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium text-gray-900">{seller.name}</p>
                </div>
                {seller.email && (
                  <a
                    href={`mailto:${seller.email}`}
                    className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {disclosure.pdfUrl && (
          <a
            href={disclosure.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        )}

        {sharedDisclosure.status === 'viewed' && (
          <button
            onClick={handleAcknowledge}
            disabled={acknowledging}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {acknowledging ? 'Acknowledging...' : 'Acknowledge Receipt'}
          </button>
        )}

        {(sharedDisclosure.status === 'acknowledged' ||
          sharedDisclosure.status === 'viewed') && (
          <button
            onClick={() => setShowSignModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PenTool className="w-4 h-4" />
            Sign Disclosure
          </button>
        )}

        {sharedDisclosure.status === 'signed' && (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Signed on {new Date(sharedDisclosure.signedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Message from Seller */}
      {sharedDisclosure.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-1">Message from Seller:</p>
          <p className="text-blue-700">{sharedDisclosure.message}</p>
        </div>
      )}

      {/* Disclosure Sections */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Disclosure Details</h2>

        {/* Property Items */}
        <SectionCard
          title="Section 1: Property Items & Equipment"
          icon={Home}
          sectionKey="section1"
          hasContent={Object.keys(disclosure.propertyItems || {}).length > 0}
        >
          <div className="space-y-4">
            {disclosure.propertyItems &&
              Object.entries(disclosure.propertyItems).map(([key, value]) => (
                <div key={key}>
                  {renderYesNo(
                    value,
                    key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                  )}
                </div>
              ))}
            {disclosure.roofInfo && (
              <div className="pt-3 border-t">
                <p className="font-medium text-gray-700 mb-2">Roof Information</p>
                {disclosure.roofInfo.roof_type && (
                  <p className="text-sm text-gray-600">Type: {disclosure.roofInfo.roof_type}</p>
                )}
                {disclosure.roofInfo.roof_age && (
                  <p className="text-sm text-gray-600">Age: {disclosure.roofInfo.roof_age}</p>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Defects */}
        <SectionCard
          title="Section 2: Defects or Malfunctions"
          icon={Wrench}
          sectionKey="section2"
          hasContent={
            Object.keys(disclosure.defects || {}).length > 0 || !!disclosure.defectsExplanation
          }
        >
          <div className="space-y-2">
            {disclosure.defects &&
              Object.entries(disclosure.defects).map(([key, value]) => (
                <div key={key}>
                  {renderYesNo(
                    value,
                    key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                  )}
                </div>
              ))}
            {disclosure.defectsExplanation && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{disclosure.defectsExplanation}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Conditions */}
        <SectionCard
          title="Section 3: Awareness of Conditions"
          icon={AlertCircle}
          sectionKey="section3"
          hasContent={
            Object.keys(disclosure.conditions || {}).length > 0 ||
            !!disclosure.conditionsExplanation
          }
        >
          <div className="space-y-2">
            {disclosure.conditions &&
              Object.entries(disclosure.conditions).map(([key, value]) => (
                <div key={key}>
                  {renderYesNo(
                    value,
                    key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                  )}
                </div>
              ))}
            {disclosure.conditionsExplanation && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{disclosure.conditionsExplanation}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Additional Repairs */}
        <SectionCard
          title="Section 4: Additional Repairs Needed"
          icon={Wrench}
          sectionKey="section4"
          hasContent={disclosure.additionalRepairs !== null}
        >
          {renderYesNo(disclosure.additionalRepairs, 'Additional repairs needed')}
          {disclosure.additionalRepairsExplanation && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">{disclosure.additionalRepairsExplanation}</p>
            </div>
          )}
        </SectionCard>

        {/* Flood Information */}
        <SectionCard
          title="Sections 5-7: Flood Information"
          icon={Droplet}
          sectionKey="flood"
          hasContent={Object.keys(disclosure.floodData || {}).length > 0}
        >
          <div className="space-y-2">
            {disclosure.floodData &&
              Object.entries(disclosure.floodData).map(([key, value]) => (
                <div key={key}>
                  {typeof value === 'boolean' || value === 'yes' || value === 'no'
                    ? renderYesNo(
                        value,
                        key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                      )
                    : (
                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-600">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          <span className="text-gray-900">{String(value)}</span>
                        </div>
                      )}
                </div>
              ))}
            {renderYesNo(disclosure.floodClaim, 'Flood insurance claim filed')}
            {renderYesNo(disclosure.femaAssistance, 'FEMA/SBA assistance received')}
          </div>
        </SectionCard>

        {/* HOA Information */}
        <SectionCard
          title="Section 8: Legal & HOA Information"
          icon={Building}
          sectionKey="section8"
          hasContent={Object.keys(disclosure.hoaDetails || {}).length > 0}
        >
          <div className="space-y-2">
            {disclosure.hoaDetails?.has_hoa !== undefined &&
              renderYesNo(disclosure.hoaDetails.has_hoa, 'Property subject to HOA')}
            {disclosure.hoaDetails?.hoa_name && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">HOA Name</span>
                <span className="text-gray-900">{disclosure.hoaDetails.hoa_name}</span>
              </div>
            )}
            {disclosure.hoaDetails?.monthly_dues && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Monthly Dues</span>
                <span className="text-gray-900">${disclosure.hoaDetails.monthly_dues}</span>
              </div>
            )}
            {disclosure.legalExplanation && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{disclosure.legalExplanation}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Insurance Claims */}
        <SectionCard
          title="Sections 11-12: Insurance & Claims"
          icon={Shield}
          sectionKey="insurance"
          hasContent={
            disclosure.insuranceClaims !== null || disclosure.unremediatedClaims !== null
          }
        >
          {renderYesNo(disclosure.insuranceClaims, 'Insurance claims filed (non-flood)')}
          {renderYesNo(disclosure.unremediatedClaims, 'Unremediated claims')}
          {disclosure.unremediatedExplanation && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">{disclosure.unremediatedExplanation}</p>
            </div>
          )}
        </SectionCard>

        {/* Smoke Detectors */}
        <SectionCard
          title="Section 13: Smoke Detectors"
          icon={AlertCircle}
          sectionKey="section13"
          hasContent={!!disclosure.smokeDetectors}
        >
          {renderYesNo(
            disclosure.smokeDetectors === 'yes',
            'Smoke detectors installed and working'
          )}
        </SectionCard>

        {/* Utility Providers */}
        {disclosure.utilityProviders &&
          Object.keys(disclosure.utilityProviders).length > 0 && (
            <SectionCard
              title="Utility Providers"
              icon={Zap}
              sectionKey="utilities"
              hasContent={true}
            >
              <div className="space-y-2">
                {disclosure.utilityProviders.electric && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Electric
                    </span>
                    <span className="text-gray-900">{disclosure.utilityProviders.electric}</span>
                  </div>
                )}
                {disclosure.utilityProviders.gas && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Flame className="w-4 h-4" /> Gas
                    </span>
                    <span className="text-gray-900">{disclosure.utilityProviders.gas}</span>
                  </div>
                )}
                {disclosure.utilityProviders.water && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Droplet className="w-4 h-4" /> Water
                    </span>
                    <span className="text-gray-900">{disclosure.utilityProviders.water}</span>
                  </div>
                )}
                {disclosure.utilityProviders.trash && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Trash
                    </span>
                    <span className="text-gray-900">{disclosure.utilityProviders.trash}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

        {/* Attachments */}
        {disclosure.attachments && disclosure.attachments.length > 0 && (
          <SectionCard
            title="Attachments"
            icon={FileText}
            sectionKey="attachments"
            hasContent={true}
          >
            <div className="space-y-2">
              {disclosure.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <span className="text-gray-700">{att.name}</span>
                  <Download className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Sign Disclosure</h3>
              <p className="text-sm text-gray-500 mt-1">
                By signing, you acknowledge receipt and review of this disclosure
              </p>
            </div>
            <form onSubmit={handleSign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Printed Name *
                </label>
                <input
                  type="text"
                  value={signatureForm.printedName}
                  onChange={(e) =>
                    setSignatureForm({ ...signatureForm, printedName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full legal name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="text"
                    value={signatureForm.signatureData}
                    onChange={(e) =>
                      setSignatureForm({ ...signatureForm, signatureData: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg italic font-serif text-xl text-center"
                    placeholder="Type your signature"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Type your name as your electronic signature
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                <p>
                  I acknowledge that I have received and reviewed the Seller's Disclosure
                  Notice for the property at {property?.address}.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {signing ? 'Signing...' : 'Sign & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

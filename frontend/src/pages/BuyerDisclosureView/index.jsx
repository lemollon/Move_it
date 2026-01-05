import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Check, AlertTriangle, Printer,
  Download, Loader2, PenTool, CheckCircle2, XCircle
} from 'lucide-react';
import { disclosuresAPI } from '../../services/api';
import { PrintView } from '../SellerDisclosure/components/PrintView';

// Signature Pad Component
const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [printedName, setPrintedName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!hasSignature || !printedName.trim()) return;
    const signatureData = canvasRef.current.toDataURL('image/png');
    onSave({
      signature_data: signatureData,
      printed_name: printedName,
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sign to Acknowledge Receipt</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Signature
        </label>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <button
          type="button"
          onClick={clearCanvas}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Clear signature
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Print Your Name
        </label>
        <input
          type="text"
          value={printedName}
          onChange={(e) => setPrintedName(e.target.value)}
          placeholder="Enter your full legal name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasSignature || !printedName.trim()}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check size={18} />
          Sign & Acknowledge
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const BuyerDisclosureView = () => {
  const { disclosureId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [disclosure, setDisclosure] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);

  useEffect(() => {
    const loadDisclosure = async () => {
      try {
        // Get disclosure PDF data (includes disclosure details)
        const response = await disclosuresAPI.getPDF(disclosureId);
        setDisclosure(response.data.pdf_data);
        setProperty(response.data.property);

        // Check if already signed
        const buyerSig = response.data.pdf_data?.signatures?.buyer1;
        if (buyerSig?.signature_data) {
          setAlreadySigned(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load disclosure');
      } finally {
        setLoading(false);
      }
    };

    loadDisclosure();
  }, [disclosureId]);

  const handleSign = async (signatureData) => {
    setSigning(true);
    try {
      await disclosuresAPI.signBuyer(disclosureId, {
        ...signatureData,
        buyer_number: 1, // First buyer
      });
      setAlreadySigned(true);
      setShowSignature(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign disclosure');
    } finally {
      setSigning(false);
    }
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading disclosure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Disclosure</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Seller's Disclosure Notice</h1>
                <p className="text-sm text-gray-500">Review and acknowledge receipt</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
              {!alreadySigned && !showSignature && (
                <button
                  onClick={() => setShowSignature(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PenTool size={18} />
                  Sign to Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Status Banner */}
        {alreadySigned ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 print:hidden">
            <CheckCircle2 size={24} className="text-green-600" />
            <div>
              <p className="font-medium text-green-800">You have acknowledged this disclosure</p>
              <p className="text-sm text-green-600">
                Signed on {new Date(disclosure?.signatures?.buyer1?.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 print:hidden">
            <AlertTriangle size={24} className="text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Please review and acknowledge this disclosure</p>
              <p className="text-sm text-amber-600">
                Your signature confirms that you have received and reviewed this disclosure.
              </p>
            </div>
          </div>
        )}

        {/* Signature Modal/Section */}
        {showSignature && (
          <div className="mb-6 print:hidden">
            <SignaturePad
              onSave={handleSign}
              onCancel={() => setShowSignature(false)}
            />
          </div>
        )}

        {/* Print View */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <PrintView ref={printRef} disclosure={disclosure} property={property} />
        </div>

        {/* Bottom Actions */}
        {!alreadySigned && !showSignature && (
          <div className="mt-6 flex justify-center print:hidden">
            <button
              onClick={() => setShowSignature(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <PenTool size={20} />
              Sign to Acknowledge Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDisclosureView;

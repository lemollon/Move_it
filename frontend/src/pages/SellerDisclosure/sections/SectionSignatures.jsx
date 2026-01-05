import React, { useRef, useState } from 'react';
import { PenTool, Check, AlertTriangle, User, Calendar } from 'lucide-react';
import { TextInput, InfoBox, SectionHeader } from '../components/FormComponents';

const SignaturePad = ({ onSign, disabled = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = () => {
    if (!hasSignature) return null;
    return canvasRef.current.toDataURL();
  };

  return (
    <div>
      <div className={`border-2 rounded-lg overflow-hidden ${disabled ? 'bg-gray-100' : 'border-gray-300'}`}>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className={`w-full ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">Sign above using mouse or touch</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearSignature}
            disabled={disabled || !hasSignature}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onSign(getSignatureData())}
            disabled={disabled || !hasSignature}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionSignatures = ({ data, onSign, disclosure, completion }) => {
  const [seller1Name, setSeller1Name] = useState('');
  const [seller2Name, setSeller2Name] = useState('');
  const [showSeller2, setShowSeller2] = useState(false);

  const canSign = completion >= 80;
  const seller1Signed = !!data.seller1?.signature_data;
  const seller2Signed = !!data.seller2?.signature_data;

  const handleSign = async (sellerNumber, signatureData) => {
    const name = sellerNumber === 1 ? seller1Name : seller2Name;
    if (!name.trim()) {
      alert('Please enter your printed name before signing.');
      return;
    }

    try {
      await onSign({
        signature_data: signatureData,
        printed_name: name
      }, sellerNumber);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <SectionHeader
        number="✓"
        title="Seller Signature"
        subtitle="Acknowledge and sign the disclosure notice"
      />

      {!canSign && (
        <InfoBox type="warning">
          <strong>Cannot sign yet.</strong> The disclosure must be at least 80% complete before signing.
          Current completion: {completion}%
        </InfoBox>
      )}

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        {/* Acknowledgement */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Seller Acknowledgement</h4>
          <p className="text-sm text-gray-600">
            By signing below, Seller acknowledges that the statements in this notice are true
            to the best of Seller's belief and that no person, including the broker(s), has
            instructed or influenced Seller to provide inaccurate information or to omit any
            material information.
          </p>
        </div>

        {/* Seller 1 */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} />
            Seller 1 Signature
          </h4>

          {seller1Signed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Check className="text-green-600" size={20} />
                <span className="font-medium text-green-700">Signed</span>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Name:</strong> {data.seller1.printed_name}</p>
                <p><strong>Date:</strong> {new Date(data.seller1.date).toLocaleDateString()}</p>
              </div>
              {data.seller1.signature_data && (
                <img
                  src={data.seller1.signature_data}
                  alt="Seller 1 signature"
                  className="mt-2 max-h-20 border rounded"
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Printed Name *
                </label>
                <TextInput
                  value={seller1Name}
                  onChange={setSeller1Name}
                  placeholder="Enter your full legal name..."
                  disabled={!canSign}
                  className="max-w-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature *
                </label>
                <SignaturePad
                  onSign={(sig) => handleSign(1, sig)}
                  disabled={!canSign}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>Date will be recorded automatically upon signing</span>
              </div>
            </div>
          )}
        </div>

        {/* Seller 2 (optional) */}
        <div className="border-t border-gray-200 pt-6">
          {!showSeller2 && !seller2Signed ? (
            <button
              type="button"
              onClick={() => setShowSeller2(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Second Seller Signature (if applicable)
            </button>
          ) : (
            <div>
              <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} />
                Seller 2 Signature (Optional)
              </h4>

              {seller2Signed ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="text-green-600" size={20} />
                    <span className="font-medium text-green-700">Signed</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Name:</strong> {data.seller2.printed_name}</p>
                    <p><strong>Date:</strong> {new Date(data.seller2.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Printed Name
                    </label>
                    <TextInput
                      value={seller2Name}
                      onChange={setSeller2Name}
                      placeholder="Enter second seller's full legal name..."
                      disabled={!canSign || !seller1Signed}
                      className="max-w-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signature
                    </label>
                    <SignaturePad
                      onSign={(sig) => handleSign(2, sig)}
                      disabled={!canSign || !seller1Signed}
                    />
                  </div>

                  {!seller1Signed && (
                    <p className="text-sm text-yellow-600">
                      Seller 1 must sign before Seller 2 can sign.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion Status */}
      {seller1Signed && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-semibold text-green-800">Disclosure Signed</h4>
              <p className="text-sm text-green-700 mt-1">
                This seller's disclosure has been signed and is ready for the buyer's review.
                The buyer will sign to acknowledge receipt of this disclosure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionSignatures;

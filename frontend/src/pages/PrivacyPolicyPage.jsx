import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">Move-it</span>
            </Link>
            <Link
              to="/"
              className="flex items-center text-blue-600 font-medium hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="prose prose-blue max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Move-it ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our real estate marketplace platform. Please read this policy carefully. By using Move-it, you consent to the practices described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide when using our services, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Name, email address, phone number, and mailing address</li>
              <li>Account credentials (username and password)</li>
              <li>Property information (for listings)</li>
              <li>Financial information necessary for transactions</li>
              <li>Government-issued identification (when required for transactions)</li>
              <li>Communications between you and other users or vendors</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you access our platform, we may automatically collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, time spent, clicks)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Facilitate real estate transactions between buyers, sellers, and vendors</li>
              <li>Create and manage your account</li>
              <li>Process transactions and send related information</li>
              <li>Connect you with service providers (title companies, inspectors, attorneys)</li>
              <li>Send administrative information, updates, and marketing communications</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Improve our platform and develop new features</li>
              <li>Detect and prevent fraud or unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Other Users:</strong> Buyers and sellers may see relevant contact information to facilitate transactions</li>
              <li><strong>Service Vendors:</strong> Title companies, inspectors, attorneys, and appraisers you choose to work with</li>
              <li><strong>Service Providers:</strong> Third parties that help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings, but disabling cookies may limit some features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Texas-Specific Provisions</h2>
            <p className="text-gray-600 leading-relaxed">
              As a platform operating in Texas, we comply with applicable Texas state privacy laws. Texas residents have specific rights under state law regarding the collection and use of personal information in real estate transactions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the platform after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mt-4">
              <p className="text-gray-700 font-semibold">Move-it</p>
              <p className="text-gray-600">Email: privacy@move-it.com</p>
              <p className="text-gray-600">Texas, United States</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Move-it</span>
            </Link>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
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

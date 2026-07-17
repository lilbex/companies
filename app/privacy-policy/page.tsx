import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b py-4 px-4 text-center">
        <Link href="/login" className="text-2xl font-bold text-gray-900">
          City<span className="text-green-600">Wheels</span>
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 10, 2025</p>
          
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">Camera Permission</h3>
              <p className="text-gray-700 mb-4">
                CityWheels requests camera permission to allow users to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Take photos of items being delivered for identification purposes</li>
                <li>Capture delivery confirmation photos</li>
                <li>Upload profile pictures for rider and customer accounts</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">Location Permission</h3>
              <p className="text-gray-700 mb-4">
                We collect location data to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Match customers with nearby riders</li>
                <li>Provide real-time delivery tracking</li>
                <li>Calculate accurate delivery distances and pricing</li>
                <li>Optimize delivery routes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">Camera Data</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Photos are used solely for delivery verification and tracking</li>
                <li>Images are stored securely on our servers</li>
                <li>Photos are only accessible to the sender, recipient, and assigned delivery rider</li>
                <li>Images are automatically deleted after 30 days of delivery completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>All data is encrypted during transmission and storage</li>
                <li>We use industry-standard security measures to protect your information</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For privacy concerns, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@citywheels.ng</p>
                <p className="text-gray-700"><strong>Phone:</strong> +234 (0) 123 456 7890</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                This privacy policy may be updated periodically. Users will be notified of significant changes 
                through the app or email.
              </p>
            </section>
          </div>
        </div>
      </div>
      
    </div>
  );
}
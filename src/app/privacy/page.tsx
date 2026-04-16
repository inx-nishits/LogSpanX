import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f1f1f4] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/login" className="inline-flex items-center text-[#03a9f4] hover:underline mb-8 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>
        <div className="bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: April 2026</p>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
              <p>
                As this is a proprietary internal tracking application for <strong>InheritX</strong>, we collect data necessary to facilitate business operations. This includes your name, company email address, your entered time logs, project associations, and basic usage metadata (such as login timestamps).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Data</h2>
              <p>
                The information collected is used strictly for internal purposes at InheritX. This includes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Processing payroll and calculating contractor compensation.</li>
                <li>Generating client billing reports and project budget analysis.</li>
                <li>Monitoring system performance, security, and internal resource allocation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. No Third-Party Sharing</h2>
              <p>
                Because this application is built exclusively in-house, your data remains fully encapsulated within the InheritX infrastructure. We do not sell, rent, or distribute your personal information or tracking metrics to outside marketing firms, advertisers, or unaffiliated third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Data Security</h2>
              <p>
                InheritX applies standard corporate security measures to protect the integrity of your entered data. While we strive to use commercially acceptable means to protect your personal information, remember that no method of electronic storage is absolutely flawless.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Contact</h2>
              <p>
                If you have privacy-related concerns or require updates to your account credentials, please reach out to the internal InheritX HR or IT department.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-gray-100">
              <p className="text-gray-500 text-xs text-center">
                &copy; {new Date().getFullYear()} InheritX Solutions. Proprietary Internal System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

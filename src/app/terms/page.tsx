import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f1f1f4] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/login" className="inline-flex items-center text-[#03a9f4] hover:underline mb-8 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>
        <div className="bg-white rounded-sm shadow-[0_4px_16px_rgba(11,12,14,0.08)] p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: April 2026</p>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Internal Usage Only</h2>
              <p>
                Welcome to the official internal time-tracking application. This software ecosystem was built and customized exclusively by and for <strong>InheritX</strong>. By accessing this platform, you agree that your usage is strictly limited to official InheritX operations, projects, and administrative tasks.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. User Responsibilities</h2>
              <p>
                As an employee, contractor, or affiliate of InheritX, you are expected to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Log your working hours accurately and honestly.</li>
                <li>Ensure time entries are correctly categorized by project and client.</li>
                <li>Maintain the confidentiality of your login credentials.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Data Ownership</h2>
              <p>
                All data, including but not limited to time entries, project structures, client information, and reporting metrics generated within this application, are the exclusive intellectual property of InheritX. You agree not to distribute or export this data outside the company&apos;s approved workflows.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. System Integrity</h2>
              <p>
                Attempting to bypass tracking, manipulate server data, or compromise the system architecture is strictly prohibited and violates InheritX internal policies.
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

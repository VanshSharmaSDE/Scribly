import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, Globe, Users, Sparkles } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const SectionCard = ({ icon: Icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center space-x-4 mb-6">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
        }}
      >
        <Icon className="w-6 h-6" style={{ color: '#4F70E2' }} />
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="text-gray-200 leading-relaxed space-y-4">
      {children}
    </div>
  </motion.div>
);

const PrivacyPolicy = () => {
  const lastUpdated = "January 31, 2025";

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#22c55e'
              }}
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Your Privacy Matters</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We're committed to protecting your privacy and being transparent about how we collect, 
              use, and protect your personal information.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              Last updated: {lastUpdated}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <SectionCard icon={Database} title="Information We Collect" delay={0.1}>
            <h3 className="text-lg font-semibold text-white mb-3">Account Information</h3>
            <p>When you create a Scribly account, we collect:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Email address (required for account creation)</li>
              <li>Name (optional, for personalization)</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Content Data</h3>
            <p>To provide our service, we store:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Your notes, including text, formatting, and metadata</li>
              <li>Tags and organizational information</li>
              <li>Sharing settings and link configurations</li>
              <li>Usage analytics (anonymized when possible)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Technical Information</h3>
            <p>We automatically collect certain technical information:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data (for security and performance)</li>
              <li>Usage patterns and feature interactions</li>
              <li>Error logs and performance metrics</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Eye} title="How We Use Your Information" delay={0.2}>
            <h3 className="text-lg font-semibold text-white mb-3">Service Provision</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Create and maintain your account</li>
              <li>Store and sync your notes across devices</li>
              <li>Provide AI-powered features and suggestions</li>
              <li>Enable sharing and collaboration features</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Product Improvement</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Analyze usage patterns to improve our service</li>
              <li>Develop new features and capabilities</li>
              <li>Optimize performance and user experience</li>
              <li>Conduct beta testing and feature rollouts</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Communication</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Send important service updates and notifications</li>
              <li>Respond to your support requests and feedback</li>
              <li>Share beta updates and new feature announcements</li>
              <li>Provide customer support and assistance</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Lock} title="Data Security & Protection" delay={0.3}>
            <h3 className="text-lg font-semibold text-white mb-3">Encryption</h3>
            <p>Your data is protected with industry-standard security measures:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>All data transmitted using HTTPS/TLS encryption</li>
              <li>Data at rest encrypted using AES-256 encryption</li>
              <li>Secure authentication with bcrypt password hashing</li>
              <li>Regular security audits and vulnerability assessments</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Access Controls</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Strict employee access controls with principle of least privilege</li>
              <li>Multi-factor authentication for administrative access</li>
              <li>Regular access reviews and security training</li>
              <li>Comprehensive audit logs for all data access</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Infrastructure</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Hosted on secure, SOC 2 compliant cloud infrastructure</li>
              <li>Regular backups with point-in-time recovery</li>
              <li>Distributed architecture for high availability</li>
              <li>24/7 monitoring and incident response</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Globe} title="Sharing & Third Parties" delay={0.4}>
            <h3 className="text-lg font-semibold text-white mb-3">Your Shared Content</h3>
            <p>When you share notes publicly:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Shared notes are accessible via unique links you generate</li>
              <li>You control who can access your shared content</li>
              <li>You can revoke access or delete shared links anytime</li>
              <li>Creator attribution is shown with shared content</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Service Providers</h3>
            <p>We work with trusted third-party providers for:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Cloud hosting and infrastructure (Appwrite, cloud providers)</li>
              <li>AI services (Google Gemini API for content generation)</li>
              <li>Analytics and performance monitoring</li>
              <li>Customer support and communication tools</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Legal Requirements</h3>
            <p>We may disclose information only when required by:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Valid legal process or court orders</li>
              <li>Law enforcement requests with proper authorization</li>
              <li>Protection of our users' safety and security</li>
              <li>Compliance with applicable laws and regulations</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Users} title="Your Rights & Controls" delay={0.5}>
            <h3 className="text-lg font-semibold text-white mb-3">Data Access & Portability</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>View and download all your data anytime</li>
              <li>Export notes in standard formats (Markdown, etc.)</li>
              <li>Request copies of your account information</li>
              <li>Access sharing analytics and usage statistics</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Data Control</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Edit or delete your notes and content anytime</li>
              <li>Control sharing settings and permissions</li>
              <li>Manage your account information and preferences</li>
              <li>Opt-out of non-essential communications</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Account Deletion</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Delete your account and all associated data anytime</li>
              <li>Data deletion is permanent and irreversible</li>
              <li>Some metadata may be retained for legal compliance</li>
              <li>Shared content will become inaccessible immediately</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Beta Program & AI Features" delay={0.6}>
            <h3 className="text-lg font-semibold text-white mb-3">Beta Participation</h3>
            <p>As a beta user, please note:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Features may change or be discontinued without notice</li>
              <li>We may collect additional usage data for improvement</li>
              <li>Your feedback helps shape product development</li>
              <li>Beta features may have different privacy implications</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">AI Processing</h3>
            <p>For AI-powered features:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Content may be processed by Google Gemini AI</li>
              <li>AI providers have their own privacy policies</li>
              <li>We don't store your API keys - they're kept locally</li>
              <li>AI-generated content is subject to the same privacy protections</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Analytics & Improvement</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Usage analytics help us improve beta features</li>
              <li>Crash reports and error logs for debugging</li>
              <li>Performance metrics for optimization</li>
              <li>All analytics data is anonymized when possible</li>
            </ul>
          </SectionCard>

        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8 text-center"
          >
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Questions About Privacy?</h2>
            <p className="text-gray-200 mb-6">
              We're committed to transparency and protecting your privacy. If you have any questions 
              about this policy or how we handle your data, please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@scribly.com"
                className="inline-block font-medium py-3 px-6 rounded-lg transition-colors duration-300 text-white bg-blue-600 hover:bg-blue-700"
              >
                Contact Privacy Team
              </a>
              <a
                href="/contact"
                className="inline-block font-medium py-3 px-6 rounded-lg transition-colors duration-300 text-blue-400 border border-blue-500 hover:bg-blue-500 hover:text-white"
              >
                General Contact
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </ProfessionalBackground>
  );
};

export default PrivacyPolicy;

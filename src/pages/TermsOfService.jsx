import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle, Users, Globe, Scale, Sparkles } from 'lucide-react';
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

const TermsOfService = () => {
  const lastUpdated = "January 31, 2025";
  const effectiveDate = "February 1, 2025";

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
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                color: '#3b82f6'
              }}
            >
              <Scale className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Legal Agreement</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              These terms govern your use of Scribly and outline the rights and responsibilities 
              of both users and our platform.
            </p>
            <div className="mt-6 text-sm text-gray-400 space-y-1">
              <div>Last updated: {lastUpdated}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <SectionCard icon={FileText} title="Agreement to Terms" delay={0.1}>
            <p>
              By accessing or using Scribly ("the Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            
            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Who Can Use Scribly</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>You must be at least 13 years old to use Scribly</li>
              <li>Users between 13-18 must have parental consent</li>
              <li>You must provide accurate information during registration</li>
              <li>You're responsible for maintaining account security</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Beta Service Notice</h3>
            <p>
              Scribly is currently in beta testing. This means features may change, be discontinued, 
              or experience downtime. By using the beta service, you acknowledge that it's provided 
              "as is" and may not be suitable for production use.
            </p>
          </SectionCard>

          <SectionCard icon={Users} title="User Accounts & Responsibilities" delay={0.2}>
            <h3 className="text-lg font-semibold text-white mb-3">Account Creation</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>You're responsible for all activity under your account</li>
              <li>You must keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Acceptable Use</h3>
            <p>You agree not to use Scribly to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or harmful content</li>
              <li>Spam, harass, or abuse other users</li>
              <li>Share illegal, offensive, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Content Guidelines</h3>
            <p>When creating and sharing content:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Ensure you have rights to all content you upload</li>
              <li>Respect copyright and intellectual property laws</li>
              <li>Don't share content that violates others' privacy</li>
              <li>Keep shared content appropriate for public viewing</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Globe} title="Service Features & Limitations" delay={0.3}>
            <h3 className="text-lg font-semibold text-white mb-3">Current Beta Features</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Note creation, editing, and organization</li>
              <li>AI-powered content generation (requires your API key)</li>
              <li>Multiple sharing links with analytics</li>
              <li>Markdown export and professional downloads</li>
              <li>Real-time synchronization across devices</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Service Availability</h3>
            <p>While we strive for high availability:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Service may be temporarily unavailable for maintenance</li>
              <li>We don't guarantee 100% uptime during beta</li>
              <li>Features may be modified or removed without notice</li>
              <li>Data backup and recovery is your responsibility</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">AI Features</h3>
            <p>For AI-powered features:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>You must provide your own API keys for AI services</li>
              <li>AI-generated content is your responsibility</li>
              <li>We don't guarantee accuracy of AI-generated content</li>
              <li>Third-party AI providers have their own terms</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Shield} title="Intellectual Property" delay={0.4}>
            <h3 className="text-lg font-semibold text-white mb-3">Your Content</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>You retain ownership of all content you create</li>
              <li>You grant us license to host and display your content</li>
              <li>You're responsible for ensuring you have rights to uploaded content</li>
              <li>You can delete your content anytime</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Our Platform</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Scribly platform and features are our intellectual property</li>
              <li>You may not copy, modify, or reverse engineer our service</li>
              <li>Our name, logo, and branding are protected trademarks</li>
              <li>You receive a limited license to use the platform</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Shared Content</h3>
            <p>When you share notes publicly:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>You grant viewers permission to read and download shared content</li>
              <li>You remain the owner of your content</li>
              <li>You can revoke sharing access anytime</li>
              <li>Shared content may be cached or archived by third parties</li>
            </ul>
          </SectionCard>

          <SectionCard icon={AlertTriangle} title="Disclaimers & Limitations" delay={0.5}>
            <h3 className="text-lg font-semibold text-white mb-3">Beta Service Disclaimers</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED. THIS IS BETA SOFTWARE AND MAY CONTAIN BUGS OR INCOMPLETE FEATURES.
            </p>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCRIBLY SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Loss of data or content</li>
              <li>Service interruptions or downtime</li>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Actions of third-party AI services</li>
              <li>User-generated content or shared materials</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Data Security</h3>
            <p>
              While we implement security measures, you acknowledge that:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>No system is 100% secure</li>
              <li>You should backup important data</li>
              <li>You're responsible for maintaining account security</li>
              <li>Shared content may be accessible to others</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Beta Program & Future Changes" delay={0.6}>
            <h3 className="text-lg font-semibold text-white mb-3">Beta Participation</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Beta access is provided at our discretion</li>
              <li>We may limit or revoke beta access anytime</li>
              <li>Features may change significantly before final release</li>
              <li>Your feedback helps improve the service</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Future Pricing</h3>
            <p>
              The service is currently free during beta. When we launch:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>We may introduce paid plans with additional features</li>
              <li>Beta users may receive special pricing or grandfathered access</li>
              <li>We'll provide advance notice of any pricing changes</li>
              <li>You can cancel your account before any charges apply</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Terms Updates</h3>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>We may update these terms as the service evolves</li>
              <li>Material changes will be communicated in advance</li>
              <li>Continued use constitutes acceptance of updated terms</li>
              <li>You can terminate your account if you disagree with changes</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Scale} title="Termination & Dispute Resolution" delay={0.7}>
            <h3 className="text-lg font-semibold text-white mb-3">Account Termination</h3>
            <p>Either party may terminate the agreement:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>You can delete your account anytime</li>
              <li>We may suspend accounts for terms violations</li>
              <li>We may terminate the beta program with notice</li>
              <li>Data deletion is permanent and irreversible</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Governing Law</h3>
            <p>
              These Terms are governed by the laws of [Jurisdiction] without regard to conflict 
              of law principles. Any disputes will be resolved through binding arbitration.
            </p>

            <h3 className="text-lg font-semibold text-white mb-3 mt-6">Contact for Legal Issues</h3>
            <p>
              For legal questions or terms-related concerns, contact us at: 
              <a href="mailto:legal@scribly.com" className="text-blue-400 hover:underline ml-1">
                legal@scribly.com
              </a>
            </p>
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
            <Scale className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h2>
            <p className="text-gray-200 mb-6">
              If you have questions about these Terms of Service or need clarification on any 
              points, please reach out to our legal team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:legal@scribly.com"
                className="inline-block font-medium py-3 px-6 rounded-lg transition-colors duration-300 text-white bg-blue-600 hover:bg-blue-700"
              >
                Contact Legal Team
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

export default TermsOfService;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Github, Twitter, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const ContactInfo = ({ icon: Icon, title, content, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    className="flex items-start space-x-4"
  >
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: 'rgba(79, 112, 226, 0.2)' }}
    >
      <Icon className="h-6 w-6" style={{ color: '#4F70E2' }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-200">{content}</p>
    </div>
  </motion.div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject || 'Contact from Scribly Website');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:hello@scribly.com?subject=${subject}&body=${body}`;
    
    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => {
      setSubmitStatus(null);
    }, 5000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'General Inquiries',
      content: 'hello@scribly.com'
    },
    {
      icon: MessageCircle,
      title: 'Beta Feedback',
      content: 'beta@scribly.com'
    },
    {
      icon: Clock,
      title: 'Response Time',
      content: 'Usually within 24 hours'
    }
  ];

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            {/* Beta Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
                color: '#9333ea'
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">We'd Love to Hear From You</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Have questions, feedback, or just want to say hello? 
              We're here to help and excited to hear from our community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-8">
                  Let's Start a Conversation
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Whether you're facing a technical issue, have feature requests, 
                  or want to explore partnership opportunities, our team is here to help.
                </p>
              </motion.div>

              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <ContactInfo
                    key={info.title}
                    {...info}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-black/40 border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Quick Questions?
                </h3>
                <p className="text-gray-200 mb-4">
                  Check out our FAQ section for instant answers to common questions.
                </p>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-black/40 border border-white/20 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-8">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 mb-6"
                >
                  <p className="text-green-400">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <motion.textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us more..."
                    required
                    whileFocus={{ scale: 1.01 }}
                    className="w-full px-4 py-3 bg-black/20 border-2 border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors duration-300 resize-none"
                    style={{ focusBorderColor: '#4F70E2' }}
                  />
                </div>

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full border border-transparent rounded-lg px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 112, 226, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
              borderColor: 'rgba(79, 112, 226, 0.3)'
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prefer Other Ways to Connect?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Follow us on social media for updates, tips, and community discussions.
            </p>
            <div className="flex justify-center space-x-6">
              {['Twitter', 'LinkedIn', 'Discord'].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black/30 hover:bg-white/10 border border-white/20 rounded-lg px-6 py-3 text-white transition-colors duration-300"
                  style={{
                    '&:hover': {
                      borderColor: '#4F70E2'
                    }
                  }}
                >
                  {platform}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default Contact;


import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  Github,
  Twitter,
  Sparkles,
  Bug,
  AlertTriangle,
  FileText,
} from "lucide-react";
import toast from 'react-hot-toast';
import Button from "../components/Button";
import Input from "../components/Input";
import ProfessionalBackground from "../components/ProfessionalBackground";
import Breadcrumb from "../components/Breadcrumb";
import bugReportService from '../services/bugReportService';

const BugReportInfo = ({ icon: Icon, title, content, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    className="flex items-start space-x-4"
  >
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "rgba(79, 112, 226, 0.2)" }}
    >
      <Icon className="h-6 w-6" style={{ color: "#4F70E2" }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-200">{content}</p>
    </div>
  </motion.div>
);

const ReportBug = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bugSummary: "",
    bugDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading('Submitting your bug report...');
      
      // Submit form data using EmailJS
      const result = await bugReportService.submitBugReport(formData);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", bugSummary: "", bugDescription: "" });
        toast.success('Bug report submitted successfully! We\'ll investigate this issue.');
      } else {
        setSubmitStatus("error");
        toast.error(result.error || 'Failed to submit bug report. Please try again.');
      }
    } catch (error) {
      console.error('Bug report submission error:', error);
      setSubmitStatus("error");
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };

  const bugReportInfo = [
    {
      icon: Bug,
      title: "Bug Reports",
      content: "scribly.server@gmail.com",
    },
    {
      icon: AlertTriangle,
      title: "Critical Issues",
      content: "scribly.server@gmail.com",
    },
    {
      icon: Clock,
      title: "Response Time",
      content: "Usually within 24 hours",
    },
  ];

  return (
    <>
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
                  background:
                    "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                }}
              >
                <Bug className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">
                  Help Us Improve Scribly
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
                Report a <span className="gradient-text">Bug</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Found an issue? Help us make Scribly better by reporting bugs 
                and technical problems you encounter.
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
                    Help Us Fix Issues Faster
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Your bug reports are crucial for improving Scribly. Please provide 
                    as much detail as possible to help us reproduce and fix the issue quickly.
                  </p>
                </motion.div>

                <div className="space-y-8">
                  {bugReportInfo.map((info, index) => (
                    <BugReportInfo
                      key={info.title}
                      {...info}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/40 border border-white/20 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-8">
                  Submit Bug Report
                </h2>

                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 mb-6"
                  >
                    <p className="text-green-400">
                      Thank you for your bug report! We'll investigate this issue and get back to you soon.
                    </p>
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6"
                  >
                    <p className="text-red-400">
                      Sorry, there was an error submitting your bug report. Please try again.
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
                    label="Bug Summary"
                    name="bugSummary"
                    value={formData.bugSummary}
                    onChange={handleChange}
                    placeholder="Brief description of the bug"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bug Description
                    </label>
                    <motion.textarea
                      name="bugDescription"
                      value={formData.bugDescription}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Please describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior..."
                      required
                      whileFocus={{ scale: 1.01 }}
                      className="w-full px-4 py-3 bg-black/20 border-2 border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors duration-300 resize-none"
                      style={{ focusBorderColor: "#4F70E2" }}
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full border border-transparent rounded-lg px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Alternative Contact Methods */}
        {/* <section className="relative z-10 py-20">
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
      </section> */}
      </ProfessionalBackground>
    </>
  );
};

export default ReportBug;

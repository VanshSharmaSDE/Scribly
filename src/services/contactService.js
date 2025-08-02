import emailjs from '@emailjs/browser';

class ContactService {
  constructor() {
    // Initialize EmailJS with your public key
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }

  async submitContactForm(formData) {
    try {
      // Prepare template parameters for EmailJS
      // Variable names match exactly with the EmailJS template
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submitted_at: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Email sent successfully:', response);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }
}

export default new ContactService();

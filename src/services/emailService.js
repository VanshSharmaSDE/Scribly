import { functions } from '../lib/appwrite';

class EmailService {
  /**
   * Send email using custom Appwrite function with SMTP
   * @param {Object} params - Email parameters
   * @param {string} params.to - Recipient email
   * @param {string} params.subject - Email subject
   * @param {string} params.html - HTML content
   * @param {string} params.name - Recipient name (optional)
   * @param {string} params.type - Email type (verification, password_reset, etc.)
   */
  async sendEmail({ to, subject, html, name, type = 'verification' }) {
    try {
      console.log('Sending email via custom function:', { to, subject, type });
      
      const response = await functions.createExecution(
        import.meta.env.VITE_APPWRITE_EMAIL_FUNCTION_ID || '6893679e001291004e55', // Your function ID
        JSON.stringify({
          to,
          subject,
          html,
          name,
          type
        }),
        false // synchronous execution
      );

      console.log('Email function response:', response);

      // Parse the response
      let result;
      try {
        result = JSON.parse(response.responseBody || response.response || '{}');
      } catch (parseError) {
        console.warn('Could not parse email function response:', parseError);
        console.warn('Raw response:', response);
        
        // Don't assume success - check if we have any indication of success
        if (response.status === 'completed' || response.responseBody || response.response) {
          result = { success: true }; // Only assume success if we have some response
        } else {
          throw new Error('Email function returned unparseable response');
        }
      }

      console.log('Parsed email result:', result);

      if (result.success === false) {
        throw new Error(result.error || 'Failed to send email via custom function');
      }

      console.log('Email sent successfully via custom SMTP');
      return result;
    } catch (error) {
      console.error('Error sending email via custom function:', error);
      
      // Check if it's a deployment issue
      if (error.message && (
        error.message.includes('Deployment not found') || 
        error.message.includes('404') ||
        error.message.includes('Function not found')
      )) {
        console.warn('Function deployment issue detected. Email functionality will be limited until function is deployed.');
        console.warn('Function ID:', import.meta.env.VITE_APPWRITE_EMAIL_FUNCTION_ID || '6893679e001291004e55');
        console.warn('Please deploy your Appwrite function to enable custom email sending.');
        
        // Don't throw error - let the auth process continue without custom emails
        // Appwrite will still send basic verification emails
        return { 
          success: false, 
          error: 'Custom email function not deployed',
          fallback: true 
        };
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send verification email with custom styling
   */
  async sendVerificationEmail(email, verificationUrl, name) {
    const subject = 'Verify Your Scribly Account';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Scribly</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9;">Your Digital Notebook</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Verify Your Account</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Hi ${name || 'there'},<br><br>
                Thank you for signing up for Scribly! To complete your registration and access all features, please verify your email address by clicking the button below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              <p style="margin: 20px 0; color: #666666; font-size: 14px; text-align: center;">
                This verification link will expire in 24 hours for security reasons.
              </p>
              <p style="margin: 20px 0; color: #999999; font-size: 12px;">
                If you can't click the button, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">
                If you didn't create an account with Scribly, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2025 Scribly. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      name,
      type: 'verification'
    });
  }

  /**
   * Send password recovery email with custom styling
   */
  async sendPasswordRecoveryEmail(email, resetUrl, name) {
    const subject = 'Reset Your Scribly Password';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Scribly</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9;">Your Digital Notebook</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Reset Your Password</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Hi ${name || 'there'},<br><br>
                We received a request to reset your password for your Scribly account. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="margin: 20px 0; color: #666666; font-size: 14px; text-align: center;">
                This password reset link will expire in 24 hours for security reasons.
              </p>
              <p style="margin: 20px 0; color: #999999; font-size: 12px;">
                If you can't click the button, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2025 Scribly. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      name,
      type: 'password_reset'
    });
  }
}

export default new EmailService();

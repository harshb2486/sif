const nodemailer = require('nodemailer');

// Email service for sending notifications
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send approval notification
  async sendApprovalNotification(email, userName) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: '✅ Your Account Has Been Approved!',
        html: `
          <h2>Welcome to Field Sales Management System!</h2>
          <p>Hi ${userName},</p>
          <p>Great news! Your account has been approved by your company administrator.</p>
          <p>You can now:</p>
          <ul>
            <li>Create sales orders</li>
            <li>Track your commissions</li>
            <li>View your performance metrics</li>
          </ul>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Log in to your account at ${process.env.FRONTEND_URL}</li>
            <li>Update your profile information</li>
            <li>Start creating sales!</li>
          </ol>
          <p>If you have any questions, contact your administrator.</p>
          <p>Best regards,<br>Field Sales Management Team</p>
        `,
      });
      console.log(`✅ Approval notification sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending approval email:', error);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>Or copy this link: <br><code>${resetLink}</code></p>
          <p><strong>This link expires in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Field Sales Management Team</p>
        `,
      });
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending reset email:', error);
    }
  }

  // Send commission notification
  async sendCommissionNotification(email, userName, amount, productName) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `💰 Commission Earned: $${amount.toFixed(2)}`,
        html: `
          <h2>Commission Earned!</h2>
          <p>Hi ${userName},</p>
          <p>Congratulations! You've earned a commission:</p>
          <p style="font-size: 24px; color: #28a745; font-weight: bold;">$${amount.toFixed(2)}</p>
          <p><strong>Product:</strong> ${productName}</p>
          <p>Check your commissions dashboard to see all your earnings.</p>
          <p>Keep up the great work!</p>
          <p>Best regards,<br>Field Sales Management Team</p>
        `,
      });
      console.log(`✅ Commission notification sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending commission email:', error);
    }
  }

  // Send new order confirmation
  async sendOrderNotification(email, userName, clientName, amount, productName) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `📦 New Order Confirmed: $${amount.toFixed(2)}`,
        html: `
          <h2>Order Confirmation</h2>
          <p>Hi ${userName},</p>
          <p>Your order has been successfully created:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Client Name</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Product</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${productName}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${amount.toFixed(2)}</td>
            </tr>
          </table>
          <p>View all your orders in your dashboard.</p>
          <p>Best regards,<br>Field Sales Management Team</p>
        `,
      });
      console.log(`✅ Order notification sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending order email:', error);
    }
  }

  // Send welcome email for new company
  async sendWelcomeEmail(email, companyName, adminName) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🎉 Welcome to Field Sales Management System!',
        html: `
          <h2>Welcome, ${adminName}!</h2>
          <p>Your company <strong>${companyName}</strong> has been successfully registered.</p>
          <p>You now have access to:</p>
          <ul>
            <li>📦 Product Management - Create and manage your product catalog</li>
            <li>👥 Sales Team Management - Approve and manage your sales team</li>
            <li>📊 Advanced Reporting - Track sales and commissions</li>
            <li>💰 Commission Tracking - Automated commission calculations</li>
          </ul>
          <p><strong>Quick Start:</strong></p>
          <ol>
            <li>Log in at ${process.env.FRONTEND_URL}</li>
            <li>Create your first product</li>
            <li>Share your company ID with sales team members</li>
            <li>Approve team members as they register</li>
          </ol>
          <p>Need help? Check our documentation or contact support.</p>
          <p>Best regards,<br>Field Sales Management Team</p>
        `,
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
    }
  }
}

module.exports = new EmailService();

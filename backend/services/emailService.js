import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // In production, use actual SMTP credentials from environment variables
  // For development/testing, use a test account or console logging
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development - log emails to console
  return {
    sendMail: async (mailOptions) => {
      console.log('=== EMAIL NOTIFICATION ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Text:', mailOptions.text?.substring(0, 200) + '...');
      console.log('========================');
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

// Email templates
const templates = {
  welcome: (user) => ({
    subject: 'Welcome to Move-it!',
    text: `Hi ${user.first_name},\n\nWelcome to Move-it, Texas's premier FSBO real estate platform!\n\nWith Move-it, you can:\n- List or find properties without agent commissions\n- Connect directly with buyers and sellers\n- Access our 30-day close guarantee\n- Save thousands in fees\n\nGet started now by logging into your dashboard.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Move-it!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${user.first_name},</p>
          <p>Welcome to Move-it, Texas's premier FSBO real estate platform!</p>
          <p>With Move-it, you can:</p>
          <ul>
            <li>List or find properties without agent commissions</li>
            <li>Connect directly with buyers and sellers</li>
            <li>Access our 30-day close guarantee</li>
            <li>Save thousands in fees</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/dashboard" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">Go to Dashboard</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #6B7280; font-size: 12px;">
          <p>Move-it Inc. | Texas Real Estate Platform</p>
        </div>
      </div>
    `
  }),

  offerReceived: (seller, offer, property) => ({
    subject: `New Offer Received: ${property.address_line1}`,
    text: `Hi ${seller.first_name},\n\nGreat news! You've received a new offer on your property at ${property.address_line1}.\n\nOffer Details:\n- Amount: $${offer.offer_price.toLocaleString()}\n- Earnest Money: $${offer.earnest_money.toLocaleString()}\n- Financing: ${offer.financing_type}\n- Proposed Closing: ${new Date(offer.proposed_closing_date).toLocaleDateString()}\n\nLog in to your dashboard to review and respond to this offer.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Offer Received!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${seller.first_name},</p>
          <p>Great news! You've received a new offer on your property at <strong>${property.address_line1}</strong>.</p>
          <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Offer Details</h3>
            <p><strong>Amount:</strong> $${offer.offer_price.toLocaleString()}</p>
            <p><strong>Earnest Money:</strong> $${offer.earnest_money.toLocaleString()}</p>
            <p><strong>Financing:</strong> ${offer.financing_type}</p>
            <p><strong>Proposed Closing:</strong> ${new Date(offer.proposed_closing_date).toLocaleDateString()}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/seller/dashboard" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Review Offer</a>
        </div>
      </div>
    `
  }),

  offerAccepted: (buyer, offer, property) => ({
    subject: `Congratulations! Your Offer Was Accepted`,
    text: `Hi ${buyer.first_name},\n\nCongratulations! Your offer on ${property.address_line1} has been accepted!\n\nAccepted Price: $${(offer.counter_price || offer.offer_price).toLocaleString()}\n\nNext Steps:\n1. A transaction has been created in your dashboard\n2. Submit your earnest money within 3 business days\n3. Schedule your home inspection\n4. Work with our platform to complete your closing\n\nOur 30-day close guarantee is now active.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Offer Accepted!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${buyer.first_name},</p>
          <p>Congratulations! Your offer on <strong>${property.address_line1}</strong> has been accepted!</p>
          <div style="background: white; border: 2px solid #8B5CF6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; font-weight: bold; color: #8B5CF6; margin: 0;">$${(offer.counter_price || offer.offer_price).toLocaleString()}</p>
            <p style="color: #6B7280; margin: 5px 0 0 0;">Accepted Price</p>
          </div>
          <h3>Next Steps:</h3>
          <ol>
            <li>A transaction has been created in your dashboard</li>
            <li>Submit your earnest money within 3 business days</li>
            <li>Schedule your home inspection</li>
            <li>Work with our platform to complete your closing</li>
          </ol>
          <p style="background: #FEF3C7; border-radius: 8px; padding: 15px; color: #92400E;">
            <strong>⏰ 30-Day Close Guarantee Active</strong><br>
            We'll help you close on time!
          </p>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/buyer/dashboard" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">View Transaction</a>
        </div>
      </div>
    `
  }),

  transactionUpdate: (user, transaction, update) => ({
    subject: `Transaction Update: ${transaction.property?.address_line1 || 'Your Property'}`,
    text: `Hi ${user.first_name},\n\nThere's an update on your transaction.\n\nStatus: ${update.newStatus.replace(/_/g, ' ')}\n\nLog in to your dashboard to view details.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3B82F6; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Transaction Update</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${user.first_name},</p>
          <p>There's an update on your transaction for <strong>${transaction.property?.address_line1 || 'your property'}</strong>.</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #3B82F6; margin: 0;">${update.newStatus.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/transaction/${transaction.id}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Details</a>
        </div>
      </div>
    `
  }),

  documentUploaded: (user, document, transaction) => ({
    subject: `New Document: ${document.filename}`,
    text: `Hi ${user.first_name},\n\nA new document has been uploaded to your transaction.\n\nDocument: ${document.filename}\nType: ${document.document_type}\n\n${document.requires_signature ? 'This document requires your signature.' : ''}\n\nLog in to review the document.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3B82F6; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📄 New Document</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${user.first_name},</p>
          <p>A new document has been uploaded to your transaction.</p>
          <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Document:</strong> ${document.filename}</p>
            <p><strong>Type:</strong> ${document.document_type.replace(/_/g, ' ')}</p>
            ${document.requires_signature ? '<p style="color: #DC2626;"><strong>⚠️ Signature Required</strong></p>' : ''}
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/transaction/${transaction?.id}/documents" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Document</a>
        </div>
      </div>
    `
  }),

  messageReceived: (recipient, sender, message) => ({
    subject: `New Message from ${sender.first_name} ${sender.last_name}`,
    text: `Hi ${recipient.first_name},\n\nYou have a new message from ${sender.first_name} ${sender.last_name}:\n\n"${message.message}"\n\nLog in to respond.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3B82F6; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">💬 New Message</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${recipient.first_name},</p>
          <p>You have a new message from <strong>${sender.first_name} ${sender.last_name}</strong>:</p>
          <div style="background: white; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${message.message}"</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/messages" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reply</a>
        </div>
      </div>
    `
  }),
};

// Email sending functions
export const emailService = {
  // Send raw email
  async send(to, subject, text, html) {
    try {
      const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Move-it" <noreply@move-it.com>',
        to,
        subject,
        text,
        html,
      });
      console.log('Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Send welcome email
  async sendWelcome(user) {
    const template = templates.welcome(user);
    return this.send(user.email, template.subject, template.text, template.html);
  },

  // Send offer received notification
  async sendOfferReceived(seller, offer, property) {
    const template = templates.offerReceived(seller, offer, property);
    return this.send(seller.email, template.subject, template.text, template.html);
  },

  // Send offer accepted notification
  async sendOfferAccepted(buyer, offer, property) {
    const template = templates.offerAccepted(buyer, offer, property);
    return this.send(buyer.email, template.subject, template.text, template.html);
  },

  // Send transaction update notification
  async sendTransactionUpdate(user, transaction, update) {
    const template = templates.transactionUpdate(user, transaction, update);
    return this.send(user.email, template.subject, template.text, template.html);
  },

  // Send document uploaded notification
  async sendDocumentUploaded(user, document, transaction) {
    const template = templates.documentUploaded(user, document, transaction);
    return this.send(user.email, template.subject, template.text, template.html);
  },

  // Send message notification
  async sendMessageNotification(recipient, sender, message) {
    const template = templates.messageReceived(recipient, sender, message);
    return this.send(recipient.email, template.subject, template.text, template.html);
  },
};

export default emailService;

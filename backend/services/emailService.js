import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email sender configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Move-it <noreply@move-it.com>';

/**
 * Send email using Resend
 * Falls back to console logging in development if no API key
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // Development fallback - log to console
  if (!resend) {
    console.log('=== EMAIL NOTIFICATION (Dev Mode) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Preview:', text?.substring(0, 200) + '...');
    console.log('=====================================');
    return { id: 'dev-' + Date.now(), success: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });

    console.log('Email sent via Resend:', result.id);
    return { id: result.id, success: true };
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};

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

  // Disclosure Templates
  disclosureCompleted: (buyer, property, disclosureId) => ({
    subject: `Seller's Disclosure Completed: ${property.address_line1}`,
    text: `Hi ${buyer.first_name},\n\nThe seller has completed the disclosure notice for the property at ${property.address_line1}.\n\nYou can now review the disclosure and acknowledge receipt.\n\nLog in to view the disclosure.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📋 Disclosure Ready</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${buyer.first_name},</p>
          <p>The seller has completed the disclosure notice for:</p>
          <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="font-weight: bold; margin: 0;">${property.address_line1}</p>
            <p style="color: #6B7280; margin: 5px 0 0 0;">${property.city}, ${property.state} ${property.zip_code}</p>
          </div>
          <p>Please review the disclosure carefully and sign to acknowledge receipt.</p>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/disclosure/view/${disclosureId}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Disclosure</a>
        </div>
      </div>
    `
  }),

  disclosureSigned: (buyer, property, seller, disclosureId) => ({
    subject: `Disclosure Signed: ${property.address_line1}`,
    text: `Hi ${buyer.first_name},\n\nThe seller (${seller.first_name} ${seller.last_name}) has signed the disclosure notice for ${property.address_line1}.\n\nPlease review and sign to acknowledge receipt.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✍️ Disclosure Signed</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${buyer.first_name},</p>
          <p>The seller has signed the disclosure notice for:</p>
          <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="font-weight: bold; margin: 0;">${property.address_line1}</p>
            <p style="color: #6B7280; margin: 5px 0 0 0;">Signed by: ${seller.first_name} ${seller.last_name}</p>
            <p style="color: #6B7280; margin: 5px 0 0 0;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Please review the disclosure and sign to acknowledge receipt.</p>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/disclosure/view/${disclosureId}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Review & Sign</a>
        </div>
      </div>
    `
  }),

  buyerAcknowledged: (seller, property, buyer, disclosureId) => ({
    subject: `Buyer Acknowledged Disclosure: ${property.address_line1}`,
    text: `Hi ${seller.first_name},\n\nGreat news! ${buyer.first_name} ${buyer.last_name} has acknowledged receipt of your disclosure for ${property.address_line1}.\n\nThe disclosure process is now complete.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Disclosure Complete</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${seller.first_name},</p>
          <p>Great news! The buyer has acknowledged receipt of your disclosure for:</p>
          <div style="background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="font-weight: bold; margin: 0;">${property.address_line1}</p>
            <p style="color: #6B7280; margin: 5px 0 0 0;">Acknowledged by: ${buyer.first_name} ${buyer.last_name}</p>
            <p style="color: #6B7280; margin: 5px 0 0 0;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <p>The disclosure process is now complete. Both parties have a signed copy on record.</p>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/disclosure/${disclosureId}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Document</a>
        </div>
      </div>
    `
  }),

  disclosureReminder: (seller, property, completionPercentage) => ({
    subject: `Reminder: Complete Your Disclosure - ${property.address_line1}`,
    text: `Hi ${seller.first_name},\n\nYour seller's disclosure for ${property.address_line1} is ${completionPercentage}% complete.\n\nTexas law requires sellers to provide buyers with a disclosure notice. Please complete your disclosure to proceed.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⏰ Disclosure Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${seller.first_name},</p>
          <p>Your seller's disclosure for the following property is incomplete:</p>
          <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="font-weight: bold; margin: 0;">${property.address_line1}</p>
            <div style="background: #E5E7EB; height: 8px; border-radius: 4px; margin: 15px 0;">
              <div style="background: #F59E0B; height: 8px; border-radius: 4px; width: ${completionPercentage}%;"></div>
            </div>
            <p style="color: #6B7280; margin: 0;">${completionPercentage}% complete</p>
          </div>
          <p>Texas law requires sellers to provide buyers with a disclosure notice. Please complete your disclosure to proceed with the transaction.</p>
          <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/disclosure/${property.id}" style="display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Continue Disclosure</a>
        </div>
      </div>
    `
  }),

  // Password Reset Templates
  forgotPassword: (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://move-it.com'}/reset-password?token=${resetToken}`;
    return {
      subject: 'Reset Your Move-it Password',
      text: `Hi ${user.first_name},\n\nYou requested to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest,\nThe Move-it Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p>Hi ${user.first_name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">This link expires in 1 hour.</p>
            <p style="color: #6B7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #9CA3AF; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #6B7280; font-size: 12px;">
            <p>Move-it Inc. | Texas Real Estate Platform</p>
          </div>
        </div>
      `
    };
  },

  passwordResetSuccess: (user) => ({
    subject: 'Your Move-it Password Has Been Changed',
    text: `Hi ${user.first_name},\n\nYour password has been successfully changed.\n\nIf you didn't make this change, please contact our support team immediately.\n\nBest,\nThe Move-it Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Password Changed</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Hi ${user.first_name},</p>
          <p>Your password has been successfully changed.</p>
          <p>You can now log in with your new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://move-it.com'}/login" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In</a>
          </div>
          <p style="color: #DC2626; font-size: 14px;"><strong>Didn't make this change?</strong> Please contact our support team immediately.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6B7280; font-size: 12px;">
          <p>Move-it Inc. | Texas Real Estate Platform</p>
        </div>
      </div>
    `
  }),
};

// Email sending functions
export const emailService = {
  // Send raw email
  async send(to, subject, text, html) {
    return sendEmail({ to, subject, text, html });
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

  // Disclosure notification: completed
  async sendDisclosureCompleted(buyer, property, disclosureId) {
    const template = templates.disclosureCompleted(buyer, property, disclosureId);
    return this.send(buyer.email, template.subject, template.text, template.html);
  },

  // Disclosure notification: seller signed
  async sendDisclosureSigned(buyer, property, seller, disclosureId) {
    const template = templates.disclosureSigned(buyer, property, seller, disclosureId);
    return this.send(buyer.email, template.subject, template.text, template.html);
  },

  // Disclosure notification: buyer acknowledged
  async sendBuyerAcknowledged(seller, property, buyer, disclosureId) {
    const template = templates.buyerAcknowledged(seller, property, buyer, disclosureId);
    return this.send(seller.email, template.subject, template.text, template.html);
  },

  // Disclosure notification: reminder
  async sendDisclosureReminder(seller, property, completionPercentage) {
    const template = templates.disclosureReminder(seller, property, completionPercentage);
    return this.send(seller.email, template.subject, template.text, template.html);
  },

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const template = templates.forgotPassword(user, resetToken);
    return this.send(user.email, template.subject, template.text, template.html);
  },

  // Password reset success confirmation
  async sendPasswordResetSuccess(user) {
    const template = templates.passwordResetSuccess(user);
    return this.send(user.email, template.subject, template.text, template.html);
  },
};

export default emailService;

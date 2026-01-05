import twilio from 'twilio';

// Initialize Twilio client
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * SMS Service for sending text notifications
 */
export const smsService = {
  /**
   * Check if SMS is configured
   */
  isConfigured() {
    return !!(client && FROM_NUMBER);
  },

  /**
   * Send a basic SMS
   */
  async send(to, message) {
    if (!this.isConfigured()) {
      console.log('[SMS Mock] Would send to:', to, 'Message:', message);
      return { success: true, mock: true };
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: FROM_NUMBER,
        to: to,
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error('SMS send error:', error);
      throw error;
    }
  },

  /**
   * Send disclosure shared notification
   */
  async sendDisclosureShared({ to, sellerName, propertyAddress }) {
    const message = `Move-it: ${sellerName} has shared a Seller's Disclosure with you for ${propertyAddress}. Log in to review it.`;
    return this.send(to, message);
  },

  /**
   * Send disclosure viewed notification (to seller)
   */
  async sendDisclosureViewed({ to, buyerName, propertyAddress }) {
    const message = `Move-it: ${buyerName || 'A buyer'} has viewed your Seller's Disclosure for ${propertyAddress}.`;
    return this.send(to, message);
  },

  /**
   * Send disclosure acknowledged notification (to seller)
   */
  async sendDisclosureAcknowledged({ to, buyerName, propertyAddress }) {
    const message = `Move-it: ${buyerName || 'A buyer'} has acknowledged receipt of your Seller's Disclosure for ${propertyAddress}.`;
    return this.send(to, message);
  },

  /**
   * Send disclosure signed notification (to seller)
   */
  async sendDisclosureSigned({ to, buyerName, propertyAddress }) {
    const message = `Move-it: Great news! ${buyerName || 'A buyer'} has signed your Seller's Disclosure for ${propertyAddress}. Log in to view details.`;
    return this.send(to, message);
  },

  /**
   * Send new offer notification (to seller)
   */
  async sendNewOfferNotification({ to, buyerName, propertyAddress, offerAmount }) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(offerAmount);

    const message = `Move-it: New offer received! ${buyerName || 'A buyer'} has submitted a ${formattedAmount} offer on ${propertyAddress}. Log in to review.`;
    return this.send(to, message);
  },

  /**
   * Send offer status update (to buyer)
   */
  async sendOfferStatusUpdate({ to, propertyAddress, status }) {
    const statusMessages = {
      accepted: 'Congratulations! Your offer has been accepted',
      rejected: 'Unfortunately, your offer was not accepted',
      countered: 'The seller has countered your offer',
    };

    const statusMessage = statusMessages[status] || `Your offer status has been updated to: ${status}`;
    const message = `Move-it: ${statusMessage} for ${propertyAddress}. Log in for details.`;
    return this.send(to, message);
  },

  /**
   * Send transaction milestone notification
   */
  async sendTransactionMilestone({ to, propertyAddress, milestone }) {
    const milestoneMessages = {
      contract_signed: 'Contract has been fully signed',
      earnest_money_received: 'Earnest money has been received',
      inspection_scheduled: 'Inspection has been scheduled',
      inspection_completed: 'Inspection is complete',
      appraisal_ordered: 'Appraisal has been ordered',
      appraisal_completed: 'Appraisal is complete',
      clear_to_close: 'You are clear to close!',
      closing_scheduled: 'Closing has been scheduled',
      closed: 'Congratulations! Transaction is closed',
    };

    const milestoneMessage = milestoneMessages[milestone] || milestone;
    const message = `Move-it: ${milestoneMessage} for ${propertyAddress}.`;
    return this.send(to, message);
  },

  /**
   * Send password reset code via SMS
   */
  async sendPasswordResetCode({ to, code }) {
    const message = `Move-it: Your password reset code is ${code}. This code expires in 10 minutes.`;
    return this.send(to, message);
  },

  /**
   * Send verification code
   */
  async sendVerificationCode({ to, code }) {
    const message = `Move-it: Your verification code is ${code}. This code expires in 10 minutes.`;
    return this.send(to, message);
  },

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder({ to, appointmentType, propertyAddress, dateTime }) {
    const message = `Move-it Reminder: Your ${appointmentType} for ${propertyAddress} is scheduled for ${dateTime}.`;
    return this.send(to, message);
  },
};

export default smsService;

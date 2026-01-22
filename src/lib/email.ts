import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Faqtpn <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Log configuration on startup
console.log('📧 Email config:', {
  hasApiKey: !!process.env.RESEND_API_KEY,
  fromEmail: FROM_EMAIL,
  appUrl: APP_URL,
})

// ============================================
// 1️⃣ ACCOUNT & SECURITY (MANDATORY)
// ============================================

/**
 * Email Verification - Send when user signs up
 */
export async function sendVerificationEmail(params: {
  to: string
  userName: string
  verificationToken: string
}) {
  try {
    const verificationUrl = `${APP_URL}/auth/verify?token=${params.verificationToken}`
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Verify your email address - Faqtpn',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Property Rental Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Welcome to Faqtpn</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.userName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Thank you for creating an account with Faqtpn. To complete your registration and access all features, please verify your email address by clicking the button below.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; background: #667eea; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">Verify Email Address</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                        If the button above doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="color: #667eea; font-size: 13px; word-break: break-all; margin: 8px 0 0 0;">
                        <a href="${verificationUrl}" style="color: #667eea; text-decoration: underline;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #6b6b6b; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                        <strong>Important:</strong> This verification link will expire in 24 hours.
                      </p>
                      <p style="color: #9b9b9b; font-size: 12px; line-height: 1.5; margin: 0;">
                        If you didn't create an account with Faqtpn, please disregard this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Verification email error:', error)
      return { success: false, error }
    }

    console.log('✅ Verification email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Verification email exception:', error)
    return { success: false, error }
  }
}

/**
 * Password Reset - Send when user requests password reset
 */
export async function sendPasswordResetEmail(params: {
  to: string
  userName: string
  resetToken: string
}) {
  try {
    const resetUrl = `${APP_URL}/auth/reset-password?token=${params.resetToken}`
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: 'Password Reset Request - Faqtpn',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: #dc3545; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Property Rental Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Password Reset Request</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.userName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        We received a request to reset your password. Click the button below to create a new password for your account.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: #dc3545; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                        If the button above doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="color: #dc3545; font-size: 13px; word-break: break-all; margin: 8px 0 0 0;">
                        <a href="${resetUrl}" style="color: #dc3545; text-decoration: underline;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Security Notice -->
                  <tr>
                    <td style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px;">
                      <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                        <strong>Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please disregard this email and your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #9b9b9b; font-size: 12px; line-height: 1.5; margin: 0;">
                        For security reasons, we recommend changing your password regularly and using a strong, unique password.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Password reset email error:', error)
      return { success: false, error }
    }

    console.log('✅ Password reset email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Password reset email exception:', error)
    return { success: false, error }
  }
}

// ============================================
// 2️⃣ CORE PRODUCT VALUE (MVP)
// ============================================

/**
 * New Listing Alert - When property matches saved search (opt-in only)
 */
export async function sendAlertEmail(params: {
  to: string
  userName: string
  propertyTitle: string
  propertyLocation: string
  propertyPrice: string
  propertyUrl: string
  alertName: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `New Property Alert: ${params.propertyTitle} - Faqtpn`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">New Property Alert</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">New Property Available</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.userName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Great news! A new property matching your alert "<strong>${params.alertName}</strong>" is now available.
                      </p>
                      
                      <!-- Property Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #667eea; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">${params.propertyTitle}</h3>
                            <p style="color: #6b6b6b; font-size: 15px; margin: 0 0 8px 0;">
                              <span style="display: inline-block; margin-right: 4px;">Location:</span>${params.propertyLocation}
                            </p>
                            <p style="color: #28a745; font-size: 28px; font-weight: 700; margin: 16px 0;">
                              ${params.propertyPrice}<span style="font-size: 16px; font-weight: 400; color: #6b6b6b;">/month</span>
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" style="padding: 12px 0 0 0;">
                                  <a href="${params.propertyUrl}" style="display: inline-block; background: #667eea; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">View Property Details</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Tip Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e7f3ff; border-left: 4px solid #2196f3; border-radius: 4px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="color: #1565c0; font-size: 14px; line-height: 1.6; margin: 0;">
                              <strong>Tip:</strong> Properties can be rented quickly. We recommend contacting the owner as soon as possible to secure this rental.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef; text-align: center;">
                      <p style="color: #6b6b6b; font-size: 13px; margin: 0 0 8px 0;">
                        <a href="${APP_URL}/alerts" style="color: #667eea; text-decoration: none; font-weight: 500;">Manage Alerts</a>
                        <span style="color: #9b9b9b; margin: 0 8px;">•</span>
                        <a href="${APP_URL}/profile" style="color: #667eea; text-decoration: none; font-weight: 500;">Email Preferences</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Alert email error:', error)
      return { success: false, error }
    }

    console.log('✅ Alert email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Alert email exception:', error)
    return { success: false, error }
  }
}

/**
 * Enquiry Notification - When user's enquiry receives a reply
 */
export async function sendEnquiryReplyEmail(params: {
  to: string
  userName: string
  propertyTitle: string
  propertyUrl: string
  replyMessage: string
  ownerName: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Reply to your enquiry: ${params.propertyTitle} - Faqtpn`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: #28a745; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">You have a reply</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Enquiry Reply</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.userName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        <strong>${params.ownerName}</strong> replied to your enquiry about "<strong>${params.propertyTitle}</strong>":
                      </p>
                      
                      <!-- Message Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${params.replyMessage}</p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${params.propertyUrl}" style="display: inline-block; background: #28a745; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">View Property & Reply</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                        Respond quickly to increase your chances of securing this property.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #9b9b9b; font-size: 12px; line-height: 1.5; margin: 0;">
                        Keep your communication professional and prompt for the best results.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Enquiry reply email error:', error)
      return { success: false, error }
    }

    console.log('✅ Enquiry reply email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Enquiry reply email exception:', error)
    return { success: false, error }
  }
}

// ============================================
// 3️⃣ SUPPLY-SIDE ESSENTIALS (OWNERS)
// ============================================

/**
 * Listing Confirmation - After property is successfully listed
 */
export async function sendListingConfirmationEmail(params: {
  to: string
  ownerName: string
  propertyTitle: string
  propertyId: string
}) {
  try {
    const propertyUrl = `${APP_URL}/properties/${params.propertyId}`
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Listing Submitted: ${params.propertyTitle} - Faqtpn`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Property Listing</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Listing Submitted Successfully</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.ownerName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Your property listing "<strong>${params.propertyTitle}</strong>" has been successfully submitted and is now under review.
                      </p>
                      
                      <!-- Status Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                              <strong>What's Next:</strong> Your listing is currently under review by our team. This typically takes 24-48 hours. We'll notify you once it's approved and live on the platform.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${propertyUrl}" style="display: inline-block; background: #667eea; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">View Your Listing</a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Tips Section -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">While You Wait</h3>
                            <ul style="color: #4a4a4a; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                              <li>Ensure your contact information is up to date</li>
                              <li>Prepare to respond quickly to enquiries once live</li>
                              <li>Check your dashboard for messages from our team</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #9b9b9b; font-size: 12px; line-height: 1.5; margin: 0;">
                        If you have any questions about your listing, please contact our support team.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Listing confirmation email error:', error)
      return { success: false, error }
    }

    console.log('✅ Listing confirmation email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Listing confirmation email exception:', error)
    return { success: false, error }
  }
}

/**
 * Listing Approval - When admin approves the property
 */
export async function sendListingApprovalEmail(params: {
  to: string
  ownerName: string
  propertyTitle: string
  propertyUrl: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Your listing is now live: ${params.propertyTitle} - Faqtpn`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Listing is Live</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Listing Approved</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.ownerName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Great news! Your property listing "<strong>${params.propertyTitle}</strong>" has been approved and is now visible to thousands of potential renters.
                      </p>
                      
                      <!-- Success Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="color: #155724; font-size: 14px; line-height: 1.6; margin: 0;">
                              <strong>Status:</strong> Your listing is now active and appearing in search results. You can start receiving enquiries from interested renters.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${params.propertyUrl}" style="display: inline-block; background: #28a745; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">View Live Listing</a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Tips Section -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #28a745; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Tips for Success</h3>
                            <ul style="color: #4a4a4a; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                              <li><strong>Respond quickly:</strong> Reply to enquiries within 24 hours</li>
                              <li><strong>Be detailed:</strong> Answer questions thoroughly and professionally</li>
                              <li><strong>Stay updated:</strong> Keep your listing information current</li>
                              <li><strong>Quality photos:</strong> Good images attract more interest</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef; text-align: center;">
                      <p style="color: #6b6b6b; font-size: 13px; margin: 0 0 8px 0;">
                        <a href="${APP_URL}/owner/dashboard" style="color: #28a745; text-decoration: none; font-weight: 500;">Manage Listings</a>
                        <span style="color: #9b9b9b; margin: 0 8px;">•</span>
                        <a href="${APP_URL}/owner/analytics" style="color: #28a745; text-decoration: none; font-weight: 500;">View Analytics</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Listing approval email error:', error)
      return { success: false, error }
    }

    console.log('✅ Listing approval email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Listing approval email exception:', error)
    return { success: false, error }
  }
}

/**
 * Listing Rejection - When admin rejects/suspends the property
 */
export async function sendListingRejectionEmail(params: {
  to: string
  ownerName: string
  propertyTitle: string
  reason?: string
  propertyUrl: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `Action Required: ${params.propertyTitle} - Faqtpn`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background: #dc3545; padding: 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Faqtpn</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Listing Requires Attention</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Listing Not Approved</h2>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                        Hi <strong>${params.ownerName}</strong>,
                      </p>
                      
                      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        We've reviewed your property listing "<strong>${params.propertyTitle}</strong>" and it cannot be published at this time.
                      </p>
                      
                      ${params.reason ? `
                      <!-- Reason Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="color: #721c24; font-size: 14px; line-height: 1.6; margin: 0;">
                              <strong>Reason:</strong> ${params.reason}
                            </p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <!-- Action Items -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #dc3545; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What You Can Do</h3>
                            <ul style="color: #4a4a4a; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                              <li>Review and update your listing with the required changes</li>
                              <li>Ensure all information is accurate and complete</li>
                              <li>Upload high-quality photos that meet our guidelines</li>
                              <li>Resubmit your listing for review</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${params.propertyUrl}" style="display: inline-block; background: #dc3545; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">Edit Your Listing</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #6b6b6b; font-size: 13px; line-height: 1.6; margin: 0;">
                        Need help? Contact our support team or check our listing guidelines for more information.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Company Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #ffffff;">
                      <p style="color: #9b9b9b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Faqtpn. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Listing rejection email error:', error)
      return { success: false, error }
    }

    console.log('✅ Listing rejection email sent:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Listing rejection email exception:', error)
    return { success: false, error }
  }
}
# Email Setup Guide for User Creation

## Current Status
✅ Users are created successfully and can login immediately
⚠️ Welcome emails with credentials are NOT automatically sent
📝 Admins must share credentials manually with new users

## Why No Email?
Supabase Edge Functions don't automatically send custom emails with passwords for security reasons. You need to integrate a third-party email service.

## Solution: Add Email Service (Recommended)

### Option 1: Resend (Easiest - Recommended)

**Resend** is the easiest email service to integrate with Supabase Edge Functions.

#### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for free account (100 emails/day free tier)
3. Get your API key from Dashboard

#### Step 2: Add Resend to Edge Function

Add this secret in Supabase Dashboard > Edge Functions > Secrets:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Step 3: Update Edge Function

Add Resend at the top of `create-user/index.ts`:

```typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendWelcomeEmail(email: string, name: string, password: string, role: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "GVAS System <noreply@yourdomain.com>", // Change to your verified domain
      to: [email],
      subject: "Welcome to GVAS - Your Account Credentials",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GVAS</h1>
                <p style="color: #cbd5e1; margin: 10px 0 0 0;">Guest & Visitor Attendance System</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #334155; margin: 0 0 20px 0;">
                  Hello <strong>${name}</strong>,
                </p>
                
                <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
                  Your account has been created as a <span style="background: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 4px; font-weight: 600;">${role.toUpperCase()}</span>. 
                  You can now access the GVAS system using the credentials below.
                </p>
                
                <!-- Credentials Box -->
                <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px;">Your Login Credentials</h3>
                  
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; font-weight: 600;">EMAIL</label>
                    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-family: monospace; color: #1e293b;">
                      ${email}
                    </div>
                  </div>
                  
                  <div>
                    <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 5px; font-weight: 600;">TEMPORARY PASSWORD</label>
                    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-family: monospace; color: #1e293b; font-weight: 600;">
                      ${password}
                    </div>
                  </div>
                </div>
                
                <!-- Security Notice -->
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                    <strong>🔒 Security Reminder:</strong> Please change your password after your first login. 
                    Keep your credentials secure and never share them with anyone.
                  </p>
                </div>
                
                <!-- Login Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get("SITE_URL") || "http://localhost:5173"}/login" 
                     style="display: inline-block; background: #1e293b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Login to GVAS →
                  </a>
                </div>
                
                <!-- Getting Started -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <h4 style="color: #1e293b; font-size: 14px; margin: 0 0 10px 0;">📋 Getting Started</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.8;">
                    <li>Login using your email and password</li>
                    <li>Change your password in Account Settings</li>
                    <li>Explore your dashboard and available features</li>
                    <li>Contact your administrator if you need assistance</li>
                  </ul>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  This is an automated message from GVAS System. Please do not reply to this email.
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #cbd5e1;">
                  © ${new Date().getFullYear()} GVAS. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Email sending failed: ${JSON.stringify(data)}`);
  }
  return data;
}
```

Then call it after user creation:

```typescript
// After creating user...
try {
  await sendWelcomeEmail(email, full_name, password, role);
  console.log(`✅ Welcome email sent to ${email}`);
} catch (emailError) {
  console.error("Failed to send welcome email:", emailError);
  // Don't throw - user is created
}
```

#### Step 4: Verify Domain (For Production)

For production, verify your domain in Resend:
1. Add your domain in Resend Dashboard
2. Add DNS records they provide
3. Change `from` email to use your domain: `noreply@yourdomain.com`

---

### Option 2: SendGrid

Similar process but uses SendGrid API:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

---

### Option 3: Manual Sharing (Current Solution)

For now, the system:
1. ✅ Creates user successfully
2. ✅ Returns credentials to admin
3. ⚠️ Admin must manually share credentials with user (email, chat, etc.)

**Temporary Workaround:**
- Copy password from success message
- Share with user via secure channel
- User can login immediately

---

## Quick Test

After setting up Resend:

1. Create a new user
2. Check the user's email inbox
3. They should receive a professional welcome email with credentials
4. User can login immediately

---

## Cost Comparison

| Service | Free Tier | Pricing |
|---------|-----------|---------|
| Resend | 100 emails/day | $20/month for 50k emails |
| SendGrid | 100 emails/day | $19.95/month for 40k emails |
| AWS SES | 62k emails/month (EC2) | $0.10 per 1k emails |

**Recommendation:** Start with Resend free tier (easiest integration).

---

## Need Help?

1. Check Resend docs: https://resend.com/docs
2. Test emails in Resend Dashboard
3. Check Edge Function logs in Supabase
4. Verify RESEND_API_KEY is set correctly

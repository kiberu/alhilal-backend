# Google Analytics Setup Guide
## Al-Hilal Travels Uganda

## 📊 What's Included

Your website now has Google Analytics 4 (GA4) fully integrated with:
- ✅ Page view tracking
- ✅ Event tracking
- ✅ Conversion tracking
- ✅ Custom business events

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Google Analytics Account

1. **Go to Google Analytics**: https://analytics.google.com
2. **Sign in** with your Google account
3. Click **"Start measuring"**
4. Enter account details:
   - Account Name: `Al-Hilal Travels`
   - Choose data sharing settings (recommended: all enabled)
   - Click **Next**

### Step 2: Create a Property

1. **Property name**: `Al-Hilal Website`
2. **Time zone**: `(GMT+03:00) East Africa Time - Nairobi`
3. **Currency**: `Uganda Shilling (UGX)` or `US Dollar (USD)`
4. Click **Next**

### Step 3: Business Information

1. **Industry category**: Travel
2. **Business size**: Small (1-10 employees) or appropriate size
3. **How you intend to use Google Analytics**: Select all that apply
4. Click **Create**
5. Accept Terms of Service

### Step 4: Set Up Data Stream

1. Choose platform: **Web**
2. **Website URL**: `https://alhilaltravels.com`
3. **Stream name**: `Al-Hilal Website`
4. Click **Create stream**

### Step 5: Get Your Measurement ID

You'll see your **Measurement ID** in the format: `G-XXXXXXXXXX`

**Copy this ID** - you'll need it in the next step!

### Step 6: Add to Your Website

1. In your project, create a file called `.env.local` in the `/web` folder
2. Add this line (replace with your actual ID):

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Example:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC1234567
```

3. Save the file
4. Restart your development server:

```bash
npm run dev
```

### Step 7: Verify It's Working

1. Open your website in a browser
2. Go to Google Analytics
3. Click **Reports** → **Realtime**
4. You should see yourself as an active user!

## 📈 What Gets Tracked Automatically

### Page Views
Every page visit is automatically tracked:
- Homepage visits
- Service page views
- Trip calendar views
- Contact page visits
- All other pages

### Important Metrics
- Number of visitors
- Pages per session
- Average session duration
- Bounce rate
- Traffic sources (Google, Social Media, Direct)

## 🎯 Custom Events You Can Track

We've set up special tracking for key business actions:

### 1. Package Views
Track when users view specific packages:

```typescript
import { trackPackageView } from '@/lib/gtag'

// In your component:
trackPackageView('Ramadan Umrah 2026')
```

### 2. Contact Form Submissions
Track when users submit forms:

```typescript
import { trackContactFormSubmit } from '@/lib/gtag'

// After form submission:
trackContactFormSubmit('contact_form')
```

### 3. Phone Number Clicks
Track when users click to call:

```typescript
import { trackPhoneClick } from '@/lib/gtag'

// On phone link click:
<a href="tel:+256700773535" onClick={trackPhoneClick}>
  Call Us
</a>
```

### 4. WhatsApp Clicks
Track when users click WhatsApp:

```typescript
import { trackWhatsAppClick } from '@/lib/gtag'

// On WhatsApp link click:
<a href="https://wa.me/256700773535" onClick={trackWhatsAppClick}>
  WhatsApp
</a>
```

### 5. Booking Starts
Track when users start booking process:

```typescript
import { trackBookingStart } from '@/lib/gtag'

// When booking begins:
trackBookingStart('Umrah Package')
```

## 📊 Key Reports to Check

### Daily Checks (5 minutes)
1. **Realtime Report**: See current visitors
2. **Today's traffic**: Quick overview

### Weekly Checks (15 minutes)
1. **Acquisition Overview**: Where visitors come from
2. **Pages and Screens**: Most viewed pages
3. **Events**: Top actions users take

### Monthly Analysis (30 minutes)
1. **User Acquisition**: Traffic sources breakdown
2. **Engagement**: How users interact
3. **Conversions**: Goal completions
4. **Demographics**: User locations (should see Uganda heavily)

## 🎯 Setting Up Conversions (Goals)

Conversions help you track business objectives:

### Step 1: Mark Events as Conversions
1. Go to **Configure** → **Events**
2. Find these events:
   - `submit_form`
   - `click_phone`
   - `click_whatsapp`
   - `start_booking`
3. Toggle **"Mark as conversion"** for each

### Step 2: Monitor Conversion Rate
Track how many visitors:
- View packages
- Contact you
- Click phone/WhatsApp
- Start booking

## 📱 Track Marketing Campaigns

### URL Parameters for Campaign Tracking
When sharing links on social media or ads, add these parameters:

**Facebook Post**:
```
https://alhilaltravels.com/?utm_source=facebook&utm_medium=social&utm_campaign=ramadan2026
```

**Instagram Story**:
```
https://alhilaltravels.com/trip-calendar?utm_source=instagram&utm_medium=story&utm_campaign=special_offer
```

**WhatsApp Status**:
```
https://alhilaltravels.com/?utm_source=whatsapp&utm_medium=status&utm_campaign=weekly_update
```

**Email Newsletter**:
```
https://alhilaltravels.com/?utm_source=email&utm_medium=newsletter&utm_campaign=december2025
```

### Campaign URL Builder
Use this tool to create tracking URLs:
https://ga-dev-tools.google/campaign-url-builder/

## 🔒 Privacy & GDPR Compliance

Google Analytics is configured to:
- Anonymize IP addresses
- Not collect personally identifiable information
- Comply with data protection regulations

If needed, you can add a cookie consent banner in the future.

## 🐛 Troubleshooting

### Not Seeing Data?
1. **Check .env.local file exists** with correct Measurement ID
2. **Restart development server** after adding .env.local
3. **Check browser console** for errors
4. **Wait 24-48 hours** for full data processing
5. **Check Realtime report** for immediate verification

### Measurement ID Format
- ✅ Correct: `G-ABC1234567`
- ❌ Wrong: `UA-123456-1` (old Universal Analytics)
- ❌ Wrong: `GTM-XXXXX` (Google Tag Manager)

### Environment Variables
Make sure you use `NEXT_PUBLIC_` prefix:
- ✅ `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- ❌ `GA_MEASUREMENT_ID` (won't work in browser)

## 📈 Expected Results

### Week 1-2
- Basic traffic data
- Page view tracking
- User behavior patterns

### Month 1
- Clear traffic sources
- Peak visiting hours
- Most popular pages
- User demographics

### Month 3+
- Conversion patterns
- Marketing ROI
- Seasonal trends
- User journey insights

## 🎓 Learn More

### Google Analytics Resources
- **GA4 Documentation**: https://support.google.com/analytics
- **Google Analytics Academy**: https://analytics.google.com/analytics/academy/
- **GA4 Setup Guide**: https://support.google.com/analytics/answer/9304153

### YouTube Tutorials
- "Google Analytics 4 Tutorial for Beginners"
- "GA4 Setup in 10 Minutes"
- "Understanding GA4 Reports"

## 📊 Recommended Dashboard Setup

Create a custom dashboard with these metrics:

### Key Performance Indicators (KPIs)
1. **Total Users** (This Month)
2. **New Users** (This Month)
3. **Sessions** (This Month)
4. **Conversions** (Form Submissions, Calls)
5. **Top Pages** (Most Viewed)
6. **Traffic Sources** (Google, Social, Direct)

### How to Create Dashboard
1. Go to **Explore** in GA4
2. Create **Blank exploration**
3. Add dimensions and metrics
4. Save and name it "Monthly Overview"

## 🔔 Set Up Alerts

Get notified of important events:

1. Go to **Configure** → **Custom Insights**
2. Set up alerts for:
   - Sudden traffic increase (viral post?)
   - Sudden traffic decrease (site issue?)
   - High conversion days
   - Zero traffic (technical issue?)

## 📱 Mobile App (Optional)

Download the Google Analytics mobile app:
- **iOS**: App Store
- **Android**: Google Play

Check stats on the go!

## 💡 Pro Tips

### 1. Check Daily
Quick 2-minute check:
- Open GA4 mobile app
- View today's traffic
- Check realtime users

### 2. Weekly Review
15-minute session:
- Compare to last week
- Identify top pages
- Check traffic sources
- Note any anomalies

### 3. Monthly Deep Dive
30-minute analysis:
- Month-over-month growth
- Campaign performance
- User behavior changes
- Adjust marketing strategy

### 4. Use Annotations
Mark important dates:
- New package launches
- Marketing campaigns
- Social media posts
- Seasonal events (Ramadan, Hajj season)

## ❓ Common Questions

### Q: How long until I see data?
**A**: Realtime data appears immediately. Full reports may take 24-48 hours.

### Q: Can I track phone calls?
**A**: Yes! We've added phone click tracking. You'll see it in Events.

### Q: What about WhatsApp clicks?
**A**: Also tracked! Check Events → `click_whatsapp`

### Q: How do I know which marketing works?
**A**: Use UTM parameters in your social media links. Check Acquisition reports.

### Q: Is it free?
**A**: Yes! Google Analytics is completely free for standard use.

### Q: What about GDPR/privacy?
**A**: GA4 is designed with privacy in mind. No personal data is collected without consent.

## 🎯 Next Steps After Setup

1. ✅ Add Measurement ID to .env.local
2. ✅ Verify tracking in Realtime report
3. ✅ Set up conversion events
4. ✅ Create custom dashboard
5. ✅ Install mobile app
6. ✅ Set up weekly review reminder
7. ✅ Share access with team members (if needed)

## 👥 Sharing Access

To add team members:
1. Go to **Admin** (bottom left)
2. Click **Property Access Management**
3. Click the **+** icon
4. Add email address
5. Choose role:
   - **Viewer**: Can only view reports
   - **Analyst**: Can create reports
   - **Editor**: Can change settings
   - **Administrator**: Full access

---

## 📞 Need Help?

If you have questions about Google Analytics setup:
- Check Google Analytics Help Center
- Watch YouTube tutorials
- Ask in Google Analytics community forums

**Last Updated**: November 7, 2025
**Status**: Ready to use after adding Measurement ID


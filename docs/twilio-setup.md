# Twilio Setup Guide

This guide walks you through setting up Twilio for the AI Restaurant Phone Operator.

## 📞 Prerequisites

1. [Twilio Account](https://www.twilio.com/try-twilio) (free trial available)
2. n8n instance running with public webhook URL
3. Payment method for Twilio (required for phone numbers)

---

## Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up with email and verify your phone number
3. Complete the onboarding wizard

---

## Step 2: Purchase a Phone Number

1. Go to **Console** → **Phone Numbers** → **Buy a Number**
2. Select your country
3. Check **Voice** capability (required)
4. Optional: Check **SMS** for order confirmations
5. Click **Buy** (typically $1-2/month)

**Note your phone number:** `+1XXXXXXXXXX`

---

## Step 3: Configure Voice Webhook

1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click on your purchased number
3. Scroll to **Voice Configuration**
4. Set the following:

| Setting | Value |
|---------|-------|
| **Configure With** | Webhook |
| **A Call Comes In** | Webhook |
| **URL** | `https://your-n8n-url.com/webhook/incoming-call` |
| **HTTP Method** | POST |

5. Click **Save Configuration**

---

## Step 4: Enable Call Recording (Optional)

For call recordings, add this to your TwiML:

```xml
<Response>
    <Record transcribe="true" transcribeCallback="https://your-n8n-url.com/webhook/transcription" />
</Response>
```

Or enable it via API in your n8n workflow.

---

## Step 5: Get API Credentials

1. Go to **Console** → **Account** → **API Keys & Tokens**
2. Note your:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Or create a new API Key:
1. Click **Create API Key**
2. Name it `restaurant-ai`
3. Save the **SID** and **Secret**

---

## Step 6: Configure n8n Credentials

In n8n:

1. Go to **Credentials** → **New Credential**
2. Select **Twilio API**
3. Enter:
   - **Account SID**: Your Account SID
   - **Auth Token**: Your Auth Token
4. Click **Save**

---

## Step 7: Set Environment Variables

Add to your n8n environment:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
STAFF_PHONE_NUMBER=+1XXXXXXXXXX
```

---

## 🎤 Voice Configuration

### Amazon Polly Voices (Recommended)

The workflows use Amazon Polly voices via Twilio. Available options:

| Voice | Language | Style |
|-------|----------|-------|
| `Polly.Joanna` | English (US) | Natural, friendly |
| `Polly.Matthew` | English (US) | Natural, professional |
| `Polly.Amy` | English (UK) | British accent |
| `Polly.Brian` | English (UK) | British male |
| `Polly.Ivy` | English (US) | Young, energetic |

To change the voice, update the `<Say voice="...">` tags in the workflows.

### Custom Voice with ElevenLabs (Advanced)

For premium custom voices:

1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Create or clone a voice
3. Use the ElevenLabs API to generate audio
4. Host the audio and use `<Play>` instead of `<Say>`

---

## 🔧 TwiML Reference

### Basic Greeting

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">
        Thank you for calling Joe's Pizza. How can I help you today?
    </Say>
    <Gather input="speech" timeout="5" speechTimeout="auto" 
           action="https://your-n8n-url.com/webhook/ai-conversation" method="POST">
    </Gather>
</Response>
```

### Forward to Staff

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="30" callerId="+1XXXXXXXXXX">
        <Number>+1YYYYYYYYYY</Number>
    </Dial>
    <Say voice="Polly.Joanna">
        We're sorry, no one is available. Please try again later.
    </Say>
</Response>
```

### Gather Speech Input

```xml
<Gather input="speech" timeout="5" speechTimeout="auto" 
        language="en-US" hints="pizza, burger, salad, order, pickup"
        action="https://webhook-url" method="POST">
    <Say voice="Polly.Joanna">What would you like to order?</Say>
</Gather>
```

---

## 📊 Twilio Pricing

| Service | Cost |
|---------|------|
| Phone Number | ~$1-2/month |
| Incoming Calls | $0.0085/min |
| Outgoing Calls | $0.014/min |
| SMS Outbound | $0.0079/message |
| Speech Recognition | $0.02/15 seconds |

**Typical cost per AI call:** $0.02-0.05

---

## 🧪 Testing

### Test with Twilio Dev Phone

1. Install the [Twilio Dev Phone](https://www.twilio.com/docs/labs/dev-phone) app
2. Register with your Twilio account
3. Call your Twilio number from the app
4. Debug using Twilio Console logs

### Test Webhooks Locally

Use [ngrok](https://ngrok.com) to expose your local n8n:

```bash
ngrok http 5678
```

Update your Twilio webhook to use the ngrok URL.

### Monitor Calls

1. Go to **Monitor** → **Logs** → **Calls**
2. View call details, recordings, and errors
3. Check webhook request/response logs

---

## 🚨 Troubleshooting

### "Webhook not responding"

- Verify n8n is running and accessible
- Check the webhook URL is correct (no trailing slash)
- Ensure HTTPS is enabled

### "No speech detected"

- Increase `timeout` in `<Gather>` (try 10 seconds)
- Add `speechTimeout="auto"` for flexible timing
- Check the caller isn't on mute

### "Call drops immediately"

- Verify TwiML is valid XML
- Check n8n logs for errors
- Ensure response is returned within 15 seconds

### "Voice sounds robotic"

- Use Polly voices: `voice="Polly.Joanna"`
- Avoid default Twilio voices
- Consider ElevenLabs for premium quality

---

## 🔐 Security Best Practices

1. **Validate Twilio Signatures**
   - Enable signature validation in n8n
   - Prevents unauthorized webhook calls

2. **Use Environment Variables**
   - Never hardcode credentials
   - Rotate Auth Tokens periodically

3. **Restrict Webhook Access**
   - Use Twilio's IP allowlist
   - Implement rate limiting

4. **Secure Recordings**
   - Enable recording encryption
   - Set auto-deletion policies

---

## 📚 Resources

- [Twilio Voice Documentation](https://www.twilio.com/docs/voice)
- [TwiML Reference](https://www.twilio.com/docs/voice/twiml)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [n8n Twilio Node](https://docs.n8n.io/integrations/nodes/n8n-nodes-base.twilio/)

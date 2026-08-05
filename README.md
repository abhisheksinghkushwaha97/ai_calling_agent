# AI Restaurant Phone Operator

**Inbound-Only, Revenue-Safe AI Phone System for Restaurants**

An intelligent n8n-powered phone operator that handles inbound customer calls during busy hours — taking orders, answering questions, and seamlessly routing complex requests to human staff.

---

##  Key Features

### Instant Toggle Control
- **AI ON** → Agent answers calls, takes orders, confirms details, logs everything
- **AI OFF** → Calls route directly to restaurant staff with zero interference

###  Smart Call Handling
- Natural, branded voice responses
- Intent detection (orders, menu questions, hours, reservations)
- Structured order taking with confirmation
- SMS/POS integration for order submission

###  Built-in Safety Controls
- Order confirmation before submission
- Human handoff on uncertainty, edge cases, or frustration
- Manual override at any time
- Context passing during transfers

### Complete Data Logging
- Full call recordings
- Real-time transcripts
- Order details with modifiers
- Call outcomes and duration
- Peak-hour tagging

---

##  System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCOMING CALL                                 │
│                         ↓                                        │
│              ┌─────────────────────┐                            │
│              │  Twilio Voice API   │                            │
│              └──────────┬──────────┘                            │
│                         ↓                                        │
│              ┌─────────────────────┐                            │
│              │  n8n Webhook        │                            │
│              │  (Call Handler)     │                            │
│              └──────────┬──────────┘                            │
│                         ↓                                        │
│              ┌─────────────────────┐                            │
│              │  Check AI Toggle    │                            │
│              │  (Airtable Flag)    │                            │
│              └──────────┬──────────┘                            │
│                    ┌────┴────┐                                  │
│                    ↓         ↓                                  │
│           ┌────────────┐ ┌────────────┐                        │
│           │  AI OFF    │ │  AI ON     │                        │
│           │  Forward   │ │  Process   │                        │
│           │  to Staff  │ │  with AI   │                        │
│           └────────────┘ └─────┬──────┘                        │
│                                ↓                                │
│              ┌─────────────────────────────────┐               │
│              │      AI Conversation Flow       │               │
│              │  ┌───────────────────────────┐  │               │
│              │  │ 1. Greeting & Intent      │  │               │
│              │  │ 2. Order Taking           │  │               │
│              │  │ 3. Confirmation           │  │               │
│              │  │ 4. Order Submission       │  │               │
│              │  └───────────────────────────┘  │               │
│              └───────────────┬─────────────────┘               │
│                              ↓                                  │
│              ┌─────────────────────────────────┐               │
│              │        Data Logging             │               │
│              │  (Airtable + Analytics)         │               │
│              └─────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
ai_calling_agent/
├── workflows/
│   ├── 01_main_call_handler.json       # Primary inbound call workflow
│   ├── 02_ai_conversation.json         # AI conversation & order flow
│   ├── 03_human_handoff.json           # Transfer to human with context
│   ├── 04_call_logging.json            # Data logging to Airtable
│   └── 05_analytics_report.json        # Daily/weekly analytics
├── dashboard/
│   ├── index.html                      # Analytics dashboard UI
│   ├── styles.css                      # Dashboard styling
│   └── app.js                          # Dashboard logic
├── docs/
│   ├── airtable-schema.md              # Airtable base configuration
│   ├── twilio-setup.md                 # Twilio phone configuration
│   ├── openai-prompts.md               # AI prompt templates
│   └── integration-guide.md            # Third-party integrations
├── config/
│   ├── .env.example                    # Environment variables template
│   └── menu-config.json                # Restaurant menu configuration
└── README.md
```

---

## Quick Start

### Prerequisites

- [n8n](https://n8n.io/) (self-hosted or cloud)
- [Twilio](https://www.twilio.com/) account with phone number
- [OpenAI](https://openai.com/) API key
- [Airtable](https://airtable.com/) account
- [ElevenLabs](https://elevenlabs.io/) API key (optional, for premium voice)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-restaurant-phone-operator.git
   cd ai-restaurant-phone-operator
   ```

2. **Set up Airtable**
   - Create a new base using the schema in `docs/airtable-schema.md`
   - Get your API key and base ID

3. **Configure Twilio**
   - Purchase a phone number
   - Set up the webhook URL (see `docs/twilio-setup.md`)

4. **Import n8n Workflows**
   - Open n8n
   - Import each workflow from the `workflows/` folder
   - Configure credentials for each service

5. **Set Environment Variables**
   ```bash
   cp config/.env.example config/.env
   # Edit .env with your API keys
   ```

6. **Activate Workflows**
   - Enable all workflows in n8n
   - Test with a phone call

---

## Analytics Dashboard

Access real-time insights at your dashboard URL:

| Metric | Description |
|--------|-------------|
| Total Calls | All calls handled by AI vs staff |
| AI Orders | Orders successfully taken by AI |
| Revenue Recovered | Estimated revenue from calls that would have been missed |
| Avg Call Duration | Average length of AI-handled calls |
| Peak Hours | Busiest calling times |
| Handoff Rate | Percentage of calls transferred to humans |
| Top Questions | Most common customer inquiries |

---

## Integrations

The system integrates with:

| Category | Platforms |
|----------|-----------|
| **POS Systems** | Toast, Square, Clover, Lightspeed |
| **Online Ordering** | ChowNow, Grubhub, DoorDash |
| **Delivery** | DoorDash Drive, Uber Direct |
| **CRM** | HubSpot, Salesforce, Airtable |
| **Communication** | Twilio SMS, SendGrid, Slack |

---

##  Pricing Estimates

| Component | Approximate Cost |
|-----------|-----------------|
| Twilio Voice | ~$0.02/min |
| OpenAI GPT-4 | ~$0.01-0.03/call |
| ElevenLabs | ~$0.01/call |
| n8n Cloud | $20-50/month |
| Airtable | Free-$20/month |

**Average cost per AI-handled call: $0.05-0.15*

---

**Built with ❤️ for restaurants that want to capture every order**

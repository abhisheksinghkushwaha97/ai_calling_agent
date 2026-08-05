# Integration Guide

Connect the AI Restaurant Phone Operator to your existing systems.

---

## 🔌 Available Integrations

| Category | Platforms | Status |
|----------|-----------|--------|
| **POS Systems** | Toast, Square, Clover, Lightspeed | Ready |
| **Online Ordering** | ChowNow, Grubhub, DoorDash | Ready |
| **Delivery** | DoorDash Drive, Uber Direct | Ready |
| **CRM** | HubSpot, Salesforce | Ready |
| **Communication** | Slack, Email, SMS | Built-in |
| **Payments** | Stripe, Square | Ready |

---

## 🍞 Toast POS Integration

### Setup

1. Get Toast API credentials from Toast Developer Portal
2. Add credentials to n8n

### Workflow Addition

Add this node after order completion:

```json
{
  "name": "Send to Toast",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.toasttab.com/orders/v2/orders",
    "authentication": "genericCredentialType",
    "headers": {
      "Toast-Restaurant-External-ID": "{{ $env.TOAST_RESTAURANT_ID }}"
    },
    "body": {
      "source": "Phone - AI",
      "entityType": "Order",
      "checks": [{
        "selections": "={{ $json.orderItems }}",
        "customer": {
          "phone": "={{ $json.callerPhone }}"
        }
      }]
    }
  }
}
```

---

## 🟩 Square POS Integration

### Setup

1. Create Square Developer account
2. Get OAuth credentials
3. Add to n8n as Square credentials

### Workflow Addition

```json
{
  "name": "Create Square Order",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://connect.squareup.com/v2/orders",
    "authentication": "oAuth2Api",
    "body": {
      "order": {
        "location_id": "{{ $env.SQUARE_LOCATION_ID }}",
        "line_items": "={{ $json.orderItems.map(item => ({ name: item.item, quantity: item.quantity.toString(), base_price_money: { amount: item.price * 100, currency: 'USD' }})) }}",
        "fulfillments": [{
          "type": "PICKUP",
          "state": "PROPOSED",
          "pickup_details": {
            "recipient": {
              "phone_number": "{{ $json.callerPhone }}"
            },
            "pickup_at": "={{ $now.plus({minutes: 25}).toISO() }}"
          }
        }]
      },
      "idempotency_key": "={{ $json.orderNumber }}"
    }
  }
}
```

---

## 🚗 DoorDash Drive Integration

For delivery orders placed via phone:

### Setup

1. Sign up for DoorDash Drive
2. Get API credentials
3. Add webhook for delivery updates

### Workflow Addition

```json
{
  "name": "Create DoorDash Delivery",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://openapi.doordash.com/drive/v2/deliveries",
    "headers": {
      "Authorization": "Bearer {{ $env.DOORDASH_JWT }}"
    },
    "body": {
      "external_delivery_id": "{{ $json.orderNumber }}",
      "pickup_address": "{{ $env.RESTAURANT_ADDRESS }}",
      "pickup_business_name": "{{ $env.RESTAURANT_NAME }}",
      "pickup_phone_number": "{{ $env.RESTAURANT_PHONE }}",
      "dropoff_address": "{{ $json.deliveryAddress }}",
      "dropoff_phone_number": "{{ $json.callerPhone }}",
      "order_value": "={{ $json.orderTotal * 100 }}"
    }
  }
}
```

---

## 📧 Slack Notifications

Get real-time alerts in Slack:

### Setup

1. Create Slack App at api.slack.com
2. Add incoming webhook
3. Add to n8n as Slack credentials

### New Order Alert

```json
{
  "name": "Slack Order Alert",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "channel": "#orders",
    "text": "",
    "attachments": [{
      "color": "#36a64f",
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "🆕 New Phone Order"
          }
        },
        {
          "type": "section",
          "fields": [
            { "type": "mrkdwn", "text": "*Order #*\n{{ $json.orderNumber }}" },
            { "type": "mrkdwn", "text": "*Total*\n${{ $json.orderTotal }}" },
            { "type": "mrkdwn", "text": "*Items*\n{{ $json.formattedItems }}" },
            { "type": "mrkdwn", "text": "*Phone*\n{{ $json.callerPhone }}" }
          ]
        }
      ]
    }]
  }
}
```

### Human Handoff Alert

```json
{
  "name": "Slack Handoff Alert",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "channel": "#urgent",
    "text": "🚨 *Call Transfer Required*\n\nCustomer: {{ $json.callerPhone }}\nReason: {{ $json.handoffReason }}\n\nOrder so far: {{ $json.currentOrder }}"
  }
}
```

---

## 🎯 HubSpot CRM Integration

Track callers and build customer relationships:

### Setup

1. Get HubSpot API key
2. Add as n8n credential

### Create/Update Contact

```json
{
  "name": "HubSpot Contact",
  "type": "n8n-nodes-base.hubspot",
  "parameters": {
    "resource": "contact",
    "operation": "upsert",
    "email": "",
    "additionalFields": {
      "phone": "={{ $json.callerPhone }}",
      "lifecycleStage": "customer",
      "customProperties": {
        "last_phone_order": "={{ $json.orderTime }}",
        "total_phone_orders": "={{ $json.orderCount }}",
        "ai_preference": "phone"
      }
    }
  }
}
```

### Log Activity

```json
{
  "name": "HubSpot Activity",
  "type": "n8n-nodes-base.hubspot",
  "parameters": {
    "resource": "engagement",
    "operation": "create",
    "type": "CALL",
    "metadata": {
      "body": "AI Phone Order: {{ $json.orderSummary }}",
      "status": "COMPLETED",
      "durationMilliseconds": "={{ $json.callDuration * 1000 }}"
    }
  }
}
```

---

## 💳 Stripe Payment Integration

Collect payment during the call:

### Pre-Authorization Flow

1. Capture card on file via web link SMS
2. Charge when order is confirmed

### Workflow Addition

```json
{
  "name": "Stripe Payment Intent",
  "type": "n8n-nodes-base.stripe",
  "parameters": {
    "resource": "paymentIntent",
    "operation": "create",
    "amount": "={{ Math.round($json.orderTotal * 100) }}",
    "currency": "usd",
    "additionalFields": {
      "description": "Phone Order {{ $json.orderNumber }}",
      "metadata": {
        "order_number": "{{ $json.orderNumber }}",
        "phone": "{{ $json.callerPhone }}"
      }
    }
  }
}
```

### Send Payment Link via SMS

```json
{
  "name": "SMS Payment Link",
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "from": "{{ $env.TWILIO_PHONE_NUMBER }}",
    "to": "{{ $json.callerPhone }}",
    "message": "Complete your order payment: {{ $json.paymentLink }}\n\nOrder: {{ $json.orderSummary }}\nTotal: ${{ $json.orderTotal }}"
  }
}
```

---

## 📊 Google Sheets Logging

Simple backup logging to Google Sheets:

### Setup

1. Create Google Sheet with columns matching Call_Logs
2. Share with n8n service account
3. Add Google Sheets credentials

### Workflow Addition

```json
{
  "name": "Log to Google Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "operation": "append",
    "sheetId": "{{ $env.GOOGLE_SHEET_ID }}",
    "range": "Calls!A:Z",
    "options": {
      "valueInputMode": "USER_ENTERED"
    },
    "dataToSend": {
      "values": [
        "={{ $json.callSid }}",
        "={{ $json.callerPhone }}",
        "={{ $json.callStart }}",
        "={{ $json.callDuration }}",
        "={{ $json.handledBy }}",
        "={{ $json.orderTotal }}",
        "={{ $json.outcome }}"
      ]
    }
  }
}
```

---

## 🔔 Email Notifications

### Order Confirmation Email

```json
{
  "name": "Order Email",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "fromEmail": "orders@restaurant.com",
    "toEmail": "{{ $json.customerEmail }}",
    "subject": "Order Confirmation #{{ $json.orderNumber }}",
    "html": "<h1>Thank you for your order!</h1><p>{{ $json.orderSummary }}</p><p>Ready in approximately 25 minutes.</p>"
  }
}
```

---

## 🔗 Webhook Endpoints

Expose these endpoints for external systems:

### Toggle AI On/Off

```
POST /webhook/toggle-ai
Body: { "status": "ON" | "OFF" }
```

### Get Current Status

```
GET /webhook/status
Response: { "ai_enabled": true, "active_calls": 2 }
```

### Manual Order Entry

```
POST /webhook/manual-order
Body: { "phone": "+1234567890", "items": [...], "total": 45.99 }
```

---

## 🛠️ Custom Integration Template

For any system with an API:

```json
{
  "name": "Custom Integration",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.your-system.com/endpoint",
    "authentication": "genericCredentialType",
    "headers": {
      "Authorization": "Bearer {{ $env.CUSTOM_API_KEY }}",
      "Content-Type": "application/json"
    },
    "body": {
      "order_id": "={{ $json.orderNumber }}",
      "customer_phone": "={{ $json.callerPhone }}",
      "items": "={{ $json.orderItems }}",
      "total": "={{ $json.orderTotal }}",
      "source": "ai_phone",
      "timestamp": "={{ $now.toISO() }}"
    }
  }
}
```

---

## 📚 Resources

- [n8n Integrations Library](https://n8n.io/integrations/)
- [Toast API Docs](https://doc.toasttab.com/)
- [Square API Docs](https://developer.squareup.com/docs)
- [DoorDash Drive Docs](https://developer.doordash.com/docs/drive)
- [Stripe API Docs](https://stripe.com/docs/api)

# Airtable Schema Documentation

This document describes the complete Airtable base structure required for the AI Restaurant Phone Operator system.

## 📊 Base Overview

Create a new Airtable base with the following tables:

---

## Table 1: `Settings`

Configuration settings for the restaurant and system.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Name` | Single Line Text | Setting identifier | `AI_TOGGLE` |
| `Value` | Single Line Text | Setting value | `ON` |
| `Description` | Long Text | What this setting controls | `Controls whether AI answers calls` |
| `Updated_At` | Date/Time | Last update timestamp | `2026-01-19 10:30` |

### Required Settings Records

| Name | Value | Description |
|------|-------|-------------|
| `AI_TOGGLE` | `ON` or `OFF` | Master switch for AI call handling |
| `RESTAURANT_NAME` | `Joe's Pizza` | Restaurant name for greetings |
| `HOURS` | `11am-10pm Mon-Sun` | Operating hours |
| `STAFF_PHONE_NUMBER` | `+15551234567` | Phone to forward calls/alerts |
| `TWILIO_PHONE_NUMBER` | `+15559876543` | Your Twilio number |
| `OWNER_EMAIL` | `owner@restaurant.com` | Email for reports |
| `DEFAULT_PICKUP_TIME` | `25` | Default pickup time in minutes |
| `ORDER_VALUE_THRESHOLD` | `100` | Max order value before human review |

---

## Table 2: `Menu`

Restaurant menu items that the AI can recognize and order.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Name` | Single Line Text | Item name | `Margherita Pizza` |
| `Price` | Currency | Item price | `$14.99` |
| `Description` | Long Text | Item description | `Classic tomato and mozzarella` |
| `Category` | Single Select | Food category | `Pizza`, `Pasta`, `Drinks`, `Dessert` |
| `Available` | Checkbox | Currently available | ✓ |
| `Modifiers` | Long Text | Available modifications (JSON) | `["extra cheese", "gluten-free"]` |
| `Prep_Time` | Number | Prep time in minutes | `15` |
| `Popular` | Checkbox | Highlight as popular item | ✓ |

### Sample Menu Records

```
Name: Margherita Pizza
Price: $14.99
Description: Classic tomato sauce, fresh mozzarella, basil
Category: Pizza
Available: ✓
Modifiers: ["extra cheese", "light sauce", "well done"]
Prep_Time: 15
Popular: ✓

Name: Pepperoni Pizza
Price: $16.99
Description: Tomato sauce, mozzarella, pepperoni
Category: Pizza
Available: ✓
Modifiers: ["extra cheese", "extra pepperoni", "light sauce"]
Prep_Time: 15
Popular: ✓

Name: Caesar Salad
Price: $10.99
Description: Romaine, parmesan, croutons, caesar dressing
Category: Salads
Available: ✓
Modifiers: ["no croutons", "dressing on side", "add chicken +$4"]
Prep_Time: 5
Popular: ✗
```

---

## Table 3: `Call_Logs`

Complete log of all incoming calls.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Call_SID` | Single Line Text | Twilio Call SID (Primary Key) | `CA123abc...` |
| `Caller_Phone` | Phone Number | Customer phone number | `+15551234567` |
| `Caller_City` | Single Line Text | Caller's city (from Twilio) | `New York` |
| `Call_Start` | Date/Time | Call start timestamp | `2026-01-19 12:30` |
| `Call_End` | Date/Time | Call end timestamp | `2026-01-19 12:35` |
| `Duration_Seconds` | Number | Call length in seconds | `312` |
| `Duration_Minutes` | Number | Call length in minutes | `5` |
| `Handled_By` | Single Select | Who handled the call | `AI`, `Staff` |
| `Status` | Single Select | Call outcome | `Completed`, `Transferred`, `Missed`, `In Progress` |
| `Transcript` | Long Text | Full conversation transcript (JSON) | `[{"role":"user",...}]` |
| `Final_Order` | Long Text | Final order details (JSON) | `[{"item":"Pizza",...}]` |
| `Order_Placed` | Checkbox | Was an order placed? | ✓ |
| `Order_Number` | Single Line Text | Link to order | `ORD-123456` |
| `Order_Value` | Currency | Order total | `$45.99` |
| `Handoff_Reason` | Single Line Text | Why transferred to human | `Customer requested` |
| `Handoff_Time` | Date/Time | When transferred | `2026-01-19 12:33` |
| `Recording_URL` | URL | Twilio recording URL | `https://api.twilio.com/...` |
| `Estimated_Cost` | Currency | API cost estimate | `$0.08` |
| `Is_Peak_Hour` | Checkbox | During peak hours? | ✓ |
| `Hour_Of_Day` | Number | Hour (0-23) | `12` |
| `Day_Of_Week` | Single Line Text | Day name | `Monday` |

---

## Table 4: `Orders`

Orders placed through the AI system.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Order_Number` | Single Line Text | Unique order ID | `ORD-123456` |
| `Call_SID` | Single Line Text | Link to call record | `CA123abc...` |
| `Caller_Phone` | Phone Number | Customer phone | `+15551234567` |
| `Items` | Long Text | Formatted item list | `1x Margherita Pizza, 2x Garlic Bread` |
| `Item_Count` | Number | Number of items | `3` |
| `Estimated_Total` | Currency | Order total | `$45.99` |
| `Raw_Order_Data` | Long Text | Full order JSON | `[{"quantity":1,...}]` |
| `Order_Time` | Date/Time | When order was placed | `2026-01-19 12:35` |
| `Status` | Single Select | Order status | `Pending`, `Confirmed`, `Preparing`, `Ready`, `Completed`, `Cancelled` |
| `Source` | Single Select | Order source | `AI Phone`, `Manual`, `Website` |
| `Pickup_Time` | Date/Time | Estimated pickup | `2026-01-19 13:00` |
| `Special_Instructions` | Long Text | Customer notes | `No onions please` |
| `SMS_Sent` | Checkbox | Confirmation sent? | ✓ |

---

## Table 5: `Conversation_State`

Tracks ongoing conversation state during calls.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Call_SID` | Single Line Text | Active call ID | `CA123abc...` |
| `Caller_Phone` | Phone Number | Customer phone | `+15551234567` |
| `State` | Single Select | Conversation state | `greeting`, `ordering`, `confirming`, `complete` |
| `Conversation_History` | Long Text | Message history (JSON) | `[{"role":"user",...}]` |
| `Current_Order` | Long Text | Items being ordered (JSON) | `[{"item":"Pizza",...}]` |
| `Clarification_Count` | Number | Times AI asked for clarification | `1` |
| `Created_At` | Date/Time | State creation time | `2026-01-19 12:30` |
| `Updated_At` | Date/Time | Last update | `2026-01-19 12:32` |

---

## Table 6: `Handoffs`

Records of calls transferred to human staff.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Call_SID` | Single Line Text | Call that was transferred | `CA123abc...` |
| `Caller_Phone` | Phone Number | Customer phone | `+15551234567` |
| `Reason` | Single Line Text | Why transferred | `Complex customization request` |
| `Order_Context` | Long Text | Order so far (JSON) | `[{"item":"Pizza",...}]` |
| `Conversation_Context` | Long Text | Conversation history (JSON) | `[{"role":"user",...}]` |
| `Summary` | Long Text | Formatted summary for staff | `Customer wants...` |
| `Handoff_Time` | Date/Time | When transferred | `2026-01-19 12:33` |
| `SMS_Sent` | Checkbox | Alert sent to staff? | ✓ |
| `Resolved` | Checkbox | Was it resolved? | ✓ |
| `Resolution_Notes` | Long Text | How it was resolved | `Completed order manually` |

---

## Table 7: `Analytics_Reports`

Daily/weekly analytics snapshots.

| Field Name | Field Type | Description | Example |
|------------|------------|-------------|---------|
| `Report_Date` | Date | Report date | `2026-01-19` |
| `Total_Calls` | Number | All calls received | `45` |
| `AI_Handled_Calls` | Number | Calls handled by AI | `38` |
| `Staff_Handled_Calls` | Number | Direct to staff | `7` |
| `Transferred_Calls` | Number | AI → Human transfers | `5` |
| `Handoff_Rate` | Percent | Transfer percentage | `13.2%` |
| `Total_Orders` | Number | Orders placed | `28` |
| `AI_Orders` | Number | AI-placed orders | `24` |
| `Total_Revenue` | Currency | Total revenue | `$892.50` |
| `AI_Revenue` | Currency | AI-generated revenue | `$756.25` |
| `Avg_Call_Duration` | Number | Average seconds | `185` |
| `Total_Cost` | Currency | API costs | `$3.60` |
| `Peak_Hour` | Single Line Text | Busiest hour | `12:00` |
| `Busiest_Day` | Single Line Text | Busiest day | `Friday` |
| `Full_Report_JSON` | Long Text | Complete report data | `{...}` |

---

## 🔧 Setup Instructions

### Step 1: Create the Base

1. Go to [airtable.com](https://airtable.com) and sign in
2. Click "Add a base" → "Start from scratch"
3. Name it `Restaurant AI Phone System`

### Step 2: Create Tables

Create each table listed above with the exact field names and types.

**Pro tip:** Use the Airtable API to import the schema:

```bash
# Get your API key from https://airtable.com/account
# Get your base ID from the API docs
```

### Step 3: Add Initial Data

1. Add your settings to the `Settings` table
2. Add your menu items to the `Menu` table
3. Ensure `AI_TOGGLE` is set to `OFF` initially for testing

### Step 4: Get API Credentials

1. Go to https://airtable.com/account
2. Generate a Personal Access Token with these scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
3. Copy your Base ID from the URL: `https://airtable.com/appXXXXXXXXXXX/...`

### Step 5: Configure n8n

Add these credentials to n8n:
- **Airtable Token API**: Your Personal Access Token
- Set environment variable: `AIRTABLE_BASE_ID=appXXXXXXXXXXX`

---

## 📋 View Recommendations

Create these views for easy management:

### Call_Logs Views
- **Today's Calls**: Filter by Call_Start = TODAY
- **AI Handled**: Filter by Handled_By = "AI"
- **Transferred**: Filter by Status = "Transferred"
- **Peak Hours**: Filter by Is_Peak_Hour = ✓

### Orders Views
- **Pending Orders**: Filter by Status = "Pending"
- **Today's Orders**: Filter by Order_Time = TODAY
- **AI Orders**: Filter by Source = "AI Phone"

### Analytics Dashboard
- Create a Airtable Interface for visual dashboards
- Use charts to visualize hourly/daily patterns

---

## 🔗 Linked Records (Optional)

For better data relationships, you can link tables:

- `Call_Logs.Order_Number` ↔ `Orders.Order_Number`
- `Handoffs.Call_SID` ↔ `Call_Logs.Call_SID`
- `Conversation_State.Call_SID` ↔ `Call_Logs.Call_SID`

This enables rollups and lookups between tables.

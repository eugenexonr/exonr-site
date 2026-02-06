# EXONR Lead Pipeline — Setup Guide

## Architecture

```
Website (form + chat) → n8n Webhook → Telegram (Approve/Reject)
                                              ↓ Approve
                                    AI generates email draft
                                              ↓
                                    Telegram (Send/Regenerate)
                                              ↓ Send
                                    Email from eugene@exonr.com
```

Two n8n workflows:
- **WF1** `EXONR - Lead Intake` (BF3EuxZBC8l93nbP) — receives leads, sends to Telegram
- **WF2** `EXONR - Lead Response` (mcFbWTuGKh29QzP3) — handles approval, AI email, sending

---

## Step 1: Create a Telegram Bot

1. Open Telegram, find **@BotFather**
2. Send `/newbot`
3. Name it, e.g. `EXONR Lead Bot`
4. Username, e.g. `exonr_lead_bot`
5. **Save the token** — looks like `7123456789:AAG...` (you'll need it in Step 2)

### Get your Chat ID

1. Open Telegram, find **@userinfobot**
2. Send `/start`
3. It replies with your **Id** — a number like `123456789`
4. **Save this number** — this is your Chat ID

### Start the bot

**Important**: Open your new bot in Telegram and press `/start`. Without this, the bot can't send you messages.

---

## Step 2: Add Telegram Credential in n8n

1. Go to https://dovmant.app.n8n.cloud
2. **Settings** (gear icon) → **Credentials** → **Add Credential**
3. Search for **Telegram API**
4. Paste your bot token from Step 1
5. Name it `EXONR Telegram Bot`
6. Click **Save**

---

## Step 3: Get an OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up / log in
3. Go to **Keys** → **Create Key**
4. Name it `EXONR`
5. **Copy the key** — starts with `sk-or-v1-...`
6. Add credits ($5 is enough for hundreds of email drafts)

### Add OpenRouter Credential in n8n

1. In n8n: **Credentials** → **Add Credential**
2. Search for **Header Auth**
3. Set:
   - **Name**: `OpenRouter API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer sk-or-v1-YOUR_KEY_HERE`
4. Click **Save**

---

## Step 4: Set Up Email (SMTP)

You need SMTP credentials for `eugene@exonr.com`. This depends on your email provider:

### If using Google Workspace (Gmail):
1. Go to https://myaccount.google.com/apppasswords
2. Generate an **App Password** (requires 2FA enabled)
3. In n8n: **Credentials** → **Add Credential** → search **SMTP**
4. Set:
   - **Host**: `smtp.gmail.com`
   - **Port**: `465`
   - **SSL/TLS**: `true`
   - **User**: `eugene@exonr.com`
   - **Password**: the App Password from step 2
5. Name it `EXONR Email SMTP`

### If using another provider:
Get SMTP host, port, username, password from your email provider's settings and create the credential the same way.

---

## Step 5: Connect Credentials to Workflow Nodes

### WF1: EXONR - Lead Intake

1. Open workflow: https://dovmant.app.n8n.cloud/workflow/BF3EuxZBC8l93nbP
2. Click the **Send to Telegram** node
3. In **Credential to connect with** → select `EXONR Telegram Bot`
4. Change `YOUR_TELEGRAM_CHAT_ID` to your actual Chat ID number from Step 1
5. Click **Save**

### WF2: EXONR - Lead Response

1. Open workflow: https://dovmant.app.n8n.cloud/workflow/mcFbWTuGKh29QzP3
2. Click **Telegram Callback** node → set credential to `EXONR Telegram Bot`
3. Click **Generate Email** node → set credential to `OpenRouter API`
4. Click **Send Draft** node → set credential to `EXONR Telegram Bot`
5. Click **Confirm Reject** node → set credential to `EXONR Telegram Bot`
6. Click **Send Email** node → set credential to `EXONR Email SMTP`
7. Click **Confirm Sent** node → set credential to `EXONR Telegram Bot`
8. Click **Save**

Total: 4 Telegram nodes need the bot credential, 1 HTTP needs OpenRouter, 1 email needs SMTP.

---

## Step 6: Activate Workflows & Get Webhook URL

### Activate WF2 first (Lead Response)

1. Open WF2: https://dovmant.app.n8n.cloud/workflow/mcFbWTuGKh29QzP3
2. Toggle **Active** (top right switch) → ON
3. This starts listening for Telegram button callbacks

### Activate WF1 (Lead Intake)

1. Open WF1: https://dovmant.app.n8n.cloud/workflow/BF3EuxZBC8l93nbP
2. Toggle **Active** → ON
3. Click the **Lead Webhook** node
4. You'll see the **Production URL** — copy it
   - It will look like: `https://dovmant.app.n8n.cloud/webhook/exonr-lead`

---

## Step 7: Update Website with Webhook URL

1. Open `exonr-site/index.html`
2. Find this line (around line 1706):
   ```javascript
   const WEBHOOK_URL = 'WEBHOOK_PLACEHOLDER';
   ```
3. Replace `WEBHOOK_PLACEHOLDER` with your actual webhook URL:
   ```javascript
   const WEBHOOK_URL = 'https://dovmant.app.n8n.cloud/webhook/exonr-lead';
   ```
4. Save the file

---

## Step 8: Deploy the Website

### Option A: Vercel (recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. In terminal:
   ```
   cd exonr-site
   npx vercel --prod
   ```
3. Follow prompts (link to your Vercel account)
4. After deploy, go to Vercel dashboard → **Domains** → add `exonr.com`
5. Point your domain DNS:
   - Type: `A`, Value: `76.76.21.21`
   - Or Type: `CNAME`, Value: `cname.vercel-dns.com`

### Option B: Netlify

1. Go to https://app.netlify.com
2. Drag the `exonr-site` folder onto the page
3. Site deploys instantly
4. Go to **Domain settings** → add `exonr.com`

### Option C: Manual (any static host)

The site is a single `index.html` file — just upload it to any hosting that serves static files.

---

## Step 9: Test the Full Pipeline

1. Go to your deployed site (or open `index.html` locally)
2. **Test the chat widget**: click the chat bubble, go through the conversation
3. **Test the form**: fill out and submit the contact form
4. Check Telegram — you should get a message with Approve/Reject buttons
5. Press **Approve** — wait for AI email draft
6. Review the draft, press **Send Email**
7. Check the lead's inbox — email should arrive from `eugene@exonr.com`

### If testing locally (before deploy)
The webhook won't work from `file://` due to CORS. Use a local server:
```
cd exonr-site
npx serve .
```
Then open `http://localhost:3000`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Telegram bot doesn't respond | Make sure you pressed /start in the bot chat |
| No message in Telegram | Check Chat ID is correct (number, no quotes) |
| Webhook returns error | Check WF1 is active (toggle ON) |
| AI email generation fails | Check OpenRouter key and credit balance |
| Email not sending | Check SMTP credentials and that App Password is correct |
| CORS error in browser console | Check webhook `allowedOrigins` is set to `*` |
| Buttons don't work | Check WF2 is active and Telegram credential is set on all nodes |

---

## Summary Checklist

- [ ] Telegram bot created via @BotFather
- [ ] Chat ID obtained from @userinfobot
- [ ] Pressed /start in the bot
- [ ] n8n: Telegram API credential added
- [ ] n8n: OpenRouter Header Auth credential added
- [ ] n8n: SMTP credential added
- [ ] WF1: Telegram credential connected + Chat ID set
- [ ] WF2: All 4 Telegram nodes + 1 HTTP + 1 SMTP credentials connected
- [ ] WF2 activated
- [ ] WF1 activated
- [ ] Webhook URL copied from WF1
- [ ] `index.html` updated with webhook URL
- [ ] Site deployed
- [ ] Full pipeline tested end-to-end

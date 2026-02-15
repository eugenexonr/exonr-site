# Exonr.com Rebuild Plan (From Vertical to Controlled Horizontal)

Date: 2026-02-15
Goal: make Exonr understandable to a broader SMB market while preserving conversion focus.

## 1) Positioning Shift

Current message:

- "AI Automation for Home Services"

Proposed week-1 message:

- "AI Automations That Remove Manual Work in Your Business Ops"

Important:

- Keep home services as one proof lane, not the only identity.
- Sell outcomes (time saved, faster lead response, cleaner ops), not "AI" itself.

## 2) New Homepage Information Architecture

Use this order:

1. Hero (single clear promise + one CTA)
2. "Who this is for" (3 ICP cards)
3. "What we automate" (3-5 process use cases)
4. Productized offer (Automation Diagnostic Sprint)
5. Proof section (portfolio + quantified outcomes)
6. Process timeline (how engagement works)
7. Risk reversal (guarantee/clear expectations)
8. FAQ (commercial objections)
9. Final CTA form

## 3) Copy Draft (Ready to Paste)

## Hero

Badge:

- `AI Automation for SMB Operations`

H1:

- `Stop losing time to manual work.`
- `We design and deploy practical AI automations in 10 days.`

Subtext:

- `From lead follow-up to internal workflows, we help service businesses run faster with fewer manual handoffs.`

Primary CTA:

- `Book 30-min Automation Audit`

Secondary CTA:

- `See Real Automations`

## ICP Section

Title:

- `Built for teams where speed and follow-up drive revenue`

Cards:

1. Professional Services
   - `Client follow-up, proposal workflows, reporting automation`
2. Real Estate / Property Ops
   - `Lead routing, nurture sequences, CRM hygiene`
3. Construction / Field Ops
   - `Inbound lead triage, scheduling workflows, quote handoff`

## Offer Section

Title:

- `Start with an Automation Diagnostic Sprint`

Bullets:

- `Process leak map (where money/time is lost)`
- `One automation deployed in production`
- `Baseline KPI dashboard + next 30-day roadmap`
- `Delivery in 7-10 days`

CTA:

- `Start My Sprint`

## Proof Section

Title:

- `Automations running in production`

Use existing portfolio cards, but normalize language:

- highlight before/after process metrics,
- reduce niche-specific labels where not needed,
- keep one home-service case as proof, not positioning anchor.

## Process Timeline

1. Audit (day 1-2)
2. Design (day 2-3)
3. Build (day 3-6)
4. Launch + handoff (day 7-10)

## Final CTA

Title:

- `If your team is doing repetitive work manually, this is the right time.`

Subtext:

- `Book a call, we map your biggest operational bottleneck, and show exactly what to automate first.`

## 4) Navigation Changes

Current nav:

- Services, How It Works, Portfolio, FAQ, Free Consultation

Proposed nav:

- Solutions
- How It Works
- Case Studies
- Pricing
- FAQ
- `Book Audit` (primary button)

## 5) Form Changes (High Impact)

Add required fields to qualify leads:

- company size (1-10, 11-50, 51-200)
- monthly lead volume
- biggest bottleneck (dropdown)
- target outcome in 90 days

Send these fields to lead webhook payload so AI Marketer can score lead quality.

## 6) Technical Changes For Tracking

1. Add event tracking:
   - hero CTA click
   - section CTA clicks
   - form submit success/fail
2. Add hidden UTM fields to the form.
3. Ensure conversion action is tied to successful form submission only.
4. Route form posts to AI Marketer lead webhook (`/webhook/leads/{slug}`).

## 7) What To Remove Or Rewrite Immediately

Rewrite:

- all repeated "home service in Colorado only" language in hero/meta/OG.

Keep but reposition:

- Colorado mention as trust anchor ("based in Colorado"), not market limitation.

Remove:

- generic AI buzzword copy without concrete outcomes.

## 8) Suggested A/B Tests (Week 1)

Test A (operations angle):

- "Cut manual ops by 10+ hours per week with AI automations."

Test B (revenue angle):

- "Respond faster, lose fewer leads, and convert more opportunities."

Test C (execution angle):

- "From process chaos to automated workflows in 10 days."

## 9) Minimum Page Set For Scale (Next Step)

After homepage update, create:

- `/solutions/professional-services`
- `/solutions/real-estate`
- `/solutions/field-ops`
- `/offer/automation-diagnostic-sprint`

Each page should have:

- one pain narrative,
- one use-case set,
- one proof block,
- one CTA.

## 10) Implementation Priority

P0 (today):

- update meta + hero + CTA + form fields
- remove strict home-service-only framing

P1 (next 2-3 days):

- add ICP section + offer section + tracking events

P2 (next week):

- add dedicated solution pages and route paid traffic by intent.

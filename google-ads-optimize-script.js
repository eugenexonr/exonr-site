/**
 * =====================================================
 * EXONR — Campaign Optimization Script
 * =====================================================
 * Run via Preview first to see what will change.
 * Then run "Run" to apply.
 *
 * Changes:
 * 1. Budget: $10 → $20/day
 * 2. Geo: 25 miles → 35 miles
 * 3. New keywords in AG3 (Problem Aware)
 * =====================================================
 */

var CAMPAIGN_NAME = "Exonr — AI Automation Denver";

// ===== NEW KEYWORDS FOR AG3 =====
var AG3_NAME = "AG3 — Problem Aware";
var AG3_CPC = 5.00; // matches existing CPC

var NEW_KEYWORDS_AG3 = [
  "plumber marketing near me",
  "hvac advertising",
  "contractor lead generation",
  "home service marketing",
  "plumbing company marketing",
  "roofing company advertising",
  "electrical contractor leads",
  "home services crm",
  "contractor scheduling software",
  "hvac business growth",
  "plumber advertising",
  "roofing company marketing",
  "how to get more hvac customers",
  "contractor customer management",
  "home service business software"
];

// ===== NEW BUDGET =====
var NEW_BUDGET = 20; // dollars per day

// ===== NEW GEO RADIUS =====
var NEW_RADIUS = 35; // miles (was 25)
var GEO_LAT = 39.580745;
var GEO_LNG = -104.877173;

function main() {
  Logger.log("========================================");
  Logger.log("  EXONR — CAMPAIGN OPTIMIZATION");
  Logger.log("  " + new Date().toISOString());
  Logger.log("========================================\n");

  // ============ FIND CAMPAIGN ============
  var campaignIterator = AdsApp.campaigns()
    .withCondition('campaign.name = "' + CAMPAIGN_NAME + '"')
    .get();

  if (!campaignIterator.hasNext()) {
    Logger.log("ERROR: Campaign '" + CAMPAIGN_NAME + "' not found!");
    return;
  }

  var campaign = campaignIterator.next();
  Logger.log("Campaign: " + campaign.getName() + " (ID: " + campaign.getId() + ")\n");

  // ============ 1. UPDATE BUDGET ============
  Logger.log("=== 1. BUDGET UPDATE ===");
  var budget = campaign.getBudget();
  var oldBudget = budget.getAmount();
  Logger.log("  Current budget: $" + oldBudget + "/day");

  if (oldBudget !== NEW_BUDGET) {
    budget.setAmount(NEW_BUDGET);
    Logger.log("  NEW budget: $" + NEW_BUDGET + "/day");
  } else {
    Logger.log("  Budget already at $" + NEW_BUDGET + "/day — no change");
  }

  // ============ 2. UPDATE GEO TARGETING ============
  Logger.log("\n=== 2. GEO TARGETING UPDATE ===");

  // Remove old proximity targeting
  var proximityIterator = campaign.targeting().targetedProximities().get();
  var removedCount = 0;
  while (proximityIterator.hasNext()) {
    var proximity = proximityIterator.next();
    Logger.log("  Removing old proximity: " +
      proximity.getLatitude() + ", " + proximity.getLongitude() +
      " — " + proximity.getRadius() + " " + proximity.getRadiusUnits());
    proximity.remove();
    removedCount++;
  }
  Logger.log("  Removed " + removedCount + " old proximity targets");

  // Add new proximity with 35 miles
  try {
    campaign.addProximity(GEO_LAT, GEO_LNG, NEW_RADIUS, "MILES");
    Logger.log("  Added new proximity: " + GEO_LAT + ", " + GEO_LNG +
               " — " + NEW_RADIUS + " MILES");
  } catch (e) {
    Logger.log("  ERROR adding proximity via addProximity: " + e.message);
    Logger.log("  >>> MANUAL ACTION: Go to Campaign Settings → Locations → Add proximity: ");
    Logger.log("      " + GEO_LAT + ", " + GEO_LNG + " — " + NEW_RADIUS + " miles");
  }

  // ============ 3. ADD NEW KEYWORDS ============
  Logger.log("\n=== 3. NEW KEYWORDS (AG3) ===");

  // Find AG3
  var agIterator = campaign.adGroups()
    .withCondition('ad_group.name = "' + AG3_NAME + '"')
    .get();

  if (!agIterator.hasNext()) {
    Logger.log("  ERROR: Ad group '" + AG3_NAME + "' not found!");
    return;
  }

  var adGroup = agIterator.next();
  Logger.log("  Ad Group: " + adGroup.getName() + " (ID: " + adGroup.getId() + ")");

  // Get existing keywords to avoid duplicates
  var existingKW = {};
  var kwIterator = adGroup.keywords().get();
  while (kwIterator.hasNext()) {
    var kw = kwIterator.next();
    existingKW[kw.getText().toLowerCase()] = true;
  }
  Logger.log("  Existing keywords: " + Object.keys(existingKW).length);

  // Add new keywords
  var addedKW = 0;
  var skippedKW = 0;

  for (var i = 0; i < NEW_KEYWORDS_AG3.length; i++) {
    var keyword = NEW_KEYWORDS_AG3[i].toLowerCase();

    if (existingKW[keyword]) {
      Logger.log("  SKIP (exists): " + keyword);
      skippedKW++;
      continue;
    }

    try {
      var kwOperation = adGroup.newKeywordBuilder()
        .withText(keyword)
        .withCpc(AG3_CPC)
        .build();

      if (kwOperation.isSuccessful()) {
        Logger.log("  ADDED: " + keyword + " (BROAD, $" + AG3_CPC + " CPC)");
        addedKW++;
      } else {
        Logger.log("  ERROR: " + keyword + " — " + kwOperation.getErrors());
      }
    } catch (e) {
      Logger.log("  ERROR: " + keyword + " — " + e.message);
    }
  }

  Logger.log("\n  Added: " + addedKW + " | Skipped: " + skippedKW);

  // ============ SUMMARY ============
  Logger.log("\n========================================");
  Logger.log("  OPTIMIZATION SUMMARY");
  Logger.log("========================================");
  Logger.log("  Budget: $" + oldBudget + " → $" + NEW_BUDGET + "/day");
  Logger.log("  Geo: 25mi → " + NEW_RADIUS + "mi radius");
  Logger.log("  New keywords: " + addedKW + " added to " + AG3_NAME);
  Logger.log("  Total AG3 keywords: " + (Object.keys(existingKW).length + addedKW));
  Logger.log("========================================");
}

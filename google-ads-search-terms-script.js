/**
 * =====================================================
 * EXONR — Search Terms Analysis & Negative Keywords
 * =====================================================
 * Run via Preview first to see the report.
 * Then run "Apply" to add negative keywords.
 *
 * What it does:
 * 1. Pulls search terms from the last 14 days
 * 2. Flags irrelevant terms (logo, generator, etc.)
 * 3. Shows performance breakdown per search term
 * 4. Adds new negative keywords (phrase match) if
 *    AUTO_ADD_NEGATIVES = true
 * =====================================================
 */

// ===== CONFIGURATION =====
var CAMPAIGN_NAME = "Exonr — AI Automation Denver";
var DATE_RANGE = "LAST_14_DAYS";

// Set to true to automatically add flagged terms as negatives
var AUTO_ADD_NEGATIVES = true;

// Negative keywords to add (PHRASE match at campaign level)
// These are based on the search terms report from Feb 12, 2026
var NEW_NEGATIVES_PHRASE = [
  "logo",
  "generator",
  "name generator",
  "make a logo",
  "design a logo",
  "create a logo",
  "how to make",
  "how to create",
  "how to design",
  "how to build a website",
  "chatgpt",
  "openai",
  "midjourney",
  "dall-e",
  "stable diffusion"
];

var NEW_NEGATIVES_EXACT = [
  "us based ai companies",
  "ai companies",
  "ai startups",
  "ai company",
  "what is ai",
  "artificial intelligence",
  "machine learning",
  "deep learning"
];

// Words that flag a search term as likely irrelevant
var RED_FLAG_WORDS = [
  "logo", "generator", "template", "free", "course", "tutorial",
  "learn", "salary", "job", "jobs", "career", "hiring", "intern",
  "download", "open source", "github", "python", "code", "coding",
  "certification", "degree", "school", "class", "training",
  "chatgpt", "openai", "midjourney", "dall-e", "image",
  "write", "essay", "homework", "resume", "cover letter",
  "stock", "invest", "crypto", "bitcoin", "trading",
  "what is", "define", "definition", "meaning",
  "diy", "build your own", "make your own"
];

function main() {
  Logger.log("========================================");
  Logger.log("  EXONR — SEARCH TERMS ANALYSIS");
  Logger.log("  " + new Date().toISOString());
  Logger.log("  Date range: " + DATE_RANGE);
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

  // ============ SEARCH TERMS REPORT ============
  Logger.log("=== SEARCH TERMS REPORT ===\n");

  var report = AdsApp.report(
    "SELECT search_term_view.search_term, " +
    "segments.keyword.info.text, " +
    "segments.keyword.ad_group_criterion.keyword.match_type, " +
    "metrics.impressions, " +
    "metrics.clicks, " +
    "metrics.cost_micros, " +
    "metrics.ctr, " +
    "metrics.conversions, " +
    "campaign.name, " +
    "ad_group.name " +
    "FROM search_term_view " +
    "WHERE campaign.name = '" + CAMPAIGN_NAME + "' " +
    "AND segments.date DURING " + DATE_RANGE + " " +
    "ORDER BY metrics.impressions DESC"
  );

  var rows = report.rows();
  var termCount = 0;
  var relevantTerms = [];
  var irrelevantTerms = [];
  var totalImpressions = 0;
  var totalClicks = 0;
  var totalCostMicros = 0;

  while (rows.hasNext()) {
    var row = rows.next();
    var searchTerm = row['search_term_view.search_term'];
    var keyword = row['segments.keyword.info.text'];
    var impressions = parseInt(row['metrics.impressions'], 10);
    var clicks = parseInt(row['metrics.clicks'], 10);
    var costMicros = parseInt(row['metrics.cost_micros'], 10);
    var cost = (costMicros / 1000000).toFixed(2);
    var ctr = row['metrics.ctr'];
    var conversions = row['metrics.conversions'];
    var adGroup = row['ad_group.name'];

    totalImpressions += impressions;
    totalClicks += clicks;
    totalCostMicros += costMicros;
    termCount++;

    var isIrrelevant = isTermIrrelevant(searchTerm);

    var termData = {
      term: searchTerm,
      keyword: keyword,
      adGroup: adGroup,
      impressions: impressions,
      clicks: clicks,
      cost: cost,
      ctr: ctr,
      conversions: conversions,
      flagged: isIrrelevant
    };

    if (isIrrelevant) {
      irrelevantTerms.push(termData);
    } else {
      relevantTerms.push(termData);
    }

    var flag = isIrrelevant ? " *** IRRELEVANT ***" : "";
    Logger.log("  \"" + searchTerm + "\"" + flag);
    Logger.log("    Keyword: " + keyword + " | Ad Group: " + adGroup);
    Logger.log("    Impressions: " + impressions + " | Clicks: " + clicks +
               " | Cost: $" + cost + " | CTR: " + ctr +
               " | Conv: " + conversions);
    Logger.log("");
  }

  // ============ SUMMARY ============
  Logger.log("\n=== SUMMARY ===");
  Logger.log("Total search terms: " + termCount);
  Logger.log("Relevant: " + relevantTerms.length);
  Logger.log("Irrelevant (flagged): " + irrelevantTerms.length);
  Logger.log("Total impressions: " + totalImpressions);
  Logger.log("Total clicks: " + totalClicks);
  Logger.log("Total cost: $" + (totalCostMicros / 1000000).toFixed(2));

  if (irrelevantTerms.length > 0) {
    Logger.log("\n=== FLAGGED IRRELEVANT TERMS ===");
    for (var i = 0; i < irrelevantTerms.length; i++) {
      Logger.log("  - \"" + irrelevantTerms[i].term + "\" (" +
                 irrelevantTerms[i].impressions + " imp, $" +
                 irrelevantTerms[i].cost + " spent)");
    }
  }

  // ============ EXISTING NEGATIVES ============
  Logger.log("\n=== EXISTING NEGATIVE KEYWORDS ===");
  var existingNegatives = {};
  var negIterator = campaign.negativeKeywords().get();
  while (negIterator.hasNext()) {
    var neg = negIterator.next();
    var negText = neg.getText().toLowerCase();
    existingNegatives[negText] = neg.getMatchType();
    Logger.log("  " + neg.getMatchType() + ": " + neg.getText());
  }
  Logger.log("  Total: " + Object.keys(existingNegatives).length);

  // ============ ADD NEW NEGATIVES ============
  if (AUTO_ADD_NEGATIVES) {
    Logger.log("\n=== ADDING NEW NEGATIVE KEYWORDS ===");
    var addedCount = 0;

    // Add phrase match negatives
    for (var i = 0; i < NEW_NEGATIVES_PHRASE.length; i++) {
      var term = NEW_NEGATIVES_PHRASE[i].toLowerCase();
      if (existingNegatives[term]) {
        Logger.log("  SKIP (exists): \"" + term + "\" [" + existingNegatives[term] + "]");
        continue;
      }
      try {
        // Google Ads Scripts: quoted string = phrase match
        campaign.createNegativeKeyword('"' + term + '"');
        Logger.log("  ADDED PHRASE: \"" + term + "\"");
        addedCount++;
      } catch (e) {
        Logger.log("  ERROR adding \"" + term + "\": " + e.message);
      }
    }

    // Add exact match negatives
    for (var i = 0; i < NEW_NEGATIVES_EXACT.length; i++) {
      var term = NEW_NEGATIVES_EXACT[i].toLowerCase();
      if (existingNegatives[term]) {
        Logger.log("  SKIP (exists): [" + term + "] [" + existingNegatives[term] + "]");
        continue;
      }
      try {
        campaign.createNegativeKeyword("[" + term + "]");
        Logger.log("  ADDED EXACT: [" + term + "]");
        addedCount++;
      } catch (e) {
        Logger.log("  ERROR adding [" + term + "]: " + e.message);
      }
    }

    Logger.log("\n  Total new negatives added: " + addedCount);
  } else {
    Logger.log("\n=== RECOMMENDED NEW NEGATIVES (not applied) ===");
    Logger.log("Set AUTO_ADD_NEGATIVES = true to apply these.");
    for (var i = 0; i < NEW_NEGATIVES_PHRASE.length; i++) {
      Logger.log("  PHRASE: \"" + NEW_NEGATIVES_PHRASE[i] + "\"");
    }
    for (var i = 0; i < NEW_NEGATIVES_EXACT.length; i++) {
      Logger.log("  EXACT: [" + NEW_NEGATIVES_EXACT[i] + "]");
    }
  }

  // ============ KEYWORD PERFORMANCE ============
  Logger.log("\n=== KEYWORD PERFORMANCE (by keyword) ===");
  var kwReport = AdsApp.report(
    "SELECT ad_group_criterion.keyword.text, " +
    "ad_group_criterion.keyword.match_type, " +
    "ad_group.name, " +
    "metrics.impressions, " +
    "metrics.clicks, " +
    "metrics.cost_micros, " +
    "metrics.ctr, " +
    "metrics.conversions, " +
    "metrics.average_cpc " +
    "FROM keyword_view " +
    "WHERE campaign.name = '" + CAMPAIGN_NAME + "' " +
    "AND segments.date DURING " + DATE_RANGE + " " +
    "AND metrics.impressions > 0 " +
    "ORDER BY metrics.impressions DESC"
  );

  var kwRows = kwReport.rows();
  while (kwRows.hasNext()) {
    var r = kwRows.next();
    var kw = r['ad_group_criterion.keyword.text'];
    var imp = r['metrics.impressions'];
    var cl = r['metrics.clicks'];
    var costM = parseInt(r['metrics.cost_micros'], 10);
    var ag = r['ad_group.name'];
    Logger.log("  " + kw + " (" + ag + ")");
    Logger.log("    Imp: " + imp + " | Clicks: " + cl +
               " | Cost: $" + (costM / 1000000).toFixed(2) +
               " | CTR: " + r['metrics.ctr'] +
               " | Conv: " + r['metrics.conversions']);
  }

  // ============ AD GROUP PERFORMANCE ============
  Logger.log("\n=== AD GROUP PERFORMANCE ===");
  var agReport = AdsApp.report(
    "SELECT ad_group.name, " +
    "metrics.impressions, " +
    "metrics.clicks, " +
    "metrics.cost_micros, " +
    "metrics.ctr, " +
    "metrics.conversions " +
    "FROM ad_group " +
    "WHERE campaign.name = '" + CAMPAIGN_NAME + "' " +
    "AND segments.date DURING " + DATE_RANGE + " " +
    "ORDER BY metrics.impressions DESC"
  );

  var agRows = agReport.rows();
  while (agRows.hasNext()) {
    var r = agRows.next();
    var costM = parseInt(r['metrics.cost_micros'], 10);
    Logger.log("  " + r['ad_group.name']);
    Logger.log("    Imp: " + r['metrics.impressions'] +
               " | Clicks: " + r['metrics.clicks'] +
               " | Cost: $" + (costM / 1000000).toFixed(2) +
               " | CTR: " + r['metrics.ctr'] +
               " | Conv: " + r['metrics.conversions']);
  }

  Logger.log("\n========================================");
  Logger.log("  DONE — Review results above");
  Logger.log("========================================");
}

/**
 * Check if a search term is likely irrelevant
 */
function isTermIrrelevant(term) {
  var lower = term.toLowerCase();
  for (var i = 0; i < RED_FLAG_WORDS.length; i++) {
    if (lower.indexOf(RED_FLAG_WORDS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

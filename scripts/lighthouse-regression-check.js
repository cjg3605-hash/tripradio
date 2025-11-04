#!/usr/bin/env node

/**
 * Lighthouse Regression Detection Script
 *
 * Week 4 QA Testing System
 * Persona: QA Expert
 * Role: Automated regression detection and alerting
 *
 * Analyzes Lighthouse results and detects performance regressions
 * Compares current results against baseline and historical data
 */

const fs = require('fs');
const path = require('path');

// Performance thresholds (minimum acceptable scores)
const THRESHOLDS = {
  performance: 85,
  accessibility: 85,
  'best-practices': 85,
  seo: 90
};

// Regression thresholds (max allowed decline from baseline)
const REGRESSION_THRESHOLDS = {
  performance: 5,      // Max 5 point drop
  accessibility: 5,
  'best-practices': 5,
  seo: 3
};

/**
 * Read Lighthouse results file
 */
function readLighthouseResults(resultsPath = './lighthouserc-results.json') {
  try {
    const data = fs.readFileSync(resultsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read Lighthouse results:', error.message);
    return null;
  }
}

/**
 * Read baseline results for regression comparison
 */
function readBaseline(baselinePath = './lighthouse-baseline.json') {
  try {
    if (!fs.existsSync(baselinePath)) {
      console.log('📝 No baseline found - creating new baseline');
      return null;
    }
    const data = fs.readFileSync(baselinePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('⚠️ Failed to read baseline:', error.message);
    return null;
  }
}

/**
 * Save current results as new baseline
 */
function saveBaseline(results, baselinePath = './lighthouse-baseline.json') {
  try {
    fs.writeFileSync(baselinePath, JSON.stringify(results, null, 2));
    console.log('✅ Baseline saved:', baselinePath);
  } catch (error) {
    console.error('❌ Failed to save baseline:', error.message);
  }
}

/**
 * Extract scores from Lighthouse result
 */
function extractScores(result) {
  if (!result || !result.categories) {
    return null;
  }

  return {
    performance: Math.round(result.categories.performance.score * 100),
    accessibility: Math.round(result.categories.accessibility.score * 100),
    'best-practices': Math.round(result.categories['best-practices'].score * 100),
    seo: Math.round(result.categories.seo.score * 100)
  };
}

/**
 * Check if scores meet thresholds
 */
function checkThresholds(scores) {
  const failures = [];

  Object.entries(THRESHOLDS).forEach(([category, threshold]) => {
    if (scores[category] < threshold) {
      failures.push({
        category,
        score: scores[category],
        threshold,
        diff: threshold - scores[category]
      });
    }
  });

  return failures;
}

/**
 * Check for regressions compared to baseline
 */
function checkRegressions(current, baseline) {
  if (!baseline) {
    return [];
  }

  const regressions = [];

  Object.entries(REGRESSION_THRESHOLDS).forEach(([category, threshold]) => {
    const diff = baseline[category] - current[category];
    if (diff > threshold) {
      regressions.push({
        category,
        current: current[category],
        baseline: baseline[category],
        regression: diff,
        threshold
      });
    }
  });

  return regressions;
}

/**
 * Generate detailed report
 */
function generateReport(results, failures, regressions) {
  let report = '# 📊 Lighthouse CI Regression Report\n\n';

  // Scores summary
  report += '## Performance Scores\n\n';
  report += '| Category | Score | Status |\n';
  report += '|----------|-------|--------|\n';

  Object.entries(results).forEach(([category, score]) => {
    const threshold = THRESHOLDS[category];
    const status = score >= threshold ? '✅' : '❌';
    report += `| ${category} | ${score} | ${status} |\n`;
  });

  report += '\n';

  // Failures
  if (failures.length > 0) {
    report += '## ❌ Threshold Failures\n\n';
    failures.forEach(failure => {
      report += `- **${failure.category}**: ${failure.score} (threshold: ${failure.threshold}, deficit: ${failure.diff} points)\n`;
    });
    report += '\n';
  }

  // Regressions
  if (regressions.length > 0) {
    report += '## ⚠️ Performance Regressions\n\n';
    regressions.forEach(regression => {
      report += `- **${regression.category}**: ${regression.current} (was ${regression.baseline}, regressed ${regression.regression} points)\n`;
    });
    report += '\n';
  }

  // Recommendations
  if (failures.length === 0 && regressions.length === 0) {
    report += '## ✅ All Checks Passed\n\n';
    report += 'Performance is within acceptable thresholds.\n';
  } else {
    report += '## 🔧 Recommendations\n\n';
    report += '1. Run bundle analyzer: `npm run bundle:analyze`\n';
    report += '2. Check Core Web Vitals: `/api/vitals?hours=24`\n';
    report += '3. Review slow pages in `/guide` routes\n';
    report += '4. Profile with Lighthouse devtools\n';
  }

  return report;
}

/**
 * Post report to Slack (if webhook configured)
 */
function postToSlack(report, results) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhook) {
    console.log('ℹ️ Slack webhook not configured - skipping notification');
    return;
  }

  const color = Object.values(results).every(score => score >= 85) ? '#36a64f' : '#ff0000';
  const payload = {
    attachments: [
      {
        color,
        title: '📊 Lighthouse CI Report',
        text: report,
        fields: Object.entries(results).map(([category, score]) => ({
          title: category,
          value: `${score}`,
          short: true
        }))
      }
    ]
  };

  try {
    const https = require('https');
    const postData = JSON.stringify(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(slackWebhook, options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Slack notification sent');
      } else {
        console.warn(`⚠️ Slack notification failed: ${res.statusCode}`);
      }
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Analyzing Lighthouse results...\n');

  // Read results
  const resultsData = readLighthouseResults();
  if (!resultsData || resultsData.length === 0) {
    console.error('❌ No Lighthouse results found');
    process.exit(1);
  }

  const latestResult = resultsData[0];
  const scores = extractScores(latestResult);

  if (!scores) {
    console.error('❌ Could not extract scores from results');
    process.exit(1);
  }

  console.log('📊 Scores:', scores);

  // Check thresholds
  const failures = checkThresholds(scores);

  // Check regressions
  const baseline = readBaseline();
  const regressions = checkRegressions(scores, baseline);

  // Generate report
  const report = generateReport(scores, failures, regressions);
  console.log(report);

  // Save report to file
  const reportPath = './lighthouse-regression-report.md';
  fs.writeFileSync(reportPath, report);
  console.log(`\n✅ Report saved to ${reportPath}`);

  // Post to Slack
  postToSlack(report, scores);

  // Update baseline
  saveBaseline(scores);

  // Exit with error if failures
  if (failures.length > 0) {
    console.error('\n❌ Performance thresholds not met');
    process.exit(1);
  }

  if (regressions.length > 0) {
    console.warn('\n⚠️ Performance regressions detected');
    // Don't exit with error for regressions if they're small
    if (regressions.some(r => r.regression > 10)) {
      process.exit(1);
    }
  }

  console.log('\n✅ All checks passed');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

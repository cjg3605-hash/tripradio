/**
 * Lighthouse Configuration
 *
 * Week 4 QA Testing System
 * Persona: QA Expert
 * Role: Automated testing, regression prevention
 *
 * Custom configuration for TripRadio.AI performance testing
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Throttling configuration
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      downloadThroughputKbps: 10240,
      uploadThroughputKbps: 2560,
      cpuSlowdownMultiplier: 1.25
    },

    // Chrome settings
    chrome: {
      useRelativePaths: true
    },

    // Skip audits that require third-party access
    skipAudits: [
      'uses-http2',  // Not applicable for all environments
      'geolocation-on-start'  // Not applicable
    ],

    // Output settings
    output: ['json', 'html'],
    outputPath: './lighthouse-results',

    // Timeout settings (ms)
    maxWaitForLoad: 45000,
    maxWaitForFCP: 15000,
    pageLoadStrategy: 'networkidle2'
  },

  // Custom plugins/onlyCategories
  onlyCategories: [
    'performance',
    'accessibility',
    'best-practices',
    'seo'
  ],

  // Audit-specific settings
  audits: {
    // Performance audits
    'largest-contentful-paint': {
      weight: 25,
      expectedValue: 2500  // ms - Web Vitals threshold
    },
    'first-contentful-paint': {
      weight: 15,
      expectedValue: 1800  // ms
    },
    'cumulative-layout-shift': {
      weight: 15,
      expectedValue: 0.1   // unitless
    },
    'speed-index': {
      weight: 15,
      expectedValue: 3000  // ms
    },
    'total-blocking-time': {
      weight: 25,
      expectedValue: 200   // ms
    },

    // Best practices audits
    'unsized-images': {
      weight: 10
    },
    'unminified-javascript': {
      weight: 10
    },
    'unminified-css': {
      weight: 10
    },

    // Accessibility audits
    'color-contrast': {
      weight: 8
    },
    'image-alt': {
      weight: 8
    }
  },

  // Threshold settings for pass/fail
  passes: [
    {
      passName: 'defaultPass',
      gatherers: [
        'accessibility',
        'anchor-elements',
        'app-cache',
        'cache-contents',
        'chrome-console-messages',
        'computed-layout-shift',
        'csp-violations',
        'css-usage',
        'dobetterweb/doctype',
        'dobetterweb/domstats',
        'dobetterweb/optimized-images',
        'dobetterweb/password-inputs-can-be-pasted-into',
        'dobetterweb/uses-http2',
        'dobetterweb/uses-passive-event-listeners',
        'fonts',
        'fullpage-screenshot',
        'iframe-cross-origin-status',
        'image-elements',
        'installable-manifest',
        'js-usage',
        'link-elements',
        'meta-elements',
        'network-requests',
        'network-server-latency',
        'network-user-agent',
        'optimized-images',
        'page-dependency-graph',
        'response-compression',
        'scripts',
        'source-maps',
        'stacks',
        'tap-targets',
        'viewport',
        'visual-change'
      ]
    }
  ],

  // Performance budget settings
  budgets: [
    {
      type: 'resourceSizes',
      resourceType: 'script',
      budget: 300000  // 300 KB max for JS
    },
    {
      type: 'resourceSizes',
      resourceType: 'stylesheet',
      budget: 100000  // 100 KB max for CSS
    },
    {
      type: 'resourceSizes',
      resourceType: 'image',
      budget: 500000  // 500 KB max per image
    },
    {
      type: 'resourceCount',
      resourceType: 'third-party',
      budget: 10  // Max 10 third-party resources
    },
    {
      type: 'resourceCount',
      resourceType: 'document',
      budget: 30  // Max 30 requests total
    }
  ]
};

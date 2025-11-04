#!/usr/bin/env python3

"""
Performance Reporter - Week 4 Performance Monitoring System

Persona: Performance Expert + Analyzer
Role: Performance data analysis, trend detection, automated reporting

Analyzes Web Vitals data from Supabase and generates:
1. Daily performance reports
2. Trend analysis (improving/declining)
3. Slack notifications
4. JSON/Markdown export
"""

import json
import os
import sys
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
import statistics

# Supabase configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK_URL', '')

# Performance thresholds
THRESHOLDS = {
    'lcp': {'good': 2500, 'warning': 4000},      # ms
    'fid': {'good': 100, 'warning': 300},        # ms
    'cls': {'good': 0.1, 'warning': 0.25},       # unitless
    'ttfb': {'good': 600, 'warning': 1200},      # ms
    'fcp': {'good': 1800, 'warning': 3000},      # ms
}

class PerformanceAnalyzer:
    """Analyzes Web Vitals data and generates reports"""

    def __init__(self, hours: int = 24):
        """Initialize with time window"""
        self.hours = hours
        self.start_time = datetime.utcnow() - timedelta(hours=hours)
        self.data = None

    def fetch_vitals(self, location: Optional[str] = None, language: Optional[str] = None) -> bool:
        """Fetch Web Vitals data from API"""
        try:
            params = {'hours': self.hours}
            if location:
                params['location'] = location
            if language:
                params['language'] = language

            response = requests.get(
                f'{SUPABASE_URL.rstrip("/")}/rest/v1/web_vitals?',
                params=params,
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                },
                timeout=10
            )

            if response.status_code == 200:
                self.data = response.json()
                print(f'✅ Fetched {len(self.data)} records')
                return True
            else:
                print(f'❌ Failed to fetch data: {response.status_code}')
                return False

        except requests.RequestException as e:
            print(f'❌ Request error: {e}')
            return False
        except Exception as e:
            print(f'❌ Unexpected error: {e}')
            return False

    def calculate_stats(self, metric: str) -> Dict[str, Any]:
        """Calculate statistics for a metric"""
        if not self.data:
            return {}

        values = [
            record[metric] for record in self.data
            if record.get(metric) is not None
        ]

        if not values:
            return {'count': 0}

        return {
            'count': len(values),
            'min': min(values),
            'max': max(values),
            'mean': statistics.mean(values),
            'median': statistics.median(values),
            'stdev': statistics.stdev(values) if len(values) > 1 else 0,
            'p75': sorted(values)[int(len(values) * 0.75)],
            'p95': sorted(values)[int(len(values) * 0.95)],
        }

    def get_status(self, metric: str, value: Optional[float]) -> str:
        """Get status emoji for a metric value"""
        if value is None:
            return '❓'

        threshold = THRESHOLDS.get(metric, {})
        if value <= threshold.get('good', float('inf')):
            return '✅'
        elif value <= threshold.get('warning', float('inf')):
            return '⚠️'
        else:
            return '❌'

    def generate_json_report(self) -> Dict[str, Any]:
        """Generate JSON report"""
        metrics = ['lcp', 'fid', 'cls', 'ttfb', 'fcp']
        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'hours': self.hours,
            'metrics': {}
        }

        for metric in metrics:
            stats = self.calculate_stats(metric)
            if stats.get('count', 0) > 0:
                stats['status'] = self.get_status(metric, stats.get('mean'))
            report['metrics'][metric] = stats

        return report

    def generate_markdown_report(self) -> str:
        """Generate Markdown report"""
        report = f"# 📊 Performance Report - Last {self.hours} hours\n\n"
        report += f"**Generated**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"

        metrics = ['lcp', 'fid', 'cls', 'ttfb', 'fcp']
        report += "## Core Web Vitals Summary\n\n"
        report += "| Metric | Status | Mean | Median | P75 | P95 | Count |\n"
        report += "|--------|--------|------|--------|-----|-----|-------|\n"

        for metric in metrics:
            stats = self.calculate_stats(metric)
            if stats.get('count', 0) == 0:
                continue

            status = self.get_status(metric, stats.get('mean'))
            mean = f"{stats['mean']:.0f}" if stats['mean'] else 'N/A'
            median = f"{stats['median']:.0f}" if stats['median'] else 'N/A'
            p75 = f"{stats['p75']:.0f}" if stats['p75'] else 'N/A'
            p95 = f"{stats['p95']:.0f}" if stats['p95'] else 'N/A'
            count = stats['count']

            report += f"| {metric.upper()} | {status} | {mean} | {median} | {p75} | {p95} | {count} |\n"

        report += "\n## Thresholds\n\n"
        for metric, threshold in THRESHOLDS.items():
            report += f"- **{metric.upper()}**: Good ≤ {threshold['good']}, Warning ≤ {threshold['warning']}\n"

        report += "\n## Recommendations\n\n"
        for metric in metrics:
            stats = self.calculate_stats(metric)
            if stats.get('count', 0) == 0:
                continue

            status = self.get_status(metric, stats.get('mean'))
            if status == '❌':
                if metric == 'lcp':
                    report += f"- **LCP**: Image optimization, lazy loading, or code splitting needed\n"
                elif metric == 'fid':
                    report += f"- **FID**: JavaScript execution time too high\n"
                elif metric == 'cls':
                    report += f"- **CLS**: Layout shifts detected - check for unsized images\n"
                elif metric == 'ttfb':
                    report += f"- **TTFB**: Server response time slow - check backend\n"
                elif metric == 'fcp':
                    report += f"- **FCP**: Critical rendering path needs optimization\n"

        return report

    def detect_trends(self, days: int = 7) -> Dict[str, str]:
        """Detect performance trends"""
        # This would compare with historical data
        # For now, return a placeholder
        return {
            'lcp': 'stable',
            'fid': 'stable',
            'cls': 'stable',
            'ttfb': 'stable',
            'fcp': 'stable'
        }

def send_slack_notification(report: str, json_report: Dict[str, Any]) -> bool:
    """Send report to Slack"""
    if not SLACK_WEBHOOK:
        print('ℹ️ Slack webhook not configured - skipping notification')
        return True

    try:
        # Build Slack message
        metrics = json_report.get('metrics', {})

        fields = []
        for metric, stats in metrics.items():
            if stats.get('count', 0) > 0:
                status = stats.get('status', '❓')
                mean = f"{stats['mean']:.0f}" if stats.get('mean') else 'N/A'
                fields.append({
                    'title': f"{metric.upper()} {status}",
                    'value': f"Mean: {mean}",
                    'short': True
                })

        payload = {
            'attachments': [{
                'color': '#36a64f',
                'title': '📊 Web Vitals Performance Report',
                'text': report[:500],  # Truncate for Slack
                'fields': fields,
                'ts': int(datetime.utcnow().timestamp())
            }]
        }

        response = requests.post(SLACK_WEBHOOK, json=payload, timeout=10)
        if response.status_code == 200:
            print('✅ Slack notification sent')
            return True
        else:
            print(f'⚠️ Slack notification failed: {response.status_code}')
            return False

    except Exception as e:
        print(f'❌ Failed to send Slack notification: {e}')
        return False

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Web Vitals Performance Reporter')
    parser.add_argument('--hours', type=int, default=24, help='Time window in hours')
    parser.add_argument('--location', help='Filter by location')
    parser.add_argument('--language', help='Filter by language')
    parser.add_argument('--output', help='Output file path')
    parser.add_argument('--slack', action='store_true', help='Send Slack notification')
    parser.add_argument('--json', action='store_true', help='Output JSON format')

    args = parser.parse_args()

    print(f'📊 Analyzing Web Vitals for last {args.hours} hours...\n')

    # Initialize analyzer
    analyzer = PerformanceAnalyzer(hours=args.hours)

    # Fetch data
    if not analyzer.fetch_vitals(location=args.location, language=args.language):
        print('❌ Failed to fetch data')
        sys.exit(1)

    # Generate reports
    json_report = analyzer.generate_json_report()
    markdown_report = analyzer.generate_markdown_report()

    # Output report
    if args.json:
        print(json.dumps(json_report, indent=2))
    else:
        print(markdown_report)

    # Save to file if specified
    if args.output:
        if args.json:
            with open(args.output, 'w') as f:
                json.dump(json_report, f, indent=2)
        else:
            with open(args.output, 'w') as f:
                f.write(markdown_report)
        print(f'\n✅ Report saved to {args.output}')

    # Send Slack notification
    if args.slack:
        send_slack_notification(markdown_report, json_report)

    print('\n✅ Report generation complete')

if __name__ == '__main__':
    main()

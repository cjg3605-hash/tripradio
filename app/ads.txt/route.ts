import { NextResponse } from 'next/server';

export async function GET() {
  const adsContent = `# ads.txt file for https://tripradio.shop
# Owner: TripRadio.AI
# Publisher ID: pub-8225961966676319 (Customer ID: 2434557208)
# Last updated: ${new Date().toISOString()}

google.com, pub-8225961966676319, DIRECT, f08c47fec0942fa0`;

  return new NextResponse(adsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, max-age=86400',
      'X-Robots-Tag': 'index, follow',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
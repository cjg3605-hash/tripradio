import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/en/digital-nomad-travel',
    'en',
    'Digital Nomad Travel Guide | Remote Work Travel Planning AI',
    '💻 Ultimate digital nomad travel guide with AI-powered destination recommendations, wifi speeds, cost of living, and remote work hotspots worldwide.',
    ['digital nomad travel', 'remote work travel', 'nomad destinations', 'digital nomad guide', 'remote work locations', 'nomad-friendly cities', 'coworking travel', 'location independent travel', 'workation planning', 'remote work abroad', 'nomad travel app', 'work and travel guide', 'TripRadio.AI']
  )
};

export default function DigitalNomadTravelPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="digital nomad travel"
        pagePath="/en/digital-nomad-travel"
        title="Digital Nomad Travel Guide | Remote Work Travel Planning AI"
        description="Ultimate digital nomad travel guide with AI-powered destination recommendations, wifi speeds, cost of living, and remote work hotspots worldwide."
        features={['Remote Work Hotspots', 'WiFi Speed Data', 'Cost of Living Analysis', 'Coworking Spaces', 'Nomad Community Info', 'Visa Requirements']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              Digital Nomad Guide • AI-Powered Remote Work Travel
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Work From Anywhere 
              <span className="font-semibold block mt-2">Travel Smarter</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              AI-powered travel guide designed specifically for digital nomads. Find the best remote work 
              destinations with reliable WiFi, affordable living, and thriving communities
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/nomad-calculator?lang=en&nomad=true"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              Find Nomad Destinations
            </Link>
            <Link 
              href="#nomad-essentials"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              Nomad Essentials
            </Link>
          </div>
        </div>
      </section>

      {/* Nomad Challenges */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Digital Nomad Travel 
              <span className="font-semibold block mt-2">Challenges</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📶</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Reliable Internet</h3>
              <p className="text-gray-600">
                Finding destinations with fast, stable WiFi for video calls and productive work
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Cost Management</h3>
              <p className="text-gray-600">
                Balancing living costs with quality of life while maintaining a sustainable budget
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Time Zone Coordination</h3>
              <p className="text-gray-600">
                Managing work schedules and client meetings across different time zones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Nomad Solutions */}
      <section id="nomad-essentials" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI-Powered Solutions for 
              <span className="font-semibold block mt-2">Location Independent Work</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">WiFi Speed Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time WiFi speed data, coworking space reviews, and internet reliability scores for every destination
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Cost Calculator</h3>
              <p className="text-gray-600 leading-relaxed">
                Detailed cost breakdowns including accommodation, food, transport, and workspace expenses
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏢</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Workspace Finder</h3>
              <p className="text-gray-600 leading-relaxed">
                Curated list of coworking spaces, cafes, and remote work spots with detailed amenities
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">👥</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Nomad Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with local nomad communities, events, and networking opportunities
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📋</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Visa Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                Up-to-date visa requirements, digital nomad visas, and legal work information
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Time Zone Optimizer</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart suggestions for locations based on your client/team time zones and work schedule
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Nomad Destinations */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Top Digital Nomad 
              <span className="font-semibold block mt-2">Destinations 2024</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏝️</div>
                <h3 className="text-lg font-medium text-gray-900">Lisbon, Portugal</h3>
                <p className="text-sm text-gray-600 mt-2">Great WiFi • €1,200/mo • Nomad hub</p>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">WiFi: 95 Mbps avg</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🌴</div>
                <h3 className="text-lg font-medium text-gray-900">Canggu, Bali</h3>
                <p className="text-sm text-gray-600 mt-2">Beach life • $800/mo • Digital nomad mecca</p>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">WiFi: 50 Mbps avg</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🌮</div>
                <h3 className="text-lg font-medium text-gray-900">Mexico City</h3>
                <p className="text-sm text-gray-600 mt-2">Culture • $900/mo • Great food scene</p>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">WiFi: 80 Mbps avg</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏙️</div>
                <h3 className="text-lg font-medium text-gray-900">Tbilisi, Georgia</h3>
                <p className="text-sm text-gray-600 mt-2">1-year visa • $600/mo • EU time zone</p>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">WiFi: 70 Mbps avg</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Discover More Destinations
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Nomad Lifestyle Benefits */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Why Choose the 
              <span className="font-semibold block mt-2">Nomadic Lifestyle</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-2xl font-medium text-gray-900">Global Perspective</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Experience diverse cultures and broaden your worldview</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Build international networks and global business connections</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Gain cross-cultural communication and adaptation skills</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-2xl font-medium text-gray-900">Financial Freedom</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Leverage geographical arbitrage for better quality of life</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Reduce living expenses while maintaining income levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>No rent commitments or expensive city living costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Real Nomads, 
              <span className="font-semibold block mt-2">Real Stories</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">💻</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;This AI guide helped me find the perfect coworking spaces in 15 countries. The WiFi data was incredibly accurate and saved me countless hours.&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Alex R., Software Developer</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🌎</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;The cost calculator was a game-changer. I&apos;ve been living in Southeast Asia for 8 months spending 60% less than in San Francisco.&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Sarah M., Marketing Consultant</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🤝</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Found amazing nomad communities through this platform. Now I have friends and business partners in cities worldwide.&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- James K., Content Creator</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              Start Your Digital Nomad Journey Today
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              Join the growing community of location-independent professionals living life on their own terms
            </p>
            <Link 
              href="/nomad-calculator?lang=en&nomad=true"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Find Your Next Destination
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/en/travel-planning-app',
    'en',
    'Smart Travel Planning App | AI Itinerary Generator & Trip Planner',
    '📱 Revolutionary travel planning app that creates perfect itineraries instantly. Smart trip planner with AI-powered recommendations, real-time updates, and personalized travel experiences.',
    ['travel planning app', 'smart travel planner', 'AI itinerary generator', 'trip planning app', 'travel itinerary app', 'automated trip planner', 'intelligent travel app', 'personalized travel planner', 'smart trip organizer', 'AI travel assistant app', 'travel planning software', 'digital travel planner', 'TripRadio.AI']
  )
};

export default function TravelPlanningAppPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="travel planning app"
        pagePath="/en/travel-planning-app"
        title="Smart Travel Planning App | AI Itinerary Generator & Trip Planner"
        description="Revolutionary travel planning app that creates perfect itineraries instantly. Smart trip planner with AI-powered recommendations, real-time updates, and personalized travel experiences."
        features={['Instant Itinerary Generation', 'Smart Recommendations', 'Real-Time Updates', 'Budget Optimization', 'Offline Access', 'Free to Use']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              Smart Travel Planner • AI-Powered App
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Plan Perfect Trips 
              <span className="font-semibold block mt-2">In Seconds, Not Hours</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              The smartest travel planning app that creates personalized itineraries instantly. 
              AI technology meets intuitive design for effortless trip planning
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/trip-planner?lang=en&app=smart"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              Start Planning Free
            </Link>
            <Link 
              href="#how-it-works"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* App Problems */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Tired of Complex 
              <span className="font-semibold block mt-2">Travel Planning?</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📋</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Overwhelming Options</h3>
              <p className="text-gray-600">
                Too many apps, websites, and tools make planning more confusing than helpful
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏳</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Time-Consuming Process</h3>
              <p className="text-gray-600">
                Hours spent researching, comparing, and organizing scattered information into coherent plans
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Expensive Planning Tools</h3>
              <p className="text-gray-600">
                Premium travel apps cost monthly fees but still require manual work and provide generic suggestions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Revolutionary Travel Planning 
              <span className="font-semibold block mt-2">Made Simple</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🚀</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Instant Itinerary Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Get complete day-by-day travel plans in seconds, not hours of manual planning
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Smart Personalization</h3>
              <p className="text-gray-600 leading-relaxed">
                AI learns your preferences to suggest activities, restaurants, and experiences you&apos;ll actually love
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Budget Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatic budget tracking and smart suggestions to maximize your travel experiences within budget
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Real-Time Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                Dynamic adjustments based on weather, local events, opening hours, and real-time conditions
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Mobile-First Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your plans anywhere, with offline maps and guides that work without internet
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🆓</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Completely Free</h3>
              <p className="text-gray-600 leading-relaxed">
                No subscriptions, no premium features locked away - full access to all planning tools at no cost
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              From Idea to Itinerary 
              <span className="font-semibold block mt-2">In 3 Simple Steps</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">1</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Quick Setup</h3>
              <p className="text-gray-600">
                Tell us your destination, dates, budget, and travel style in a simple 2-minute conversation
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">2</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">AI Magic</h3>
              <p className="text-gray-600">
                Our AI instantly creates a personalized itinerary with optimized routes, timing, and recommendations
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-medium mx-auto mb-6">3</div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Travel & Enjoy</h3>
              <p className="text-gray-600">
                Your smart travel guide adapts in real-time, ensuring every moment of your trip is perfectly planned
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Benefits */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Why Smart Travelers Choose 
              <span className="font-semibold block mt-2">Our App</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-2xl font-medium text-gray-900">Lightning Fast</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Complete itineraries generated in under 30 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Instant modifications and re-planning on the go</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>No loading screens or waiting - everything happens immediately</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-medium text-gray-900">Perfectly Personalized</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Understands your unique travel preferences and style</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Learns from every trip to make better future recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Adapts to dietary restrictions, accessibility needs, and special interests</span>
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
              Real Travelers, 
              <span className="font-semibold block mt-2">Real Results</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🌟</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Best travel app I&apos;ve ever used! Planned a perfect 10-day Europe trip in minutes. Everything was so well-organized and personalized.&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Jessica H., Marketing Manager</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🚀</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Saved me 15+ hours of planning time. The AI suggestions were spot-on and I discovered places I never would have found myself.&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- David K., Software Developer</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">💝</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Finally a travel app that&apos;s actually free and works better than expensive alternatives. This is the future of travel planning!&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Maria S., Travel Blogger</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              Ready to Plan Your Best Trip Ever?
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of smart travelers who&apos;ve discovered effortless, personalized trip planning
            </p>
            <Link 
              href="/trip-planner?lang=en&app=smart"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Start Your Free Travel Plan
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
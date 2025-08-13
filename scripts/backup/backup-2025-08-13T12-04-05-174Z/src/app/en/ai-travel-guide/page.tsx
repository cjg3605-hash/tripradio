import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/en/ai-travel-guide',
    'en',
    'AI Travel Guide | Smart Travel Planning with AI Assistant',
    '🤖 Experience the future of travel with AI-powered personalized travel guides. Get instant recommendations, real-time insights, and customized itineraries for any destination worldwide.',
    ['AI travel guide', 'smart travel planning', 'travel AI assistant', 'personalized travel app', 'intelligent travel guide', 'AI tourism guide', 'automated travel planner', 'digital travel companion', 'AI-powered tourism', 'smart destination guide', 'travel technology', 'AI trip planner', 'TripRadio.AI']
  )
};

export default function AITravelGuidePage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="AI travel guide"
        pagePath="/en/ai-travel-guide"
        title="AI Travel Guide | Smart Travel Planning with AI Assistant"
        description="Experience the future of travel with AI-powered personalized travel guides. Get instant recommendations, real-time insights, and customized itineraries for any destination worldwide."
        features={['AI-Powered Insights', 'Real-Time Recommendations', 'Personalized Itineraries', 'Smart Destination Discovery', 'Multilingual Support', 'Completely Free']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              AI Travel Guide • Next-Generation Travel Planning
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Travel Smarter with 
              <span className="font-semibold block mt-2">AI-Powered Guides</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Discover personalized travel experiences with our intelligent AI guide that creates 
              custom itineraries, provides real-time insights, and uncovers hidden gems worldwide
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/?lang=en&ai=guide&personalized=true"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              Start Free AI Guide
            </Link>
            <Link 
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              Explore AI Features
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Traditional Travel Planning 
              <span className="font-semibold block mt-2">Challenges</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗺️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Information Overload</h3>
              <p className="text-gray-600">
                Too many options, conflicting reviews, and overwhelming destination choices make planning stressful
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⏰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Time-Consuming Research</h3>
              <p className="text-gray-600">
                Hours spent browsing websites, reading blogs, and comparing options without clear guidance
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Generic Recommendations</h3>
              <p className="text-gray-600">
                One-size-fits-all guides that don't match your interests, budget, or travel style
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solution Features */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI-Powered Travel 
              <span className="font-semibold block mt-2">Intelligence</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🧠</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Intelligent Personalization</h3>
              <p className="text-gray-600 leading-relaxed">
                AI analyzes your preferences, travel history, and interests to create perfectly tailored recommendations
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">⚡</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Real-Time Adaptation</h3>
              <p className="text-gray-600 leading-relaxed">
                Dynamic itinerary adjustments based on weather, local events, and real-time conditions
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💎</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Hidden Gem Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Uncover secret spots, local favorites, and authentic experiences that traditional guides miss
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌍</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Global Coverage</h3>
              <p className="text-gray-600 leading-relaxed">
                From major cities to remote destinations, get expert AI guidance anywhere in the world
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Natural Conversations</h3>
              <p className="text-gray-600 leading-relaxed">
                Ask questions naturally and get detailed, conversational responses from your AI travel companion
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Mobile-First Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your AI travel guide anytime, anywhere with our optimized mobile experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Advantage */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Why AI Travel Guides Are 
              <span className="font-semibold block mt-2">The Future</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-medium text-gray-900">Speed & Efficiency</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Get comprehensive travel plans in seconds, not hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Instant answers to any travel question, 24/7 availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>No waiting for human guides or delayed responses</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-medium text-gray-900">Perfect Personalization</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Adapts to your exact preferences and travel style</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Learns from your choices to improve recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Unlimited customization without extra costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Simple <span className="font-semibold">3-Step Process</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">Tell Us Your Destination</h3>
                    <p className="text-gray-600 mb-3">
                      Enter where you want to go - from famous cities to hidden villages, our AI knows them all.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 Example: "Paris, France" or "Hidden temples in Kyoto"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">Share Your Preferences</h3>
                    <p className="text-gray-600 mb-3">
                      Brief chat about your interests, budget, travel style, and any special requirements.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 AI learns: food preferences, activity level, cultural interests, budget range
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">Get Your AI Guide</h3>
                    <p className="text-gray-600 mb-3">
                      Receive your personalized travel guide with detailed recommendations and real-time support.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        💡 Includes: custom itinerary, local insights, hidden gems, safety tips, weather updates
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Travelers Love Our 
              <span className="font-semibold block mt-2">AI Guide Experience</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🗾</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "The AI found authentic local restaurants in Tokyo that I never would have discovered. It felt like having a local friend guide me!"
              </p>
              <p className="text-sm text-gray-500 text-center">- Sarah M., Digital Nomad</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🏛️</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "Perfect for my art history trip to Rome. The AI knew exactly which museums and hidden galleries matched my interests."
              </p>
              <p className="text-sm text-gray-500 text-center">- Michael R., Art Teacher</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🌍</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                "Saved me hours of planning time and gave me experiences I could never have planned myself. This is the future of travel!"
              </p>
              <p className="text-sm text-gray-500 text-center">- Emma L., Travel Blogger</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              Start Your AI-Powered Travel Adventure Today
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of travelers who have discovered smarter, more personalized ways to explore the world
            </p>
            <Link 
              href="/?lang=en&ai=guide&personalized=true"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Get Your Free AI Travel Guide
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
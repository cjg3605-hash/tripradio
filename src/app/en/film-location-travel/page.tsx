import { Metadata } from 'next';
import Link from 'next/link';
import { generateKeywordPageMetadata } from '@/lib/seo/metadata';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

export const metadata: Metadata = {
  ...generateKeywordPageMetadata(
    '/en/film-location-travel',
    'en',
    'Film Location Travel Guide | Set-Jetting & Movie Tourism AI',
    '🎬 Discover iconic filming locations worldwide with AI-powered guides. Visit famous movie sets, TV show locations, and behind-the-scenes stories from your favorite films.',
    ['film location travel', 'set jetting', 'movie tourism', 'filming locations', 'TV show locations', 'movie set visits', 'cinematic travel', 'Hollywood locations', 'film site tourism', 'movie destination guide', 'set-jetting travel', 'film tourism guide', 'TripRadio.AI']
  )
};

export default function FilmLocationTravelPage() {
  return (
    <>
      <KeywordPageSchema 
        keyword="film location travel"
        pagePath="/en/film-location-travel"
        title="Film Location Travel Guide | Set-Jetting & Movie Tourism AI"
        description="Discover iconic filming locations worldwide with AI-powered guides. Visit famous movie sets, TV show locations, and behind-the-scenes stories from your favorite films."
        features={['Famous Movie Sets', 'TV Show Locations', 'Behind-the-Scenes Stories', 'Interactive Map', 'Production Insights', 'Photo Opportunities']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              Set-Jetting Guide • Movie Tourism AI
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              Step Into Your 
              <span className="font-semibold block mt-2">Favorite Movies</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Discover iconic filming locations from blockbuster movies and beloved TV shows. 
              Get insider stories, production secrets, and the best photo spots with AI-powered guides
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/film-locations?lang=en&setjetting=true"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              Explore Film Locations
            </Link>
            <Link 
              href="#trending-locations"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              Trending Locations
            </Link>
          </div>
        </div>
      </section>

      {/* Set-Jetting Trend */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Set-Jetting: The Fastest Growing 
              <span className="font-semibold block mt-2">Travel Trend</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📈</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">340% Growth</h3>
              <p className="text-gray-600">
                Film location tourism has grown 340% since 2020, driven by streaming content popularity
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Millennial Driven</h3>
              <p className="text-gray-600">
                70% of millennials plan trips around movies and TV shows they&apos;ve watched
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Social Media Impact</h3>
              <p className="text-gray-600">
                Instagram and TikTok have made filming locations must-visit destinations for content creators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              AI-Powered Film Location 
              <span className="font-semibold block mt-2">Discovery</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎬</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Scene Recognition</h3>
              <p className="text-gray-600 leading-relaxed">
                AI identifies exact filming spots from movie scenes and provides detailed location information
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📖</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Behind-the-Scenes Stories</h3>
              <p className="text-gray-600 leading-relaxed">
                Fascinating production stories, actor anecdotes, and filming challenges at each location
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📸</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Perfect Photo Angles</h3>
              <p className="text-gray-600 leading-relaxed">
                Get the exact camera angles and positions used in famous scenes for Instagram-worthy shots
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗺️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Interactive Film Map</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore filming locations on an interactive map with scene previews and travel routes
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎭</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Multi-Genre Coverage</h3>
              <p className="text-gray-600 leading-relaxed">
                From Marvel blockbusters to indie films, romantic comedies to thrillers - all genres covered
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📺</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">TV Series Locations</h3>
              <p className="text-gray-600 leading-relaxed">
                Popular Netflix, HBO, and streaming series filming locations with episode-specific details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Locations */}
      <section id="trending-locations" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Most Popular Film 
              <span className="font-semibold block mt-2">Destinations 2024</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏰</div>
                <h3 className="text-lg font-medium text-gray-900">Dubrovnik, Croatia</h3>
                <p className="text-sm text-gray-600 mt-2">Game of Thrones • King&apos;s Landing scenes</p>
                <div className="mt-3">
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Hot Destination</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🌸</div>
                <h3 className="text-lg font-medium text-gray-900">Tokyo, Japan</h3>
                <p className="text-sm text-gray-600 mt-2">Lost in Translation • Sofia Coppola classics</p>
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trending</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🗿</div>
                <h3 className="text-lg font-medium text-gray-900">New Zealand</h3>
                <p className="text-sm text-gray-600 mt-2">Lord of the Rings • Hobbiton & more</p>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Classic</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🌊</div>
                <h3 className="text-lg font-medium text-gray-900">Santorini, Greece</h3>
                <p className="text-sm text-gray-600 mt-2">Mamma Mia! • Romantic comedy scenes</p>
                <div className="mt-3">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Romantic</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🌴</div>
                <h3 className="text-lg font-medium text-gray-900">Hawaii, USA</h3>
                <p className="text-sm text-gray-600 mt-2">Jurassic Park • Lost series locations</p>
                <div className="mt-3">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Adventure</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">🏙️</div>
                <h3 className="text-lg font-medium text-gray-900">New York City</h3>
                <p className="text-sm text-gray-600 mt-2">Marvel Movies • Countless film locations</p>
                <div className="mt-3">
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Superhero</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Explore All Film Locations
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Types of Film Tourism */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              Types of Film Location 
              <span className="font-semibold block mt-2">Experiences</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎪</div>
                <h3 className="text-2xl font-medium text-gray-900">Studio Tours</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Warner Bros Studio Tour (Harry Potter sets)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Universal Studios (Movie-themed attractions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Marvel Studios Campus experiences</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-2xl font-medium text-gray-900">Natural Locations</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Scottish Highlands (Harry Potter, Outlander)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Icelandic landscapes (Game of Thrones)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Jordanian deserts (Star Wars, Dune)</span>
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
              Set-Jetters Share Their 
              <span className="font-semibold block mt-2">Amazing Experiences</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">🏰</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Standing in the exact spot where my favorite Game of Thrones scenes were filmed was magical. The AI guide gave me details I never knew!&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Emma L., Fantasy Fan</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">📸</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Got the perfect Instagram shots at Lord of the Rings locations in New Zealand. The photo angle recommendations were spot-on!&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Jake M., Travel Photographer</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="text-4xl mb-6 text-center">❤️</div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">
                &ldquo;Proposed to my girlfriend at the Mamma Mia church in Santorini. The AI guide helped me plan the perfect romantic moment!&rdquo;
              </p>
              <p className="text-sm text-gray-500 text-center">- Carlos R., Movie Romantic</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              Start Your Cinematic Adventure Today
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              Step into your favorite movies and TV shows with personalized AI guides to iconic filming locations
            </p>
            <Link 
              href="/film-locations?lang=en&setjetting=true"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Discover Film Locations
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
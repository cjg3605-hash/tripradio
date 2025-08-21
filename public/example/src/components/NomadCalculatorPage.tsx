import { useState } from "react";
import { ArrowLeft, ChevronDown, Calculator, Globe, MapPin, Wifi, DollarSign, Coffee, Home, Plane, Users, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";

interface NomadCalculatorPageProps {
  onBackToHome: () => void;
}

interface CityData {
  id: string;
  name: string;
  country: string;
  nameKo: string;
  countryKo: string;
  accommodation: number;
  food: number;
  coworking: number;
  transport: number;
  entertainment: number;
  nomadScore: number;
  wifiSpeed: number;
  coworkingSpaces: number;
  visaFreeStay: number;
  costRange: string;
  highlights: string[];
  emoji: string;
}

const cities: CityData[] = [
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    nameKo: '리스본',
    countryKo: '포르투갈',
    accommodation: 600,
    food: 525,
    coworking: 68,
    transport: 40,
    entertainment: 200,
    nomadScore: 9.2,
    wifiSpeed: 95,
    coworkingSpaces: 45,
    visaFreeStay: 90,
    costRange: '€1200-2000',
    highlights: ['Perfect Timezone', 'Nomad Community', 'Mild Climate'],
    emoji: '🏛️'
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    nameKo: '베르린',
    countryKo: '독일',
    accommodation: 700,
    food: 550,
    coworking: 75,
    transport: 45,
    entertainment: 230,
    nomadScore: 9.0,
    wifiSpeed: 88,
    coworkingSpaces: 62,
    visaFreeStay: 90,
    costRange: '€1500-2500',
    highlights: ['Startup Hub', 'Rich Culture', 'Beer Paradise'],
    emoji: '🍺'
  },
  {
    id: 'canggu',
    name: 'Canggu',
    country: 'Indonesia',
    nameKo: '창구',
    countryKo: '인도네시아',
    accommodation: 400,
    food: 200,
    coworking: 45,
    transport: 25,
    entertainment: 130,
    nomadScore: 8.8,
    wifiSpeed: 50,
    coworkingSpaces: 28,
    visaFreeStay: 30,
    costRange: '$800-1500',
    highlights: ['Low Cost Living', 'Beach Life', 'Surfing Paradise'],
    emoji: '🏄‍♂️'
  },
  {
    id: 'chiang-mai',
    name: 'Chiang Mai',
    country: 'Thailand',
    nameKo: '치앙마이',
    countryKo: '태국',
    accommodation: 350,
    food: 180,
    coworking: 35,
    transport: 20,
    entertainment: 115,
    nomadScore: 8.5,
    wifiSpeed: 45,
    coworkingSpaces: 22,
    visaFreeStay: 30,
    costRange: '$600-1200',
    highlights: ['Ultra Low Cost', 'Delicious Food', 'Friendly People'],
    emoji: '🛺'
  },
  {
    id: 'ho-chi-minh',
    name: 'Ho Chi Minh',
    country: 'Vietnam',
    nameKo: '호치민',
    countryKo: '베트남',
    accommodation: 380,
    food: 220,
    coworking: 40,
    transport: 25,
    entertainment: 135,
    nomadScore: 8.3,
    wifiSpeed: 55,
    coworkingSpaces: 18,
    visaFreeStay: 15,
    costRange: '$700-1300',
    highlights: ['Affordable Cost', 'Vibrant City', 'Delicious Food'],
    emoji: '🍜'
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    country: 'Mexico',
    nameKo: '멕시코시티',
    countryKo: '멕시코',
    accommodation: 450,
    food: 280,
    coworking: 55,
    transport: 30,
    entertainment: 185,
    nomadScore: 8.4,
    wifiSpeed: 65,
    coworkingSpaces: 35,
    visaFreeStay: 180,
    costRange: '$900-1600',
    highlights: ['Rich Culture', 'Delicious Food', 'Art & Design'],
    emoji: '🌮'
  }
];

export function NomadCalculatorPage({ onBackToHome }: NomadCalculatorPageProps) {
  const [selectedCity, setSelectedCity] = useState<CityData>(cities[0]);
  const [workingDays, setWorkingDays] = useState<number[]>([22]);
  const [coworkingUsage, setCoworkingUsage] = useState<number[]>([10]);
  const [accommodationType, setAccommodationType] = useState<string>('apartment');
  const [diningOut, setDiningOut] = useState<number[]>([15]);
  const [entertainmentLevel, setEntertainmentLevel] = useState<number[]>([50]);

  const accommodationMultiplier = accommodationType === 'apartment' ? 1 : 
                                  accommodationType === 'shared' ? 0.6 : 
                                  accommodationType === 'hotel' ? 1.4 : 1;

  const calculateTotal = () => {
    const accommodation = selectedCity.accommodation * accommodationMultiplier;
    const food = selectedCity.food * (diningOut[0] / 15);
    const coworking = (selectedCity.coworking / 10) * coworkingUsage[0];
    const transport = selectedCity.transport;
    const entertainment = selectedCity.entertainment * (entertainmentLevel[0] / 50);

    return Math.round(accommodation + food + coworking + transport + entertainment);
  };

  const totalCost = calculateTotal();

  const tips = [
    {
      title: 'Budget Planning',
      description: 'Keep 20-30% buffer on your calculated budget for unexpected expenses. Consider exchange rate fluctuations, medical costs, and emergency situations.',
      icon: Calculator
    },
    {
      title: 'Local Networking',
      description: 'Network with other nomads and participate in local communities. Utilize Facebook groups, Meetup, and coworking space events.',
      icon: Users
    },
    {
      title: 'Visa Research',
      description: 'Research visa requirements thoroughly before traveling. Some countries offer special digital nomad visas with extended stays.',
      icon: Plane
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-400 hover:text-black" 
              onClick={onBackToHome}
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Go Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-sm">English</Button>
              <Button variant="ghost" size="sm" className="text-sm">History</Button>
              <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 bg-neutral-100 text-neutral-800">
            For Digital Nomads
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Nomad Living Cost Calculator
          </h1>
          
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            당신의 라이프스타일에 맞는 도시를 찾아보세요
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Settings Panel */}
            <Card className="p-8 bg-white border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">Cost Calculation Settings</h2>
              
              <div className="space-y-6">
                {/* City Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Select City</label>
                  <div className="relative">
                    <select
                      value={selectedCity.id}
                      onChange={(e) => setSelectedCity(cities.find(c => c.id === e.target.value) || cities[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                    >
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.nameKo}, {city.countryKo}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Working Days */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Working Days ({workingDays[0]}days/month)
                  </label>
                  <Slider
                    value={workingDays}
                    onValueChange={setWorkingDays}
                    max={30}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Coworking Usage */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Coworking Usage ({coworkingUsage[0]}days/month)
                  </label>
                  <Slider
                    value={coworkingUsage}
                    onValueChange={setCoworkingUsage}
                    max={25}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Accommodation Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Accommodation Type</label>
                  <div className="relative">
                    <select
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white"
                    >
                      <option value="apartment">Apartment/Studio</option>
                      <option value="shared">Shared Room</option>
                      <option value="hotel">Hotel/Boutique</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Dining Out */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Dining Out Frequency ({diningOut[0]}times/week)
                  </label>
                  <Slider
                    value={diningOut}
                    onValueChange={setDiningOut}
                    max={21}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Entertainment Level */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Entertainment Level ({entertainmentLevel[0]}%)
                  </label>
                  <Slider
                    value={entertainmentLevel}
                    onValueChange={setEntertainmentLevel}
                    max={100}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Results Panel */}
            <Card className="p-8 bg-white border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black">Estimated Monthly Cost</h2>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">{selectedCity.nameKo}, {selectedCity.countryKo}</p>
                  <p className="text-3xl font-bold text-black">${totalCost}/month</p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-neutral-600">Accommodation</span>
                  <span className="font-medium text-black">${Math.round(selectedCity.accommodation * accommodationMultiplier)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-neutral-600">Food</span>
                  <span className="font-medium text-black">${Math.round(selectedCity.food * (diningOut[0] / 15))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-neutral-600">Coworking</span>
                  <span className="font-medium text-black">${Math.round((selectedCity.coworking / 10) * coworkingUsage[0])}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-neutral-600">Transport</span>
                  <span className="font-medium text-black">${selectedCity.transport}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-neutral-600">Entertainment</span>
                  <span className="font-medium text-black">${Math.round(selectedCity.entertainment * (entertainmentLevel[0] / 50))}</span>
                </div>
              </div>

              {/* City Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-black mb-4">City Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Nomad Score</p>
                    <p className="font-medium text-black">{selectedCity.nomadScore}/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">WiFi Speed</p>
                    <p className="font-medium text-black">{selectedCity.wifiSpeed}Mbps</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Coworking Spaces</p>
                    <p className="font-medium text-black">{selectedCity.coworkingSpaces}locations</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Visa-free Stay</p>
                    <p className="font-medium text-black">{selectedCity.visaFreeStay}days</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Popular Nomad Cities</h2>
            <p className="text-xl text-neutral-600">Explore nomad-friendly cities from around the world</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <Card 
                key={city.id} 
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedCity.id === city.id ? 'ring-2 ring-black' : 'border-gray-200'
                }`}
                onClick={() => setSelectedCity(city)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-black flex items-center space-x-2">
                      <span className="text-2xl">{city.emoji}</span>
                      <span>{city.nameKo}</span>
                    </h3>
                    <p className="text-sm text-neutral-600">{city.countryKo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Monthly Estimated Cost</p>
                    <p className="font-bold text-black">{city.costRange}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {city.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-neutral-400 rounded-full"></div>
                      <span className="text-sm text-neutral-600">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Nomad Score: {city.nomadScore}/10</span>
                    <span className="text-neutral-500">WiFi Average: {city.wifiSpeed}Mbps</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Nomad Living Tips</h2>
            <p className="text-xl text-neutral-600">Practical advice for successful digital nomad life</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tips.map((tip, index) => (
              <Card key={index} className="p-8 bg-white border-gray-200 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <tip.icon className="w-6 h-6 text-neutral-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{tip.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{tip.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            계획부터 여행까지, 모든 것을 한 곳에서
          </h2>
          
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            노마드 생활비 계산부터 실시간 여행 가이드까지, TripRadio.AI와 함께 완벽한 여행을 준비하세요
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">정확한 비용 계산</h3>
              <p className="text-sm text-neutral-300">
                실제 데이터 기반으로 정확한 생활비를 미리 계산해보세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">맞춤 여행 계획</h3>
              <p className="text-sm text-neutral-300">
                AI가 당신의 라이프스타일에 맞는 완벽한 여행 계획을 생성합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">실시간 가이드</h3>
              <p className="text-sm text-neutral-300">
                현지에서 실시간 AI 오디오 가이드로 더 깊이 있는 여행을 경험하세요
              </p>
            </div>
          </div>

          <Button
            onClick={onBackToHome}
            className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            통합 여행 서비스 체험하기
          </Button>
        </div>
      </section>
    </div>
  );
}
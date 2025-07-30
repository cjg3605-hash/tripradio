import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  User, 
  Globe, 
  Download, 
  Settings, 
  Bell,
  Moon,
  Sun,
  Languages,
  Bookmark,
  Headphones,
  HelpCircle,
  Info,
  LogOut
} from 'lucide-react';
import { useApp, useTranslation, Language } from '../App';

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'ko' as Language, name: 'Korean', nativeName: '한국어' },
  { code: 'ja' as Language, name: 'Japanese', nativeName: '日本語' },
  { code: 'zh' as Language, name: 'Chinese', nativeName: '中文' },
  { code: 'es' as Language, name: 'Spanish', nativeName: 'Español' }
];

export default function ProfileSettings() {
  const { userPreferences, setUserPreferences, setIsOnboarded, setCurrentScreen } = useApp();
  const { t, language } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    if (userPreferences) {
      setUserPreferences({
        ...userPreferences,
        language: newLanguage
      });
    }
    setShowLanguageSelector(false);
  };

  const resetOnboarding = () => {
    setIsOnboarded(false);
  };

  if (!userPreferences) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (showLanguageSelector) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowLanguageSelector(false)}
            >
              <Globe className="w-5 h-5" />
            </Button>
            <h1>Select Language</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {languages.map((lang) => (
              <Card
                key={lang.code}
                className={`cursor-pointer transition-all ${
                  language === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-sm text-muted-foreground">{lang.name}</p>
                  </div>
                  {language === lang.code && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1>Profile & Settings</h1>
            <p className="text-sm text-muted-foreground">Personalize your experience</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {userPreferences.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Age Group</p>
                <p className="font-medium capitalize">{userPreferences.ageGroup}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Knowledge Level</p>
                <p className="font-medium capitalize">{userPreferences.knowledgeLevel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tour Duration</p>
                <p className="font-medium capitalize">{userPreferences.tourDuration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tour Style</p>
                <p className="font-medium capitalize">{userPreferences.tourStyle}</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={resetOnboarding}
            >
              Update Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">App Language</p>
                <p className="text-sm text-muted-foreground">
                  {languages.find(l => l.code === language)?.nativeName}
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowLanguageSelector(true)}
              >
                <Globe className="w-4 h-4 mr-2" />
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch to dark theme</p>
              </div>
              <Switch 
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get updates about new guides</p>
              </div>
              <Switch 
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Download</p>
                <p className="text-sm text-muted-foreground">Download guides for offline use</p>
              </div>
              <Switch 
                checked={autoDownload}
                onCheckedChange={setAutoDownload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              <Bookmark className="w-4 h-4 mr-3" />
              Saved Guides
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Download className="w-4 h-4 mr-3" />
              Downloaded Content
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Headphones className="w-4 h-4 mr-3" />
              Audio History
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-3" />
              Help & FAQ
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Info className="w-4 h-4 mr-3" />
              About NAVI
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive">
              <LogOut className="w-4 h-4 mr-3" />
              Reset App Data
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>NAVI - AI Travel Guide</p>
          <p>Version 1.0.0</p>
          <p>Made with ❤️ for travelers worldwide</p>
        </div>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}
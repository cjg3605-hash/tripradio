import { Search, Menu, X, Globe, History, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold text-black">TripRadio.AI</h1>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-1">
              <Globe size={16} />
              <span className="text-sm">KO</span>
            </Button>

            {/* History */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <History size={16} />
            </Button>

            {/* Login */}
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-1">
              <User size={16} />
              <span className="text-sm">로그인</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="px-4 py-4 space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Globe size={16} className="mr-2" />
              언어 설정
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <History size={16} className="mr-2" />
              히스토리
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User size={16} className="mr-2" />
              로그인
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
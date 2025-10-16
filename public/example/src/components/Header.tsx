import { Globe, Clock, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onLoginClick?: () => void;
  onMyPageClick?: () => void;
}

export function Header({ onLoginClick, onMyPageClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-sm">
              <Globe className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">English</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">History</span>
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm flex items-center space-x-2"
                  onClick={onMyPageClick}
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    {user?.image ? (
                      <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm text-gray-600 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm"
                onClick={onLoginClick}
              >
                <User className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
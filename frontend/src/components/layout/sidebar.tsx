import { Hospital, ChartLine, Users, FileText, List, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const { data: hospitalSettings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const navigation = [
    { name: "Dashboard", href: "/", icon: ChartLine },
    { name: "Patient Management", href: "/patients", icon: Users },
    { name: "Billing & Invoices", href: "/billing", icon: FileText },
    { name: "Services Management", href: "/services", icon: List },
    { name: "Hospital Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Hospital Logo & Name Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center">
            <Hospital className="text-white text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {(hospitalSettings as any)?.name || "City General Hospital"}
            </h3>
            <p className="text-sm text-gray-500">Billing System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 flex-1">
        <div className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Button
                key={item.name}
                onClick={() => setLocation(item.href)}
                variant="ghost"
                className={`w-full justify-start ${
                  isActive
                    ? "bg-medical-blue text-white hover:bg-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

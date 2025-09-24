
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Plus, BarChart3, Package, LogOut, User as UserIcon, Wrench, CheckCircle } from "lucide-react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "New Batch",
    url: createPageUrl("BatchEntry"),
    icon: Plus,
  },
  {
    title: "Scan Items",
    url: createPageUrl("Scanner"),
    icon: Package,
  },
  {
    title: "Install Items",
    url: createPageUrl("Installation"),
    icon: Wrench,
  },
  {
    title: "Inspection",
    url: createPageUrl("Inspection"),
    icon: CheckCircle,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --railway-blue: #003f7f;
          --railway-light-blue: #4a90e2;
          --railway-orange: #ff6b35;
          --railway-gray: #f8f9fa;
          --text-primary: #212529;
          --text-secondary: #6c757d;
        }
        
        .railway-gradient {
          background: linear-gradient(135deg, var(--railway-blue) 0%, var(--railway-light-blue) 100%);
        }
        
        .railway-card {
          background: white;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .railway-button {
          background: var(--railway-blue);
          transition: all 0.3s ease;
        }
        
        .railway-button:hover {
          background: var(--railway-light-blue);
          transform: translateY(-1px);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--railway-gray)' }}>
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b70f15c02a8c242ff1d651/4f6c9fa05_image.png" alt="QRail Logo" className="w-12 h-12"/>
              <div>
                <h2 className="font-bold text-xl text-gray-800">QRail</h2>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-2 py-2" style={{ color: 'var(--text-secondary)' }}>
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg mb-2 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 text-base">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3 p-3 text-left">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{user.full_name || user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role || 'Worker'}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogout} className="text-blue-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 py-3 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b70f15c02a8c242ff1d651/4f6c9fa05_image.png" alt="QRail Logo" className="h-8 w-auto"/>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout} className="text-blue-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : <div className="w-8"></div>}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Shield, Users } from "lucide-react";

export default function AuthWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--railway-gray)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
        <style>{`
          :root {
            --railway-blue: #003f7f;
            --railway-light-blue: #4a90e2;
            --railway-gray: #f8f9fa;
          }
          .railway-gradient {
            background: linear-gradient(135deg, var(--railway-blue) 0%, var(--railway-light-blue) 100%);
          }
          .railway-card {
            background: white;
            border: 1px solid #e9ecef;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
          }
          .railway-button {
            background: var(--railway-blue);
            transition: all 0.3s ease;
          }
          .railway-button:hover {
            background: var(--railway-light-blue);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 63, 127, 0.3);
          }
        `}</style>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b70f15c02a8c242ff1d651/4f6c9fa05_image.png" alt="QRail Logo" className="w-24 h-24 mx-auto mb-4"/>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--railway-blue)' }}>
              QRail Inventory
            </h1>
            <p className="text-gray-600">Secure access for authorized personnel</p>
          </div>

          {/* Login Card */}
          <Card className="railway-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Worker Login Required
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">
                Please sign in to access the inventory system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={handleLogin}
                className="w-full railway-button text-white py-4 text-lg font-medium rounded-lg"
              >
                <LogIn className="w-5 h-5 mr-3" />
                Sign In
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Only authorized railway personnel can access this system
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="railway-card mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-center mb-4 flex items-center justify-center gap-2">
                 <Users className="w-5 h-5"/>
                 System Features
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>QR Code scanning for inventory tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Batch management across all railway zones</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Real-time reporting and analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Secure multi-user access control</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return children;
}
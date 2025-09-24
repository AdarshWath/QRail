import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Batch } from "@/entities/Batch";
import { InventoryItem } from "@/entities/InventoryItem";
import { User } from "@/entities/User";
import AuthWrapper from "../components/AuthWrapper";
import { Plus, Package, BarChart3, QrCode, Users, MapPin, TrendingUp, CheckCircle, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function HomeContent() {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalItems: 0,
    activeBatches: 0,
    completedBatches: 0,
    installedItems: 0
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadStats();
    loadUser();
  }, []);

  const loadStats = async () => {
    const [batches, items] = await Promise.all([
      Batch.list(),
      InventoryItem.list()
    ]);

    setStats({
      totalBatches: batches.length,
      totalItems: items.length,
      activeBatches: batches.filter(b => b.batch_status === 'active').length,
      completedBatches: batches.filter(b => b.batch_status === 'completed').length,
      installedItems: items.filter(i => i.status === 'installed').length
    });
  };

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--railway-blue)' }}>
            QRail Inventory System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Simple, fast inventory management for railway depots. Scan QR codes, track batches, and manage installations with ease.
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Welcome, {user.full_name || user.email}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <Card className="railway-card text-center">
            <CardContent className="p-4">
              <Package className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </CardContent>
          </Card>
          <Card className="railway-card text-center">
            <CardContent className="p-4">
              <TrendingUp className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{stats.totalBatches}</p>
              <p className="text-sm text-gray-600">Total Batches</p>
            </CardContent>
          </Card>
          <Card className="railway-card text-center">
            <CardContent className="p-4">
              <QrCode className="w-6 h-6 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{stats.activeBatches}</p>
              <p className="text-sm text-gray-600">Active Batches</p>
            </CardContent>
          </Card>
          <Card className="railway-card text-center">
            <CardContent className="p-4">
              <CheckCircle className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{stats.completedBatches}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="railway-card text-center">
            <CardContent className="p-4">
              <Wrench className="w-6 h-6 mx-auto text-red-600 mb-2" />
              <p className="text-2xl font-bold">{stats.installedItems}</p>
              <p className="text-sm text-gray-600">Installed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Link to={createPageUrl("BatchEntry")} className="block">
            <Card className="railway-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto railway-gradient rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: 'var(--railway-blue)' }}>
                  New Batch Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Start a new inventory batch with vendor details and location.
                </p>
                <Button className="railway-button text-white px-6 py-2 rounded-lg">
                  Start Batch
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Scanner")} className="block">
            <Card className="railway-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-green-700">
                  QR Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Scan multiple QR codes quickly for inventory tracking.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                  Start Scanning
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Installation")} className="block">
            <Card className="railway-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-red-700">
                  Install Items
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Mark items as installed with location and voice notes.
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                  Install Items
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Inspection")} className="block">
            <Card className="railway-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto bg-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-orange-700">
                  Item Inspection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Inspect items and report any issues or complaints.
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg">
                  Start Inspection
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Worker Friendly</h3>
              <p className="text-gray-600">Large buttons and simple interface designed for field workers</p>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto text-green-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Location Tracking</h3>
              <p className="text-gray-600">Automatic GPS location capture during item installation</p>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Voice Notes</h3>
              <p className="text-gray-600">Record voice remarks and notes during installation</p>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-orange-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Quality Control</h3>
              <p className="text-gray-600">Comprehensive inspection system with complaint tracking</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <HomeContent />
    </AuthWrapper>
  );
}

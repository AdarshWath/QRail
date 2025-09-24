import React, { useState, useEffect } from "react";
import { Batch } from "@/entities/Batch";
import { InventoryItem } from "@/entities/InventoryItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, Package, Building, MapPin, Calendar, Activity } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

const COLORS = ['#003f7f', '#4a90e2', '#ff6b35', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]);
  const [timeFilter, setTimeFilter] = useState("30");
  const [zoneFilter, setZoneFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [batchData, itemData] = await Promise.all([
      Batch.list("-created_date"),
      InventoryItem.list("-scan_timestamp")
    ]);
    setBatches(batchData);
    setItems(itemData);
  };

  // Filter data based on time and zone
  const getFilteredData = () => {
    const cutoffDate = subDays(new Date(), parseInt(timeFilter));
    
    let filteredBatches = batches.filter(batch => 
      isAfter(new Date(batch.created_date), cutoffDate)
    );

    if (zoneFilter !== "all") {
      filteredBatches = filteredBatches.filter(batch => batch.railway_zone === zoneFilter);
    }

    const batchIds = filteredBatches.map(b => b.id);
    const filteredItems = items.filter(item => batchIds.includes(item.batch_id));

    return { filteredBatches, filteredItems };
  };

  // Analytics calculations
  const getAnalyticsData = () => {
    const { filteredBatches, filteredItems } = getFilteredData();

    // Items by zone
    const zoneData = {};
    filteredBatches.forEach(batch => {
      const zone = batch.railway_zone;
      const itemCount = filteredItems.filter(item => item.batch_id === batch.id).length;
      zoneData[zone] = (zoneData[zone] || 0) + itemCount;
    });

    const itemsByZone = Object.entries(zoneData).map(([zone, count]) => ({
      zone: zone.replace(/_/g, ' '),
      items: count
    }));

    // Items by vendor
    const vendorData = {};
    filteredBatches.forEach(batch => {
      const vendor = batch.vendor_name;
      const itemCount = filteredItems.filter(item => item.batch_id === batch.id).length;
      vendorData[vendor] = (vendorData[vendor] || 0) + itemCount;
    });

    const itemsByVendor = Object.entries(vendorData)
      .map(([vendor, count]) => ({ vendor, items: count }))
      .sort((a, b) => b.items - a.items)
      .slice(0, 6);

    // Status distribution
    const statusData = {};
    filteredItems.forEach(item => {
      statusData[item.status] = (statusData[item.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusData).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));

    // Daily scanning activity
    const dailyActivity = {};
    filteredItems.forEach(item => {
      const date = format(new Date(item.scan_timestamp), 'MMM dd');
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    const scanningActivity = Object.entries(dailyActivity)
      .map(([date, count]) => ({ date, scans: count }))
      .slice(-14); // Last 14 days

    return {
      itemsByZone,
      itemsByVendor,
      statusDistribution,
      scanningActivity,
      totalItems: filteredItems.length,
      totalBatches: filteredBatches.length,
      completedBatches: filteredBatches.filter(b => b.batch_status === 'completed').length,
      activeBatches: filteredBatches.filter(b => b.batch_status === 'active').length
    };
  };

  const analytics = getAnalyticsData();
  const availableZones = [...new Set(batches.map(b => b.railway_zone))];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--railway-blue)' }}>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Insights and trends for inventory management</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {availableZones.map(zone => (
                  <SelectItem key={zone} value={zone}>
                    {zone.replace(/_/g, ' ')} Railway
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="railway-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{analytics.totalItems}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold">{analytics.totalBatches}</p>
                </div>
                <Building className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Batches</p>
                  <p className="text-2xl font-bold">{analytics.activeBatches}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{analytics.completedBatches}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Items by Zone */}
          <Card className="railway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Items by Railway Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.itemsByZone}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="items" fill="var(--railway-blue)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="railway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lower Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Vendors */}
          <Card className="railway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Top Vendors by Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.itemsByVendor} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="vendor" type="category" width={120} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="items" fill="var(--railway-light-blue)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Scanning Activity */}
          <Card className="railway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Scanning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.scanningActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="var(--railway-blue)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--railway-blue)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Package, MapPin, Building } from "lucide-react";
import { format } from "date-fns";

const commonManufacturers = [
  { name: "Balaji Railroad Systems", code: "BRS" },
  { name: "Indian Railway Manufacturing", code: "IRM" },
  { name: "Rail Infrastructure Limited", code: "RIL" },
  { name: "Metro Rail Corporation", code: "MRC" },
  { name: "Railway Equipment Company", code: "REC" },
];

const railwayZones = [
  "Central", "Western", "Eastern", "Northern", "Southern", 
  "North_Eastern", "Northeast_Frontier", "East_Central", 
  "East_Coast", "North_Central", "North_Western", 
  "South_Central", "South_Eastern", "South_Western", "West_Central"
];

const warrantyOptions = [
  { value: "6_months", label: "6 Months" },
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "3_years", label: "3 Years" },
];

export default function BatchForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    vendor_name: "",
    manufacturer_code: "",
    date_received: new Date(),
    warranty_period: "1_year",
    railway_zone: "",
    division: "",
    depot_name: "",
    product_id: "",
  });

  const handleVendorChange = (vendorName) => {
    const manufacturer = commonManufacturers.find(m => m.name === vendorName);
    setFormData(prev => ({
      ...prev,
      vendor_name: vendorName,
      manufacturer_code: manufacturer ? manufacturer.code : ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="railway-card shadow-lg">
      <CardHeader className="text-center railway-gradient text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Package className="w-6 h-6" /> {/* Keeping Package icon as a placeholder for the QRail logo */}
          QRail: Batch Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vendor Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Vendor Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-base font-medium">
                  Vendor/Manufacturer Name
                </Label>
                <Select value={formData.vendor_name} onValueChange={handleVendorChange}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonManufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.code} value={manufacturer.name}>
                        {manufacturer.name} ({manufacturer.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or type custom vendor name"
                  value={formData.vendor_name}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer_code" className="text-base font-medium">
                  Manufacturer Code
                </Label>
                <Input
                  id="manufacturer_code"
                  value={formData.manufacturer_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer_code: e.target.value.toUpperCase() }))}
                  placeholder="Enter 3-letter code"
                  maxLength={3}
                  className="h-12 text-base font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product & Date Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Product & Date Information</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product_id" className="text-base font-medium">
                  Product ID
                </Label>
                <Input
                  id="product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                  placeholder="e.g., 12"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Date Received</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 text-base justify-start w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date_received, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_received}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date_received: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Warranty Period</Label>
                <Select value={formData.warranty_period} onValueChange={(value) => setFormData(prev => ({ ...prev, warranty_period: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warrantyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold">Storage Location</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">Railway Zone</Label>
                <Select value={formData.railway_zone} onValueChange={(value) => setFormData(prev => ({ ...prev, railway_zone: value }))}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {railwayZones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone.replace(/_/g, ' ')} Railway
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-base font-medium">
                  Division
                </Label>
                <Input
                  id="division"
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  placeholder="e.g., Bhusawal"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depot_name" className="text-base font-medium">
                  Depot Name
                </Label>
                <Input
                  id="depot_name"
                  value={formData.depot_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, depot_name: e.target.value }))}
                  placeholder="Enter depot name"
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button type="submit" className="railway-button text-white px-12 py-4 text-xl rounded-lg hover:shadow-lg transition-all">
              <Package className="w-6 h-6 mr-3" />
              Start Scanning Items
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

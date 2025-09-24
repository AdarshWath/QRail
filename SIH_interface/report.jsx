
import React, { useState, useEffect } from "react";
import { Batch } from "@/entities/Batch";
import { InventoryItem } from "@/entities/InventoryItem";
import AuthWrapper from "../components/AuthWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Search, Filter, Package, CheckCircle } from "lucide-react";
import { format } from "date-fns";

function ReportsContent() {
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredItems = items.filter(item => {
    const batchMatch = selectedBatch === "all" || item.batch_id === selectedBatch;
    const searchMatch = searchTerm === "" || 
      item.generated_id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    
    return batchMatch && searchMatch && statusMatch;
  });

  const getBatchInfo = (batchId) => {
    return batches.find(b => b.id === batchId);
  };

  const exportToCSV = () => {
    const headers = ["Generated ID", "Batch", "Vendor", "Scan Number", "Status", "Scan Date"];
    const csvData = filteredItems.map(item => {
      const batch = getBatchInfo(item.batch_id);
      return [
        item.generated_id,
        batch?.vendor_name || "Unknown",
        batch?.vendor_name || "Unknown", // The original code had vendor_name twice here. Preserving this behavior.
        item.scan_number,
        item.status,
        format(new Date(item.scan_timestamp), 'yyyy-MM-dd HH:mm:ss')
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scanned": return "bg-blue-100 text-blue-800";
      case "verified": return "bg-green-100 text-green-800";
      case "damaged": return "bg-red-100 text-red-800";
      case "missing": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalItems = items.length;
  const completedBatches = batches.filter(b => b.batch_status === "completed").length;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--railway-blue)' }}>
              Reports & Data
            </h1>
          </div>
          <Button onClick={exportToCSV} className="railway-button text-white">
            <Download className="w-5 h-5 mr-2" />
            Export to CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto text-blue-600 mb-3" />
              <h3 className="text-2xl font-bold mb-1">{totalItems}</h3>
              <p className="text-gray-600">Total Items Scanned</p>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-3" />
              <h3 className="text-2xl font-bold mb-1">{completedBatches}</h3>
              <p className="text-gray-600">Completed Batches</p>
            </CardContent>
          </Card>

          <Card className="railway-card">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 mx-auto text-purple-600 mb-3" />
              <h3 className="text-2xl font-bold mb-1">{batches.length}</h3>
              <p className="text-gray-600">Total Batches</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="railway-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search by ID</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Enter inventory ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="All batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.vendor_name} - {format(new Date(batch.created_date), 'dd/MM/yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scanned">Scanned</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedBatch("all");
                    setStatusFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="railway-card">
          <CardHeader>
            <CardTitle>
              Inventory Items ({filteredItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Generated ID</TableHead>
                    <TableHead>Batch Info</TableHead>
                    <TableHead>Scan #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scan Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const batch = getBatchInfo(item.batch_id);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium">
                          {item.generated_id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{batch?.vendor_name || "Unknown"}</p>
                            <p className="text-sm text-gray-600">
                              {batch?.railway_zone} - {batch?.division}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.scan_number}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.scan_timestamp), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3" />
                  <p>No items found matching the current filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <AuthWrapper>
      <ReportsContent />
    </AuthWrapper>
  );
}

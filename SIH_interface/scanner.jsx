import React, { useState, useEffect, useCallback } from "react";
import { Batch } from "@/entities/Batch";
import { InventoryItem } from "@/entities/InventoryItem";
import AuthWrapper from "../components/AuthWrapper";
import LiveScanner from "../components/LiveScanner";
import BatchSelector from "../components/BatchSelector";
import ScanLog from "../components/ScanLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, CheckCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

function ScannerContent() {
  const navigate = useNavigate();
  const [activeBatch, setActiveBatch] = useState(null);
  const [scanLog, setScanLog] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const loadExistingItems = useCallback(async (batchId) => {
    const items = await InventoryItem.filter({ batch_id: batchId }, "-scan_timestamp");
    setScanLog(items);
    setScanCount(items.length);
  }, []);

  useEffect(() => {
    const loadActiveBatches = async () => {
      const batches = await Batch.filter({ batch_status: "active" }, "-created_date", 1);
      if (batches.length > 0) {
        const currentBatch = batches[0];
        setActiveBatch(currentBatch);
        loadExistingItems(currentBatch.id);
      }
    };

    loadActiveBatches();
  }, [loadExistingItems]);

  const generateInventoryId = (batch, scanNumber) => {
    const date = format(new Date(batch.date_received), 'ddMMyyyy');
    const paddedScanNumber = scanNumber.toString().padStart(4, '0');
    return `${batch.manufacturer_code}${date}${batch.product_id}${paddedScanNumber}`;
  };

  const handleQRScan = async (qrData) => {
    if (!activeBatch) return;

    const nextScanNumber = scanCount + 1;
    const generatedId = generateInventoryId(activeBatch, nextScanNumber);

    const newItem = {
      batch_id: activeBatch.id,
      generated_id: generatedId,
      qr_code_data: qrData,
      scan_number: nextScanNumber,
      scan_timestamp: new Date().toISOString(),
      status: "scanned"
    };

    try {
      await InventoryItem.create(newItem);
      setScanLog(prev => [newItem, ...prev]);
      setScanCount(nextScanNumber);
      
      // Update batch total
      await Batch.update(activeBatch.id, { 
        total_items_scanned: nextScanNumber,
        batch_status: "scanning"
      });
    } catch (error) {
      console.error("Error saving scanned item:", error);
    }
  };

  const handleFinishBatch = async () => {
    if (!activeBatch) return;
    
    await Batch.update(activeBatch.id, { batch_status: "completed" });
    navigate(createPageUrl("Analytics"));
  };

  const undoLastScan = async () => {
    if (scanLog.length === 0) return;
    
    const lastItem = scanLog[0];
    // Assuming the item has an 'id' property used for deletion
    await InventoryItem.delete(lastItem.id); 
    setScanLog(prev => prev.slice(1));
    setScanCount(prev => prev - 1);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <img src="/qrail-logo.png" alt="QRail Logo" className="h-10 md:h-12" /> {/* Assuming logo is in public folder */}
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--railway-blue)' }}>
              QRail
            </h1>
          </div>
        </div>

        {!activeBatch ? (
          <BatchSelector onBatchSelect={setActiveBatch} />
        ) : (
          <div className="space-y-6">
            {/* Batch Info Header */}
            <Card className="railway-card">
              <CardHeader className="railway-gradient text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Active Batch Information
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Items Scanned</p>
                    <p className="text-2xl font-bold">{scanCount}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Vendor</p>
                    <p>{activeBatch.vendor_name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Zone/Division</p>
                    <p>{activeBatch.railway_zone} / {activeBatch.division}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Date Received</p>
                    <p>{format(new Date(activeBatch.date_received), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Depot</p>
                    <p>{activeBatch.depot_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Scanner Section */}
              <div className="space-y-6">
                <Card className="railway-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Live Camera Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LiveScanner 
                      onScan={handleQRScan} 
                      isActive={isScanning}
                      setIsActive={setIsScanning}
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={undoLastScan}
                    disabled={scanLog.length === 0}
                    className="flex-1 py-3"
                  >
                    Undo Last Scan
                  </Button>
                  <Button
                    onClick={handleFinishBatch}
                    className="flex-1 railway-button text-white py-3"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Finish Batch
                  </Button>
                </div>
              </div>

              {/* Scan Log */}
              <ScanLog scanLog={scanLog} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Scanner() {
  return (
    <AuthWrapper>
      <ScannerContent />
    </AuthWrapper>
  );
}

import React, { useState, useEffect } from "react";
import { InventoryItem } from "@/entities/InventoryItem";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import AuthWrapper from "../components/AuthWrapper";
import LiveScanner from "../components/LiveScanner";
import VoiceRecorder from "../components/VoiceRecorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, MapPin, CheckCircle, AlertCircle, Package, Mic } from "lucide-react";

function InstallationContent() {
  const [scannedItem, setScannedItem] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [voiceNoteBlob, setVoiceNoteBlob] = useState(null);
  const [textRemarks, setTextRemarks] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationComplete, setInstallationComplete] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationError("");
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleQRScan = async (qrData) => {
    try {
      // Find the item by its generated ID or QR code data
      const items = await InventoryItem.list();
      const foundItem = items.find(item => 
        item.qr_code_data === qrData || item.generated_id === qrData
      );

      if (!foundItem) {
        alert("Item not found in inventory. Please scan a valid QR code.");
        return;
      }

      if (foundItem.status === "installed") {
        alert("This item is already installed.");
        return;
      }

      setScannedItem(foundItem);
      setIsScanning(false);
    } catch (error) {
      console.error("Error finding scanned item:", error);
      alert("Error finding item. Please try again.");
    }
  };

  const handleVoiceNoteComplete = (audioBlob) => {
    setVoiceNoteBlob(audioBlob);
  };

  const handleInstallation = async () => {
    if (!scannedItem) {
      alert("Please scan an item first");
      return;
    }

    if (!location) {
      alert("Location not available. Please enable GPS and refresh.");
      return;
    }

    setIsInstalling(true);

    try {
      const user = await User.me();
      let voiceUrl = "";

      // Upload voice note if recorded
      if (voiceNoteBlob) {
        const uploadResult = await UploadFile({ file: voiceNoteBlob });
        voiceUrl = uploadResult.file_url;
      }

      // Get readable address from coordinates
      const address = `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`;

      // Combine text and voice remarks
      let finalRemarks = textRemarks;
      if (voiceUrl) {
        finalRemarks += (finalRemarks ? "\n\n" : "") + `Voice Note: ${voiceUrl}`;
      }

      const installationData = {
        installed_at: new Date().toISOString(),
        location_latitude: location.latitude,
        location_longitude: location.longitude,
        location_address: address,
        voice_note_url: voiceUrl,
        installation_remarks: finalRemarks,
        installed_by: user.email
      };

      // Update the item with installation data
      await InventoryItem.update(scannedItem.id, {
        status: "installed",
        installation_data: installationData
      });

      setInstallationComplete(true);
      setScannedItem(null);
      setTextRemarks("");
      setVoiceNoteBlob(null);
      
      setTimeout(() => {
        setInstallationComplete(false);
      }, 3000);

    } catch (error) {
      console.error("Error during installation:", error);
      alert("Error recording installation. Please try again.");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--railway-blue)' }}>
            Item Installation
          </h1>
          <p className="text-gray-600">Scan items when installing them in the field</p>
        </div>

        {installationComplete && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Item installed successfully! Location, text remarks, and voice notes have been recorded.
            </AlertDescription>
          </Alert>
        )}

        {/* Location Status */}
        <Card className="railway-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>GPS Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                <span className="text-sm text-gray-500">(±{location.accuracy?.toFixed(0)}m)</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{locationError || "Getting location..."}</span>
                </div>
                <Button 
                  onClick={getCurrentLocation}
                  variant="outline" 
                  className="text-blue-600"
                >
                  Retry Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scanner Section */}
        <Card className="railway-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Scan Item to Install
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

        {/* Scanned Item Details */}
        {scannedItem && (
          <Card className="railway-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Installing Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-700">Item ID</p>
                  <p className="font-mono text-lg">{scannedItem.generated_id}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Current Status</p>
                  <p className="capitalize">{scannedItem.status}</p>
                </div>
              </div>

              {/* Text Remarks */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Installation Remarks (Text)</label>
                <Textarea
                  placeholder="Add any installation notes or observations..."
                  value={textRemarks}
                  onChange={(e) => setTextRemarks(e.target.value)}
                  className="h-24"
                />
              </div>

              {/* Voice Note Recorder */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voice Note Remarks (Optional)
                </label>
                <VoiceRecorder onRecordingComplete={handleVoiceNoteComplete} />
                {voiceNoteBlob && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    ✓ Voice note recorded and will be saved with installation
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setScannedItem(null);
                    setTextRemarks("");
                    setVoiceNoteBlob(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInstallation}
                  disabled={!location || isInstalling}
                  className="flex-1 railway-button text-white"
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Installing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Installed
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Installation() {
  return (
    <AuthWrapper>
      <InstallationContent />
    </AuthWrapper>
  );
}
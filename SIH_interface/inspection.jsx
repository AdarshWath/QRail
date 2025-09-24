import React, { useState, useEffect } from "react";
import { InventoryItem } from "@/entities/InventoryItem";
import { Inspection as InspectionEntity } from "@/entities/Inspection";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import AuthWrapper from "../components/AuthWrapper";
import LiveScanner from "../components/LiveScanner";
import VoiceRecorder from "../components/VoiceRecorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Package, Mic, MapPin, AlertTriangle } from "lucide-react";

function InspectionContent() {
  const [scannedItem, setScannedItem] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [inspectionStatus, setInspectionStatus] = useState("passed");
  const [complaintType, setComplaintType] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [voiceComplaintBlob, setVoiceComplaintBlob] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspectionComplete, setInspectionComplete] = useState(false);

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

      setScannedItem(foundItem);
      setIsScanning(false);
    } catch (error) {
      console.error("Error finding scanned item:", error);
      alert("Error finding item. Please try again.");
    }
  };

  const handleVoiceComplaintComplete = (audioBlob) => {
    setVoiceComplaintBlob(audioBlob);
  };

  const handleSubmitInspection = async () => {
    if (!scannedItem) {
      alert("Please scan an item first");
      return;
    }

    if (inspectionStatus !== "passed" && !complaintDescription.trim()) {
      alert("Please provide a complaint description for failed inspections");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await User.me();
      let voiceUrl = "";

      // Upload voice complaint if recorded
      if (voiceComplaintBlob) {
        const uploadResult = await UploadFile({ file: voiceComplaintBlob });
        voiceUrl = uploadResult.file_url;
      }

      const inspectionData = {
        item_id: scannedItem.id,
        generated_id: scannedItem.generated_id,
        inspector_email: user.email,
        inspection_date: new Date().toISOString(),
        inspection_status: inspectionStatus,
        complaint_type: inspectionStatus !== "passed" ? complaintType : null,
        complaint_description: complaintDescription,
        voice_complaint_url: voiceUrl,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        priority: inspectionStatus !== "passed" ? priority : "low",
        resolution_status: inspectionStatus !== "passed" ? "open" : null
      };

      // Create inspection record
      await InspectionEntity.create(inspectionData);

      // Update item status if there's a problem
      if (inspectionStatus !== "passed") {
        await InventoryItem.update(scannedItem.id, {
          status: "needs_attention"
        });
      }

      setInspectionComplete(true);
      resetForm();
      
      setTimeout(() => {
        setInspectionComplete(false);
      }, 4000);

    } catch (error) {
      console.error("Error during inspection submission:", error);
      alert("Error submitting inspection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setScannedItem(null);
    setInspectionStatus("passed");
    setComplaintType("");
    setComplaintDescription("");
    setVoiceComplaintBlob(null);
    setPriority("medium");
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--railway-blue)' }}>
            Item Inspection
          </h1>
          <p className="text-gray-600">Scan items to inspect and report any issues</p>
        </div>

        {inspectionComplete && (
          <Alert className={`mb-6 ${inspectionStatus === "passed" ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
            <CheckCircle className={`h-4 w-4 ${inspectionStatus === "passed" ? "text-green-600" : "text-orange-600"}`} />
            <AlertDescription className={inspectionStatus === "passed" ? "text-green-800" : "text-orange-800"}>
              {inspectionStatus === "passed" 
                ? "Inspection completed successfully! Item passed inspection."
                : "Inspection completed! Complaint has been logged and will be addressed."}
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
              Scan Item to Inspect
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

        {/* Inspection Form */}
        {scannedItem && (
          <Card className="railway-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Inspecting Item
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

              {/* Inspection Result */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Inspection Result</label>
                <Select value={inspectionStatus} onValueChange={setInspectionStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passed">✓ Passed - No Issues</SelectItem>
                    <SelectItem value="failed">✗ Failed - Major Issues</SelectItem>
                    <SelectItem value="needs_attention">⚠ Needs Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Complaint Details (only show if not passed) */}
              {inspectionStatus !== "passed" && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-medium text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Issue Details
                  </h3>
                  
                  {/* Complaint Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type of Issue</label>
                    <Select value={complaintType} onValueChange={setComplaintType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="missing_parts">Missing Parts</SelectItem>
                        <SelectItem value="defective">Defective</SelectItem>
                        <SelectItem value="incorrect_item">Incorrect Item</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Complaint Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue Description</label>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      className="h-24"
                      required
                    />
                  </div>

                  {/* Voice Complaint */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Voice Complaint (Optional)
                    </label>
                    <VoiceRecorder onRecordingComplete={handleVoiceComplaintComplete} />
                    {voiceComplaintBlob && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        ✓ Voice complaint recorded and will be saved
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitInspection}
                  disabled={isSubmitting}
                  className={`flex-1 text-white ${
                    inspectionStatus === "passed" 
                      ? "railway-button" 
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {inspectionStatus === "passed" ? "Complete Inspection" : "Submit Complaint"}
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

export default function InspectionPage() {
  return (
    <AuthWrapper>
      <InspectionContent />
    </AuthWrapper>
  );
}
import React, { useState, useEffect } from "react";
import { Batch } from "@/entities/Batch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function BatchSelector({ onBatchSelect }) {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const activeBatches = await Batch.filter({ batch_status: "active" }, "-created_date");
    setBatches(activeBatches);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="railway-card text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Select Active Batch</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="py-8">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">No Active Batches Found</h3>
              <p className="text-gray-600 mb-6">
                You need to create a batch first before you can start scanning items.
              </p>
              <Link to={createPageUrl("BatchEntry")}>
                <Button className="railway-button text-white px-8 py-3 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Batch
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {batches.map((batch) => (
                <Card 
                  key={batch.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-300"
                  onClick={() => onBatchSelect(batch)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <h3 className="text-lg font-semibold">{batch.vendor_name}</h3>
                        <p className="text-gray-600">{batch.railway_zone} Railway - {batch.division}</p>
                        <p className="text-sm text-gray-500">
                          Created: {format(new Date(batch.created_date), 'PPP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Items Scanned</p>
                        <p className="text-2xl font-bold text-blue-600">{batch.total_items_scanned}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ScanLog({ scanLog }) {
  return (
    <Card className="railway-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Scan Log ({scanLog.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {scanLog.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3" />
              <p>No items scanned yet</p>
              <p className="text-sm">Start scanning to see items appear here</p>
            </div>
          ) : (
            scanLog.map((item, index) => (
              <div 
                key={item.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-mono font-medium text-lg">{item.generated_id}</p>
                    <p className="text-sm text-gray-600">Scan #{item.scan_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.scan_timestamp ? 
                      format(new Date(item.scan_timestamp), 'HH:mm:ss') : 
                      format(new Date(), 'HH:mm:ss')
                    }
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
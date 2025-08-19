"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const BackendTest = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testBackendConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      console.log("Testing backend connection...");

      const response = await fetch("/api/test-backend", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();
      console.log("Backend test result:", data);

      setTestResult({
        success: response.ok,
        data,
        timestamp: new Date().toISOString(),
      });

      if (response.ok) {
        toast.success("Kết nối backend thành công!");
      } else {
        toast.error("Kết nối backend thất bại!");
      }
    } catch (error) {
      console.error("Backend test error:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      toast.error("Không thể test kết nối backend");
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!testResult) return null;

    if (testResult.success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!testResult) return null;

    if (testResult.success) {
      return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Test Kết Nối Backend
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-blue-700 text-sm">
            Kiểm tra kết nối đến backend server
          </p>

          <Button
            onClick={testBackendConnection}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {testing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Đang test...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Kết Nối
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium">
                  {testResult.success
                    ? "Kết nối thành công"
                    : "Kết nối thất bại"}
                </span>
              </div>
              {getStatusBadge()}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Thời gian:</span>{" "}
                {new Date(testResult.timestamp).toLocaleString("vi-VN")}
              </div>

              {testResult.data?.backendUrl && (
                <div>
                  <span className="font-medium">Backend URL:</span>{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {testResult.data.backendUrl}
                  </code>
                </div>
              )}

              {testResult.data?.response && (
                <div>
                  <span className="font-medium">Response:</span>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                    {JSON.stringify(testResult.data.response, null, 2)}
                  </pre>
                </div>
              )}

              {testResult.error && (
                <div>
                  <span className="font-medium text-red-600">Error:</span>
                  <p className="text-red-600 mt-1">{testResult.error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded">
          <p className="font-medium mb-1">Lưu ý:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Backend phải đang chạy trên port 8081</li>
            <li>Environment variables phải được cấu hình đúng</li>
            <li>API endpoint /health phải tồn tại</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

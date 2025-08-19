"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface DebugInfoProps {
  error: string;
  onRetry: () => void;
  onReset: () => void;
}

export const DebugInfo = ({ error, onRetry, onReset }: DebugInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const collectDebugInfo = async () => {
    try {
      const info: any = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: {
          hasToken: !!localStorage.getItem("token"),
          hasUser: !!localStorage.getItem("user"),
        },
        sessionStorage: {
          hasToken: !!sessionStorage.getItem("token"),
          hasUser: !!sessionStorage.getItem("user"),
        },
        cookies: document.cookie ? document.cookie.split(";").length : 0,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
          apiVersion: process.env.NEXT_PUBLIC_API_VERSION,
        },
      };

      // Test backend connectivity
      try {
        const healthCheck = await fetch("/api/test-backend", {
          method: "GET",
          cache: "no-store",
        });

        if (healthCheck.ok) {
          const healthData = await healthCheck.json();
          info.backendHealth = {
            status: healthCheck.status,
            ok: healthCheck.ok,
            statusText: healthCheck.statusText,
            backendUrl: healthData.backendUrl,
            response: healthData.response,
          };
        } else {
          const errorData = await healthCheck.json();
          info.backendHealth = {
            status: healthCheck.status,
            ok: healthCheck.ok,
            statusText: healthCheck.statusText,
            error: errorData.error || errorData.message,
          };
        }
      } catch (e) {
        info.backendHealth = {
          error: e instanceof Error ? e.message : "Unknown error",
        };
      }

      setDebugInfo(info);
      toast.success("Đã thu thập thông tin debug");
    } catch (e) {
      toast.error("Không thể thu thập thông tin debug");
      console.error("Debug info collection error:", e);
    }
  };

  const copyDebugInfo = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      toast.success("Đã copy thông tin debug vào clipboard");
    }
  };

  const getErrorType = (errorMsg: string) => {
    if (errorMsg.includes("validation")) return "validation";
    if (errorMsg.includes("Unauthorized")) return "auth";
    if (errorMsg.includes("Not Found")) return "notfound";
    if (errorMsg.includes("Server")) return "server";
    return "unknown";
  };

  const errorType = getErrorType(error);

  return (
    <Card className="shadow-sm border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Lỗi khi tải dữ liệu sản phẩm
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Message */}
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="text-xs">
            {errorType === "validation" && "Validation Error"}
            {errorType === "auth" && "Authentication Error"}
            {errorType === "notfound" && "Not Found Error"}
            {errorType === "server" && "Server Error"}
            {errorType === "unknown" && "Unknown Error"}
          </Badge>
          <p className="text-red-700 font-medium">{error}</p>
        </div>

        {/* Error Details */}
        {error.includes("validation") && (
          <div className="bg-red-100 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-medium mb-2">
              Nguyên nhân có thể:
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Backend chưa khởi động hoặc không thể kết nối</li>
              <li>API endpoint không đúng hoặc không tồn tại</li>
              <li>Lỗi authentication hoặc authorization</li>
              <li>Dữ liệu không hợp lệ từ backend</li>
              <li>Environment variables không đúng</li>
            </ul>
          </div>
        )}

        {/* Debug Section */}
        <div className="border-t border-red-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-red-700 hover:bg-red-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Ẩn thông tin debug
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Hiển thị thông tin debug
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={collectDebugInfo}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thu thập thông tin
              </Button>

              {debugInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDebugInfo}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Environment Info:
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>NODE_ENV: {process.env.NODE_ENV || "undefined"}</p>
                    <p>
                      Backend URL:{" "}
                      {process.env.NEXT_PUBLIC_BACKEND_URL || "undefined"}
                    </p>
                    <p>
                      API Version:{" "}
                      {process.env.NEXT_PUBLIC_API_VERSION || "undefined"}
                    </p>
                  </div>
                </div>

                {debugInfo && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      Debug Info:
                    </h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Thử lại
          </Button>

          <Button
            variant="outline"
            onClick={onReset}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Reset và thử lại
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

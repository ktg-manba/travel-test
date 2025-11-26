"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/contexts/app";
import { Download, FileText } from "lucide-react";

type PDFType = "payment_guide" | "city_guide";

interface PDFDownloadProps {
  type: PDFType;
}

export default function PDFDownload({ type }: PDFDownloadProps) {
  const t = useTranslations("traveltang.features.pdf_guides");
  const { user } = useUser();
  const [isDownloading, setIsDownloading] = useState(false);

  const getTitle = () => {
    if (type === "payment_guide") {
      return t("payment_guide.title");
    }
    return t("city_guide.title");
  };

  const getDescription = () => {
    if (type === "payment_guide") {
      return t("payment_guide.description");
    }
    return t("city_guide.description");
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch("/api/traveltang/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdf_type: type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("download_error"));
      }

      // Get the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "payment_guide" 
        ? "TravelTang-Payment-Setup-Guide.pdf"
        : "TravelTang-City-Travel-Guides.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("download_success"));
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error(error.message || t("download_error"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <CardTitle>{getTitle()}</CardTitle>
        </div>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleDownload}
          disabled={isDownloading || !user}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : t("download")}
        </Button>
      </CardContent>
    </Card>
  );
}


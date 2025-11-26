import { useTranslations } from "next-intl";
import TravelTangChatbot from "@/components/traveltang/chatbot";
import PDFDownload from "@/components/traveltang/pdf-download";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("traveltang.title"),
    description: t("traveltang.description"),
  };
}

export default async function TravelTangPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">TravelTang</h1>
          <p className="text-xl text-muted-foreground">
            Your Ultimate Guide to Traveling in China
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <PDFDownload type="payment_guide" />
          <PDFDownload type="city_guide" />
        </div>

        <div className="mt-8">
          <TravelTangChatbot />
        </div>
      </div>
    </div>
  );
}


import { notFound } from "next/navigation";
import { isValidLocale } from "@/i18n/config";
import ProductsPage from "../products/page";

export default function LocaleShopPage({
  params,
}: {
  params: { locale?: string };
}) {
  const { locale } = params;
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  return <ProductsPage />;
}

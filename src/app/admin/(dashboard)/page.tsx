import Link from "next/link";
import { InquiriesTable } from "@/components/admin/inquiries-table";
import { ServicesManager } from "@/components/admin/services-manager";
import { MomentsManager } from "@/components/admin/moments-manager";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllServices, getInquiries, getMoments, getReviews } from "@/server/queries";

type TabValue = "reviews" | "moments" | "services" | "inquiries";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [reviews, moments, services, inquiries] = await Promise.all([
    getReviews(),
    getMoments(),
    getAllServices(),
    getInquiries(),
  ]);

  const params = await searchParams;
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: TabValue = requested === "moments" || requested === "services" || requested === "inquiries" ? requested : "reviews";

  const tabs = [
    {
      value: "reviews" as const,
      label: `Reviews (${reviews.length})`,
      content: <ReviewsTable reviews={reviews} />,
    },
    {
      value: "moments" as const,
      label: `Moments (${moments.length})`,
      content: <MomentsManager moments={moments} />,
    },
    {
      value: "services" as const,
      label: `Services (${services.length})`,
      content: <ServicesManager services={services} />,
    },
    {
      value: "inquiries" as const,
      label: `Inquiries (${inquiries.length})`,
      content: <InquiriesTable inquiries={inquiries} />,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-ink">Dashboard</h1>

      <Tabs value={tab} className="mt-6">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-ink/10 [scrollbar-width:none] sm:w-fit">
          {tabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value} asChild className="h-11 shrink-0 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-ink data-[state=active]:text-white">
              <Link href={`/admin?tab=${item.value}`}>{item.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-6">
            {item.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

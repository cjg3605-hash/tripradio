interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema, null, 2)
      }}
    />
  );
}

// 기본 브레드크럼 생성 헬퍼 함수들
export const generateHomeBreadcrumb = (): BreadcrumbItem[] => [
  { name: "Home", url: "/" }
];

export const generateGuideBreadcrumb = (locationName?: string): BreadcrumbItem[] => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Guide", url: "/guide" }
  ];
  
  if (locationName) {
    breadcrumbs.push({
      name: locationName,
      url: `/guide/${encodeURIComponent(locationName)}`
    });
  }
  
  return breadcrumbs;
};

export const generateTourBreadcrumb = (locationName: string): BreadcrumbItem[] => [
  { name: "Home", url: "/" },
  { name: "Guide", url: "/guide" },
  { name: locationName, url: `/guide/${encodeURIComponent(locationName)}` },
  { name: "Tour", url: `/guide/${encodeURIComponent(locationName)}/tour` }
];

export const generatePersonalityBreadcrumb = (locationName?: string): BreadcrumbItem[] => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Personality", url: "/personality" }
  ];
  
  if (locationName) {
    breadcrumbs.push({
      name: `${locationName} Personality`,
      url: `/personality/${encodeURIComponent(locationName)}`
    });
  }
  
  return breadcrumbs;
};
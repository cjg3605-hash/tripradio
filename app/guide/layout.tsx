import BreadcrumbSchema, { generateGuideBreadcrumb } from '@/components/seo/BreadcrumbSchema';

interface GuideLayoutProps {
  children: React.ReactNode;
}

export default function GuideLayout({ children }: GuideLayoutProps) {
  return (
    <>
      {/* Breadcrumb Schema for guide section */}
      <BreadcrumbSchema items={generateGuideBreadcrumb()} />
      
      {children}
    </>
  );
}
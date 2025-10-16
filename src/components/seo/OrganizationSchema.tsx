interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
}

export default function OrganizationSchema({
  name = 'TripRadio.AI',
  url = 'https://navidocent.com',
  logo = `${'https://navidocent.com'}/logo.svg`,
  sameAs = [
    // 네이버/공식 채널 URL들을 실제 운영 채널로 교체 권장
    'https://blog.naver.com/',
    'https://www.youtube.com/',
    'https://www.instagram.com/'
  ],
  description = 'AI 여행 오디오가이드 및 도슨트 서비스',
}: OrganizationSchemaProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    ...(description ? { description } : {}),
    ...(sameAs && sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}



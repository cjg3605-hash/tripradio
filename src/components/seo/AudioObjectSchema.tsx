interface AudioObjectData {
  name: string;
  contentUrl: string;
  description?: string;
  encodingFormat?: string;
  duration?: string | number;
  inLanguage?: string;
  thumbnailUrl?: string;
}

export default function AudioObjectSchema({ data }: { data: AudioObjectData }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: data.name,
    contentUrl: data.contentUrl,
    ...(data.description ? { description: data.description } : {}),
    ...(data.encodingFormat ? { encodingFormat: data.encodingFormat } : {}),
    ...(data.duration ? { duration: data.duration } : {}),
    ...(data.inLanguage ? { inLanguage: data.inLanguage } : {}),
    ...(data.thumbnailUrl ? { thumbnailUrl: data.thumbnailUrl } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
      suppressHydrationWarning
    />
  );
}



// Custom image loader for static files
export default function imageLoader({ src, width, quality }) {
  // Handle local images in the public folder
  if (src.startsWith('/')) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  
  // Handle remote images
  return src;
}

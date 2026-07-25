import { useEffect } from 'react';

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
};

export function useSEO({ title, description, keywords, image, canonical }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;

    setMetaTag('description', description);
    setMetaTag('keywords', keywords);

    // OpenGraph
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:image', image);
    setMetaProperty('og:type', 'website');

    // Twitter
    setMetaProperty('twitter:card', 'summary_large_image');
    setMetaProperty('twitter:title', title);
    setMetaProperty('twitter:description', description);
    setMetaProperty('twitter:image', image);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, keywords, image, canonical]);
}

function setMetaTag(name: string, content?: string | null) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content?: string | null) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

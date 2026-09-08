import { useEffect } from 'react';

// Sets the document title and meta description for the current page.
// Restores the previous values on unmount so navigating away doesn't leak stale SEO tags.
const useSEO = (title, description) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute('content');
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (meta && prevDescription !== undefined) meta.setAttribute('content', prevDescription);
    };
  }, [title, description]);
};

export default useSEO;

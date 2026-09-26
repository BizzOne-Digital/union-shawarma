const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'EM', 'FIGCAPTION', 'FIGURE', 'H2',
  'H3', 'H4', 'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'PRE', 'STRONG', 'TABLE',
  'TBODY', 'TD', 'TH', 'THEAD', 'TR', 'UL',
]);

const ALLOWED_ATTRIBUTES = {
  A: new Set(['href', 'title']),
  IMG: new Set(['src', 'alt', 'title', 'width', 'height']),
  TD: new Set(['colspan', 'rowspan']),
  TH: new Set(['colspan', 'rowspan']),
};

const BLOCKED_TAGS = new Set([
  'BUTTON', 'EMBED', 'FORM', 'IFRAME', 'INPUT', 'LINK', 'MATH', 'META', 'OBJECT',
  'SCRIPT', 'SELECT', 'STYLE', 'SVG', 'TEXTAREA',
]);

const isSafeUrl = (value, allowDataImage = false) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith('/') || normalized.startsWith('#')) return true;
  if (allowDataImage && normalized.startsWith('data:image/')) return true;

  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const sanitizeNode = (node) => {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) return;

    if (BLOCKED_TAGS.has(child.tagName)) {
      child.remove();
      return;
    }

    if (!ALLOWED_TAGS.has(child.tagName)) {
      sanitizeNode(child);
      child.replaceWith(...child.childNodes);
      return;
    }

    const allowed = ALLOWED_ATTRIBUTES[child.tagName] || new Set();
    Array.from(child.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const isUrl = name === 'href' || name === 'src';
      if (!allowed.has(name) || (isUrl && !isSafeUrl(attribute.value, child.tagName === 'IMG'))) {
        child.removeAttribute(attribute.name);
      }
    });

    if (child.tagName === 'A' && child.hasAttribute('href')) {
      child.setAttribute('target', '_blank');
      child.setAttribute('rel', 'noopener noreferrer');
    }

    sanitizeNode(child);
  });
};

const sanitizeHtml = (html = '') => {
  const document = new DOMParser().parseFromString(html, 'text/html');
  sanitizeNode(document.body);
  return document.body.innerHTML;
};

export default sanitizeHtml;

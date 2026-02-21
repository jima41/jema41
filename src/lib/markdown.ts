// Minimal, safe Markdown-ish renderer: bold (**text**) and newlines -> <br>/<p>
export function renderSimpleMarkdown(input: string | null | undefined): string {
  if (!input) return '';
  // Normalize newlines
  let text = input.replace(/\r\n?/g, '\n');

  // Escape HTML to avoid XSS
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#39;');

  text = escapeHtml(text);

  // Bold: **text** or __text__ -> <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Paragraphs: split on two or more newlines
  const paragraphs = text.split(/\n{2,}/g).map((p) => {
    // Within a paragraph, single newlines become <br>
    const withBreaks = p.replace(/\n/g, '<br/>');
    return `<p>${withBreaks}</p>`;
  });

  return paragraphs.join('');
}

export default renderSimpleMarkdown;

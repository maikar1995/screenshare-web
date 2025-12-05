import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const renderMarkdown = (text: string): string => {
    try {
      // Configurar marked para mejor seguridad
      marked.setOptions({
        breaks: true,    // Saltos de línea como <br>
        gfm: true        // GitHub Flavored Markdown
      });

      // Convertir markdown a HTML
      const rawHtml = marked(text) as string;
      
      // Sanitizar HTML para evitar XSS
      const cleanHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'code', 'pre', 
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'a', 'img'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
      });

      return cleanHtml;
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return text; // Fallback to plain text
    }
  };

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: renderMarkdown(content) 
      }}
    />
  );
};
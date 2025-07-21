import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export class SanitizerUtil {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(dirty: string): string {
    return purify.sanitize(dirty, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['class'],
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'video', 'audio'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onkeyup', 'onkeydown'],
    });
  }

  /**
   * Sanitize plain text by escaping HTML entities
   */
  static sanitizeText(text: string): string {
    return validator.escape(text);
  }

  /**
   * Sanitize and validate email
   */
  static sanitizeEmail(email: string): string {
    const normalized = validator.normalizeEmail(email, {
      gmail_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_lowercase: true,
      outlookdotcom_remove_subaddress: false,
      yahoo_lowercase: true,
      yahoo_remove_subaddress: false,
      icloud_lowercase: true,
      icloud_remove_subaddress: false,
    });
    return normalized || email.toLowerCase().trim();
  }

  /**
   * Remove potentially dangerous characters from usernames
   */
  static sanitizeUsername(username: string): string {
    return username.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: string): string {
    // Remove special characters that could be used for injection
    return query.replace(/[<>'"&]/g, '').trim();
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string | null {
    if (!validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true,
      require_valid_protocol: true,
      allow_underscores: false,
      // host_whitelist and host_blacklist removed because they expect arrays, not booleans
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
    })) {
      return null;
    }
    return url;
  }
}

import crypto from 'crypto';

/**
 * Add request ID for tracing
 */
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Sanitize request body, query, and params to prevent XSS
 * Removes dangerous characters and scripts
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove script tags and dangerous patterns
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/data:/gi, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * Prevent parameter pollution
 * Takes the last value if multiple values are provided for a query param
 */
export const preventParamPollution = (req, res, next) => {
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        req.query[key] = value[value.length - 1];
      }
    }
  }
  next();
};

/**
 * Additional security headers beyond helmet
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Validate content type for POST/PUT/PATCH requests
 */
export const validateContentType = (req, res, next) => {
  const methodsRequiringBody = ['POST', 'PUT', 'PATCH'];

  if (methodsRequiringBody.includes(req.method)) {
    const contentType = req.headers['content-type'];

    // Skip validation for multipart/form-data (file uploads)
    if (contentType && contentType.includes('multipart/form-data')) {
      return next();
    }

    // Require JSON content type for API requests
    if (contentType && !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        error: 'Content-Type must be application/json',
      });
    }
  }

  next();
};

/**
 * Limit request body size at application level
 */
export const limitBodySize = (maxSize = '10mb') => {
  const maxBytes = parseSize(maxSize);

  return (req, res, next) => {
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        res.status(413).json({
          success: false,
          error: 'Request body too large',
        });
        req.destroy();
      }
    });

    next();
  };
};

/**
 * Parse size string to bytes
 */
function parseSize(size) {
  if (typeof size === 'number') return size;

  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  const num = parseInt(match[1], 10);
  const unit = match[2] || 'b';

  return num * units[unit];
}

/**
 * Block common malicious user agents
 */
export const blockMaliciousAgents = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /openvas/i,
    /w3af/i,
    /acunetix/i,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(userAgent)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }
  }

  next();
};

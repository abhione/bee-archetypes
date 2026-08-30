/**
 * Basic-auth gate for the beta site. Preserves the behavior we had in
 * the old nginx setup: username `hive`, password from BASIC_AUTH_PASS.
 *
 * API routes under /api/agent/* still require basic auth (matches the
 * nginx behavior — the entire site was gated). The client sends the
 * same Authorization header the browser already has from the initial
 * page load.
 */
import type { MiddlewareHandler } from 'hono';

const REALM = 'Bee Archetypes Beta';

export const basicAuthMiddleware: MiddlewareHandler = async (c, next) => {
  if (process.env.DISABLE_BASIC_AUTH === '1') return next();

  const expectedUser = process.env.BASIC_AUTH_USER || 'hive';
  const expectedPass = process.env.BASIC_AUTH_PASS;
  if (!expectedPass) {
    return c.text(
      'server misconfiguration: BASIC_AUTH_PASS missing',
      500,
    );
  }

  const header = c.req.header('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    return c.text('Auth required', 401, {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
    });
  }
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  const idx = decoded.indexOf(':');
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  if (user !== expectedUser || pass !== expectedPass) {
    return c.text('Auth required', 401, {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
    });
  }
  return next();
};

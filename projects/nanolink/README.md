# NanoLink

A URL-shortening API built for Hack Club’s RaspAPI program. It runs on Bun and Hono, with SQLite storing links and redirect data.

## Link Lifecycle

Links can use a generated slug or a supplied custom slug. **Expiration timestamps and maximum-click limits** allow links to stop working after a time or usage threshold.

Redirect handling records browser, operating-system, and device information derived from the request. Optional Discord webhook notifications report redirects, and the service can generate QR codes for shortened links.

## API Boundaries

Zod validates incoming payloads. The shortening endpoint has an IP-based rate limiter, while administrative routes use bearer-token authentication.

These mechanisms have different jobs: payload validation checks the shape of a request, rate limiting constrains how frequently it is accepted, and the bearer token controls access to administrative operations.

## Running the Service

The repository includes Bun development and start commands, environment configuration, and a paginated links endpoint. Deployments need persistent storage for the SQLite database; replacing an ephemeral container without retaining that file would lose its links and records.

The redirect metadata is useful for basic analytics, but user-agent-derived device information is not an authenticated identity. The repository also leaves process supervision and the public-facing deployment configuration to the operator.

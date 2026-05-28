# Security Policy

## Supported Versions

Only the latest version of LibreSearch is actively supported with security fixes.

| Version        | Supported |
| -------------- | --------- |
| 0.0.x (latest) | Yes       |
| Older          | No        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it by opening a [GitHub Security Advisory](../../security/advisories/new) in this repository. This keeps the disclosure private until a fix is ready.

Include as much of the following as possible:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- The version(s) affected
- Any suggested mitigations, if known

You should receive an acknowledgement within 48 hours. We will keep you informed as the issue is investigated and resolved.

## Scope

Security issues we care about include but are not limited to:

- Server-side request forgery (SSRF)
- Cross-site scripting (XSS)
- Rate-limit bypass or denial of service
- Information disclosure (e.g. API keys, user data)
- Dependency vulnerabilities with a realistic attack path

Out of scope:

- Issues requiring physical access to a user's machine
- Self-XSS
- Vulnerabilities in third-party services we rely on (report those upstream)
- Missing security headers that have no practical impact

## Privacy

LibreSearch does not log search queries, store IP addresses, or build user profiles. If you find a way that user data could be unintentionally exposed or retained, please report it as a security issue.

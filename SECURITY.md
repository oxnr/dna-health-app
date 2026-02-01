# Security Policy

## Architecture

This application is designed with **security and privacy as the primary concerns**.

### Zero Server Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                                                                  │
│   DNA File ──▶ Parser ──▶ Analyzer ──▶ Results ──▶ Export       │
│                                                                  │
│   ✅ All processing happens here                                 │
│   ✅ Data never transmitted                                      │
│   ✅ No server communication                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                       NO DATA LEAVES
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      STATIC FILE HOST                            │
│                                                                  │
│   Serves only: HTML, CSS, JavaScript, fonts                     │
│   No backend, no API, no database                               │
└─────────────────────────────────────────────────────────────────┘
```

## Security Measures

### 1. Input Validation

All DNA file parsing includes strict validation:

| Check | Limit | Purpose |
|-------|-------|---------|
| File size | 50 MB max | Prevent memory exhaustion |
| Line count | 2M lines max | Prevent DoS |
| Genotype length | 10 chars max | Prevent buffer issues |
| rsID format | `/^rs\d{1,12}$/i` | Reject malformed input |
| Chromosome | Valid chr only | Reject invalid data |
| Genotype chars | `[ACGT-0]` only | Sanitize input |

### 2. No Dynamic Code Execution

- ❌ No `eval()`
- ❌ No `new Function()`
- ❌ No `innerHTML` with user data
- ❌ No `document.write()`
- ❌ No dynamic `import()` with user input

### 3. No Network Communication

- ❌ No `fetch()` calls to external APIs
- ❌ No `XMLHttpRequest`
- ❌ No WebSocket connections
- ❌ No tracking pixels or analytics
- ❌ No third-party scripts (except build dependencies)

### 4. Data Storage

| Storage | Contents | DNA Data? |
|---------|----------|-----------|
| localStorage | Theme preference | ❌ Never |
| localStorage | Language preference | ❌ Never |
| sessionStorage | Not used | ❌ Never |
| IndexedDB | Not used | ❌ Never |
| Cookies | Not used | ❌ Never |

**DNA data exists only in browser memory during analysis and is garbage collected when the page closes.**

### 5. Export Security

Exports (PDF, Markdown, Text) are generated entirely client-side:
- Uses `Blob` and `URL.createObjectURL()`
- `URL.revokeObjectURL()` called after download
- No server upload required

### 6. Content Security Policy

The app is compatible with strict CSP headers:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'none';
  frame-src 'none';
  object-src 'none';
```

### 7. Dependencies

Production dependencies are minimal:
- `jspdf` - PDF generation (loaded dynamically, only when exporting)
- `file-saver` - File download helper
- `idb-keyval` - IndexedDB wrapper (optional, not currently used for DNA)

All dependencies are:
- Open source
- Audited for security issues
- Loaded from npm (not CDN at runtime)

## Threat Model

### Threats Mitigated

| Threat | Mitigation |
|--------|------------|
| Data exfiltration | No network calls, data stays in browser |
| MITM attacks | No data transmission to intercept |
| Server breach | No server, no database |
| XSS attacks | No dynamic HTML injection, strict CSP |
| ReDoS | No complex regex on user input |
| Memory exhaustion | File size limits enforced |
| Prototype pollution | No dynamic property access on user input |

### Out of Scope

These are user's responsibility:
- Browser security (keep browser updated)
- Device security (malware on user's device)
- File integrity (we trust the file the user provides)
- Physical security (someone looking over your shoulder)

## Vulnerability Reporting

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer privately
3. Allow reasonable time for a fix before disclosure

## Security Audit Checklist

Run before each release:

```bash
# Check for known vulnerabilities in dependencies
npm audit

# Check for secrets in code
grep -r "api.key\|secret\|password\|token" src/

# Check for dangerous patterns
grep -r "eval\|innerHTML\|document.write" src/

# Check for network calls
grep -r "fetch\|XMLHttpRequest\|axios" src/

# Verify no console.log with sensitive data
grep -r "console.log" src/
```

## Compliance Notes

- **GDPR**: No personal data collected or transmitted
- **HIPAA**: No PHI stored or transmitted (analysis is local only)
- **CCPA**: No personal information sold (no data collection)

## Version History

| Version | Security Updates |
|---------|------------------|
| 0.1.0 | Initial release with security-first architecture |

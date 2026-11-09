# Reporting an Authorization Bug in the CBSE PVR Portal

While checking my exam application status on the CBSE PVR portal, I looked at the background network requests and noticed that a request included a student roll number.

The server required a logged-in session. It wasn’t checking whether that session was allowed to access the student record identified in the request.

I changed the identifier in a request and received another student’s personal data. I stopped testing and reported the issue. The fix has since been confirmed, and the finding cleared for public disclosure.

## Authentication Wasn’t the Missing Check

This was an insecure direct object reference, or IDOR: a caller could choose an object identifier without the server enforcing the relevant access restriction.

Being logged in answered one question: did the request come from an authenticated session? It didn’t answer the next one: was that session entitled to read this particular record?

The response included personal and exam information. I’m not publishing the endpoint, request headers, identifiers, response samples, or proof-of-concept video here.

One successful unauthorized response established a concrete failure. It didn’t establish how many records were accessible, whether every account could reproduce it, or whether anyone had previously exploited it. My original post’s suggestion of millions of exposed records went beyond what I had tested.

## Reporting and Remediation

I documented the finding and reported it to CBSE’s IT Directorate, then escalated it to CERT-In with a video proof of concept. Paras Shenmare helped me navigate the disclosure process.

Within 24 hours, according to the timeline I recorded, the service was temporarily taken down and the authorization logic was fixed. I appreciated how quickly the teams responded.

I’ve kept the incident reference out of this article; it isn’t needed to explain the bug or the fix.

## The Test That Matters

For a system handling per-user records, an authorization test needs more than a valid login and a successful response for the owner. It also needs another account that should be refused access to that object.

The check belongs on the server, on every relevant request. Hiding an identifier in the interface or making it harder to guess doesn’t establish permission to access the record.

[OWASP’s IDOR guidance](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) describes this distinction and recommends looking up objects within the set a user is authorized to access. That was the boundary missing in this case.

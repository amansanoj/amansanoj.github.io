# Reporting an Authorization Bug in the CBSE PVR Portal

While checking my exam application status on the CBSE PVR portal, I looked at the background network requests and noticed that a request included a student roll number.

The server required a logged-in session. It wasn’t checking whether that session was allowed to access the student record identified in the request.

I changed the identifier in a request and received another student’s personal data. I stopped testing and reported the issue. The vulnerability has since been fixed.

## Authentication Wasn’t the Missing Check

This was an **insecure direct object reference**, or IDOR: a caller could choose an object identifier without the server enforcing the relevant access restriction.

Being logged in answered one question: did the request come from an authenticated session? It didn’t answer the next one: was that session entitled to read this particular record?

The response included personal and exam information.

The request confirmed unauthorized access to another student’s record. The total number of accessible records and any prior exploitation were not established.

## Reporting and Remediation

I documented the finding and reported it to CBSE’s IT Directorate, then escalated it to CERT-In with a video proof of concept.

Within 24 hours of the report, the service was temporarily taken down and the authorization logic was fixed.

## The Test That Matters

For a system handling per-user records, an authorization test needs more than a valid login and a successful response for the owner. It also needs another account that should be refused access to that object.

The check belongs on the server, on every relevant request. Hiding an identifier in the interface or making it harder to guess doesn’t establish permission to access the record.

[OWASP’s IDOR guidance](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) describes this distinction and recommends looking up objects within the set a user is authorized to access. That was the boundary missing in this case.

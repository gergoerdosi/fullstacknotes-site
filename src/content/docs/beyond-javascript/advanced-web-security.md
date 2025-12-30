---
title: "Advanced Web Security: OAuth2, OIDC, and SSO"
description: "Master enterprise identity management. Learn the difference between OAuth2 and OIDC, implement the PKCE flow for secure apps, and understand the BFF pattern."
tags: ["oauth2", "oidc", "saml", "security", "architecture"]
sidebar:
  order: 8
---

In basic authentication, you give your password to a site. In **OAuth2**, you grant a site access to your data *without* giving them your password.

## 1. The OAuth2 Roles

To understand the flow, you must define the four players:

1. **Resource Owner:** The User (You).
2. **Client:** The Application (e.g., Spotify) wanting to access your data.
3. **Authorization Server:** The "Guardian" (e.g., Google or Auth0).
4. **Resource Server:** The API holding the data (e.g., Google Contacts).

---

## 2. OAuth2 vs. OIDC (OpenID Connect)

This is the most common point of confusion in senior interviews.

* **OAuth2 is for Authorization:** It gives you an **Access Token** (A "Key" to a specific door). It tells the server *what* you can do.
* **OIDC is for Authentication:** It sits on top of OAuth2 and gives you an **ID Token** (An "ID Card"). It tells the server *who* you are.

---

## 3. The "Authorization Code" Flow with PKCE

The standard "Authorization Code" flow is vulnerable to interception on mobile and single-page apps (SPAs). The industry standard now is **PKCE** (Proof Key for Code Exchange).

**The Flow:**

1. **Client** creates a secret "Code Verifier" and hashes it to create a "Code Challenge."
2. **User** logs into the Auth Server. The Client sends the "Code Challenge."
3. **Auth Server** sends back a temporary "Auth Code."
4. **Client** sends the "Auth Code" + the original "Code Verifier."
5. **Auth Server** hashes the verifier; if it matches the challenge, it issues the tokens.

---

## 4. SAML: The Enterprise Giant

While OAuth2/OIDC uses JSON and is the standard for modern web apps, **SAML (Security Assertion Markup Language)** uses XML and is the standard for older corporate environments and "Single Sign-On" (SSO).

* **Identity Provider (IdP):** The company directory (e.g., Okta, Active Directory).
* **Service Provider (SP):** Your application.

**When to use which?**

* Use **OIDC** for modern web/mobile apps.
* Use **SAML** if you are selling software to a bank or a Fortune 500 company that insists on using their internal directory.

---

## 5. Security Best Practices for Architects

### A. Token Rotation

If an **Access Token** is stolen, it’s valid until it expires. If a **Refresh Token** is stolen, the attacker can stay logged in forever.
**Solution:** Implement **Refresh Token Rotation**. Every time a refresh token is used, it is invalidated and a new one is issued. If an old one is used twice, the system assumes a breach and kills the entire session.

### B. The "BFF" Pattern (Backend-for-Frontend)

For high-security apps, never store tokens in the browser's `localStorage`. Instead:

1. The Frontend talks to a small Node.js **BFF**.
2. The BFF handles the OAuth exchange and stores tokens in a secure server-side session.
3. The Frontend only gets a secure, `HttpOnly` cookie.

---

## 6. Senior Architect Interview Questions

* **Q: Why do we need a "Refresh Token"? Why not just make "Access Tokens" last forever?**
* **A:** Security. Access tokens are sent with every request and are easily intercepted. By making them short-lived (e.g., 15 mins), we limit the damage. The Refresh Token is kept in a more secure location and only used once to get a new Access Token.


* **Q: What is a "Scope" in OAuth2?**
* **A:** Scopes define the level of access requested (e.g., `read:profile`, `write:orders`). The user must explicitly approve these scopes during login.


* **Q: Explain the "Confidential Client" vs. "Public Client" distinction.**
* **A:** A **Confidential Client** (like a Node.js server) can keep a "Client Secret" safe. A **Public Client** (like a React app or Mobile app) cannot hide secrets from the user, so it must use flows like PKCE.

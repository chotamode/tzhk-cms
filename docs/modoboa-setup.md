# Self-hosted mail with Modoboa

How we run our own mail for `tzhk.dev` (and client domains): real mailboxes +
webmail **and** an SMTP server this CMS sends through (password resets, invites).

The CMS side is already wired: when `SMTP_HOST` is set, Payload sends through it
(`@payloadcms/email-nodemailer`, see `src/payload.config.ts`). This doc covers
the server that `SMTP_HOST` points at.

> History: we first scoped this around Mailcow, then evaluated Mox (too young)
> and landed on **Modoboa** — mature (since 2010), built on the battle-tested
> Postfix + Dovecot stack, with a clean multi-domain admin UI. This doc reflects
> what is actually deployed.

## TL;DR — the decisions

| Topic | Decision | Why |
|-------|----------|-----|
| Software | **Modoboa** (official installer) | Mature, Postfix/Dovecot under the hood, web admin UI, multi-domain, per-domain admins for clients |
| Antispam | **Rspamd** (not Amavis/ClamAV) | Much lighter; Rspamd also handles DKIM signing |
| Where it runs | **A dedicated Hetzner VPS** — NOT the Coolify node | Modoboa installs its own nginx on 80/443; mail also wants a clean host + its own PTR/reputation |
| Sizing | 4 GB RAM + 2 GB swap (CX-class) | Installer needs ≥2 GB; Rspamd keeps it light |
| Hostname | `mail.tzhk.dev` | Installer arg is the **bare domain** (`tzhk.dev`); it derives `mail.<domain>` |
| Admin model | We administer everything ourselves | Domains/mailboxes in the Modoboa UI; hand clients only their webmail login |

> **Do not run Modoboa on the Coolify node.** Modoboa's nginx binds 80/443, which
> Coolify's Traefik already owns → collision. Mixing mail with web apps also means
> a Coolify rebuild/outage takes down every client's mail. Keep mail isolated.

> **If you attach the mail VPS to Coolify** (handy for the terminal / monitoring),
> you **must disable Coolify's proxy on that server** (Servers → [mail server] →
> Proxy → None/Disabled) so it doesn't start a `coolify-proxy` on 80/443. Never
> deploy a web resource there. Modoboa is **not** a Coolify resource — it's a
> native install managed over SSH; Coolify is just the dashboard for the box.

## Architecture

```
 VPS #1  (Coolify)                          VPS #2  (mail, native install)
 ┌──────────────────────┐   SMTP 587/STARTTLS  ┌────────────────────────────┐
 │ Coolify              │ ───────────────────► │ Modoboa  (mail.tzhk.dev)   │
 │  - tzhk-cms (Payload)│                      │  Postfix  send/receive     │
 │  - other sites       │                      │  Dovecot  mailboxes/IMAP   │
 └──────────────────────┘                      │  Rspamd   antispam + DKIM  │
        clients ─── IMAP 993 / webmail 443 ──► │  nginx    webmail + admin  │
                                               └────────────────────────────┘
```

Live box (reference): Hetzner CX-class, Ubuntu, 4 GB RAM + 2 GB swap,
IPv4 `91.99.163.104`, IPv6 `2a01:4f8:1c18:24b7::1`, hostname `mail.tzhk.dev`.

## 1. Provision the mail VPS (Hetzner)

1. Create the server (Ubuntu LTS). **IPv6-only is not enough for mail** — add an
   IPv4 (Networking → Add IPv4, ~€0.50/mo): many receivers/senders are still
   IPv4-only.
2. **Reverse DNS (PTR):** Networking → set rDNS for **both** IPv4 and IPv6 to
   `mail.tzhk.dev` (single value each — no stray `mail.` / `mail.local.`
   entries). Without a matching PTR, Gmail/Outlook reject or spam-folder mail.
3. Set hostname + swap:
   ```bash
   hostnamectl set-hostname mail.tzhk.dev
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```
4. If the box is in Coolify: disable the proxy and confirm 80/443/25 are free
   before installing:
   ```bash
   docker ps | grep -i proxy        # nothing; if a coolify-proxy lingers, stop+rm it
   ss -ltnp | grep -E ':25|:80|:443'  # empty
   ```

## 2. DNS records (set on `tzhk.dev`, at name.com)

| Type | Host | Value | Notes |
|------|------|-------|-------|
| A | `mail` | `91.99.163.104` | mailserver host |
| AAAA | `mail` | `2a01:4f8:1c18:24b7::1` | |
| MX | *(root)* | `mail.tzhk.dev` (priority `10`) | **only one MX** — remove any leftover SES/Resend inbound MX |
| TXT | *(root)* | `v=spf1 mx ~all` | SPF |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:postmaster@tzhk.dev` | **exactly one** DMARC record |
| TXT | `modoboa._domainkey` | `v=DKIM1; k=rsa; p=...` | DKIM — added after step 4 |
| CNAME | `autoconfig` | `mail.tzhk.dev` | client autoconfig |
| CNAME | `autodiscover` | `mail.tzhk.dev` | Outlook autoconfig |

> Two common foot-guns we hit: **duplicate MX** (split delivery) and **two DMARC
> TXT records** (DMARC becomes invalid and is ignored). Keep one of each.

## 3. Install Modoboa

The installer argument is the **bare domain** — it serves the panel at
`mail.<domain>`. Passing `mail.tzhk.dev` produces `mail.mail.tzhk.dev` (wrong).

```bash
apt update && apt -y install git python3
cd /opt
git clone https://github.com/modoboa/modoboa-installer
cd modoboa-installer
sudo python3 run.py --interactive tzhk.dev
```
In the prompts choose: **PostgreSQL**, antispam **Rspamd**, Let's Encrypt **yes**.
On success it prints `https://mail.tzhk.dev (admin:password)` — log in and change
the admin password immediately.

> If you ran it wrong (e.g. double `mail.`), the cleanest fix on an empty box is a
> Hetzner **Rebuild** + reinstall with the correct `tzhk.dev` arg, rather than
> editing `installer.cfg` in place. The installer lives at `/srv/modoboa`
> (`env/` venv, `instance/` Django project).

## 4. Domain, mailbox, and DKIM

1. Admin → **Domains → Add domain** `tzhk.dev`, **enable DKIM**, selector
   `modoboa`, key length `2048`.
2. Admin → **Identities → Add → Mailbox** `no-reply@tzhk.dev` (this password is
   the CMS `SMTP_PASS`). "Send only" is fine for a no-reply sender. You must add
   the domain **before** the mailbox, or you get
   `No Domain matches the given query`.
3. Generate the DKIM key on disk (Rspamd signs, **there is no OpenDKIM** with the
   Rspamd antispam choice):
   ```bash
   cd /srv/modoboa/instance
   sudo -u modoboa /srv/modoboa/env/bin/python manage.py modo manage_dkim_keys
   ```
   This writes `/var/lib/dkim/tzhk.dev.pem` (owned by `_rspamd`).
4. **Create the Rspamd signing maps** — the installer's
   `/etc/rspamd/local.d/dkim_signing.conf` references two maps that
   `manage_dkim_keys` does **not** populate, so signing silently does nothing
   until you create them:
   ```bash
   echo "tzhk.dev modoboa" > /var/lib/dkim/selectors.path.map
   echo "tzhk.dev /var/lib/dkim/tzhk.dev.pem" > /var/lib/dkim/keys.path.map
   chown _rspamd:_rspamd /var/lib/dkim/*.map
   chmod 644 /var/lib/dkim/*.map
   systemctl restart rspamd
   ```
   (The conf has `try_fallback = false`, so without these maps Rspamd has nothing
   to sign with.)
5. Publish the public key. Get the DNS value from the admin (Domains → tzhk.dev)
   or derive it:
   ```bash
   echo "v=DKIM1; k=rsa; p=$(openssl rsa -in /var/lib/dkim/tzhk.dev.pem -pubout 2>/dev/null | sed '1d;$d' | tr -d '\n')"
   ```
   Add it as `modoboa._domainkey` TXT (step 2 table), then verify:
   ```bash
   dig +short TXT modoboa._domainkey.tzhk.dev
   ```

## 5. Point the CMS at it (Coolify)

On the `tzhk-cms` service set (code already reads these — `src/payload.config.ts`):

```
SMTP_HOST=mail.tzhk.dev
SMTP_PORT=587
SMTP_SECURE=                 # blank — 587 is STARTTLS
SMTP_USER=no-reply@tzhk.dev
SMTP_PASS=<no-reply mailbox password>
EMAIL_FROM=no-reply@tzhk.dev
EMAIL_FROM_NAME=TZHK
```
Redeploy, then trigger a password-reset from the admin to confirm delivery.

## 6. Verify deliverability

Send a test to https://www.mail-tester.com (or to Gmail → *Show original*) and
confirm **SPF / DKIM / DMARC all pass**. Our live result is **9.5/10**.

- If DKIM shows as *not signed*: the maps in step 4.4 are missing/empty, or the
  selector in the map ≠ the published `..._domainkey` host.
- A small blacklist hit (e.g. UCEPROTECT covering Hetzner's range) is usually
  ignored by Gmail. Spamhaus listings are worth delisting.
- Fresh IP/domain reputation is the last mile: send real mail consistently and
  have recipients mark "not spam". It settles over days–weeks. If you ever need
  warmed IPs immediately, you can switch CMS sending to a managed relay
  (Resend/Migadu) by changing only the `SMTP_*` vars, keeping mailboxes here.

## Maintenance

- Modoboa is a native install — manage services with `systemctl`
  (`postfix`, `dovecot`, `rspamd`, `nginx`). Coolify is only the box dashboard.
- Adding a client: Domains → Add domain, enable DKIM, run `manage_dkim_keys`,
  add that domain to the two Rspamd maps, set the client's DNS
  (MX → `mail.tzhk.dev`, SPF, DKIM, DMARC), then create their mailbox.

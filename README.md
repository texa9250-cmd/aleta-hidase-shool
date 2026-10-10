# School website backend

## Run it
1. Install Node.js 22.13 or newer (the current LTS is fine).
2. In this folder: `npm install`
3. Copy `.env.example` to `.env` and fill it in (JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD).
4. `npm start`
5. Public page: http://localhost:3000   Staff login: http://localhost:3000/admin

The first admin account is created from `.env` on the first start. After that you can remove ADMIN_PASSWORD from `.env`.

## Who can do what
- Public visitors: read published announcements only.
- Publisher: log in, post announcements, edit or delete their own.
- Admin: everything a publisher can do, on all announcements, plus add/remove staff and reset passwords.

## Before going live
- Serve the site over HTTPS (use a host that provides it, or put nginx/Caddy in front). Passwords are sent on login.
- Keep `.env` and `school.db` private and back up `school.db` regularly.
- Use a long random JWT_SECRET.

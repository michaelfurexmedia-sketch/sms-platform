# Frontend review — Phase 2.6

## Phase 2.6 owner review

Update your existing Mac checkout (stop the old server with Control+C first):

```sh
cd ~/sms-platform
git pull --ff-only
npm run setup
npm run build
npm start
```

Public website: http://localhost:3000/ . Customer: http://localhost:3000/app .
Use Explore demo workspace for synthetic data. No real messages or payments.

Private administrator preview, separately in another terminal:

```sh
cd ~/sms-platform
npm run preview:owner
```

Owner entry: http://127.0.0.1:3001/admin/login . No credentials required because
this is synthetic local-only review, not implemented authentication. Never tunnel
or deploy this owner server. Normal application servers deny administrator routes.
The launcher binds to loopback and rejects managed preview environments.
See PHASE26_ADMIN_SECURITY.md for the mandatory Phase 3 authentication gate.

# Deployment — requirements only

No deployment has been configured or tested. No hosting purchase is authorized. Vercel is prohibited.

Target a portable Linux VPS with Docker Compose. After capacity validation, one host may run the web/API, persistent worker, PostgreSQL and compatible queue datastore. Coolify is optional; Cloudflare may handle DNS/edge services.

Before commercial launch: validate provider costs/capacity; pin tested images; keep database/queue on private networks; configure HTTPS, firewall, least-privilege service credentials, persistent volumes, health checks and restart policies. Configure logs/metrics/alerts, encrypted off-site backups and retention. Test restore to a clean environment, document RPO/RTO, and rehearse application rollback with migration compatibility.

Record exact deployment commands, backup/restore commands and rollback procedure only after they exist and have been tested. The local candidate's static review server is not a production deployment.

Configuration values in .env.example are planning placeholders, not functioning integration settings. Never commit secrets. Keep provider credentials server-side. Domain, company/support information and final hosting are owner inputs needed later.

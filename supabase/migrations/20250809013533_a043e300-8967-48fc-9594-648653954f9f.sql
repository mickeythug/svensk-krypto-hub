-- Enable required extensions for scheduled HTTP calls
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Helper: upsert cron jobs safely (drop if exists by name then recreate)
select cron.unschedule(jobid)
from cron.job
where jobname in ('market-prefetch-hourly', 'token-prices-refresh-3min');

-- Hourly market snapshot (2 pages)
select cron.schedule(
  'market-prefetch-hourly',
  '0 * * * *',
  $$
  select
    net.http_post(
      url := 'https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/market-prefetch?refresh=true&pages=2',
      headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbGxjcnZvbXhkcmh0a3FwY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI3NzIsImV4cCI6MjA3MDE0ODc3Mn0.heVnPPTIYaR2AHpmM-v2LPxV_i4KT5sQE9Qh_2woB9U","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbGxjcnZvbXhkcmh0a3FwY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI3NzIsImV4cCI6MjA3MDE0ODc3Mn0.heVnPPTIYaR2AHpmM-v2LPxV_i4KT5sQE9Qh_2woB9U"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- Every 3 minutes token price refresh (2 pages)
select cron.schedule(
  'token-prices-refresh-3min',
  '*/3 * * * *',
  $$
  select
    net.http_post(
      url := 'https://jcllcrvomxdrhtkqpcbr.supabase.co/functions/v1/token-prices-refresh?refresh=true&pages=2',
      headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbGxjcnZvbXhkcmh0a3FwY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI3NzIsImV4cCI6MjA3MDE0ODc3Mn0.heVnPPTIYaR2AHpmM-v2LPxV_i4KT5sQE9Qh_2woB9U","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbGxjcnZvbXhkcmh0a3FwY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzI3NzIsImV4cCI6MjA3MDE0ODc3Mn0.heVnPPTIYaR2AHpmM-v2LPxV_i4KT5sQE9Qh_2woB9U"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
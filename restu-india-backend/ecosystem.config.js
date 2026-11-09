// PM2 ecosystem file — production process manager config
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'restu-india-api',
      script: 'src/server.js',
      instances: 'max',          // one worker per CPU core
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Graceful reload — zero-downtime deploys
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Log rotation (requires pm2-logrotate module)
      error_file: '/var/log/restu-india/err.log',
      out_file: '/var/log/restu-india/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};

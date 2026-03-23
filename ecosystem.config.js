module.exports = {
  apps: [
    {
      name: 'leave-dashboard',
      script: 'dist/main.js',
      cwd: '/var/www/leave-dashboard/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_PATH: '/var/www/leave-dashboard/backend/data/leave.db',
      },
      // Restart if the app crashes, but don't restart loop-crash
      max_restarts: 10,
      restart_delay: 3000,
      // Keep logs under /var/log/pm2/
      out_file: '/var/log/pm2/leave-dashboard-out.log',
      error_file: '/var/log/pm2/leave-dashboard-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};

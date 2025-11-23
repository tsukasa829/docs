module.exports = {
  apps: [{
    name: 'wiki-proxy',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: true,
    watch_delay: 1000,
    ignore_watch: [
      'node_modules',
      'logs',
      '.git',
      '*.log'
    ],
    max_memory_restart: '200M',
    env_development: {
      NODE_ENV: 'development',
      PORT: 50321
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 50321,
      watch: false
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    time: true
  }]
};

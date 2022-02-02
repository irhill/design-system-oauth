module.exports = {
  apps: [{
    name: 'netlify-oauth',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-52-56-69-61.eu-west-2.compute.amazonaws.com',
      key: '~/.ssh/design-system-oauth.pem',
      ref: 'origin/main',
      repo: 'https://github.com/irhill/netlify-oauth.git',
      path: '/home/ubuntu/netlify-oauth',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
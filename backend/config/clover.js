const BASE_URLS = {
  production: 'https://api.clover.com',
  sandbox: 'https://apisandbox.dev.clover.com',
};

const getCloverBaseUrl = () => BASE_URLS[process.env.CLOVER_ENV] || BASE_URLS.production;

module.exports = { getCloverBaseUrl };

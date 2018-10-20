Package.describe({
  summary: "Open Humans OAuth. Modified kljenson's coursera flow to support Open Humans oauth",
  version: "0.1.0",
  documentation: '',
  git: ''
});

Package.onUse(function(api) {
  api.use('accounts-base@1.2.0', ['client', 'server']);
  api.imply('accounts-base@1.2.0', ['client', 'server']);
  api.use('accounts-oauth@1.1.5', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Openhumans');

  api.addFiles("openhumans.js");
  api.addFiles('openhumans_server.js', 'server');
  api.addFiles('openhumans_client.js', 'client');
});
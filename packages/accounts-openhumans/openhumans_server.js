Openhumans = {};

OAuth.registerService('openhumans', 2, null, function(query) {
  var accessToken = getAccessToken(query);
  var profile = getProfile(accessToken);

  return {
    serviceData: {
      id: profile.project_member_id,
      accessToken: OAuth.sealSecret(accessToken),
      profile: profile
    },
    options: {profile: {name: profile.username}}
  };
});

var getAccessToken = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'openhumans'});
  if (!config){
    throw new ServiceConfiguration.ConfigError();
  }
  var response;
  try {
    response = HTTP.post(
      "https://www.openhumans.org/oauth2/token/", {
        auth: config.clientId + ":" + config.secret,
        params: {
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: OAuth._redirectUri('openhumans', config).replace("?close", "")  //'http://localhost:3000/_oauth/openhumans'
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Open Humans. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Open Humans. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getProfile = function (accessToken) {
  var config = ServiceConfiguration.configurations.findOne({service: 'openhumans'});
  try {
    var profileResponse = HTTP.get(
      "https://www.openhumans.org/api/direct-sharing/project/exchange-member/", {
        auth: config.clientId + ":" + config.secret,
        params: {access_token: accessToken}
    });
    return profileResponse.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Open Humans. " + err.message),
                   {response: err.response});
  }
};


Openhumans.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
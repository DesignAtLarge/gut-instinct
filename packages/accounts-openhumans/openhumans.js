Accounts.oauth.registerService('openhumans');

if (Meteor.isClient) {
  Meteor.loginWithOpenhumans = function(options, callback) {
    // support a callback without options
    if (! callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Openhumans.requestCredential(options, credentialRequestCompleteCallback);
  };
} else {
  Accounts.addAutopublishFields({
    forLoggedInUser: ['services.openhumans'],
    forOtherUsers: ['services.openhumans.username']
  });
}
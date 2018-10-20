import {
    Meteor
} from 'meteor/meteor';
// import sslRootCas from 'ssl-root-cas/latest';
// sslRootCas.inject();

Meteor.methods({

    'email.getToken' () {
        console.log("returning token" + Meteor.settings.emailToken);
        return Meteor.settings.emailToken;
    },
    'email.getAPI' () {
        console.log("returning api");
        return Meteor.settings.emailAPI;
    }
});
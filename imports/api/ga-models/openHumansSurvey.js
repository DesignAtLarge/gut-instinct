import {
    Meteor
} from 'meteor/meteor';

export const OpenHumansSurvey = new Mongo.Collection('ga_openhumans_survey');

Meteor.methods({
    'galileo.openhumanssurvey.submit': function(email, interestArray) {
        return OpenHumansSurvey.insert({
            email: email,
            interests: interestArray
        });
    }
});
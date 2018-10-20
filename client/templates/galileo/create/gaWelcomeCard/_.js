import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaWelcomeCard.rendered = function() {

};

Template.gaWelcomeCard.onCreated(function() {});

Template.gaWelcomeCard.helpers({
    isDemo: function() {
        return Session.get('isDemo');
    }
});

Template.gaWelcomeCard.events({});
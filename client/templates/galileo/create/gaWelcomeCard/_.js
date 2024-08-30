import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

import {
    Session
} from 'meteor/session'

Template.gaWelcomeCard.rendered = function () {

};

Template.gaWelcomeCard.onCreated(function () { });

Template.gaWelcomeCard.helpers({
    isDemo: function () {
        return Session.get('isDemo');
    }
});

Template.gaWelcomeCard.events({});
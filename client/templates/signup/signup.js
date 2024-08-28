import { Template } from 'meteor/templating';

import './signup.html';

Template.signup.rendered = function () {

};

Template.signup.onCreated(function () { });

Template.signup.helpers({
    error_message: function () {
        return Template.instance().error.get();
    },
    homeUrl: function () {
        if (Template.instance().isGalileo.get()) {
            return "/galileo/home";
        } else {
            return "/";
        }
    },
    imageUrl: function () {
        if (Template.instance().isGalileo.get()) {
            return "/images/galileo/galileo-logo-white.png";
        } else {
            return "images/logos/gi_basic_dark_bg.png";
        }
    }
});


Template.signup.events({

});
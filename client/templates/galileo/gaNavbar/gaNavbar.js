import { Template } from 'meteor/templating';

import './gaNavbar.html';

Template.gaNavbar.onCreated(function () {
    // Initialization code
});

Template.gaNavbar.helpers({
    loggedIn: function() {
        return "2353511";
    },
    username: function() {
        return "3rwhghshhrq";
    },
    intuitionAmount: function() {
        return Template.instance().intuitionAmount.get();
    },
    experimentAmount: function() {
        return Template.instance().experimentAmount.get();
    },
    notifications: function() {

        return [];
    },
    hasNotification: function() {
        return true;
    },
    needTourBanner: function() {
        return Template.instance().needTourBanner.get();
    },
    getMendel: function() {
        return "dbdababab";
    },
    hasMendel: function() {
        return true;
    },
});

import { Template } from 'meteor/templating';

import './username.html';

Template.username.rendered = function () {

};

Template.username.onCreated(function () { });

Template.username.helpers({

    init: function () {

    },
    getCurrentName: function () {
        return "abc";
    },
    getEmail: function () {
        return "abc";
    },
    getAGID: function () {
        try {
            if (Meteor.user()) {
                return Template.instance().profileObj.get().agid;
            } else {
                console.log("User not populated");
            }
        } catch (e) { }
    },
    preEnterName: function () {
        return false;
    },
    preEmail: function () {
        return false;
    },
    preAGID: function () {
        return true;
    },
    notGalileo: function (instance) {
        return !Template.instance().isGalileo.get();
    },
    isGalileo: function (instance) {
        return Template.instance().isGalileo.get();
    },
    getCity: function (instance) {
        try { // fills it if there's something already
            if (Meteor.userId()) {
                return Template.instance().galileoObj.get().city;
            } else {
                console.log("City not populated");
            }
        } catch (e) { }
    },
    getCountry: function (instance) {
        try { // fills it if there's something already
            if (Meteor.userId()) {
                let country = Template.instance().galileoObj.get().country;
                if (country) {
                    $("#ga-country").val(country);
                    $("#ga-country").material_select();
                    return country;
                } else {
                    return "";
                }
            } else {
                console.log("Country not populated");
            }
        } catch (e) { }
    },
    getTimeZone: function (instance) {
        try { // fills it if there's something already
            if (Meteor.userId()) {
                let timezone = Template.instance().galileoObj.get().timezone;
                if (timezone) {
                    $("#ga-timezone").val(timezone);
                    $("#ga-timezone").material_select();
                    return timezone;
                } else {
                    if ($("#ga-timezone").val() === null || $("#ga-timezone") === undefined || $("#ga-timezone") === "") {
                        x = new Date();
                        let offset = ((x.stdTimezoneOffset()) * -1) / 60;
                        $("#ga-timezone").val(offset);
                        $("#ga-timezone").material_select();
                        return timezone;
                    }
                }
            } else {
                console.log("Timezone not populated");
            }
        } catch (e) { }
    },
    getDst: function () {
        try { // fills it if there's something already
            if (Meteor.userId()) {
                let isDst = Template.instance().galileoObj.get().isDst;
                if (isDst) {
                    $("#ga-dst").val(isDst);
                    $("#ga-dst").material_select();
                    return isDst;
                } else {
                    if ($("#ga-dst").val() === null || $("#ga-dst") === undefined || $("#ga-dst") === "") {
                        x = new Date()
                        toReturn = "0";

                        if (x.isDST()) {
                            toReturn = "1";
                        }

                        $("#ga-dst").val(toReturn);
                        $("#ga-dst").material_select();
                        return toReturn;
                    }
                }

            } else {
                console.log("DST not populated");
            }
        } catch (e) { }
    },

});


Template.username.events({

});
import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';


import {
    //UserTestResponse
    UserEmail
} from '../../../imports/api/models.js';
import { redirect } from '../../../imports/api/ga-routes.js';

Template.username.rendered = function () { };

Template.username.onRendered(function () {

    /* $(document).ready(function() {
         Materialize.updateTextFields();
 
         $('select').material_select();
     });*/
});

Template.username.onCreated(function () {
    let inst = this;
    this.profileObj = new ReactiveVar(null);
    this.timezone = new ReactiveVar(null);
    this.country = new ReactiveVar(null);
    this.city = new ReactiveVar(null);
    this.isDst = new ReactiveVar(null);
    this.galileoObj = new ReactiveVar(null);

    Meteor.call("users.getUsername", function (err, username) {
        if (err) {
            alert("Server Connection Error");
        } else {
            inst.profileObj.set(UserEmail.findOne({
                username: username
            }));
            setTimeout(function () {
                //Materialize.updateTextFields();
            }, 200);
            Meteor.call("galileo.profile.getProfile", function (err, profile) {
                if (err) {
                    throw new Meteor.Error("Server Connection Error");
                } else {
                    inst.galileoObj.set(profile);
                    setTimeout(function () {
                        // Materialize.updateTextFields();
                    }, 200);
                }
            });
        }
    });

    this.isGalileo = new ReactiveVar(this.data && this.data.isGalileo);
});

Template.username.helpers({
    init: function () {

    },
    getCurrentName: function () {
        try {
            if (Meteor.userAsync()) {
                return Meteor.userAsync().username;
            } else {
                console.log("User not populated");
            }
        } catch (e) { }
    },
    getEmail: function () {
        var email = Meteor.user().emails[0].address;
        console.log(email);
        return email;
        try {
            if (Meteor.user()) {
                console.log(Meteor.user().emails[0].address);
                if (Meteor.userAsync().profile.source === 2) return Meteor.userAsync().emails[0].address;
                if (Meteor.userAsync().profile.source === 3) return Meteor.userAsync().services.google.email;
                if (Meteor.userAsync().profile.source === 4) return Meteor.userAsync().services.facebook.email;
                return Template.instance().profileObj.get().email;
                //
            } else {
                console.log("User not populated");
            }
        } catch (e) { }
    },
    getAGID: function () {
        try {
            if (Meteor.userAsync()) {
                return Template.instance().profileObj.get().agid;
            } else {
                console.log("User not populated");
            }
        } catch (e) { }
    },
    preEnterName: function () {
        try {
            if (Meteor.userAsync()) {
                if (typeof Meteor.userAsync().username !== 'undefined') {
                    return true;
                }
                return false;
            }
        } catch (e) { }

        // if (typeof Meteor.userAsync().username != 'undefined') {
        //     return true;
        // }
        //return false;
    },
    preEmail: function () {
        return true;
        try {
            if (Meteor.userAsync()) {
                if (Meteor.userAsync().profile.source === 3 || Meteor.userAsync().profile.source === 4 || Meteor.userAsync().profile.source === 2) return true;
                if (Template.instance().profileObj.get().email === "") return false;
                else return true;
            }
        } catch (e) { }

        // if (typeof Meteor.userAsync().username != 'undefined') {
        //     return true;
        // }
        //return false;
    },
    preAGID: function () {
        try {
            if (Meteor.userAsync()) {
                if (Template.instance().profileObj.get().agid && Template.instance().profileObj.get() !== "") return true;
                if (Template.instance().profileObj.get().email === "") return false;
                else return true;
            }
        } catch (e) { }
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
    "click #logout": function () {
        redirect("/galileo/logout");
    },
    'click #facebook-btn': function () {
        window.open("https://www.facebook.com/gutinstinct.ucsd");
    },
    'click #twitter-btn': function () {
        window.open("https://twitter.com/GutInstinctUCSD");
    },

    'click #submitTest': function (event, instance) {
        event.preventDefault();

        let isGalileo = Template.instance().isGalileo.get();
        let inst = Template.instance();

        function validateEmail(email) {
            console.log("checking email value --> " + email);
            let re =
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        let tryUserName = $('#userNameAnswerText').val().trim();
        let tryEmail = $('#emailAnswerText').val().trim();

        let tryAgid = '';
        if (instance.isGalileo.get() === false) {
            tryAgid = $('#agidText').val().trim();
        }


        if (tryEmail !== "") {
            if (!validateEmail(tryEmail)) {
                alert('Please enter a valid email address');
                return;
            }
        }
        Meteor.call('profile.addUserName', tryUserName);
        console.log('calling galileo.profile.setUsernameToured');
        Meteor.call('galileo.profile.setUsernameToured', function (err, res) {
            if (err) {
                console.log(err);
            } else {
                redirect("/galileo/me");
            }
        });

        if (tryUserName === '') {
            return;
        }
        Meteor.call('profile.checkExist', tryUserName, function (error, result) {
            if (!document.getElementById('userNameAnswerText').disabled) {
                Meteor.call('profile.addUserName', tryUserName);
                Meteor.call('galileo.profile.setUsernameToured', function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        redirect("/galileo/browse");
                    }
                });
            }
        });
    }
});

import "./_.jade"

import {
    UserEmail
} from '../../../../../imports/api/models.js';

Template.gaMeProfile.onRendered(function() {

    $(document).ready(function() {
        $('ul.tabs').tabs({
            'swipeable': false
        });
        Materialize.updateTextFields();

        $('select').material_select();
    });
});

Template.gaMeProfile.onCreated(function() {

    var inst = this;
    this.profileObj = new ReactiveVar(null);
    this.notificationObj = new ReactiveVar(null);
    this.interest = new ReactiveVar(null);
    this.phone = new ReactiveVar(null);
    this.timezone = new ReactiveVar(null);
    this.isDst = new ReactiveVar(null);
    this.ethicsCertificate = new ReactiveVar("");
    this.city = new ReactiveVar(null);
    this.galileoObj = new ReactiveVar(null);
    this.country = new ReactiveVar(null);

    Meteor.call("users.getUsername", function(err, username) {
        if (err) {
            alert("Server Connection Error");
        } else {
            inst.profileObj.set(UserEmail.findOne({
                username: username
            }));
            setTimeout(function() {
                Materialize.updateTextFields();
            }, 200);
        }
    });

    Meteor.call("galileo.profile.getNotificationSetting", function(err, notif) {
        if (err) {
            alert("Server Connection Error");
        } else {
            inst.notificationObj.set(notif);

            if (notif.onMyExp) {
                $("#on-my-exp-checkbox").prop("checked", true);
            }
            if (notif.onFollowingExp) {
                $("#on-following-exp-checkbox").prop("checked", true);
            }
            if (notif.onJoinedExp) {
                $("#on-joined-exp-checkbox").prop("checked", true);
            }
            if (notif.onFeedbackProvidedExp) {
                $("#on-feedback-provided-exp-checkbox").prop("checked", true);
            }
            if (notif.onNewExpAdded) {
                $("#on-new-exp-added-checkbox").prop("checked", true);
            }
            Materialize.updateTextFields();
        }
    });

    Meteor.call("galileo.profile.getProfile", function(err, profile) {
        if (err) {
            throw new Meteor.Error("server connection error");
        } else {

            inst.galileoObj.set(profile);
            setTimeout(function() {
                Materialize.updateTextFields();
            }, 200);

            // Set phone number
            if (profile.phone) {
                inst.phone.set(profile.phone);
            }

            // Set timezone
            if (profile.timezone) {
                inst.timezone.set(profile.timezone);
            }
            // Set city
            if (profile.city) {
                inst.city.set(profile.city);
            }

            // set country
            if (profile.country) {
                inst.country.set(profile.country)
            }

            // set isDst
            if (profile.isDst) {
                inst.isDst.set(profile.isDst);
            }

            // Set interest
            inst.interest.set(profile.interest);

            // Set ethics certificate
            inst.ethicsCertificate.set(profile.ethicsCertificate);
        }
    });
});

Template.gaMeProfile.helpers({
    init: function() {

    },
    getCurrentUserName: function() {
        var profile = Template.instance().profileObj;
        if (profile.get()) {
            return profile.get().username;
        } else {
            return '';
        }
    },
    getCurrentEmail: function() {
        var profile = Template.instance().profileObj;
        if (profile.get()) {
            var searchEmail = profile.get().email;
            if (searchEmail === undefined || searchEmail === '' || searchEmail === 'no-email@example.com') {
                return '';
            } else {
                return searchEmail;
            }
        } else {
            return '';
        }
    },
    getCurrentAGID: function() {
        var profile = Template.instance().profileObj;
        if (profile.get()) {
            var searchAG = profile.get().agid;
            if (searchAG === undefined || searchAG === '' || searchAG === 'no-id') {
                return '';
            } else {
                return searchAG;
            }
        } else {
            return '';
        }
    },
    getCountry: function(instance) {
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
        } catch (e) {}
    },
    getCurrentLocation: function() {
        var profile = Template.instance().galileoObj;
        if (profile.get()) {
            var searchLoc = profile.get().city;
            if (searchLoc === undefined || searchLoc === '' || searchLoc === 'no-location') {
                return '';
            } else {
                return searchLoc;
            }
        } else {
            return '';
        }
    },
    hasEmail: function() {
        var profile = Template.instance().profileObj;
        if (profile.get()) {
            var searchEmail = profile.get().email;
            if (searchEmail === undefined || searchEmail === '' || searchEmail === 'no-email@example.com') {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    },
    getPhone: function() {
        var phone = Template.instance().phone.get();
        if (phone) {
            return phone;
        } else {
            return "";
        }
    },
    getTimezone: function() {
        let timezone = Template.instance().timezone.get();
        if (timezone) {
            $('#ga-timezone').val(timezone);

            // re-initialize material-select
            $('#ga-timezone').material_select();

            return timezone;
        } else {
            return "";
        }
    },
    getDst: function() {
        let isDst = Template.instance().isDst.get();
        if (isDst) {
            $('#ga-dst').val(isDst);

            // re-initialize material-select
            $('#ga-dst').material_select();

            return isDst;
        } else {
            return "";
        }
    },
    getInterest: function() {
        var interest = Template.instance().interest.get();
        if (interest) {
            return interest;
        } else {
            return "";
        }
    },
    finishedEthicsTraining: function() {
        return Template.instance().ethicsCertificate.get() !== undefined;
    },
    ethicsCertificate: function() {
        return Template.instance().ethicsCertificate.get();
    }
});

Template.gaMeProfile.events({
    'click #delete-account-btn': function(event) {
        if (confirm("Do you really want to delete your profile? This action cannot be restored.")) {
            Meteor.call("galileo.profile.deleteProfile", function(err, result) {
                if (!err) {
                    window.location.href = "/";
                }
            });
        }
    },
    'change #on-my-exp-checkbox': function(event) {
        if ($(event.target).prop('checked')) {
            Meteor.call('galileo.profile.notification.enableOnMyExp');
        } else {
            Meteor.call('galileo.profile.notification.disableOnMyExp');
        }
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
    },
    'change #on-following-exp-checkbox': function(event) {
        if ($(event.target).prop('checked')) {
            Meteor.call('galileo.profile.notification.enableOnFollowingExp');
        } else {
            Meteor.call('galileo.profile.notification.disableOnFollowingExp');
        }
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
    },
    'change #on-joined-exp-checkbox': function(event) {
        if ($(event.target).prop('checked')) {
            Meteor.call('galileo.profile.notification.enableOnJoinedExp');
        } else {
            Meteor.call('galileo.profile.notification.disableOnJoinedExp');
        }
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
    },
    'change #on-feedback-provided-exp-checkbox': function(event) {
        if ($(event.target).prop('checked')) {
            Meteor.call('galileo.profile.notification.enableOnFeedbackProvidedExp');
        } else {
            Meteor.call('galileo.profile.notification.disableOnFeedbackProvidedExp');
        }
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
    },
    'change #on-new-exp-added-checkbox': function(event) {
        if ($(event.target).prop('checked')) {
            Meteor.call('galileo.profile.notification.enableOnNewExpAdded');
        } else {
            Meteor.call('galileo.profile.notification.disableOnNewExpAdded');
        }
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
    },
    'submit #galileo-basic-profile-form': function(event) {
        let inst = Template.instance();
        var interest = $("#ga-profile-interest-input").val().trim();
        if (interest != "" && interest != Template.instance().interest.get()) {
            Meteor.call('galileo.profile.setInterest', interest, function(error) {
                let msg = "Interest Saved";
                if (error) {
                    msg = error.error;
                }
                inst.interest.set(interest);
                Materialize.toast(msg, 1500, 'toast rounded');
            });
        }
        var country = $("#ga-country").val().trim();
        if (country != "" && country != Template.instance().country.get()) {
            Meteor.call('galileo.profile.setCountry', country, function(error) {
                let msg = "Country Saved";
                if (error) {
                    msg = error.error;
                }
                inst.country.set(country);
                Materialize.toast(msg, 1500, 'toast rounded');
            });

        }
        var city = $("#ga-profile-location-input").val().trim();
        if (city != "" && city != Template.instance().city.get()) {
            Meteor.call('galileo.profile.setCity', city, function(error) {
                let msg = "City Saved";
                if (error) {
                    msg = error.error;
                }
                inst.city.set(city);
                Materialize.toast(msg, 1500, 'toast rounded');
            });

        }
        var phone = $("#ga-profile-phone-input").val().trim();
        if (phone != "" && phone != Template.instance().phone.get()) {
            Meteor.call("galileo.profile.setPhone", phone, function(error) {
                let msg = "Phone Number Saved!";
                if (error) {
                    msg = error.error;
                }
                inst.phone.set(phone);
                Materialize.toast(msg, 1500, 'toast rounded');
            });

        }
        var timezone = $("#ga-timezone").val();
        if (timezone != "" && timezone != Template.instance().timezone.get()) {
            timezone = parseInt(timezone);
            Meteor.call("galileo.profile.setTimeZoneOnly", timezone, function(error) {
                let msg = "Timezone Saved!";
                if (error) {
                    msg = error.error;
                }
                inst.timezone.set(timezone);
                Materialize.toast(msg, 1500, 'toast rounded');
            });

        }
        var isDst = $("#ga-dst").val();
        if (isDst != "" && isDst != Template.instance().isDst.get()) {
            Meteor.call("galileo.profile.setIsDstOnly", isDst, function(error) {
                let msg = "isDst Saved!";
                if (error) {
                    msg = error.error;
                }
                inst.isDst.set(isDst);
                Materialize.toast(msg, 1500, 'toast rounded');
            });

        }
        return false;
    }
});
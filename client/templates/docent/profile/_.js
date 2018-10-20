import './_.jade';

import {
    UserEmail
} from '../../../../imports/api/models.js';

Template.profile.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.profile.onCreated(function() {
    this.error = new ReactiveVar('');
    this.state = new ReactiveDict();
    this.state.set('signin', true);
    this.state.set('signup', false);

    var inst = this;
    this.profileObj = new ReactiveVar(null);
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
});

Template.profile.onRendered(function() {
    //document.querySelector('.initialized').style.height = "500px";
    $('#delete-modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .3, // Opacity of modal background
        inDuration: 200, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '40%', // Starting top style attribute
        endingTop: '40%', // Ending top style attribute
    });

    function renderNotification() {
        if ($('#n3checkbox').length > 0) {
            Meteor.call('profile.getNotificationArray', function(error, result) {
                if (result[0] == 1) {
                    $('#n0checkbox').prop('checked', true);
                }

                if (result[1] == 1) {
                    $('#n1checkbox').prop('checked', true);
                }

                if (result[2] == 1) {
                    $('#n2checkbox').prop('checked', true);
                }

                if (result[3] == 1) {
                    $('#n3checkbox').prop('checked', true);
                }

                if (result[4] == 1) {
                    $('#n4checkbox').prop('checked', true);
                }
            });
        }
    }

    $(document).ready(function() {
        ////console.log("doc ready");
        $('ul.tabs').tabs({
            'swipeable': false
        });
        renderNotification();
        setTimeout(function() {
            Materialize.updateTextFields();
            renderNotification();
            setTimeout(function() {
                Materialize.updateTextFields();
                renderNotification();
                setTimeout(function() {
                    Materialize.updateTextFields();
                    renderNotification();
                }, 200)
            }, 200)
        }, 200)
    });

    $("#header-logo").show();

});

Template.profile.helpers({
    init: function() {

    },
    getCurrentUserName: function() {
        try {
            if (Meteor.user()) {
                return Meteor.user().username;
            }
        } catch (e) {}
    },
    getCurrentEmail: function() {
        try {
            if (Meteor.user()) {
                let searchEmail = UserEmail.findOne({
                    username: Meteor.user().username
                }).email;
                if (searchEmail === undefined || searchEmail === '' || searchEmail === 'no-email@example.com') {
                    return '';
                } else {
                    return searchEmail;
                }
            }
        } catch (e) {}

    },
    getCurrentAGID: function() {
        try {
            if (Meteor.user()) {
                let searchAG = UserEmail.findOne({
                    username: Meteor.user().username
                }).agid;
                if (searchAG === undefined || searchAG === '' || searchAG === 'no-id') {
                    return '';
                } else {
                    return searchAG;
                }
            }
        } catch (e) {}
    },
    getCurrentLocation: function() {
        try {
            if (Meteor.user()) {
                let searchLoc = UserEmail.findOne({
                    username: Meteor.user().username
                }).location;
                if (searchLoc === undefined || searchLoc === '' || searchLoc === 'no-location') {
                    return '';
                } else {
                    return searchLoc;
                }
            }
        } catch (e) {}
    },
    hasEmail: function() {
        try {
            if (Meteor.user()) {
                let searchEmail = UserEmail.findOne({
                    username: Meteor.user().username
                }).email;
                if (searchEmail === undefined || searchEmail === '' || searchEmail === 'no-email@example.com') {
                    return false;
                } else {
                    return true;
                }
            }
        } catch (e) {}
    },
    getWhyInterested: function() {
        var profile = Template.instance().profileObj;
        if (profile.get()) {
            return profile.get().interest;
        } else {
            return '';
        }
    },
    isCondition7: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                ////console.log("my condition is in" + condition);
                return condition == 7;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition2or4or0or6or9or11: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11;
            }
        } catch (e) {
            return false;
        }
    },
});

Template.profile.events({
    'change #n0checkbox': function(event) {
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
        if ($('#n0checkbox').prop('checked')) {
            Meteor.call('profile.setNotificationArray', 0, 1);
        } else {
            Meteor.call('profile.setNotificationArray', 0, 0);
        }
    },
    'change #n1checkbox': function(event) {
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
        if ($('#n1checkbox').prop('checked')) {
            Meteor.call('profile.setNotificationArray', 1, 1);
        } else {
            Meteor.call('profile.setNotificationArray', 1, 0);
        }
    },
    'change #n2checkbox': function(event) {
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
        if ($('#n2checkbox').prop('checked')) {
            Meteor.call('profile.setNotificationArray', 2, 1);
        } else {
            Meteor.call('profile.setNotificationArray', 2, 0);
        }
    },
    'change #n3checkbox': function(event) {
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
        if ($('#n3checkbox').prop('checked')) {
            Meteor.call('profile.setNotificationArray', 3, 1);
        } else {
            Meteor.call('profile.setNotificationArray', 3, 0);
        }
    },
    'change #n4checkbox': function(event) {
        Materialize.toast('Notification setting saved!', 1500, 'toast rounded');
        if ($('#n4checkbox').prop('checked')) {
            Meteor.call('profile.setNotificationArray', 4, 1);
        } else {
            Meteor.call('profile.setNotificationArray', 4, 0);
        }
    },
    'submit #basic_profile': function(event) {
        event.preventDefault();

        function validateEmail(email) {
            //console.log("checking email value --> " + email);
            let re =
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function postEmail(token, api, emailUser) {
            //console.log("Calling api: " + api);
            var emailUserAddr = emailUser.email;

            $.ajax({
                type: "POST",
                url: api,
                data: {
                    token: token,
                    userEmail: emailUserAddr,
                    userName: Meteor.user().username,
                },
                success: function(data) {
                    //console.log("Onboarding email sent successfully!");
                }
            });
        }

        function sendOnboardingEmail() {
            //console.log("SENDING ONBOARDING EMAIL to " + Meteor.user().username);
            let currentUserName = Meteor.user().username;
            let emailUser = UserEmail.findOne({
                username: currentUserName
            });

            if (emailUser !== 'undefined' && 'email' in emailUser) {
                Meteor.call('email.getToken', function(error, result) {
                    if (error) {
                        //console.log("Error: " + error);
                        return;
                    }
                    //console.log("Recived email token.");

                    var currentToken = result;
                    Meteor.call('email.getAPI', function(error, result) {
                        var currentAPI = result;
                        //console.log("got api");
                        postEmail(currentToken, currentAPI + "sendOnboardingEmail",
                            emailUser);
                    });
                });
            } else {
                return;
            }

        }

        let emailInput = $('#useremail_field').val().trim();
        let locationInput = $('#userlocation_field').val().trim();
        let agidInput = $('#useragid_field').val().trim();
        let giInterestInput = $('#gi-profile-interest-input').val().trim();

        if (giInterestInput != '') {
            Meteor.call('profile.setGIInterest', giInterestInput);
        }

        if (!validateEmail(emailInput)) {
            alert('Please enter a valid email address');
            return;
        }

        let currentEmailObj = Template.instance().profileObj.get();;

        let targetID = currentEmailObj._id;

        let notificationSetting;

        if ('noticeSet' in currentEmailObj) {
            notificationSetting = currentEmailObj.noticeSet;
        } else {
            notificationSetting = [1, 1, 1, 1, 1];
        }

        if ('email' in currentEmailObj && currentEmailObj.email != "" && currentEmailObj.onboardingEmail) {
            UserEmail.update(targetID, {
                $set: {
                    email: emailInput,
                    agid: agidInput,
                    location: locationInput,
                    noticeSet: notificationSetting,
                }
            });
        } else {

            UserEmail.update(targetID, {
                $set: {
                    email: emailInput,
                    agid: agidInput,
                    location: locationInput,
                    noticeSet: notificationSetting,
                    onboardingEmail: true
                }
            }, function() {
                //console.log("Trying to send onboarding email.");
                setTimeout(sendOnboardingEmail(), 2000);
            });
        }

        Materialize.toast('Your basic profile is saved!', 1500, 'toast rounded');
    },
    'click #delete_button': function(event) {
        Meteor.call("profile.deleteUser");
        window.location.replace('/logout');
    }
});
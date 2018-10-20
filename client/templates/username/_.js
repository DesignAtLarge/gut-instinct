import './_.jade';

import {
    //UserTestResponse
    UserEmail
} from '../../../imports/api/models.js';

Template.username.rendered = function() {};

Template.username.onRendered(function() {

    $(document).ready(function() {
        Materialize.updateTextFields();

        $('select').material_select();
    });
});

Template.username.onCreated(function() {
    let inst = this;
    this.profileObj = new ReactiveVar(null);
    this.timezone = new ReactiveVar(null);
    this.country = new ReactiveVar(null);
    this.city = new ReactiveVar(null);
    this.isDst = new ReactiveVar(null);
    this.galileoObj = new ReactiveVar(null);

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
            Meteor.call("galileo.profile.getProfile", function(err, profile) {
                if (err) {
                    throw new Meteor.Error("Server Connection Error");
                } else {
                    inst.galileoObj.set(profile);
                    setTimeout(function() {
                        Materialize.updateTextFields();
                    }, 200);
                }
            });
        }
    });

    this.isGalileo = new ReactiveVar(this.data && this.data.isGalileo);
});

Template.username.helpers({
    init: function() {

    },
    getCurrentName: function() {
        try {
            if (Meteor.user()) {
                return Meteor.user().username;
            } else {
                console.log("User not populated");
            }
        } catch (e) {}
    },
    getEmail: function() {
        try {
            if (Meteor.user()) {
                if (Meteor.user().profile.source === 2) return Meteor.user().emails[0].address;
                if (Meteor.user().profile.source === 3) return Meteor.user().services.google.email;
                if (Meteor.user().profile.source === 4) return Meteor.user().services.facebook.email;
                return Template.instance().profileObj.get().email;
                //
            } else {
                console.log("User not populated");
            }
        } catch (e) {}
    },
    getAGID: function() {
        try {
            if (Meteor.user()) {
                return Template.instance().profileObj.get().agid;
            } else {
                console.log("User not populated");
            }
        } catch (e) {}
    },
    preEnterName: function() {
        try {
            if (Meteor.user()) {
                if (typeof Meteor.user().username !== 'undefined') {
                    return true;
                }
                return false;
            }
        } catch (e) {}

        // if (typeof Meteor.user().username != 'undefined') {
        //     return true;
        // }
        //return false;
    },
    preEmail: function() {
        try {
            if (Meteor.user()) {
                if (Meteor.user().profile.source === 3 || Meteor.user().profile.source === 4 || Meteor.user().profile.source === 2) return true;
                if (Template.instance().profileObj.get().email === "") return false;
                else return true;
            }
        } catch (e) {}

        // if (typeof Meteor.user().username != 'undefined') {
        //     return true;
        // }
        //return false;
    },
    preAGID: function() {
        try {
            if (Meteor.user()) {
                if (Template.instance().profileObj.get().agid && Template.instance().profileObj.get() !== "") return true;
                if (Template.instance().profileObj.get().email === "") return false;
                else return true;
            }
        } catch (e) {}
    },
    notGalileo: function(instance) {
        return !Template.instance().isGalileo.get();
    },
    isGalileo: function(instance) {
        return Template.instance().isGalileo.get();
    },
    getCity: function(instance) {
        try { // fills it if there's something already
            if (Meteor.userId()) {
                return Template.instance().galileoObj.get().city;
            } else {
                console.log("City not populated");
            }
        } catch (e) {}
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
    getTimeZone: function(instance) {
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
                        let offset = ((x.stdTimezoneOffset()) * -1)/60;
                        $("#ga-timezone").val(offset);
                        $("#ga-timezone").material_select();
                        return timezone;
                    }
                }
            } else {
                console.log("Timezone not populated");
            }
        } catch (e) {}
    },
    getDst: function() {
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
        } catch (e) {}
    },



});

Template.username.events({
    'click #facebook-btn': function () {
        window.open("https://www.facebook.com/gutinstinct.ucsd");
    },
    'click #twitter-btn': function () {
        window.open("https://twitter.com/GutInstinctUCSD");
    },

    'click #submitTest': function(event, instance) {
        event.preventDefault();

        let isGalileo = Template.instance().isGalileo.get();
        let inst = Template.instance();

        if (isGalileo) {
            let country = $("#ga-country").val();
            if (country !== "" && country != null) {
                inst.country.set(country);
                Meteor.call('galileo.profile.setCountry', country, function(err) {
                    if (err) {
                        Materialize.toast('Error!', 1500, 'toast rounded');
                    }
                });

            }

            let city = $('#ga-city').val().trim();
            if (city !== "" && city != null) {
                inst.city.set(city);
                Meteor.call('galileo.profile.setCity', city, function(err) {
                    if (err) {
                        Materialize.toast('Error!', 1500, 'toast rounded');
                    }
                });

            }

            let timezone = $("#ga-timezone").val();
            //let timezone = "-7";
            let isDst = $("#ga-dst").val();
            //let isDst = "0";
            if (timezone === null || timezone === "") {
                Materialize.toast('Please pick your timezone', 2500, 'toast rounded');
                return;
            } else if (isDst === null || isDst === "") {
                Materialize.toast('Please answer Daylight savings question', 2500, 'toast rounded');
                return;
            } else {
                timezone = parseInt(timezone);
                inst.timezone.set(timezone);
                inst.isDst.set(isDst);
                Meteor.call("galileo.profile.setTimeZone", timezone, isDst, function(err) {
                    if (err) {
                        Materialize.toast('Error!', 1500, 'toast rounded');
                    }
                });
            }
        }

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

        if (tryUserName === '') {
            Materialize.toast("Please select a username", 2000, "toast");
            return;
        }




        Meteor.call('profile.checkExist', tryUserName, function(error, result) {
            if (!document.getElementById('userNameAnswerText').disabled && result) {
                Materialize.toast("Username already exists; Please pick a new one.", 2000, "toast");
                return;
            }

            if (!document.getElementById('userNameAnswerText').disabled) {
                Meteor.call('profile.addUserName', tryUserName);
            }

            let city = inst.city.get();
            Meteor.call('profile.insertFullProfile', tryUserName, tryEmail, tryAgid, function(err, result) {
                function postEmail(token, api, emailUser) {
                    let emailUserAddr = emailUser.email;
                    let emailUserName = emailUser.username;
                    $.ajax({
                        type: "POST",
                        url: api,
                        data: {
                            token: token,
                            userEmail: emailUserAddr,
                            userName: emailUserName,
                        },
                        success: function(data) {
                            console.log("onboarding email sent");
                        }
                    });
                }

                function sendOnboardingEmail() {
                    console.log("SENDING ONBOARDING EMAIL to " + tryUserName);

                    if (isGalileo) {
                        Meteor.call('galileo.users.sendOnBoardingEmail');
                    } else {
                        let currentUserName = Meteor.user().username;
                        let emailUser = UserEmail.findOne({
                            username: currentUserName
                        });

                        if (emailUser !== 'undefined' && 'email' in emailUser) {
                            Meteor.call('email.getToken', function(error, result) {
                                if (error) {
                                    console.log("Error: " + error);
                                    return;
                                }
                                console.log("Recived email token.");

                                let currentToken = result;
                                Meteor.call('email.getAPI', function(error, result) {
                                    let currentAPI = result;
                                    console.log("got api");
                                    postEmail(currentToken, currentAPI + "sendOnboardingEmail",
                                        emailUser);
                                });
                            });

                        }
                    }
                }

                // calling this before sending on boarding email because that operation takes a long time to return
                if (isGalileo) {
                    console.log('calling galileo.profile.setUsernameToured');
                    Meteor.call('galileo.profile.setUsernameToured', function(err, res) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }

                if (result)
                    sendOnboardingEmail();

                // TODO: calling this after onboarding flow for now, figure out onboarding blocking stuff
                if (isGalileo) {
                    if (localStorage.getItem("loginRedirectUrl")) {
                        let redirectTo = localStorage.getItem("loginRedirectUrl");
                        localStorage.removeItem('loginRedirectUrl');
                        console.log('going to ' + redirectTo);
                        window.location.href = redirectTo;
                    } else if (localStorage.getItem("mendelcode_ga") && localStorage.getItem("mendelcode_ga") != "undefined" && localStorage.getItem("mendelcode_ga") != "") {
                        console.log("going to browse - " + localStorage.getItem("mendelcode_ga"))
                        window.location.href = '/galileo/browse'
                    } else {
                        console.log('going to entrance');
                        window.location.href = '/galileo/entrance';
                    }
                    return;
                }


                //docent-exp
                let username;
                let condition;

                try {
                    if (Meteor.user()) {
                        username = Meteor.user().username;
                        condition = Meteor.user().profile.condition;
                        if (username === "expert" && Meteor.user().profile.condition !== 0) {
                            Meteor.users.update(Meteor.userId(), {
                                $set: {
                                    'profile.condition': 0
                                }
                            });
                        }
                        if (username === "expert" || username === "citizen") {
                            Meteor.call('user.updateHasAddedQuestion');
                        }
                    }
                } catch (e) {}


                setTimeout(function() {
                    console.log('updating username_page toured later');
                    Meteor.users.update(Meteor.userId(), {
                        $set: {
                            'profile.toured.username_page': true
                        }
                    });
                    condition = Meteor.user().profile.condition;

                    if (condition === 7) {
                        window.location.href = '/trial';
                    } else {
                        if (isGalileo) {
                            if (localStorage.getItem("loginRedirectUrl")) {
                                let redirectTo = localStorage.getItem("loginRedirectUrl");
                                localStorage.removeItem('loginRedirectUrl');
                                console.log('going to ' + redirectTo);
                                window.location.href = redirectTo;
                            } else {
                                console.log('going to entrance');
                                window.location.href = '/galileo/entrance';
                            }
                            return;
                        } else {
                            window.location.href = '/entrance';
                        }
                    }
                }, 500);
            });
        });



        /*if ($('#userAnswerText').val() === '') {
            alert("Please tell us your understanding about the gut microbiome before continuing!");
            return;
        }

        const userRes = $('#userAnswerText').val().trim();
        const userRes = " ";  // Temporary user response

        let checkExist = (typeof UserTestResponse.findOne({
            "username": Meteor.user().username
        }) !== 'undefined');

        if (checkExist) {
            let targetID = UserTestResponse.findOne({
                "username": Meteor.user().username
            })._id;
            UserTestResponse.update({
                _id: targetID
            }, {
                $set: {
                    "pretest_response": userRes
                }
            });

        } else {
            UserTestResponse.insert({
                "username": Meteor.user().username,
                "pretest_response": userRes
            });
        } */

        // if (!document.getElementById('userNameAnswerText').disabled) {
        //     Meteor.call('profile.addUserName', tryUserName);
        // }

        // Meteor.call('profile.insertFullProfile', tryUserName);

        // //docent-exp
        // let username;
        // let condition;
        // try {
        //     if (Meteor.user()) {
        //         username = Meteor.user().username;
        //         condition = Meteor.user().profile.condition;
        //     }
        // } catch (e) {}


        // if (condition == 1) { //cond-1 goes directly to gutboard - others go to introduction sequence
        //     window.location.href = '/gutboard';
        //     return;
        // } else {
        //     if (condition == 2) {
        //         //window.location.href = '/t/introduction';
        //         window.location.href = '/entrance';
        //         return;
        //     } else
        //     if (condition == 3) {
        //         //window.location.href = '/t/introduction';
        //         window.location.href = '/entrance';
        //         //return;
        //     } else { //in some weird case when cond is not 1,2,or 3 - we route to best version
        //         //window.location.href = '/t/introduction';
        //         window.location.href = '/entrance';
        //         return;
        //     }
        // }
    }
});


Date.prototype.stdTimezoneOffset = function() {
    var fy=this.getFullYear();
    if (!Date.prototype.stdTimezoneOffset.cache.hasOwnProperty(fy)) {

        var maxOffset = new Date(fy, 0, 1).getTimezoneOffset();
        var monthsTestOrder=[6,7,5,8,4,9,3,10,2,11,1,0];

        for(var mi=0;mi<12;mi++) {
            var offset=new Date(fy, monthsTestOrder[mi], 1).getTimezoneOffset();
            if (offset!=maxOffset) { 
                maxOffset=Math.max(maxOffset,offset);
                break;
            }
        }
        Date.prototype.stdTimezoneOffset.cache[fy]=maxOffset;
    }
    return Date.prototype.stdTimezoneOffset.cache[fy];
};
Date.prototype.isDST = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset(); 
};

Date.prototype.stdTimezoneOffset.cache={};

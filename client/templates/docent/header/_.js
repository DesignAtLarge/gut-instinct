import './_.jade';

import {
    Questions,
    Notifications,
    Bookmarks,
    UserEmail
} from '../../../../imports/api/models.js';

Template.header.rendered = function() {
    // $('.button-collapse').sideNav();
    const routeName = Router.current().route.getName();
    try {
        $("#_" + routeName + "_").addClass('active');
    } catch (e) {
        if (routeName === 'q.:hashcode') {
            $("#_gutboard_").addClass('active');
        } else if (routeName === 't.:name') {
            $("#_topics_").addClass('active');
        }
    }

    try {
        if (Meteor.user()) {
            if (Meteor.user().username.length < 5) {
                $("#userDrop").css('padding-left', '50px');
            }

        }
    } catch (e) {}


    if (window.location.href.indexOf("/gutboard") > -1 && window.location.href.indexOf("/gutboard_slider_addq") < 0) $("#gutboard").addClass("pressed");
    else $("#gutboard").removeClass("pressed");

    if (window.location.href.indexOf("/topics") > -1 || window.location.href.indexOf("/t/") > -1) $("#topics").addClass("pressed");
    else $("#topics").removeClass("pressed");

    if (window.location.href.indexOf("/guide") > -1 || window.location.href.indexOf("/guide_question") > -1 || window.location.href.indexOf("/guide_result") > -1) $("#guide").addClass("pressed");
    else $("#guide").removeClass("pressed");

    if (window.location.href.indexOf("/addq") > -1 || window.location.href.indexOf("/gutboard_slider_addq") > -1) $("#addq").addClass("pressed");
    else $("#addq").removeClass("pressed");
}

Template.header.onCreated(function() {
    this.sideNav = new ReactiveVar(false);
});

Template.header.helpers({
    init: function() {
        function updateURL() {
            $(".dropdown-button").dropdown();
            var currentMendelHeader = sessionStorage.getItem("mendelcode");
            setTimeout(function() {
                if (currentMendelHeader != undefined) {
                    $('#gutboardMendelLink').attr("href", "/gutboard/" + currentMendelHeader);
                } else {
                    updateURL();
                }
                $(".dropdown-button").dropdown();
            }, 250);
        }

        updateURL();
    },
    user: function() {
        try {
            return Meteor.user().username;
        } catch (e) {
            return '';
        }
    },
    counter: function() {
        try {
            if (Meteor.user()) {
                const answered = Meteor.user().profile.answered;
                const questions = Questions.find({}).fetch();

                var answered_count = 0;
                var unanswered_count = questions.length;

                for (var i = 0; i < questions.length; i++) {
                    var question = questions[i];
                    if (answered[question.hash] && answered[question.hash].length >= 3) {
                        answered_count++;
                        unanswered_count--;
                    }
                }
                return {
                    answered: answered_count,
                    unanswered: unanswered_count
                };
            }
        } catch (e) {
            return {
                answered: 0,
                unanswered: 0
            };
        }
    },
    isLearnCondition: function() {
        try {
            var condition = Meteor.user().profile.condition;
            return condition == 1;
        } catch (e) {
            return false;
        }

        // var username = Meteor.user().username;
        // if (username[0] === 'p' && !isNaN(parseInt(username.substring(1)))) {
        //     const participant = parseInt(username.substring(1));
        //     if (participant >= 6 && participant <= 10) {
        //         return true;
        //     }
        // }
        // return false;
    },
    isWorkCondition: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                return condition == 2;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition1or3or5or8or10: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 3 || condition == 5 || condition == 8 || condition == 10;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition1: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition2: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition7: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 7;
            }
        } catch (e) {
            return false;
        }

    },
    isCondition1or2or7or8or9: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 2 || condition == 7 || condition == 8 || condition == 9;
            }
        } catch (e) {
            return false;
        }
    },
    renderNotification: function() {
        var dbNotificationCheck = _.sortBy(Notifications.find({
            raw_owner_name: Meteor.user().username,
            isRead: 0
        }).fetch(), function(object) {
            return object.created_at.getTime();
        }).reverse();

        return dbNotificationCheck;
    },
    getNotificationCount: function() {
        var dbNotificationCheck = Notifications.find({
            raw_owner_name: Meteor.user().username,
            isRead: 0
        }).fetch();
        return dbNotificationCheck.length;
    },
    getBookmarkCount: function() {
        var dbBkCheck = Bookmarks.find({
            owner: {
                'username': Meteor.user().username,
                '_id': Meteor.userId()
            }
        }).fetch();
        return dbBkCheck.length;
    },
    isUnreadNotification: function() {
        if (typeof Meteor.user() === 'undefined') {
            return false;
        }

        var dbNotificationCheck = Notifications.find({
            raw_owner_name: Meteor.user().username,
            isRead: 0
        }).fetch();
        if (dbNotificationCheck.length == 0) {
            return false;
        } else {
            return true;
        }

    },
    isBookmarkCount: function() {
        if (typeof Meteor.user() === 'undefined') {
            return false;
        }

        var dbBkCheck = Bookmarks.find({
            owner: {
                'username': Meteor.user().username,
                '_id': Meteor.userId()
            }
        }).fetch();
        if (dbBkCheck.length == 0) {
            return false;
        } else {
            return true;
        }

    },
    getMendelCode: function() {
        return sessionStorage.mendelcode;
    },
    hasEmail: function() {
        try {
            if (Meteor.user()) {
                let searchEmail = UserEmail.findOne({
                    username: Meteor.user().username
                }).email;
                if (searchEmail === undefined || searchEmail === '' || searchEmail === 'no-email@example.com')
                    return false;
                else
                    return true;
            }
        } catch (e) {}
    },
    visitedTopics: function() {
        try {
            if (Meteor.user())
                return Meteor.user().profile.toured.topics;
        } catch (e) {}
    }
});

Template.header.events({
    'click #mobileMenuSwitch': function(event) {
        $('#mobile-demo').css("transform", "translateX(0%)");
        $('#mobile-demo').addClass("animated slideInLeft");

        setTimeout("$('#mobile-demo').removeClass('animated slideInLeft');", 1000);
        // $('#mobile-demo').addClass("animated slideInLeft");
    },
    'click .closeMobileMenuSwitch': function(event) {
        $('#mobile-demo').addClass("animated slideOutLeft");
        $('#mobile-demo').css("transform", "translateX(-105%)");
        setTimeout("$('#mobile-demo').removeClass('animated slideOutLeft');", 1000);

    },
    'click #addQuestionControlHeader': function(event, instance) {

        const guide_completed = Meteor.user().profile.guide_completed;
        console.log("guide_completed is " + guide_completed);

        var condition = Meteor.user().profile.condition;
        //console.log("my condition is in" + condition);
        //docent-exp
        if (condition == 3 || condition == 4 || condition == 5 || condition == 6) {
            if (!guide_completed) {
                alert(
                    "Before you add your question, Gut Instinct will guide you into asking great questions!"
                );
                window.location.replace("/guide");
            } else {
                //
            }
        }
        /*$("#addQuestionDiv").show();
         $("#sliderControl").hide();
         $("#backSliderControl").hide();
         $("#addQuestionControl").hide();
         $("#activeQuestionDiv").hide();
         $("#questionStatusTabs").hide();*/
        else {
            window.location.replace("/gutboard_slider_addq");
        }
    },
    /*'click #bugControlHeader': function(event, instance) {

     const guide_completed = Meteor.user().profile.guide_completed;
     console.log("guide_completed is "+guide_completed);

     //if(!doneTraining) {
     if(!guide_completed){
     alert("Before you add your question, Gut Instinct will guide you into asking great questions!");
     window.location.replace("/guide");
     }
     else{
     /*$("#addQuestionDiv").show();
     $("#sliderControl").hide();
     $("#backSliderControl").hide();
     $("#addQuestionControl").hide();
     $("#activeQuestionDiv").hide();
     $("#questionStatusTabs").hide();
     window.location.replace("/gutboard_slider_addq");

     }
     },*/
    'click .logout': function(event) {
        event.preventDefault();

        $('.modal').modal();
        $('#logout-modal').modal('open');
        //Router.go("/logout");
        // Meteor.logout();
        // location.reload();
    },
    'click #logout': function(event) {
        event.preventDefault();
        Router.go("/logout");
        // Meteor.logout();
        // location.reload();
    },
    'click #notification-button': function(event) {
        $('.modal').modal();
        $('#notification-modal').modal('open');
    },
    'click .readNotificationLink': function(event) {
        // event.preventDefault();
        var currentNoticeID = $(event.target).attr('noticeid-data');

        Notifications.update(currentNoticeID, {
            $set: {
                isRead: 1
            }
        });
    },
    'click #popAddCard': function() {
        $('html, body').animate({
            scrollTop: 0
        }, 'fast');
    },
    // 'click .dropdown-button': function() {
    //     $('.dropdown-button').dropdown({
    //         hover: true
    //     });
    // },
    // 'click .button-collapse': function(event, instance) {
    //     var shown = instance.sideNav.get();
    //     if (shown) {
    //         $('.button-collapse').sideNav('hide');
    //     } else {
    //         $('.button-collapse').sideNav();
    //     }
    //     instance.sideNav.set(false);
    // },
    'click .glasspane': function() {
        //introJs().setOption('showProgress', true).start();
        introJs().setOption('showProgress', true).start();
    },
    'click .guttest-button': function() {
        sessionStorage.setItem('clicked-guttest', true);
    },
    'submit #gutsearch': function(e) {
        e.preventDefault();

        let search = $("#searchQuery").val().trim();

        window.location.replace('/gutboard/' + sessionStorage.mendelcode + '/search?q=' + search);
    }
});
import './_.jade';

import {
    PersonalQuestions,
    Tags
} from '../../../../imports/api/models.js';

var currentDisplay = 1;
var maxDisplay = 7;

Template.guide_question_welcome.rendered = function() {
    try {
        if (Meteor.user()) {
            const toured = Meteor.user().profile.toured.guide_question_info;
            //console.log("intro_completed is" + Meteor.user().profile.intro_completed);
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.call('user.updateProfileTouredGuideQuestionInfo');
                }).start();
            }
            $("#back-bottom").hide();
        } else {
            console.log("Meteor user not created yet");
        }
    } catch (e) {}
}

Template.guide_question_welcome.onCreated(function() {
    let docentProgress = localStorage.getItem("docentProgress")

    if (!docentProgress) {
        localStorage.setItem("docentProgress", 0);
        docentProgress = 0;
    }
    this.progress = new ReactiveVar(docentProgress);
    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.guide_question_welcome.helpers({
    getProgressData() {
        return {
            progress: Template.instance().progress.get()
        };
    },
    init: function() {

    },
    personal_questions: function() {
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResult = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch();
        return personalFetchResult;
    }
});

Template.guide_question_welcome.events({
    'click #submit-button': function(event) {

        // check user has got all questions
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResultCount = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch().length;

        if ($("input:radio:checked").length < personalFetchResultCount) {
            alert("Please answer all the questions on this page.");
        } else {
            alert("Thank you! You can now explore the topic.");
            // save user's answer in db
            var personalFetchResult = PersonalQuestions.find({
                "tag": currentQueryTag
            }).fetch();

            for (var i = 0; i < personalFetchResult.length; i++) {
                var userRes = $($("input:radio:checked")[i]).attr("personal-id");
                var targetID = personalFetchResult[i]._id;
                var targetUser = Meteor.user().username;
                PersonalQuestions.update({
                    _id: targetID
                }, {
                    $push: {
                        answers: {
                            username: targetUser,
                            response: userRes
                        }
                    }
                });
            }
            var redirectURL = "/t/" + window.location.pathname.split('/').filter(function(el) {
                return !!el;
            }).pop();

            // store the personal question status in tag db
            var targetTagID = Tags.findOne({
                name: currentQueryTag
            })._id;
            var targetUserName = Meteor.user().username;

            Tags.update({
                _id: targetTagID
            }, {
                $push: {
                    viewed_user: targetUserName
                }
            });

            window.location.replace(redirectURL);
        }
    },
    'click #sliderControl': function(event) {


        const intro_completed = Meteor.user().profile.intro_completed;
        const condition = Meteor.user().profile.condition;

        if (intro_completed) {
            if (condition == 1 || condition == 2 || condition == 8 || condition == 9)
                window.location.replace("/addq");
            else if (condition == 7) {
                let docentProgress = localStorage.getItem("docentProgress");
                if (docentProgress < 50) localStorage.setItem("docentProgress", 50);
                $('#sliderControl').attr('href', '/topics');
                //window.location.replace("/topics");
            } else {
                let docentProgress = localStorage.getItem("docentProgress");
                if (docentProgress < 50) localStorage.setItem("docentProgress", 50);
                $('#sliderControl').attr('href', '/guide_question');
                //window.location.replace("/guide_question");
            }
        } else {
            let docentProgress = parseInt(localStorage.getItem("docentProgress"));
            if (condition == 1 || condition == 2 || condition == 8 || condition == 9) {
                if (docentProgress < 50) localStorage.setItem("docentProgress", 50);
            } else if (condition == 7) {
                if (docentProgress < 50) localStorage.setItem("docentProgress", 50);
            } else {
                if (docentProgress < 50) localStorage.setItem("docentProgress", 50);
            }
            $('#sliderControl').attr('href', '/t/introduction');
            //window.location.replace("/t/introduction");
        }

        // if(currentDisplay == maxDisplay){
        //     alert("This is the last tip. Please use left arrow to see the previous tip!");
        //     return;
        // }
        // var targetHide = "#card-" + currentDisplay;
        // $(targetHide).hide();
        // currentDisplay = currentDisplay + 1;
        // var targetShow = "#card-" + currentDisplay;
        // console.log("targetShow changed" + targetShow);
        // $(targetShow).show();
        //
        // if(currentDisplay == maxDisplay){
        //     $("#next-btn").show();
        // }
    }
});


Template.guide_question_welcome.helpers({
    isGuideCompleted: function() {
        try {
            if (Meteor.user()) {
                const guide_completed = Meteor.user().profile.guide_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return guide_completed;
            }
        } catch (e) {}
    },
    isIntroCompleted: function() {
        try {
            if (Meteor.user()) {
                const intro_completed = Meteor.user().profile.intro_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return intro_completed;
            }
        } catch (e) {}
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
    isCondition2or7: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2 || condition == 7;
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
    isCondition1or2or8or9: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 2 || condition == 8 || condition == 9;
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
});
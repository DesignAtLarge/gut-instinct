import './_.jade';

// import {
//     PersonalQuestions,
//     Tags
// } from '../../../../imports/api/models.js';

var currentDisplay = 1;
var maxDisplay = 7;

//var five_opened = false'

Template.guide_question_info.rendered = function() {

    try {
        if (Meteor.user()) {
            const toured = Meteor.user().profile.toured.guide_question_info;
            //console.log("intro_completed is " + Meteor.user().profile.intro_completed);
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.call('user.updateProfileTouredGuideQuestionInfo');
                }).start();
            }
            $("#back-bottom").hide();
        } else {
            //console.log("Meteor user not created yet");
        }
    } catch (e) {}
}

Template.guide_question_info.onCreated(function() {
    let docentProgress = localStorage.getItem("docentProgress")
    if (!docentProgress) {
        localStorage.setItem("docentProgress", 50);
        docentProgress = 50;
    }
    this.progress = new ReactiveVar(docentProgress);

    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.guide_question_info.onRendered(function() {
    $(document).ready(function() {
        $('.collapsible').collapsible();
        $('.collapsible').collapsible();
    });
});

Template.guide_question_info.helpers({
    getProgressData() {
        return {
            progress: Template.instance().progress.get()
        };
    },
    init: function() {},
    personal_questions: function() {
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        // var personalFetchResult = PersonalQuestions.find({
        //     "tag": currentQueryTag
        // }).fetch();
        // return personalFetchResult;
        Meteor.call('personalQuestions.fetchPersonalQuestionsByTag', currentQueryTag, function(error, result) {
            localStorage.removeItem("personalFetchResult")
            localStorage.setItem("personalFetchResult", JSON.stringify(result));
        });

        return mongoJsonify(localStorage.getItem("personalFetchResult"));
    }
});

Template.guide_question_info.events({
    'click #submit-button': function(event) {

        // check user has got all questions
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        // var personalFetchResultCount = PersonalQuestions.find({
        //     "tag": currentQueryTag
        // }).fetch().length;
        var personalFetchResultCount = mongoJsonify(localStorage.getItem("personalFetchResult")).length;


        if ($("input:radio:checked").length < personalFetchResultCount) {
            alert("Please answer all the questions on this page.");
        } else {
            alert("Thank you! You can now explore the topic.");
            // save user's answer in db
            // var personalFetchResult = PersonalQuestions.find({
            //     "tag": currentQueryTag
            // }).fetch();

            var personalFetchResult = mongoJsonify(localStorage.getItem("personalFetchResult"));

            for (var i = 0; i < personalFetchResult.length; i++) {
                var userRes = $($("input:radio:checked")[i]).attr("personal-id");
                var targetID = personalFetchResult[i]._id;

                var targetUser;
                try {
                    if (Meteor.user()) {
                        targetUser = Meteor.user().username;
                    }
                } catch (e) {}

                // PersonalQuestions.update({
                //     _id: targetID
                // }, {
                //     $push: {
                //         answers: {
                //             username: targetUser,
                //             response: userRes
                //         }
                //     }
                // });
                Meteor.call('personalQuestions.pushAnswers', targetID, targetUser, userRes);
            }
            var redirectURL = "/t/" + window.location.pathname.split('/').filter(function(el) {
                return !!el;
            }).pop();

            // store the personal question status in tag db
            var targetUserName = Meteor.user().username;
            Meteor.call('tags.pushViewedStatus', currentQueryTag, targetUserName);
            // var targetTagID = Tags.findOne({
            //     name: currentQueryTag
            // })._id;
            // var targetUserName = Meteor.user().username;

            // Tags.update({
            //     _id: targetTagID
            // }, {
            //     $push: {
            //         viewed_user: targetUserName
            //     }
            // });

            window.location.replace(redirectURL);
        }
    },
    'click #sliderControl': function(event) {
        let docentProgress = localStorage.getItem("docentProgress");
        if (docentProgress < 85) {
            localStorage.setItem("docentProgress", 85);
        }
        $('#sliderControl').attr('href', '/guide_result');
        //window.location.replace('/guide_result');

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
    },
    'click #backSliderControl': function(event) {
        const guide_completed = Meteor.user().profile.guide_completed;
        if (guide_completed) {
            $('#backSliderControl').attr('href', '/guide');
            //window.location.replace('/guide');
        } else {
            $('#backSliderControl').attr('href', '/t/introduction');
            //window.location.replace('/t/introduction');
        }

        // if(currentDisplay == 1){
        //     alert("This is the first tip. Please use right arrow to see the next tip!");
        //     return;
        // }
        // var targetHide = "#card-" + currentDisplay;
        // $(targetHide).hide();
        // currentDisplay = currentDisplay - 1;
        // var targetShow = "#card-" + currentDisplay;
        // console.log("targetShow changed" + targetShow);
        //
        // $(targetShow).show();
    },
    /*
        'click #addOptionFollowupBtn': function(event) {
            var currentOptionNumber = parseInt($(event.target).parent().find('.followup-option').attr(
                'option-number'));

            if ($(event.target).parent().find('#followup_question').val() == '') {
                Materialize.toast("Please add your question before adding the options.", 4000);
                //alert("Please add your question before adding the options.");
                return;
            }
            if ($(event.target).parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() ==
                '') {
                Materialize.toast("Please complete this option before adding more options.", 4000);
                //alert("Please complete this option before adding more options.");
                return;
            }

            $(event.target).parent().find('.followup-option').attr('option-number', currentOptionNumber + 1);
            $(event.target).parent().find('.option-' + (currentOptionNumber + 1)).show();

        },
        'click #addExtraL2Question': function(event) {
            $('#addExtraL2QuestionOptionsDiv').hide();

            var extraFollowUpDivArr = $('.extra-followup');
            for (var followIndex = 0; followIndex < extraFollowUpDivArr.length; followIndex++) {
                if ($(extraFollowUpDivArr[followIndex]).css('display') == 'none') {

                    if (followIndex - 1 >= 0 && $(extraFollowUpDivArr[followIndex - 1]).find(
                            '.extra-followup-question').val().trim() == '') {
                        Materialize.toast('Please enter a question before continue', 4000);
                        //alert('Please enter a question before continue');
                        return;
                    }

                    $(extraFollowUpDivArr[followIndex]).show();
                    return;
                }
            }
        },
        'click .addq-nextstep': function(event) {
            $($(event.target).parent().parent().next().children()[0]).click();
        },
        'click .criteria-check': function(event) {
            for (var i = 0; i < 5; i++) {
                var item = document.getElementById("addq-checklist").getElementsByTagName("input")[i];
                if(!item.checked) {
                    if (five_opened) ($(event.target).parent().parent().parent().parent().next().children()[0]).click();
                    five_opened = false;
                    return;
                }
            }
            five_opened = true;
            $($(event.target).parent().parent().parent().parent().next().children()[0]).click();
        }, */
});


Template.guide_question_info.helpers({
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
    isGuideCompleted: function() {
        try {
            if (Meteor.user()) {
                const guide_completed = Meteor.user().profile.guide_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return guide_completed;
            }
        } catch (e) {}
    }
});
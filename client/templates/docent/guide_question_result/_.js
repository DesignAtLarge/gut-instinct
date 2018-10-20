import './_.jade';

import {
    TrainingQuestions,
    UserGuideResponse
} from '../../../../imports/api/models.js';

import {
    mongoJsonify
} from '../../../../imports/api/parsing';

var checkResponse = [];
var currentDBCheckResponse = [];
var currentDBReasonResponse = [];

Template.guide_question_result.rendered = function() {
    // Meteor.call('trainingQuestions.fetchTrainingQuestions', function (error, result) {
    //     localStorage.removeItem("trainingQs");
    //     localStorage.setItem("trainingQs", JSON.stringify(result));
    // });

    var numberQuestion = $('.guide-option-reason').length; //$('input:text').length;

    try {
        if (Meteor.user()) {
            var targetUser = Meteor.user().username;

            for (var i = 0; i < numberQuestion; i++) {
                //console.log("user res arr loop i is" + i);

                // Meteor.call('trainingQuestions.getUserResponse', i,  function (error, result) {
                //     localStorage.removeItem("userResponse_Q" + i);
                //     if (result == undefined) return;
                //     localStorage.setItem("userResponse_Q" + i, result);
                // });

                var correctAnswerArr = TrainingQuestions.findOne({
                    index: i
                }).correct_answer_index;

                var userResArr = UserGuideResponse.findOne({
                    username: targetUser
                });

                //var userResArr = localStorage.getItem("userResponse_Q" + i);
                if (userResArr == undefined) return;

                $("#" + i + "-reason").text(userResArr.reason_response[i]);

                for (var j = 0; j < userResArr.check_response[i].length; j++) {
                    //if (targetUser === userResArr[j].username) {
                    var check = 1;
                    if (userResArr.check_response[i][j] == 1) check = 0;
                    $("#guidecheck-" + i + "-" + j + "-radio-" + check).prop("checked", true);
                    // got target user
                    // var currentOption = userResArr[j].option_response;
                    // var currentReason = userResArr[j].option_reason;

                    // $("#" + currentOption).prop("checked", true);

                    // Meteor.call('trainingQuestions.getCorrectChoice', i,  function (error, result) {
                    //     localStorage.removeItem("correctChoice_Q" + i);
                    //     localStorage.setItem("correctChoice_Q" + i, result);
                    // });

                    // var correct_choice = localStorage.getItem("correctChoice_Q" + i);

                    // var correct_choice = TrainingQuestions.findOne({
                    //     index: i
                    // }).correct_answer_index;

                    // Meteor.call('trainingQuestions.getCorrectReason', i,  function (error, result) {
                    //     localStorage.removeItem("correctReason_Q" + i);
                    //     localStorage.setItem("correctReason_Q" + i, result);
                    // });

                    // var correct_solution = localStorage.getItem("correctReason_Q" + i);
                    // var correct_solution = TrainingQuestions.findOne({
                    //     index: i
                    // }).correct_reason;
                    // console.log("current correct_choice is " + correct_choice);

                    // $("#" + correct_choice + "-label").append(
                    //     "<span style='color: #8bc34a; font-weight: 700'>  -->Correct Answer</span>");
                    // if (correct_choice.substr(-1) == '1') {
                    //     $("#" + i + "-reason").val("This is a good question because: " + correct_solution);
                    // } else {
                    //     $("#" + i + "-reason").val("This is not a good question because: " + correct_solution);
                    // }
                    //}
                }
                //$("#submit-button-question-" + i).trigger("click");
            }
        }
    } catch (e) {}

    try {
        const toured = Meteor.user().profile.toured.guide_question_result;
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.guide_question_result': true
                    }
                });
            }).start();
        }
    } catch (e) {}

}

Template.guide_question_result.onCreated(function() {
    let docentProgress = localStorage.getItem("docentProgress")
    if (!docentProgress) {
        localStorage.setItem("docentProgress", 85);
        docentProgress = 85;
    }
    this.progress = new ReactiveVar(docentProgress);

    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.guide_question_result.helpers({
    getProgressData() {
        return {
            progress: Template.instance().progress.get()
        };
    },
    init: function() {},
    training_questions: function() {
        try {
            if (Meteor.user()) {
                var fetchResult = TrainingQuestions.find({}).fetch();
                var targetUser = Meteor.user().username;
                return fetchResult;
            }
        } catch (e) {}
        //return mongoJsonify(localStorage.getItem("trainingQs"));
    }
});

Template.guide_question_result.events({
    'click #submit-button-question-0': function(event) {

        if ($('.guide-option-0:radio:checked').length < 5) {
            Materialize.toast('Please answer all the questions before continuing!', 4000)
            return;
        }

        /*if ($('.guide-option:radio:checked').length == 10) {
            $('#submit-addq-button').toggle('show');
        }*/

        var userResponse = $('.guide-option-0:radio:checked');
        //var currentDBCheckResponse = [];
        //var currentDBReasonResponse = [];

        for (var i = 0; i < userResponse.length; i++) {
            var targetCheckInfoArr = $(userResponse[i]).attr('id').split('-');

            //console.log(targetCheckInfoArr);

            if (targetCheckInfoArr[4] == '0') {
                var guideQuestionClusterIndex = targetCheckInfoArr[1];
                var guideQuestionIndex = targetCheckInfoArr[2];
                currentDBCheckResponse[i] = (guideQuestionClusterIndex + '-' + guideQuestionIndex);
                //currentDBCheckResponse[i] = (guideQuestionClusterIndex + '-' + guideQuestionIndex);
            } else {
                currentDBCheckResponse[i] = 'X-X';
            }
        }
        //console.log(currentDBCheckResponse);

        var totalQuestionLength = $('.guide-option-reason').length;
        //for (var qIndex = 0; qIndex < totalQuestionLength; qIndex++) {
        var qIndex = 0;
        currentDBReasonResponse[qIndex] = $($('.guide-option-reason')[qIndex]).val().trim();

        if (currentDBReasonResponse[qIndex] == '') {
            Materialize.toast('Please explain your choices.', 4000)
            return;
        }

        // Meteor.call('trainingQuestions.getCorrectChoice', qIndex,  function (error, result) {
        //     localStorage.removeItem("correctChoice_Q" + qIndex);
        //     localStorage.setItem("correctChoice_Q" + qIndex, result);
        // });

        // var currentQuestionSolution = localStorage.getItem("correctChoice_Q" + qIndex);

        var currentQuestionSolution = TrainingQuestions.findOne({
            index: qIndex
        }).correct_answer_index;

        //console.log(currentQuestionSolution);

        var currentQuestionUserRes = [0, 0, 0, 0, 0];

        for (var optionIndex = 0; optionIndex < currentDBCheckResponse.length; optionIndex++) {
            var eachUserRes = currentDBCheckResponse[optionIndex].split('-');
            if (eachUserRes[0] == qIndex) {
                currentQuestionUserRes[parseInt(eachUserRes[1])] = 1;
            }
        }

        //console.log(currentQuestionUserRes);
        checkResponse[qIndex] = currentQuestionUserRes;

        for (var i = 0, j = 0; i < currentQuestionSolution.length; i++, j++) {
            if (currentQuestionSolution[i] == currentQuestionUserRes[j]) {
                $('#guidecheck-' + qIndex + '-' + j + '-correct').show();
                $('#guidecheck-' + qIndex + '-' + j + '-incorrect').hide();
            } else {
                $('#guidecheck-' + qIndex + '-' + j + '-incorrect').show();
                $('#guidecheck-' + qIndex + '-' + j + '-correct').hide();
            }
        }
        $('.feedback-reason-0').show()

        //}
        if (($('.guide-option-0:radio:checked').length + $('.guide-option-1:radio:checked').length) == 10) {
            document.getElementById("submit-addq-button").className = document.getElementById("submit-addq-button").className.replace("disabled", "");
        }
        $('.feedback').show();
        if (parseInt(Template.instance().progress.get()) == 85 || parseInt(Template.instance().progress.get()) == 90)
            Template.instance().progress.set(parseInt(Template.instance().progress.get()) + 5);
        Meteor.call('trainingQuestions.insertTrainingQuestionResponses', currentQuestionUserRes, currentDBReasonResponse[qIndex], 0);
    },
    'click #submit-button-question-1': function(event) {

        if ($('.guide-option-1:radio:checked').length < 5) {
            Materialize.toast('Please answer all the questions before continuing!', 4000)
            return;
        }

        /*if ($('.guide-option:radio:checked').length == 10) {
            $('#submit-addq-button').toggle('show');
        }*/

        var userResponse = $('.guide-option-1:radio:checked');
        //var currentDBCheckResponse = [];
        //var currentDBReasonResponse = [];

        for (var i = 0; i < userResponse.length; i++) {
            var targetCheckInfoArr = $(userResponse[i]).attr('id').split('-');

            //console.log(targetCheckInfoArr);

            if (targetCheckInfoArr[4] == '0') {
                var guideQuestionClusterIndex = targetCheckInfoArr[1];
                var guideQuestionIndex = targetCheckInfoArr[2];
                currentDBCheckResponse[i] = (guideQuestionClusterIndex + '-' + guideQuestionIndex);
                //currentDBCheckResponse[i] = (guideQuestionClusterIndex + '-' + guideQuestionIndex);
            } else {
                currentDBCheckResponse[i] = 'X-X';
            }
        }

        var totalQuestionLength = $('.guide-option-reason').length;
        //for (var qIndex = 0; qIndex < totalQuestionLength; qIndex++) {
        var qIndex = 1;
        currentDBReasonResponse[qIndex] = $($('.guide-option-reason')[qIndex]).val().trim();

        if (currentDBReasonResponse[qIndex] == '') {
            Materialize.toast('Please explain your choices.', 4000)
            return;
        }

        // Meteor.call('trainingQuestions.getCorrectChoice', qIndex,  function (error, result) {
        //     localStorage.removeItem("correctChoice_Q" + qIndex);
        //     localStorage.setItem("correctChoice_Q" + qIndex, result);
        // });

        // var currentQuestionSolution = localStorage.getItem("correctChoice_Q" + qIndex);
        var currentQuestionSolution = TrainingQuestions.findOne({
            index: qIndex
        }).correct_answer_index;

        //console.log(currentQuestionSolution);

        var currentQuestionUserRes = [0, 0, 0, 0, 0];

        for (var optionIndex = 0; optionIndex < currentDBCheckResponse.length; optionIndex++) {
            var eachUserRes = currentDBCheckResponse[optionIndex].split('-');
            if (eachUserRes[0] == qIndex) {
                currentQuestionUserRes[parseInt(eachUserRes[1])] = 1;
            }
        }

        //console.log(currentQuestionUserRes);
        checkResponse[qIndex] = currentQuestionUserRes;

        for (var i = 0, j = 0; i < currentQuestionSolution.length; i++, j++) {
            if (currentQuestionSolution[i] == currentQuestionUserRes[j]) {
                $('#guidecheck-' + qIndex + '-' + j + '-correct').show();
                $('#guidecheck-' + qIndex + '-' + j + '-incorrect').hide();
            } else {
                $('#guidecheck-' + qIndex + '-' + j + '-incorrect').show();
                $('#guidecheck-' + qIndex + '-' + j + '-correct').hide();
            }
        }
        $('.feedback-reason-1').show()

        //}
        if (($('.guide-option-0:radio:checked').length + $('.guide-option-1:radio:checked').length) == 10) {
            document.getElementById("submit-addq-button").className = document.getElementById("submit-addq-button").className.replace("disabled", "");
        }
        $('.feedback').show();
        if (parseInt(Template.instance().progress.get()) == 85 || parseInt(Template.instance().progress.get()) == 90)
            Template.instance().progress.set(parseInt(Template.instance().progress.get()) + 5);
        Meteor.call('trainingQuestions.insertTrainingQuestionResponses', currentQuestionUserRes, currentDBReasonResponse[qIndex], 1);
    },
    'click #submit-addq-button': function(event) {
        // only updatedb if there is no user response
        //console.log(checkResponse);
        // console.log(currentDBReasonResponse);


        // if (typeof UserGuideResponse.findOne({
        //         username: Meteor.user().username
        //     }) === 'undefined') {
        //     UserGuideResponse.insert({
        //         username: Meteor.user().username,
        //         check_response: checkResponse,
        //         reason_response: currentDBReasonResponse
        //     });
        // }
        Template.instance().progress.set(100);

        setTimeout(function() {
            try {
                // Meteor.users.update(Meteor.userId(), {
                //     $set: {
                //         'profile.intro_completed': true
                //     }
                // });
                //console.log("guide_completed before is "+ Meteor.user().profile.guide_completed);
                //console.log("updating guide_completed bit");
                Meteor.call('user.updateGuideCompleted');
                // Meteor.users.update(Meteor.userId(), {
                //     $set: {
                //         'profile.guide_completed': true
                //     }
                // });
                //console.log("updated guide_completed bit");
                //console.log("guide_completed after is "+ Meteor.user().profile.guide_completed);
                //alert("just hanging in");
                window.location.replace("/gutboard_slider_addq");
            } catch (e) {}
        }, 2000);
    },
    'click #sliderControl': function(event) {

        window.location.replace('/guide_question');

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

        window.location.replace('/guide_info');

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
});

Template.guide_question_result.helpers({
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
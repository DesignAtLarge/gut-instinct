import './_.jade';

import {
    PersonalQuestions,
    Tags
} from '../../../../imports/api/models.js';

import {
    mongoJsonify
} from '../../../../imports/api/parsing';

Template.personal_tag_question.rendered = function() {
    try {
        if (Meteor.user()) {
            const toured = Meteor.user().profile.toured.personal_tag_question;
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.call('user.updateProfileTouredPersonalTagQuestion');
                    // Meteor.users.update(Meteor.userId(), {
                    //     $set: {
                    //         'profile.toured.personal_tag_question': true
                    //     }
                    // });
                }).start();
            }
            $("#back-bottom").hide();
        }
    } catch (e) {}
}

Template.personal_tag_question.onCreated(function() {
    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.personal_tag_question.helpers({
    init: function() {},
    personal_questions: function() {
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResult = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch();
        return personalFetchResult;

        // Meteor.call('personalQuestions.fetchPersonalQuestionsByTag', currentQueryTag, function(error, result) {
        //     localStorage.removeItem("personalFetchResult")
        //     localStorage.setItem("personalFetchResult", JSON.stringify(result));
        // });

        // return mongoJsonify(localStorage.getItem("personalFetchResult"));
    }
});

Template.personal_tag_question.events({
    'click #submit-button': function(event) {

        // check user has got all questions
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResultCount = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch().length;

        var personalFetchResult = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch();

        // var personalFetchResultCount = mongoJsonify(localStorage.getItem("personalFetchResult")).length;

        // var personalFetchResult = mongoJsonify(localStorage.getItem("personalFetchResult"));


        for (var i = 0; i < personalFetchResultCount; i++) {
            if ($('#tag-' + personalFetchResult[i].cluster + '-answer-extra')[0].checked) {
                if ($('#tag-' + personalFetchResult[i].cluster + '-answer-extra-text-text')[0].value == '') {
                    Materialize.toast('Please specify your option.', 2000, 'toast');
                    return;
                }
            }
        }

        for (var i = 0; i < personalFetchResultCount; i++) {
            var check = $('#personal-q' + i).find('input:checkbox:checked').length;
            if (check < 1) {
                Materialize.toast('Please answer all the questions on this page before exploring this topic.', 2000, 'toast');
                return;
            }
        }

        alert('Thank you! You can now explore this topic.');

        for (var i = 0; i < personalFetchResult.length; i++) {
            var userRes = [];
            var checkExtra = false;
            var chosenOptions = $('#personal-q' + i).find('input:checkbox:checked');
            console.log(chosenOptions);

            for (var j = 0; j < chosenOptions.length; j++) {
                var response = chosenOptions[j].getAttribute("personal-id");
                if (response.indexOf("extra") !== -1) {
                    checkExtra = true;
                    response = response.replace("extra", "");
                    response = response + ($('#personal-q' + i).find('input:checkbox').length - 1);
                }
                userRes.push(response);
            }

            var targetID = personalFetchResult[i]._id;
            var targetUser = Meteor.user().username;

            if (checkExtra) {
                // user choose the extra option
                // get the last index of choices
                var currentPushIndex = (personalFetchResult[i].choices.length);

                var newIndex = personalFetchResult[i].cluster + "-" + currentPushIndex;
                var currentCluster = personalFetchResult[i].cluster;
                var newText = $('#tag-' + currentCluster + "-answer-extra-text-text").val();

                //userRes = currentCluster + "-" + currentPushIndex;
                var newAuthor = Meteor.user().username;

                Meteor.call('personalQuestions.pushChoices', targetID, currentCluster, newIndex, "None", newText, newAuthor);
                // PersonalQuestions.update({
                //     _id: targetID
                // }, {
                //     $push: {
                //         choices: {
                //             cluster: currentCluster,
                //             index: newIndex,
                //             feedback: "None",
                //             text: newText,
                //             author: newAuthor
                //         }
                //     }
                // });

                Meteor.call('personalQuestions.pushAnswers', targetID, targetUser, userRes);
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
            } else {
                Meteor.call('personalQuestions.pushAnswers', targetID, targetUser, userRes);
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
            }


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
        //location.reload(true);       
    }
});
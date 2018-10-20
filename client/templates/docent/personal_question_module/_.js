import './_.jade';

import {
    PersonalQuestions
} from '../../../../imports/api/models.js';

Template.personal_question_module.onCreated(function() {
    this.tag_editable = new ReactiveVar(false);
    this.tags = new ReactiveArray();
    this.first = new ReactiveVar(false);
});

Template.personal_question_module.rendered = function() {
    // if user exist
    try {
        if (Meteor.user()) {
            //console.log("here1")
            var targetUser = Meteor.user().username;
            var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
                return !!el;
            }).pop();
            var personalFetchResult = PersonalQuestions.find({
                "tag": currentQueryTag
            }).fetch();

            for (var i = 0; i < personalFetchResult.length; i++) {
                var currentAns = personalFetchResult[i].answers;
                //console.log(currentAns.length);
                for (var j = 0; j < currentAns.length; j++) {
                    if (targetUser === currentAns[j].username) {
                        for (var k = 0; k < currentAns[j].response.length; k++) {
                            //update the res to frontend
                            var targetID = currentAns[j].response[k];
                            $("[personal-id='" + targetID + "']").attr('checked', true);
                        }
                    }
                }
            }

            const toured = Meteor.user().profile.toured.personal_question_module;
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.call("user.updateProfileTouredPersonalQuestionModule");
                    // Meteor.users.update(Meteor.userId(), {
                    //     $set: {
                    //         'profile.toured.personal_question_module': true
                    //     }
                    // });
                }).start();
            }
        }
    } catch (e) {}

}

Template.personal_question_module.helpers({

});

Template.personal_question_module.events({
    'click #updatePersonalQuestion': function(event) {
        console.log("here")

        // check user has got all questions
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResultCount = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch().length;

        if ($("input:radio:checked").length < personalFetchResultCount) {} else {
            // save user's answer in db
            var personalFetchResult = PersonalQuestions.find({
                "tag": currentQueryTag
            }).fetch();

            for (var i = 0; i < personalFetchResult.length; i++) {
                var userRes = $($("input:radio:checked")[i]).attr("personal-id");
                var targetID = personalFetchResult[i]._id;
                var targetUser = Meteor.user().username;
                // PersonalQuestions.update( { _id: targetID }, { $push: { answers: {username: targetUser, response: userRes} } } );
            }
            var redirectURL = "/t/" + window.location.pathname.split('/').filter(function(el) {
                return !!el;
            }).pop();
            alert("Your changes have been saved!");
            // window.location.replace(redirectURL);
        }
    },
    'change .personal-extra-option': function(event) {
        var self = this;
        var currentCluster = self.cluster;
        var checked = $('#tag-' + currentCluster + '-answer-extra')[0].checked;
        if (checked) {
            $('#tag-' + currentCluster + '-answer-extra-text').show();
        } else {
            $('#tag-' + currentCluster + '-answer-extra-text').hide();
        }
    },
    'click .addPersonalOption': function(event) {
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();

        let newOption = $(event.target).parent().find('#tag-' + this.cluster + '-answer-extra-text-text').val().trim();

        var personalFetch = PersonalQuestions.findOne({
            "tag": currentQueryTag,
            "cluster": this.cluster
        });

        var newIndex = this.cluster + "-" + personalFetch.choices.length

        Meteor.call("personalQuestions.addOption", personalFetch._id, this.cluster, newIndex, "None", newOption, Meteor.user().username);

        $(event.target).parent().find('#tag-' + this.cluster + '-answer-extra-text-text').val("")
        $(event.target).parent().hide();
        $(event.target).parent().parent().find("#tag-" + this.cluster + "-answer-extra").removeAttr("checked");
        $("#tag-" + this.cluster + "-answer-" + newIndex).attr("checked", true);
        let inst = this;
        setTimeout(function() {
            $("#tag-" + inst.cluster + "-answer-" + newIndex).attr("checked", true);
        }, 500);
        // var optionInputArr = $('.question-each-option-personal');

        // console.log('found total number of options ' + optionInputArr.length);

        // for (var optionIndex = 0; optionIndex < optionInputArr.length; optionIndex++) {

        //     if ($(optionInputArr).eq(optionIndex).parent().parent().parent().css('display') != 'none') {
        //         if ($(optionInputArr).eq(optionIndex).css('display') == 'none') {

        //             if ($(optionInputArr).eq(optionIndex).parent().parent().find('.extra-followup-question')
        //                     .val().trim() == '') {
        //                 alert('Please enter your question before add more options.');
        //                 return;
        //             }

        //             if ($(optionInputArr).eq(optionIndex - 1).find('.addOptionInputExtra').val().trim() ==
        //                 '') {
        //                 alert('Please enter your option before continue');
        //                 return;
        //             }

        //             $(optionInputArr).eq(optionIndex).show();
        //             break;
        //         }
        //     }
        // }
    }

});
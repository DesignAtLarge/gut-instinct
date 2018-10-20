import './_.jade';

import {
    PersonalQuestions
} from '../../../../imports/api/models.js';

Template.personal_question_bin.rendered = function() {
    if (Meteor.user()) {
        const toured = Meteor.user().profile.toured.personal_question;
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.personal_question': true
                    }
                });
            }).start();
        }
    } else {
        console.log("Meteor user not ready!");
    }
    $("#back-bottom").hide();
}

Template.personal_question_bin.onCreated(function() {
    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.personal_question_bin.helpers({
    init: function() {},
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

Template.personal_question_bin.events({
    'click #continue-button': function(event) {
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();

        window.location.replace('/personal_question/' + currentQueryTag);

    }
});
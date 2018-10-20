import './_.jade';

import {
    Questions
} from '../../../../imports/api/models.js';

Template.test.onCreated(function() {
    this.completed = new ReactiveVar(0);
});

Template.test.rendered = function() {
    const clicked = sessionStorage.getItem('clicked-guttest');
    if (clicked === 'true') {
        sessionStorage.setItem('clicked-guttest', false);
        window.location.reload();
    }
}

Template.test.helpers({
    verify: function() {
        var result = false;
        var condition = "default";
        try {
            var participant = Meteor.user().username;
            if (participant[0] === 'p' && !isNaN(parseInt(participant.substring(1)))) {
                participant = parseInt(participant.substring(1));
                if (participant >= 11 && participant <= 15) {
                    condition = "work";
                }
            }
            if (condition === "work") {
                const added = Questions.find({
                    owner: {
                        _id: Meteor.userId(),
                        username: Meteor.user().username
                    }
                });
                var count = added.fetch().length;
                result = count < 3;
                // const answered = Meteor.user().profile.answered;
                // var count = 0;
                // for (var question in answered) {
                //     if (answered.hasOwnProperty(question)) {
                //         count = !_.isUndefined(answered[question]) ? count + 1 : count;
                //     }
                // }
                // Template.instance().completed.set(count);
                // result = count < 3;
            } else {
                const topics_investigated = Meteor.user().profile.topics_investigated;
                var count = 0;
                for (var topic in topics_investigated) {
                    if (topics_investigated.hasOwnProperty(topic)) {
                        count = !_.isUndefined(topics_investigated[topic]) && topics_investigated[topic].is_correct ? count + 1 : count;
                    }
                }
                Template.instance().completed.set(count);
                result = count < 3;
            }
        } catch (e) {
            result = false;
        }
        if (result) {
            $('#warning').openModal({
                complete: function() {
                    if (condition === "work") {
                        Router.go('/gutboard');
                    } else {
                        Router.go('/topics');
                    }
                    $('#warning').closeModal();
                }
            });
            $('#warning').show();
            $('#guttest').addClass('blur')
        } else {
            $('#warning').closeModal();
            $('#warning').hide();
        }
        sessionStorage.setItem('from_test', true);
    },
    remaining: function() {
        var count = Template.instance().completed.get();
        return count > 3 ? 0 : 3 - count;
    },
    isWorkCondition: function() {
        var participant = Meteor.user().username;
        if (participant[0] === 'p' && !isNaN(parseInt(participant.substring(1)))) {
            participant = parseInt(participant.substring(1));
            if (participant >= 11 && participant <= 15) {
                return true;
            }
        }
        return false;
    }
});
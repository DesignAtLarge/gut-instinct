import './_.jade';

import {
    UserMetrics
} from '../../../../imports/api/models.js';

Template.tutorial.rendered = function(argument) {
    try {
        const toured = Meteor.user().profile.toured.tutorial;
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.tutorial': true
                    }
                });
            }).start();
        }

        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        user_metric.visit_counter.tutorial++;
        UserMetrics.update({
            _id: user_metric._id
        }, {
            $set: {
                visit_counter: user_metric.visit_counter
            }
        });
    } catch (e) {}
}

Template.tutorial.helpers({
    isLearnCondition: function() {
        try {
            const condition = Meteor.user().profile.condition;
            return condition == 1;
            // var username = Meteor.user().username;
            // if (username[0] === 'p' && !isNaN(parseInt(username.substring(1)))) {
            //     const participant = parseInt(username.substring(1));
            //     if (participant >= 6 && participant <= 10) {
            //         return true;
            //     }
            // }
            // return false;
        } catch (e) {
            return false
        }

    },
});

Template.tutorial.events({
    // 'beforeunload': function() {
    //     alert("YO");
    //     return false;
    // }
});
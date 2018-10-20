import './_.jade';

import {
    Articles,
    UserMetrics
} from '../../../../imports/api/models.js';

Template.articles.rendered = function() {
    try {
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        user_metric.visit_counter.articles++;
        UserMetrics.update({
            _id: user_metric._id
        }, {
            $set: {
                visit_counter: user_metric.visit_counter
            }
        });
    } catch (e) {}

    try {
        const toured = Meteor.user().profile.toured.articles;

        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.articles': true
                    }
                });
                // sessionStorage.setItem('novice', false);
            }).start();
        }
    } catch (e) {}
}

Template.articles.onCreated(function() {
    this.articles = null;
});

Template.articles.helpers({
    articles: function() {
        Template.instance().articles = _.shuffle(Articles.find({}).fetch());
        return Template.instance().articles;
    },
    isFirst: function() {
        var self = this;
        return _.isEqual(self, Template.instance().articles[0]);
    }
});
import './_.jade';

import {
    Tags,
    UserMetrics
} from '../../../../imports/api/models.js';

import {
    mongoJsonify
} from '../../../../imports/api/parsing';

Template.topics.rendered = function() {
    // Meteor.call('tags.fetchTagsByResearcherTopic', 1, function(error, result) {
    //     localStorage.removeItem("tags_researcher_topic_1")
    //     localStorage.setItem("tags_researcher_topic_1", JSON.stringify(result));
    // });
    // Meteor.call('tags.fetchTagsByCluster', "basic", function(error, result) {
    //     localStorage.removeItem("basic_tags");
    //     result.unshift(result[result.length - 1]);
    //     result.pop();
    //     localStorage.setItem("basic_tags", JSON.stringify(result));
    // });
    // Meteor.call('tags.fetchTagsByCluster', "autoimmune_diseases", function(error, result) {
    //     result[0]._refname = result[0].name;
    //     result[0].name = result[0].name.replace('-', 'to');
    //     for (var i = 1; i < result.length; i++) {
    //         result[i]._refname = result[i].name;
    //         result[i].name = result[i].name.replace('- Autoimmune Diseases', '');
    //     }
    //     localStorage.removeItem("autoimmune_diseases_tags");
    //     localStorage.setItem("autoimmune_diseases_tags", JSON.stringify(result));
    // });
    // Meteor.call('tags.fetchTagsByCluster', "gut_brain_axis", function(error, result) {
    //     result[0]._refname = result[0].name;
    //     result[0].name = result[0].name.replace('-', 'to');

    //     for (var i = 1; i < result.length; i++) {
    //         result[i]._refname = result[i].name;
    //         result[i].name = result[i].name.replace('- Gut Brain Axis', '');
    //     }
    //     localStorage.removeItem("gut_brain_axis_tags");
    //     localStorage.setItem("gut_brain_axis_tags", JSON.stringify(result));
    // });
    // Meteor.call('tags.fetchTagsByCluster', "gut_diseases", function(error, result) {
    //     result[0]._refname = result[0].name;
    //     result[0].name = result[0].name.replace('-', 'to');
    //     for (var i = 1; i < result.length; i++) {
    //         result[i]._refname = result[i].name;
    //         result[i].name = result[i].name.toLowerCase().replace(/([^a-z]|^)([a-z])(?=[a-z]{2})/g, function(_, g1, g2) {
    // return g1 + g2.toUpperCase(); } );
    //         result[i].name = result[i].name.replace('- Gut Diseases', '');
    //     }
    //     localStorage.removeItem("gut_diseases_tags");
    //     localStorage.setItem("gut_diseases_tags", JSON.stringify(result));
    // });

    const toured = Meteor.user().profile.toured.topics;
    //console.log("toured is " + toured);

    function initTopics() {
        $('.collapsible').collapsible();
    }

    setTimeout(initTopics(), 500);
    setTimeout(initTopics(), 1500);
    setTimeout(initTopics(), 2500);

    if (!toured) {
        introJs().setOption('showProgress', true).onchange(function(target) {

            Meteor.call('user.updateProfileTouredTopics');
            // Meteor.users.update(Meteor.userId(), {
            //     $set: {
            //         'profile.toured.topics': true
            //     }
            // });

        }).start();
    }
    try {
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        user_metric.visit_counter.topics++;

        UserMetrics.update({
            _id: user_metric._id
        }, {
            $set: {
                visit_counter: user_metric.visit_counter
            }
        });
    } catch (e) {}
}

Template.tag.onCreated(function() {
    //this.data = {}
    // this.chosen = {};
});

Template.topics.helpers({
    topics: function() {
        //return _.shuffle(Tags.find({}).fetch());

        return (Tags.find({
            "researcher_topic": 1
        }).fetch());
        //return mongoJsonify(localStorage.getItem("tags_researcher_topic_1"));
    },
    getBasicTopics: function() {
        //return mongoJsonify(localStorage.getItem("basic_tags"));
        let result = Tags.find({
            "tag_cluster": "basic"
        }).fetch();

        return _.sortBy(result, function(object) {
            return object.index;
        });
    },
    getAutoimmuneTopics: function() {
        //return mongoJsonify(localStorage.getItem("autoimmune_diseases_tags"));
        let result = Tags.find({
            "tag_cluster": "autoimmune_diseases"
        }).fetch();

        // for (var i = 0; i < result.length; i++) {
        //     if (result[i].name.indexOf('Introduction') > -1) {
        //         result[i]._refname = result[i].name;
        //         result[i].name = result[i].name.replace('-', 'to');
        //         continue;
        //     }
        //     result[i]._refname = result[i].name;
        //     result[i].name = result[i].name.replace('- Autoimmune Diseases', '');
        // }
        return _.sortBy(result, function(object) {
            return object.index;
        });
    },
    getGutBrainAxisTopics: function() {
        //return mongoJsonify(localStorage.getItem("gut_brain_axis_tags"));
        let result = Tags.find({
            "tag_cluster": "gut_brain_axis"
        }).fetch();

        // for (var i = 0; i < result.length; i++) {
        //     if (result[i].name.indexOf('Introduction') > -1) {
        //         result[i]._refname = result[i].name;
        //         result[i].name = result[i].name.replace('-', 'to');
        //         continue;
        //     }
        //     result[i]._refname = result[i].name;
        //     result[i].name = result[i].name.replace('- Gut Brain Axis', '');
        // }

        return _.sortBy(result, function(object) {
            return object.index;
        });
    },
    getGutDiseasesTopics: function() {
        //return mongoJsonify(localStorage.getItem("gut_diseases_tags"));
        let result = Tags.find({
            "tag_cluster": "gut_diseases"
        }).fetch();


        //     for (var i = 0; i < result.length; i++) {
        //         if (result[i].name.indexOf('Introduction') > -1) {
        //             result[i]._refname = result[i].name;
        //             result[i].name = result[i].name.replace('-', 'to');
        //             continue;
        //         }
        //         result[i]._refname = result[i].name;
        //         result[i].name = result[i].name.toLowerCase().replace(/([^a-z]|^)([a-z])(?=[a-z]{2})/g, function(_, g1, g2) {
        // return g1 + g2.toUpperCase(); } );
        //         result[i].name = result[i].name.replace('- Gut Diseases', '');
        //     }
        return _.sortBy(result, function(object) {
            return object.index;
        });
    },
    visited: function(name) {
        try {
            // Meteor.call('tags.fetchTagId', name, function(error, result) {
            //     localStorage.removeItem("currentTagId");
            //     localStorage.setItem("currentTagId", result);
            // });

            // const _id = localStorage.getItem("currentTagId");
            const _id = Tags.find({
                name: name
            }).fetch()[0]._id;

            return Meteor.user().profile.topics_investigated[_id];
        } catch (e) {
            return false;
        }
    },
    firstOf: function(array) {
        array = array[0] ? array : array.fetch();

        // console.log(_.isEqual(this, _.first(array)));
        return _.isEqual(this, _.first(array));
    }
});
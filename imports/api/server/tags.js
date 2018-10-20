import {
    Meteor
} from 'meteor/meteor';

import {
    Tags
} from './../models.js';


Meteor.methods({
    'tags.fetchTagsByResearcherTopic' (topic) {
        return (Tags.find({
            "researcher_topic": topic
        }).fetch());
    },
    'tags.fetchTagsByCluster' (tagCluster) {
        return (Tags.find({
            "tag_cluster": tagCluster
        }).fetch());
    },
    'tags.fetchTagId' (name) {
        return Tags.findOne({
            name: name
        })._id;
    },
    'tags.fetchTag' (name) {
        return Tags.findOne({
            name: name
        });
    },
    'tags.insertTag' (tagname, created_at) {
        var tagID = Tags.insert({
            hash: '',
            name: tagname,
            created_at: created_at,
            video_url: '',
            science_texts: '',
            questions: [],
            tag_question: ''
        });
        return tagID;
    },
    /* Try inserting tags from an array of tagnames */
    'tags.insertTags' (tagnames, created_at, qID) {
        var tags = []
        for (var i = 0; i < tagnames.length; i++) {
            var tagID = Tags.findOne({
                name: tagnames[i]
            });

            if (!tagID) {
                tagID = Tags.insert({
                    hash: '',
                    name: tagnames[i],
                    created_at: created_at,
                    video_url: '',
                    science_texts: '',
                    questions: [],
                    tag_question: ''
                });
                Tags.update(tagID, {
                    $set: {
                        hash: CryptoJS.MD5(tagID).toString()
                    }
                });
                Tags.update(tagID, {
                    $push: {
                        questions: {
                            hash: CryptoJS.MD5(qID).toString()
                        }
                    }
                });
                tagID = tagID._str || tagID;
                tags.push({
                    hash: CryptoJS.MD5(tagID).toString(),
                    name: tagnames[i]
                });
            } else {
                tagID = tagID._id;
                Tags.update(tagID, {
                    $push: {
                        questions: {
                            hash: CryptoJS.MD5(qID).toString()
                        }
                    }
                });
                tagID = tagID._str || tagID;
                tags.push({
                    hash: CryptoJS.MD5(tagID).toString(),
                    name: tagnames[i]
                });
            }
        }
        return tags;
    },
    'tags.pushQuestion' (tagID, qID) {
        Tags.update(tagID, {
            $push: {
                questions: {
                    hash: CryptoJS.MD5(qID).toString()
                }
            }
        });
    },
    'tags.pushViewedStatus' (currentQueryTag, targetUserName) {
        var targetTagID = Tags.findOne({
            name: currentQueryTag
        })._id;
        Tags.update({
            _id: targetTagID
        }, {
            $push: {
                viewed_user: targetUserName
            }
        });
    },
    'tags.setHash' (tagID) {
        Tags.update(tagID, {
            $set: {
                hash: CryptoJS.MD5(tagID).toString()
            }
        });
    },
});
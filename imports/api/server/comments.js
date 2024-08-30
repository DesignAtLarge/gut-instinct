import {
    Meteor
} from 'meteor/meteor';

import {
    Comments
} from '../../../imports/api/models.js';

Meteor.methods({
    'comments.insertCommment' (comment, created_at, s3URL, userURL) {
        let cID = Comments.insert({
            text: comment,
            owner: {
                username: Meteor.user().username,
                _id: Meteor.user()._id
            },
            created_at: created_at,
            attached_file: s3URL,
            attached_url: userURL,
            upvote_count: 0,
            downvote_count: 0
        });
        return cID;
    },
    'comments.setHash' (cID) {
        Comments.update(cID, {
            $set: {
                hashcode: CryptoJS.MD5(cID).toString()
            }
        });
    }

});
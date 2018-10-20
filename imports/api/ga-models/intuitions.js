export const Intuitions = new Mongo.Collection('ga_intuitions');
export const GalileoTopics = new Mongo.Collection('ga_intuition_topics');

Meteor.methods({
    'galileo.intuition.hasIntuition': function(intuition) {
        return Intuitions.findOne({
            "intuition": intuition
        }) != undefined;
    },

    'galileo.intuition.addIntuition': function(intuition, tags, mechanism) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        if (intuition.length <= 10) {
            throw new Meteor.Error("intuition too short");
        }
        Intuitions.insert({
            "user_id": Meteor.userId(),
            "intuition": intuition,
            "mechanism": mechanism,
            "tags": tags.split("#").map(str => str.trim()).filter(str => str != ""),
            "insert_date": new Date()
        });
        return true;
    },

    'galileo.intuition.getIntuitions': function() {

        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        var intuitions = Intuitions.find().fetch();
        intuitions.forEach((intuition) => {
            var user = Meteor.users.findOne({
                _id: intuition.user_id
            });
            if (user) {
                intuition.username = user.username;
            }
        });
        return intuitions;
    },

    'galileo.intuition.getIntuitionById': function(id) {
        var int = Intuitions.findOne({
            _id: id
        });
        return int;
    },

    'galileo.intuition.getIntuitionAmount': function() {
        return Intuitions.find().count();
    },

    'galileo.intuition.getTopics': function() {
        return GalileoTopics.find().fetch();
    },

    'galileo.intuition.getIntuitionTags': function() {
        var allTags = Intuitions.find({
            tags: {
                $exists: true
            }
        }, {
            fields: {
                tags: 1
            }
        }).fetch();
        var tagDict = {};
        for (var i = 0; i < allTags.length; i++) {
            for (var j = 0; j < allTags[i].tags.length; j++) {
                tagDict[allTags[i].tags[j]] = 1;
            }
        }
        var tags = [];
        for (var tag in tagDict) {
            tags.push(tag);
        }
        return tags;
    },

    'galileo.intuition.getMyIntuitions': function() {
        return Intuitions.find({
            "user_id": Meteor.userId()
        }, {
            sort: {
                'insert_date': 1
            }
        }).fetch();
    },

    'galileo.intuition.getFirstThreeIntuitions': function() {
        var user = Meteor.users.findOne({
            _id: Meteor.userId()
        });
        if (!user) {
            throw new Meteor.Error("not-authorized");
        }
        var ints = Intuitions.find({
            'user_id': Meteor.userId()
        }, {
            limit: 3,
            sort: {
                'insert_date': 1
            }
        }).fetch();
        return ints;
    },

    'galileo.intuition.getPostedIntuitionAmount': function() {
        var user = Meteor.users.findOne({
            _id: Meteor.userId()
        });
        if (!user) {
            throw new Meteor.Error("not-authorized");
        }
        var count = Intuitions.find({
            'user_id': Meteor.userId()
        }).count();
        return count;
    }
});
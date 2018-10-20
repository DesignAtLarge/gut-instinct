import './_.jade';

import {
    Questions,
    Bookmarks
} from '../../../../imports/api/models.js';

Template.qmodule_min.onCreated(function() {
    this.tag_editable = new ReactiveVar(false);
    this.tags = new ReactiveArray();
    this.first = new ReactiveVar(false);
});

Template.qmodule_min.rendered = function() {
    $('.chips-initial').hide();

    const toured = Meteor.user().profile.toured.qmodule;
    if (!toured) {
        introJs().setOption('showProgress', true).onchange(function(target) {
            Meteor.users.update(Meteor.userId(), {
                $set: {
                    'profile.toured.qmodule': true
                }
            });
        }).start();
    }
};

Template.qmodule_min.helpers({
    init: function(hashcode) {
        if (Meteor.user().profile.answered[hashcode][0]) {
            $('.layer-2').show();
        }
        console.log('current id is ' + this._id);
    },
    isFirst: function() {
        return Template.instance().first.get();
    },
    isStarQuestion: function() {
        if (this.star_question == 1) {
            return true;
        }
        return false;
    },
    firstOf: function(array) {
        array = array[0] ? array : array.fetch();
        var isFirst = _.isEqual(this, _.first(array));
        if (isFirst) {
            Template.instance().first.set(true);
        }
        // console.log(_.isEqual(this, _.first(array)));
        return isFirst;
    },
    followup_answer: function(hashcode) {
        try {
            return Meteor.user().profile.answered[hashcode][1] || '';
        } catch (e) {
            return '';
        }
    },
    firstComment: function() {
        return this.comments[0] ? this.comments[0].text : '';
    },
    expert_question: function() {
        if (this.owner.username === 'expert') {
            // $("#currentActiveQuestionDiv").;
            return true;
        }

        return false;
        // return this.owner.username === 'expert';

    },
    isCondition1: function() {
        try {
            var condition = Meteor.user().profile.condition;
            //console.log("my condition is in" + condition);
            return condition == 1;
        } catch (e) {
            return false;
        }
    },
    isCondition2or4or0or6or9or11: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11;
            }
        } catch (e) {
            return false;
        }
    },
    owns: function(_id) {
        try {
            return Meteor.user()._id === _id;
        } catch (e) {
            return false;
        }
    },
    answered: function(answer) {
        try {
            return Meteor.user().profile.answered[this.hash][0] === answer;
        } catch (e) {
            return true;
        }
    },
    encodeURI: function(text) {
        return encodeURI(text);
    },
    tweetText: function() {
        var layer1 = this.layer_1.text;
        var layer2 = this.layer_2.text;
        var returnText = encodeURI((layer1 + layer2).substring(0, 62) + '...').replace('?', '%3F');

        return returnText + encodeURI(
            ' Find more about what citizen scientists are discussing. #GutInstinctUCSD');
    },
    tagmode: function() {
        return Template.instance().tag_editable.get();
    },
    inGutBoard: function() {
        return Router.current().route.getName() === 'gutboard';
    },
    inBookmark: function() {
        return Router.current().route.getName() === 'bookmark';
    },
    inQuestionPage: function() {
        return Router.current().route.getName() === 'q.:hashcode';
    },
    layer2Viewable: function() {
        // console.log(this);
        var currentUserName = Meteor.user().username;
        // console.log("layer2 user check: " + currentUserName);
        var targetResponseArr = Questions.findOne({
            _id: this._id
        }).layer_1.user_response;
        for (var i = 0; i < targetResponseArr.length; i++) {
            if (targetResponseArr[i].username == currentUserName) {
                return true;
            }
        }
        return false;

        // return Router.current().route.getName() === 'q.:hashcode' && Meteor.user().profile.answered[this.hash][0];
    },
    layer2Submitted: function() {
        return false;
        // return !!Meteor.user().profile.answered[this.hash][1];
    },
    isUserExpert: function() {
        if (Meteor.user()) {
            //return (Meteor.user().username === 'expert') || (Meteor.user().username === 'knightlab');}
            return (Meteor.user().username === 'expert') || (Meteor.user().username === 'knightlab') || (
                Meteor.user().username === 'e001') || (Meteor.user().username === 'e002') || (Meteor.user()
                .username === 'e003') || (Meteor.user().username === 'e004') || (Meteor.user().username ===
                'e005');
        } else {
            console.log("meteor user in isUserExpert");
        }
    },
    isInBKDB: function() {
        try {
            if (Meteor.user()) {
                var targetID = this._id;

                searchid = this._id;

                if (typeof(searchid) === 'object') {
                    var insertTypeID = searchid.toString().match(/"([^"]+)"/)[1];
                } else {
                    var insertTypeID = searchid.toString();
                }

                var fetchResult = Bookmarks.findOne({
                    "typeid": insertTypeID,
                    owner: {
                        username: Meteor.user().username,
                        _id: Meteor.user()._id
                    }
                });

                if (fetchResult == undefined) {
                    return false;
                } else {
                    return true;
                }
            }
        } catch (e) {}
    },
});

Template.qmodule_min.events({

    'click .questionAddBK': function(event) {
        searchid = this._id;

        if (typeof(searchid) === 'object') {
            var insertTypeID = searchid.toString().match(/"([^"]+)"/)[1];
        } else {
            var insertTypeID = searchid.toString();
        }

        var fetchResult = Bookmarks.findOne({
            "typeid": insertTypeID,
            owner: {
                username: Meteor.user().username,
                _id: Meteor.user()._id
            }
        });

        // if (fetchResult == undefined) {
        //     // create the bk item in db
        if (!fetchResult)
            Bookmarks.insert({
                "type": "q",
                "typeid": insertTypeID,
                owner: {
                    username: Meteor.user().username,
                    _id: Meteor.user()._id
                }
            });

        //$(event.target).find(".bookmark-word").html('&nbsp;&nbsp;Unbookmark&nbsp;&nbsp;');
        /*$.notify({
         // options
         icon: 'glyphicon glyphicon-ok-sign',
         message: 'Added post to Bookmarks tab!'
         },{
         // settings
         type: 'info',
         allow_dismiss: true,
         showProgressbar: false,
         onShow: null,
         placement: {
         from: "bottom",
         align: "right"
         },
         onShown: null,
         onClose: null,
         onClosed: null,
         icon_type: 'class'
         });*/
        // } else {
        //     var doc = Bookmarks.findOne({
        //         "typeid": insertTypeID
        //     });

        //     Bookmarks.remove({
        //         _id: doc._id
        //     });

        //     $(event.target).find(".bookmark-word").html('&nbsp;&nbsp;Bookmark&nbsp;&nbsp;');
        //     $.notify({
        //      // options
        //      icon: 'glyphicon glyphicon-ok-sign',
        //      message: 'Removed post from Bookmarks tab!'
        //      },{
        //      // settings
        //      type: 'info',
        //      allow_dismiss: true,
        //      placement: {
        //      from: "bottom",
        //      align: "right"
        //      },
        //      showProgressbar: false,
        //      onShow: null,
        //      onShown: null,
        //      onClose: null,
        //      onClosed: null,
        //      icon_type: 'class'
        //      });

        // }

    },
    'click .questionRemoveBK': function(event) {

        searchid = this._id;

        if (typeof(searchid) === 'object') {
            var insertTypeID = searchid.toString().match(/"([^"]+)"/)[1];
        } else {
            var insertTypeID = searchid.toString();
        }

        var fetchResult = Bookmarks.findOne({
            "typeid": insertTypeID,
            owner: {
                username: Meteor.user().username,
                _id: Meteor.user()._id
            }
        });

        if (fetchResult)
            Bookmarks.remove({
                _id: fetchResult._id
            });

        // if (fetchResult == undefined) {
        //     // create the bk item in db
        //     Bookmarks.insert({
        //         "type": "q",
        //         "typeid": insertTypeID,
        //         owner: {
        //             username: Meteor.user().username,
        //             _id: Meteor.user()._id
        //         }
        //     });


        //     $('.bookmark-word').html('&nbsp;&nbsp;Unbookmark&nbsp;&nbsp;');
        //     $.notify({
        //         // options
        //         icon: 'glyphicon glyphicon-ok-sign',
        //         message: 'Removed this question from Bookmarks tab!'
        //     }, {
        //         // settings
        //         type: 'info',
        //         allow_dismiss: true,
        //         placement: {
        //             from: "bottom",
        //             align: "right"
        //         },
        //         showProgressbar: false,
        //         onShow: null,
        //         onShown: null,
        //         onClose: null,
        //         onClosed: null,
        //         icon_type: 'class'
        //     });
        // } else {
        // var doc = Bookmarks.findOne({
        //     "typeid": insertTypeID
        // });

        // Bookmarks.remove({
        //     _id: doc._id
        // });

        // $(event.target).find(".bookmark-word").html('&nbsp;&nbsp;Bookmark&nbsp;&nbsp;');
        // $.notify({
        //  // options
        //  icon: 'glyphicon glyphicon-ok-sign',
        //  message: 'Successfully Removed This Post From Your Bookmark'
        //  },{
        //  // settings
        //  type: 'info',
        //  allow_dismiss: true,
        //  placement: {
        //  from: "bottom",
        //  align: "right"
        //  },
        //  showProgressbar: false,
        //  onShow: null,
        //  onShown: null,
        //  onClose: null,
        //  onClosed: null,
        //  icon_type: 'class'
        //  });

        // }

    },
    'click .addStarQuestion': function(event) {
        Questions.update({
            _id: this._id
        }, {
            $set: {
                "star_question": 1
            }
        });
    },
    'click .removeStarQuestion': function(event) {
        Questions.update({
            _id: this._id
        }, {
            $set: {
                "star_question": 0
            }
        });
    },
    'click .delete': function(event, instance) {
        const qmodule = $(event.target).parents()[4];
        // const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];
        $(qmodule).find('.confirm-delete').openModal();
        // return false;
        // $('#confirm-delete').openModal();
        // if (!confirm("Are you sure about deleting this question?")) {
        //     return false;
        // }
        Questions.remove(this._id);
        // UserMetrics.update({ _id: user_metric._id }, {
        //     $set: {
        //         number_of_questions: user_metric.number_of_questions - 1
        //     }
        // });
        return false;
    },
    'click .confirm-delete-yes': function() {
        // console.log(this);
        Questions.remove(this._id);
        return false;
    },
    'click .glasspane_vineet': function() {
        //introJs().setOption('showProgress', true).start();
        //introJs().setOption('showProgress', true).start();
        //introJs(".qmodule").setOption('showProgress', true).start();
        //introJs(".cardquestion").setOption('showProgress', true, 'scrollToElement', true).start();
        introJs(".cardquestion").setOptions({
            'showProgress': true,
            'showBullets': true
        }).start();
        //introJs("questions").setOption('showProgress', true).start();
    },
});
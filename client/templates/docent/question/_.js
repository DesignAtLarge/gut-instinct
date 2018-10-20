import './_.jade';

import {
    Questions,
    Comments,
    Notifications,
    UserMetrics,
    UserEmail
} from '../../../../imports/api/models.js';

Template.question.rendered = function() {
    // const toured = Meteor.user().profile.toured.question;
    // if (!toured) {
    //     introJs().setOption('showProgress', true).onchange(function(target) {
    //         Meteor.users.update(Meteor.userId(), {
    //             $set: {
    //                 'profile.toured.question': true
    //             }
    //         });
    //     }).start();
    // }
    $("#back-bottom").hide();
    //console.log('~~~~~~~~ rendered TEMPLATE HASH' + Template.instance().data.hashcode);


    // display the attachment and urls
    try {
        if (Meteor.user()) {
            const toured = Meteor.user().profile.toured.question;
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.users.update(Meteor.userId(), {
                        $set: {
                            'profile.toured.question': true
                        }
                    });
                }).start();
            }
        }
    } catch (e) {}


    $(document).ready(function() {
        setTimeout(function() {
            var fileArr = $('.targetFile');
            var urlArr = $('.targetURL');
            for (var i = 0; i < fileArr.length; i++) {

                if ($(fileArr[i]).attr('href') != '-1') {
                    $(fileArr[i]).show();
                }

                if ($(urlArr[i]).attr('href') != '-1') {
                    $(urlArr[i]).show();
                }
            }
        }, 2000);

    });

};

$(window).scroll(function(e) {
    try {
        var backTop = $('.to-back').position().top;
        if ($(window).scrollTop() >= backTop) {
            $("#back-bottom").show();
        } else {
            $("#back-bottom").hide();
        }
    } catch (e) {}
});

Template.question.onCreated(function() {
    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.question.helpers({
    init: function(hashcode) {
        // console.log('~~~~~~~~ NORMAL HASH' + hashcode);
        // console.log('~~~~~~~~ TEMPLATE HASH' + Template.instance().hashcode.get());
        const question = Questions.find({
            hash: hashcode
        }).fetch()[0];
        if (!question) return;
        Template.instance()._id = question._id;
    },
    data: function() {
        let question = [Questions.findOne({
            _id: Template.instance()._id
        })];
        return question;
    },
    upvote_count: function(hashcode) {
        const comment = Comments.find({
            "hashcode": hashcode
        }).fetch()[0];
        return comment.upvote_count;
    },
    downvote_count: function(hashcode) {
        const comment = Comments.find({
            "hashcode": hashcode
        }).fetch()[0];
        return comment.downvote_count;
    },
    upvoted: function(hashcode) {
        var voted = Meteor.user().profile.voted;
        return voted[hashcode] === 'upvote';
    },
    downvoted: function(hashcode) {
        var voted = Meteor.user().profile.voted;
        return voted[hashcode] === 'downvote';
    },
    isLearnCondition: function() {
        try {
            if (Meteor.user()) {
                var participant = Meteor.user().username;
                if (participant[0] === 'p' && !isNaN(parseInt(participant.substring(1)))) {
                    participant = parseInt(participant.substring(1));
                    if (participant >= 11 && participant <= 15) {
                        return true;
                    }
                }
                return false;
            }
        } catch (e) {}
    },
    isUserExpert: function() {
        try {
            if (Meteor.user()) {
                //return (Meteor.user().username === 'expert') || (Meteor.user().username === 'knightlab');}
                return (Meteor.user().username === 'expert') || (Meteor.user().username === 'knightlab') || (
                    Meteor.user().username === 'e001') || (Meteor.user().username === 'e002') || (Meteor.user()
                    .username === 'e003') || (Meteor.user().username === 'e004') || (Meteor.user().username ===
                    'e005');
            } else {
                console.log("meteor user in isUserExpert");
            }
        } catch (e) {}
    },
    isExpertComment: function() {
        console.log("in isExpertComment");
        // console.log(this);
        // console.log(this.owner.username);
        //return (this.owner.username === 'expert') && (this.owner.username === 'knightlab');
        return (this.owner.username === 'expert') || (this.owner.username === 'knightlab') || (this.owner.username ===
            'e001') || (this.owner.username === 'e002') || (this.owner.username === 'e003') || (this.owner
            .username === 'e004') || (this.owner.username === 'e005');
    },
    getMendelCode: function() {
        return sessionStorage.mendelcode;
    },
    fromTopics: function() {
        return (document.referrer.indexOf("/t") > -1);
    },
    getTopic: function() {
        let array = document.referrer.split("/");
        return array[4];
    }
});

Template.question.events({

    /*
    'submit form': function(event, instance) {
        event.preventDefault()
        return;

        const created_at = new Date();
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        var discussed = Meteor.user().profile.discussed || {};
        var cID = Comments.insert({
            text: event.target.comment.value,
            owner: {
                _id: Meteor.user()._id,
                username: Meteor.user().username
            },
            created_at: created_at,
            upvote_count: 0,
            downvote_count: 0
        });

        var lastChar = Router.current().originalUrl.charAt(Router.current().originalUrl.length - 1);

        var processURL = Router.current().originalUrl;
        if (lastChar == '/') {
            processURL = processURL.substring(0, str.length - 1);
        }

        processURL = processURL.substr(processURL.lastIndexOf('/') + 1);

        var noticeQuestion = Questions.find({
            hash: processURL
        }).fetch()[0];

        var searchOwnerName = noticeQuestion.owner.username;
        var noticeString = "Question: " + noticeQuestion.layer_1.text;

        // insert notification only you are not operating your questions
        var sameUserCheck = searchOwnerName != Meteor.user().username;
        if (true) {
            var noticeID = Notifications.insert({
                owner: {
                    _id: Meteor.user()._id,
                    username: Meteor.user().username
                },
                raw_owner_name: searchOwnerName,
                type: 'di',
                created_at: created_at,
                typeid: processURL,
                typestring: noticeString,
                isRead: 0
            });
        }

        Comments.update(cID, {
            $set: {
                hashcode: CryptoJS.MD5(cID).toString()
            }
        });

        try {
            Questions.update(instance._id, {
                $push: {
                    comments: {
                        $each: [{
                            hashcode: CryptoJS.MD5(cID).toString(),
                            text: event.target.comment.value,
                            created_at: created_at,
                        }],
                        $slice: -100000,
                        $sort: {
                            created_at: -1
                        }
                    }
                },
            });
        } catch (e) {}

        discussed[CryptoJS.MD5(instance._id._str || instance._id).toString()] = true;

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.discussed': discussed
            }
        });

        // UserMetrics.update({ _id: user_metric._id }, {
        //     $set: {
        //         number_of_comments: user_metric.number_of_comments + 1
        //     }
        // });

        event.target.comment.value = '';

        function postEmail(token, api, currentQuestionHash, emailUserAddr,
                           currentQuestionLayerOneQuestion, currentQuestionOwner) {
            //console.log("Sending email with " + token + api);
            console.log("Calling api: " + api);
            let emailQuestionHash = currentQuestionHash;
            let emailQuestionLayerOneQuestion = currentQuestionLayerOneQuestion;

            $.ajax({
                type: "POST",
                url: api,
                data: {
                    token: token,
                    userEmail: emailUserAddr,
                    userName: currentQuestionOwner,
                    layerOneQuestion: emailQuestionLayerOneQuestion,
                    layerOneQuestionHash: emailQuestionHash
                },
                success: function(data) {
                    console.log("Email sent successfully!");
                    //console.log("user accept n2 sending");
                }
            });
        }

        let currentQuestionOwner = Questions.findOne({
            _id: this._id
        }).owner;
        let currentQuestion = Questions.findOne({
            _id: this._id
        });

        if ('username' in currentQuestionOwner) {
            console.log("Sending email to " + currentQuestionOwner.username + " ...");
            let currentQuestionOwnerProfile = UserEmail.findOne({
                username: currentQuestionOwner.username
            });

            if ('email' in currentQuestionOwnerProfile && 'noticeSet' in currentQuestionOwnerProfile) {
                let currentQuestionOwnerNotificationSetting = currentQuestionOwnerProfile.noticeSet;

                if (parseInt(currentQuestionOwnerNotificationSetting[2]) === 1) {
                    Meteor.call('email.getToken', function(error, result) {
                        if (error) {
                            console.log("Error: " + error);
                            return;
                        }
                        console.log("Recieved email token.");

                        let currentToken = result;
                        Meteor.call('email.getAPI', function(error, result) {
                            let currentAPI = result;
                            console.log("Recieved api.");
                            postEmail(currentToken, currentAPI + "sendNewCommentEmail",
                                this.hash,
                                currentQuestionOwnerProfile.email, currentQuestion.layer_1
                                    .text, currentQuestionOwnerProfile.username);
                        });
                    });
                }
            }
        }
    },
    'click .questionBookMark': function() {
        // exist: remove form db
        // not exist: add to db

    },
    'click .upvote': function() {
        const hashcode = this.hashcode;
        var voted = Meteor.user().profile.voted;
        const comment = Comments.find({
            "hashcode": hashcode
        }).fetch()[0]

        Comments.update(comment._id, {
            $set: {
                upvote_count: comment.upvote_count + (voted[hashcode] === 'upvote' ? -1 : 1),
                downvote_count: comment.downvote_count + (voted[hashcode] === 'downvote' ? -1 : 0)
            }
        });

        voted[hashcode] = voted[hashcode] === 'upvote' ? '' : 'upvote';

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.voted': voted
            }
        });
    },
    'click .downvote': function() {
        const hashcode = this.hashcode;
        var voted = Meteor.user().profile.voted;
        const comment = Comments.find({
            "hashcode": hashcode
        }).fetch()[0]

        Comments.update(comment._id, {
            $set: {
                upvote_count: comment.upvote_count + (voted[hashcode] === 'upvote' ? -1 : 0),
                downvote_count: comment.downvote_count + (voted[hashcode] === 'downvote' ? -1 : 1)
            }
        });

        voted[hashcode] = voted[hashcode] === 'downvote' ? '' : 'downvote';

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.voted': voted
            }
        });
    }*/
});
import './_.jade';

import {
    Questions,
    Bookmarks,
    Tags,
    UserMetrics,
    UserEmail,
    Comments,
    Notifications,
} from '../../../../imports/api/models.js';

Template.qmodule_example.onCreated(function() {
    this.tag_editable = new ReactiveVar(false);
    this.tags = new ReactiveArray();
    this.first = new ReactiveVar(false);

    this._id = '';
    this.edit_state = new ReactiveDict();
});

Template.qmodule_example.rendered = function() {
    $('.chips-initial').hide();

    $(document).ready(function() {
        $('.modal').modal();
    });

    try {
        if (Meteor.user()) {
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

            var currentHash = Template.instance().data.hash;

            var currentLayer1 = Template.instance().data.layer_1;

            var currentResponseArr = currentLayer1.user_response;

            var currentQuestionID = currentHash;
            var currentUsername = Meteor.user().username;

            for (var k = 0; k < currentResponseArr.length; k++) {
                if (currentResponseArr[k].username == currentUsername) {
                    var targetUserResponse = currentResponseArr[k].response;

                    for (var j = 0; j < targetUserResponse.length; j++) {
                        var targetCheckBox = '#' + currentQuestionID + '-' + targetUserResponse[
                            j];
                        $(targetCheckBox).prop('checked', true);
                    }
                }
            }

            // calculate the stats for rendering
            var currentStats = currentLayer1.stats;
            var currentSum = 0;
            for (var j = 0; j < currentStats.length; j++) {
                if (isNaN(currentStats[j]) || (typeof currentStats[j] === 'undefined') ||
                    currentStats[j] === null) {
                    currentStats[j] = 0;
                    continue;
                }
                currentSum = currentSum + parseInt(currentStats[j]);
            }

            // appending the stats after the question option
            var appendid = '#' + currentHash + '-' + '0' + '-label';
            var targetPercentage = '%';

            for (var j = 0; j < currentStats.length; j++) {
                targetPercentage = Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100) +
                    '%';
                if (isNaN(Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100))) {
                    targetPercentage = "0%";
                }
                appendid = '#' + currentHash + '-' + j + '-label-stats';
                $(appendid).html('  ' + currentStats[j] + ' Answer(s) / ' + targetPercentage);
            }

            /* Populate layer 2 user responses */
            var l2CurrentResponseArr = Template.instance().data.layer_2_user_response;

            var currentQuestionID = currentHash;

            for (var k = 0; k < l2CurrentResponseArr.length; k++) {

                if (l2CurrentResponseArr[k].username === currentUsername) {
                    ////console.log('username matched l2');
                    var targetUserResponse = l2CurrentResponseArr[k].response;

                    for (var j = 0; j < targetUserResponse.length; j++) {

                        var targetCheckBox = '#' + currentQuestionID + '-layer2-' + l2CurrentResponseArr[k]
                            .layer_2_index + '-' + targetUserResponse[j];
                        $(targetCheckBox).prop('checked', true);
                    }
                }
            }

            /* Populate layer 2 user response stats*/
            var currentStatsArr = Template.instance().data.layer_2;

            for (var k = 0; k < currentStatsArr.length; k++) {
                var currentStats = currentStatsArr[k].stats;

                var currentSum = 0;
                for (var j = 0; j < currentStats.length; j++) {
                    if (isNaN(currentStats[j]) || (typeof currentStats[j] === 'undefined') || currentStats[
                            j] === null) {
                        currentStats[j] = 0;
                        continue;
                    }
                    currentSum = currentSum + parseInt(currentStats[j]);
                }

                for (var j = 0; j < currentStats.length; j++) {
                    var targetPercentage = Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100) +
                        '%';
                    if (isNaN(Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100))) {
                        targetPercentage = "0%";
                    }
                    var appendid = '#' + currentHash + '-layer2-' + k + '-' + j + '-label-stats';
                    $(appendid).html('  ' + currentStats[j] + ' Answer(s) / ' + targetPercentage);
                }
            }
        }
    } catch (e) {}


    /* trigger resize of text areas */
    $('.materialize-textarea').trigger('autoresize');
};

Template.qmodule_example.helpers({
    init: function(hashcode) {
        if (Meteor.user().profile.answered[hashcode][0]) {
            $('.layer-2').show();
        }
        //console.log('current id is ' + this._id);
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
        // //console.log(_.isEqual(this, _.first(array)));
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
        try {
            if (this.owner.username === 'expert') {
                // $("#currentActiveQuestionDiv").;
                return true;
            }

            return false;
        } catch (e) {}

        //return (this.owner.username === 'expert') || (this.owner.username === 'knightlab') || (this.owner.username === 'e001') || (this.owner.username === 'e002') || (this.owner.username === 'e003') || (this.owner.username === 'e004') || (this.owner.username === 'e005');
        // return this.owner.username === 'expert';

    },
    modified_by_expert: function() {
        try {
            let editHistory = this.layer_1.edit_history;
            for (var i = 0; i < editHistory.length; i++) {
                if (editHistory[i].editor === 'expert') return true;
            }
            return false;
        } catch (e) {}
    },
    last_modified_by_expert: function() {
        try {
            let editHistory = this.layer_1.edit_history;
            if (editHistory[editHistory.length - 1].editor === 'expert') return true;
            return false;
        } catch (e) {}
    },
    checkExpert: function(name) {
        return name == 'expert';
    },
    hasEditHistory: function() {
        try {
            return ("edit_history" in this.layer_1);
        } catch (e) {}
    },
    firstEditHistory: function() {
        return this.layer_1.edit_history[0].oldText;
    },
    getLastEditor: function() {
        return this.layer_1.edit_history[this.layer_1.edit_history.length - 1].editor;
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
        return true;
        try {
            if (Meteor.user()) {
                // //console.log(this);
                var currentUserName = Meteor.user().username;
                // //console.log("layer2 user check: " + currentUserName);
                var question = Questions.findOne({
                    _id: this._id
                });
                if (window.location.href.indexOf("/q/") > -1) return true;

                var targetResponseArr = question.layer_1.user_response;

                for (var i = 0; i < targetResponseArr.length; i++) {
                    if (targetResponseArr[i].username == currentUserName) {
                        return true;
                    }
                }
                return false;

                // return Router.current().route.getName() === 'q.:hashcode' && Meteor.user().profile.answered[this.hash][0];
            }
        } catch (e) {}
    },
    layer2Submitted: function() {
        return false;
        // return !!Meteor.user().profile.answered[this.hash][1];
    },
    isUserExpert: function() {
        try {
            if (Meteor.user()) {
                return (Meteor.user().username === 'expert') || (Meteor.user().username === 'knightlab') ||
                    (Meteor.user().username === 'e001') || (Meteor.user().username === 'e002') ||
                    (Meteor.user().username === 'e003') || (Meteor.user().username === 'e004') ||
                    (Meteor.user().username === 'e005');
            } else {
                ////console.log("meteor user in isUserExpert");
            }
        } catch (e) {}
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
    hasMechanism: function() {
        try {
            if (this.layer_1.mechanism)
                return true;
            else return false;
        } catch (e) {}
    },
    ownsMechanism: function() {
        try {
            if (Meteor.user())
                return this.owner.username == Meteor.user().username;
        } catch (e) {}
    },
    getFeedback: function(mechanism) {
        return mechanism.feedback;
    },
    hasFeedback: function() {
        if ('feedback' in this.layer_1.mechanism && this.layer_1.mechanism.feedback.text)
            return true;
        else return false;
    },
    hasFeedbackOrExpert: function() {
        try {
            if ((Meteor.user().username === 'expert') || this.layer_1.mechanism.feedback.text || (Meteor.user().username === 'knightlab') ||
                (Meteor.user().username === 'e001') || (Meteor.user().username === 'e002') ||
                (Meteor.user().username === 'e003') || (Meteor.user().username === 'e004') ||
                (Meteor.user().username === 'e005'))
                return true;
            else return false;
        } catch (e) {}
    },
    comments: function() {
        return this.comments;
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
    hasFile: function(hashcode) {
        const comment = Comments.find({
            "hashcode": hashcode
        }).fetch()[0];
        if (!comment.attached_file || comment.attached_file == -1) return false;
        else return comment.attached_file;
    },
    hasURL: function(hashcode) {
        const comment = Comments.find({
            "hashcode": hashcode
        }).fetch()[0];
        if (!comment.attached_url || comment.attached_url == -1) return false;
        else return comment.attached_url;
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
    tagExists: function(name) {
        try {
            let tag = Tags.findOne({
                "name": name
            });
            if (tag) {
                if (tag.video_url == "") return false;
                else return true;
            } else return false;
        } catch (e) {}
    }
});

Template.qmodule_example.events({
    // 'click .addOptionChoice': function (event){
    //     $(event.target).hide();
    //     $(event.target).parent().find(".addOptionInput").show();
    // },
    'change .toplevelOption': _.debounce(function(event) {
        $(event.target).parent().parent().parent().find(".saveOptionChoice").attr("from-add", false);
        $(event.target).parent().parent().parent().find(".saveOptionChoice").trigger("click");
    }, 1000),

    'click .saveOptionChoice': function(event) {

        var currentLayer1 = Questions.findOne({
            _id: this._id
        }).layer_1;

        var targetOptionDiv = $(event.target).parent().find(".layer1OptionCheck");
        var checkedLength = $(targetOptionDiv).find('input:checked').length;
        //var totalLength = $(targetOptionDiv).find('input').length;
        var totalLength = currentLayer1.options.length;

        var userAddOptionValue = $(event.target).parent().find(".addOptionInput").val();

        if ($(event.target).parent().find("#optionTip").css('display') != 'none' && checkedLength == 0 && userAddOptionValue === '') {
            Materialize.toast("Please select at least one option or add your own option!", 2000, 'toast');
            return;
        }

        var currentUserResponse = currentLayer1.user_response;
        var currentUserResponseStats = currentLayer1.stats;
        var currentUsername = Meteor.user().username;

        for (var i = 0; i < currentUserResponse.length; i++) {
            if (currentUserResponse[i].username == currentUsername) {

                // update layer1 stats
                for (var j = 0; j < currentUserResponse[i].response.length; j++) {
                    currentUserResponseStats[currentUserResponse[i].response[j]]--;
                }

                // user has previous answer at index i, one element
                currentUserResponse.splice(i, 1);
            }
        }

        Questions.update({
            _id: this._id
        }, {
            $set: {
                'layer_1.user_response': currentUserResponse,
                'layer_1.stats': currentUserResponseStats
            }
        });

        const created_at = new Date();
        var noticeQuestion = Questions.findOne({
            _id: this._id
        });

        var searchOwnerName = noticeQuestion.owner.username;
        var noticeString = "Question: " + noticeQuestion.layer_1.text;

        // insert notification only you are not operating your questions
        var sameUserCheck = searchOwnerName != Meteor.user().username;

        if (userAddOptionValue !== '') {
            let inst = this;
            let currentQuestionOwner = Questions.findOne({
                _id: this._id
            }).owner;

            if (sameUserCheck) {
                Meteor.call('profile.getNotificationArrayOfUser', currentQuestionOwner.username, function(err, result) {
                    if (result && result[2] == 1) {
                        var noticeID = Notifications.insert({
                            owner: {
                                _id: currentQuestionOwner._id,
                                username: currentQuestionOwner.username
                            },
                            raw_owner_name: searchOwnerName,
                            type: 'option',
                            created_at: created_at,
                            typeid: inst.hash,
                            typestring: noticeString,
                            isRead: 0
                        });
                    }
                });
            }
        }

        // load user answer into db

        var userResponseArr = [];

        if (userAddOptionValue != '') {
            if (checkedLength > 0) {
                for (var i = 0; i < checkedLength; i++) {
                    var targetID = $($(targetOptionDiv).find('input:checked')[i]).attr('id');
                    var targetIndex = targetID.split('-')[1];

                    userResponseArr[i] = targetIndex;
                }
                userResponseArr[userResponseArr.length] = totalLength;
            } else {
                userResponseArr[0] = totalLength;
            }

            Questions.update({
                _id: this._id
            }, {
                $push: {
                    'layer_1.options': {
                        'option_text': userAddOptionValue,
                        'option_index': totalLength,
                        'layer_1_option_author': Meteor.userId()
                    }
                }
            });

            Questions.update({
                _id: this._id
            }, {
                $push: {
                    'layer_1.user_response': {
                        'username': Meteor.user().username,
                        'response': userResponseArr
                    }
                }
            });

            Meteor.call('user.updateProfileQuestionsAnswered', this._id, userResponseArr, "layer_1", 1);

            function postEmail(token, api, currentQuestionHash, emailUserAddr,
                currentQuestionLayerOneQuestion, currentQuestionOwner) {
                ////console.log("sending email with " + token + api);
                //console.log("Calling api: " + api);
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
                        //console.log("Email sent successfully!");
                        ////console.log("user accept n2 sending");
                    }
                });
            }

            let currentQuestionOwner = Questions.findOne({
                _id: this._id
            }).owner;
            let currentQuestion = Questions.findOne({
                _id: this._id
            });

            let inst = this;

            if ('username' in currentQuestionOwner && sameUserCheck) {
                //console.log("Sending email to " + currentQuestionOwner.username + " ...");
                let currentQuestionOwnerProfile = UserEmail.findOne({
                    username: currentQuestionOwner.username
                });

                if (currentQuestionOwnerProfile && 'email' in currentQuestionOwnerProfile && 'noticeSet' in currentQuestionOwnerProfile) {
                    let currentQuestionOwnerNotificationSetting = currentQuestionOwnerProfile.noticeSet;

                    if (parseInt(currentQuestionOwnerNotificationSetting[2]) === 1) {
                        Meteor.call('email.getToken', function(error, result) {
                            if (error) {
                                //console.log("Error: " + error);
                                return;
                            }

                            //console.log("Recieved token.");

                            let currentToken = result;
                            Meteor.call('email.getAPI', function(error, result) {
                                let currentAPI = result;
                                //console.log("Recieved api.");
                                postEmail(currentToken, currentAPI + "sendNewOptionEmail",
                                    inst.hash,
                                    currentQuestionOwnerProfile.email, currentQuestion.layer_1
                                    .text,
                                    currentQuestionOwnerProfile.username);
                            });
                        });
                    }
                }
            }
        } else {
            var userResponseArr = [];
            for (var i = 0; i < checkedLength; i++) {
                var targetID = $($(targetOptionDiv).find('input:checked')[i]).attr('id');
                var targetIndex = targetID.split('-')[1];

                userResponseArr[i] = targetIndex;
            }

            Questions.update({
                _id: this._id
            }, {
                $push: {
                    'layer_1.user_response': {
                        'username': Meteor.user().username,
                        'response': userResponseArr
                    }
                }
            });

            Meteor.call('user.updateProfileQuestionsAnswered', this._id, userResponseArr, "layer_1", 1);
        }

        // change the stats counter in each question
        var currentStatsArr = Questions.findOne({
            _id: this._id
        }).layer_1.stats;

        for (var i = 0; i < userResponseArr.length; i++) {

            if (isNaN(currentStatsArr[userResponseArr[i]])) {
                currentStatsArr[userResponseArr[i]] = 0;
            }
            currentStatsArr[userResponseArr[i]]++;
        }

        // check empty slot of currentStatsArr
        var totalOption = $(targetOptionDiv).find('input').length;
        for (var i = 0; i < totalOption; i++) {
            if (isNaN(currentStatsArr[i])) {
                currentStatsArr[i] = 0;
            }
        }

        Questions.update({
            _id: this._id
        }, {
            $set: {
                "layer_1.stats": currentStatsArr
            }
        });

        $(event.target).parent().find(".addOptionInput").val('');
        //$(event.target).html("Saved");


        var currentQDB = Questions.findOne({
            _id: this._id
        });

        setTimeout(function() {
            var currentLayer1 = currentQDB.layer_1;
            var currentStats = currentLayer1.stats;
            var currentSum = 0;
            for (var j = 0; j < currentStats.length; j++) {
                if (isNaN(currentStats[j]) || (typeof currentStats[j] === 'undefined') ||
                    currentStats[j] === null) {
                    currentStats[j] = 0;
                    continue;
                }
                currentSum = currentSum + parseInt(currentStats[j]);
            }

            var appendid = '#' + currentQDB.hash + '-' + '0' + '-label';
            var targetPercentage = '%';

            for (var j = 0; j < currentStats.length; j++) {
                targetPercentage = Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100) +
                    '%';
                if (isNaN(Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100))) {
                    targetPercentage = "0%";
                }
                appendid = '#' + currentQDB.hash + '-' + j + '-label-stats';
                $(appendid).html('  ' + currentStats[j] + ' Answer(s) / ' + targetPercentage);
            }
        }, 500);


        setTimeout(function() {
            ////console.log("Rerendering the board ...");
            var allQuestionCard = $('.cardquestion');

            for (var i = 0; i < allQuestionCard.length; i++) {
                var currentHash = currentQDB.hash; //$(allQuestionCard[i]).attr('question-hash');

                var currentResponseArr = Questions.findOne({
                    hash: currentHash
                }).layer_1.user_response;
                var currentQuestionID = currentHash;
                var currentUsername = Meteor.user().username;

                for (var k = 0; k < currentResponseArr.length; k++) {
                    if (currentResponseArr[k].username == currentUsername) {
                        var targetUserResponse = currentResponseArr[k].response;

                        for (var j = 0; j < targetUserResponse.length; j++) {
                            var targetCheckBox = '#' + currentQuestionID + '-' + targetUserResponse[
                                j];
                            ////console.log("CHECKING BOX:" + targetCheckBox);
                            $(targetCheckBox).prop('checked', true);
                        }
                    }
                }
            }

        }, 500);

        $(event.target).parent().find('.userAddOptionCheckBox').prop("checked", false);

        if ($(event.target).attr("from-add")) {
            $(event.target).parent().find('#optionTip').hide();
            $(event.target).parent().find('.addOptionInput').hide();
            $(event.target).hide();
        }
    },
    'change .userAddOptionCheckBox': function(event) {
        $(event.target).parent().find('#optionTip').toggle();
        $(event.target).parent().find('.addOptionInput').toggle();
        $(event.target).parent().find('.saveOptionChoice').toggle();
        $(event.target).parent().find('.saveOptionChoice').attr("from-add", true);
        // $(event.target).hide();
    },
    'change .addFollowOptionChoiceCheckbox': function(event) {
        $(event.target).parent().find('.followUpAddOptionInput').toggle();
        $(event.target).parent().find(".saveFollowOptionChoice").toggle();
        $(event.target).parent().find('.saveFollowOptionChoice').attr("from-add", true);
    },
    'click .addFollowOptionChoice': function(event) {
        $(event.target).parent().find('.followUpAddOptionInput').show();
    },
    'click .skipFollowOptionChoice': function(event) {
        $(event.target).parent().hide();
    },
    'click .addStarQuestion': function(event) {
        Questions.update({
            _id: this._id
        }, {
            $set: {
                "star_question": 1
            }
        });

        const created_at = new Date();
        var noticeQuestion = Questions.findOne({
            _id: this._id
        });

        var searchOwnerName = noticeQuestion.owner.username;
        var noticeString = "Question: " + noticeQuestion.layer_1.text;

        // insert notification only you are not operating your questions
        var sameUserCheck = searchOwnerName != Meteor.user().username;

        let inst = this;
        let currentQuestionOwner = Questions.findOne({
            _id: this._id
        }).owner;

        if (sameUserCheck) {
            Meteor.call('profile.getNotificationArrayOfUser', currentQuestionOwner.username, function(err, result) {
                if (result && result[3] == 1) {
                    var noticeID = Notifications.insert({
                        owner: {
                            _id: currentQuestionOwner._id,
                            username: currentQuestionOwner.username
                        },
                        raw_owner_name: searchOwnerName,
                        type: 'star',
                        created_at: created_at,
                        typeid: inst.hash,
                        typestring: noticeString,
                        isRead: 0
                    });
                }
            });
        }

        function postEmail(token, api, currentQuestionHash, emailUserAddr,
            currentQuestionLayerOneQuestion, currentQuestionOwner) {
            ////console.log("sending email with " + token + api);
            //console.log("Calling api: " + api)
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
                    //console.log("Email successfully sent!");
                    ////console.log("user accept n0 sending");
                }
            });
        }

        let currentQuestion = Questions.findOne({
            _id: this._id
        });

        if ('username' in currentQuestionOwner) {
            //console.log("Sending email to " + currentQuestionOwner.username + " ...");
            let currentQuestionOwnerProfile = UserEmail.findOne({
                username: currentQuestionOwner.username
            });

            if (currentQuestionOwnerProfile && 'email' in currentQuestionOwnerProfile && 'noticeSet' in currentQuestionOwnerProfile) {
                let currentQuestionOwnerNotificationSetting = currentQuestionOwnerProfile.noticeSet;

                if (parseInt(currentQuestionOwnerNotificationSetting[3]) === 1) {
                    Meteor.call('email.getToken', function(error, result) {
                        if (error) {
                            //console.log("Error: " + error);
                        }

                        //console.log("Recieved token.");

                        var currentToken = result;
                        Meteor.call('email.getAPI', function(error, result) {
                            var currentAPI = result;
                            //console.log("Recieved api.");
                            postEmail(currentToken, currentAPI + "sendNewStarredEmail",
                                inst.hash,
                                currentQuestionOwnerProfile.email, currentQuestion.layer_1
                                .text, currentQuestionOwnerProfile.username);
                        });
                    });
                }
            }
        }
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
    'click .addL2Question': function(event) {
        var userInput = $(event.target).parent().find('.followupAnswerInput').val().trim();

        if (userInput == '') {
            //alert("Please answer all the questions before continuing!");
            Materialize.toast("Please add your question before saving it!", 2000, 'toast');

            return;
        }

        var currentL2DB = Questions.findOne({
            _id: this._id
        }).layer_2;

        var targetIndex = currentL2DB.length;

        var dbPushInfo = {
            "layer_2_index": targetIndex,
            "stats": [],
            "question": userInput,
            "options": [],
            "layer_2_author": Meteor.userId()
        };

        currentL2DB.push(dbPushInfo);

        Questions.update({
            _id: this._id
        }, {
            $set: {
                'layer_2': currentL2DB
            }
        });

        $(event.target).parent().find('.followupAnswerInput').val("");

        const created_at = new Date();
        var noticeQuestion = Questions.findOne({
            _id: this._id
        });

        var searchOwnerName = noticeQuestion.owner.username;
        var noticeString = "Question: " + noticeQuestion.layer_1.text;

        // insert notification only you are not operating your questions
        let inst = this;
        var sameUserCheck = searchOwnerName != Meteor.user().username;
        if (sameUserCheck) {
            let inst = this;
            let currentQuestionOwner = Questions.findOne({
                _id: this._id
            }).owner;


            Meteor.call('profile.getNotificationArrayOfUser', currentQuestionOwner.username, function(err, result) {
                if (result && result[0] == 1) {
                    var noticeID = Notifications.insert({
                        owner: {
                            _id: currentQuestionOwner._id,
                            username: currentQuestionOwner.username
                        },
                        raw_owner_name: searchOwnerName,
                        type: 'follow-up',
                        created_at: created_at,
                        typeid: inst.hash,
                        typestring: noticeString,
                        isRead: 0
                    });
                }
            });
        }

        var currentQuestionID = this._id;
        var currentQuestionOwner = Questions.findOne({
            _id: currentQuestionID
        }).owner.username;
        var emailUser = UserEmail.findOne({
            username: currentQuestionOwner
        });

        function postEmail(token, api) {
            ////console.log("Calling api: " + api);
            var emailUserAddr = emailUser.email;
            var emailQuestionHash = Questions.findOne({
                _id: currentQuestionID
            }).hash;
            var emailQuestionLayerOneQuestion = Questions.findOne({
                _id: currentQuestionID
            }).layer_1.text;

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
                    //console.log("Email successfully sent!");
                    ////console.log("user accept n0 sending");
                }
            });
        }


        if (emailUser && 'email' in emailUser && sameUserCheck) {

            if ('noticeSet' in emailUser) {
                //console.log("current user notice set is " + emailUser.noticeSet);
                if (parseInt(emailUser.noticeSet[0]) === 0) {
                    //console.log("user reject n0 sending");
                    return;
                }
            }

            Meteor.call('email.getToken', function(error, result) {
                //console.log("error" + error);
                //console.log("got token");

                var currentToken = result;
                Meteor.call('email.getAPI', function(error, result) {
                    var currentAPI = result;
                    //console.log("got api");
                    postEmail(currentToken, currentAPI + "sendNewLayerTwoEmail");
                });
            });
        } else {
            return;
        }
    },


    'change .followupOption': _.debounce(function(event) {
        $(event.target).parent().parent().find(".saveFollowOptionChoice").attr("from-add", false);
        $(event.target).parent().parent().find(".saveFollowOptionChoice").trigger("click");
    }, 1000),


    'click .saveFollowOptionChoice': function(event) {
        function promiseWait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        var targetOptionDiv = $(event.target).parent().find(".layer2OptionCheck");

        var checkedLength = $(targetOptionDiv).find('input:checked').length;
        var totalLength = $(targetOptionDiv).find('input').length;

        var userAddOptionValue = $(event.target).parent().find(".followUpAddOptionInput").val();

        if ($(event.target).parent().find(".followUpAddOptionInput").css('display') != 'none' && checkedLength == 0 && userAddOptionValue === '') {
            Materialize.toast("Please select at least one option or add your own option!", 2000, 'toast');
        } else {
            var targetLayer2Index = $(event.target).parent().find('.addFollowOptionChoiceCheckbox').attr(
                'id').split('-')[1];

            // check whether there is a response in db, and update stats
            var prevDBRes = Questions.findOne({
                _id: this._id
            });

            var prevRes = prevDBRes.layer_2_user_response;
            for (var index = 0; index < prevRes.length; index++) {
                if ((prevRes[index].layer_2_index == targetLayer2Index) && (prevRes[index].username ==
                        Meteor.user().username)) {
                    //console.log('found prev res');
                    var prevLayer2 = prevDBRes.layer_2;

                    for (var resIndex = 0; resIndex < prevRes[index].response.length; resIndex++) {
                        var updateStatsIndex = prevRes[index].response[resIndex];
                        //console.log("!!!!Update stats index:" + updateStatsIndex);
                        prevLayer2[targetLayer2Index].stats[updateStatsIndex]--;
                    }

                    prevRes.splice(index, 1);


                    Questions.update({
                        _id: this._id
                    }, {
                        $set: {
                            layer_2: prevLayer2,
                            layer_2_user_response: prevRes
                        }
                    });
                    promiseWait(500);
                    break;
                }
            }

            // load user answer into db
            var userResponseArr = [];

            if ($(targetOptionDiv).find('.with-gap').length > 0) {
                // there is existing question option under this target div
            }

            if (userAddOptionValue != '') {
                //console.log("enter case when user adding their answer");

                // the case when both have input and checkbox
                if (checkedLength > 0) {

                    for (var i = 0; i < checkedLength; i++) {

                        var targetID = $($(targetOptionDiv).find('input:checked')[i]).attr('id');

                        // targetLayer2Index = targetID.split('-')[2];
                        var targetOptionIndex = targetID.split('-')[3];

                        userResponseArr[i] = targetOptionIndex;
                    }
                    userResponseArr[userResponseArr.length] = totalLength;
                } else {
                    userResponseArr[0] = totalLength;
                }

                var layer2_question_db = Questions.findOne({
                    _id: this._id
                }).layer_2;

                var currentNewOption = {
                    "layer_2_index": targetLayer2Index,
                    "option_text": userAddOptionValue,
                    "option_index": totalLength,
                    "layer_2_option_author": Meteor.userId()
                };

                layer2_question_db[targetLayer2Index].options.push(currentNewOption);

                Questions.update({
                    _id: this._id
                }, {
                    $set: {
                        "layer_2": layer2_question_db
                    }
                });

                Questions.update({
                    _id: this._id
                }, {
                    $push: {
                        'layer_2_user_response': {
                            'layer_2_index': targetLayer2Index,
                            'username': Meteor.user().username,
                            'response': userResponseArr
                        }
                    }
                });

                Meteor.call('user.updateProfileQuestionsAnswered', this._id, userResponseArr, "layer_2", targetLayer2Index);

                function postEmail(token, api, currentQuestionHash, emailUserAddr,
                    currentQuestionLayerOneQuestion, currentQuestionOwner) {
                    ////console.log("sending email with " + token + api);
                    //console.log("Calling api: " + api);
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
                            //console.log("Email successfully sent!")
                            ////console.log("user accept n2 sending");
                        }
                    });
                }

                let currentQuestionOwner = Questions.findOne({
                    _id: this._id
                }).owner;
                let currentQuestion = Questions.findOne({
                    _id: this._id
                });
                let inst = this;

                if ('username' in currentQuestionOwner && Meteor.user().username != currentQuestionOwner.username) {
                    //console.log("Sending email to " + currentQuestionOwner.username + " ...");
                    let currentQuestionOwnerProfile = UserEmail.findOne({
                        username: currentQuestionOwner.username
                    });

                    if (currentQuestionOwnerProfile && 'email' in currentQuestionOwnerProfile && 'noticeSet' in
                        currentQuestionOwnerProfile) {
                        let currentQuestionOwnerNotificationSetting = currentQuestionOwnerProfile.noticeSet;

                        if (parseInt(currentQuestionOwnerNotificationSetting[2]) === 1) {
                            Meteor.call('email.getToken', function(error, result) {
                                if (error) {
                                    //console.log("Error: " + error);
                                    return;
                                }
                                //console.log("Recieved token");

                                let currentToken = result;
                                Meteor.call('email.getAPI', function(error, result) {
                                    let currentAPI = result;
                                    //console.log("Recieved api");
                                    postEmail(currentToken, currentAPI +
                                        "sendNewOptionEmail", inst.hash,
                                        currentQuestionOwnerProfile.email,
                                        currentQuestion.layer_1.text,
                                        currentQuestionOwnerProfile.username);
                                });
                            });
                        }
                    }
                }
            } else {
                ////console.log("enter case when user NOT adding their answer");
                var userResponseArr = [];
                var targetLayer2Index;

                ////console.log("number of user check is " + checkedLength);

                for (var i = 0; i < checkedLength; i++) {
                    var targetID = $($(targetOptionDiv).find('input:checked')[i]).attr('id');
                    targetLayer2Index = targetID.split('-')[2];
                    var targetIndex = targetID.split('-')[3];

                    userResponseArr[i] = targetIndex;
                }

                ////console.log("reach the end of reding user response array, getting array result:");
                ////console.log(userResponseArr);

                Questions.update({
                    _id: this._id
                }, {
                    $push: {
                        'layer_2_user_response': {
                            'layer_2_index': targetLayer2Index,
                            'username': Meteor.user().username,
                            'response': userResponseArr
                        }
                    }
                });

                Meteor.call('user.updateProfileQuestionsAnswered', this._id, userResponseArr, "layer_2", targetLayer2Index);
            }

            var that = this;

            // change the stats counter in each question
            setTimeout(function() {
                var targetID = $($(targetOptionDiv).find('input:checked')[0]).attr('id');

                var targetIndex = $(event.target).parent().find('.addFollowOptionChoiceCheckbox').attr(
                    'id').split('-')[1];

                var targetIDfulllength = $(targetOptionDiv).find('input').length;
                // var targetIndex = targetID.split('-')[2];

                var currentL2StatsArr = Questions.findOne({
                    _id: that._id
                }).layer_2;
                for (var i = 0; i < userResponseArr.length; i++) {
                    if (isNaN(currentL2StatsArr[targetIndex].stats[userResponseArr[i]])) {
                        currentL2StatsArr[targetIndex].stats[userResponseArr[i]] = 1;
                    } else {
                        currentL2StatsArr[targetIndex].stats[userResponseArr[i]]++;
                    }
                }

                for (var i = 0; i < targetIDfulllength; i++) {
                    if (isNaN(currentL2StatsArr[targetIndex].stats[i])) {
                        currentL2StatsArr[targetIndex].stats[i] = 0;
                    }
                }

                Questions.update({
                    _id: that._id
                }, {
                    $set: {
                        layer_2: currentL2StatsArr
                    }
                });

                setTimeout(function() {
                    var question = Questions.findOne({
                        _id: that._id
                    });

                    var currentL2Arr = question.layer_2;

                    var currentHash = that.hash;

                    ////console.log("rerender the layer 2 in timeout");

                    var l2CurrentResponseArr = question.layer_2_user_response;

                    var currentQuestionID = currentHash;

                    for (var k = 0; k < l2CurrentResponseArr.length; k++) {

                        if (l2CurrentResponseArr[k].username === Meteor.user().username) {
                            ////console.log('username matched l2');
                            var targetUserResponse = l2CurrentResponseArr[k].response;

                            for (var j = 0; j < targetUserResponse.length; j++) {

                                var targetCheckBox = '#' + currentQuestionID + '-layer2-' + l2CurrentResponseArr[k]
                                    .layer_2_index + '-' + targetUserResponse[j];
                                $(targetCheckBox).prop('checked', true);
                            }
                        }
                    }
                    ////console.log(currentL2Arr);
                    var currentStatsArr = currentL2Arr;
                    for (var k = 0; k < currentStatsArr.length; k++) {
                        var currentStats = currentStatsArr[k].stats;

                        var currentSum = 0;
                        for (var j = 0; j < currentStats.length; j++) {
                            if (isNaN(currentStats[j]) || (typeof currentStats[j] === 'undefined') || currentStats[
                                    j] === null) {
                                currentStats[j] = 0;
                                continue;
                            }
                            currentSum = currentSum + parseInt(currentStats[j]);
                        }

                        for (var j = 0; j < currentStats.length; j++) {
                            var targetPercentage = Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100) +
                                '%';
                            if (isNaN(Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100))) {
                                targetPercentage = "0%";
                            }
                            var appendid = '#' + currentHash + '-layer2-' + k + '-' + j + '-label-stats';
                            $(appendid).html('  ' + currentStats[j] + ' Answer(s) / ' + targetPercentage);
                        }
                    }

                    $(event.target).parent().find(".followUpAddOptionInput").val('');
                    //$(event.target).html("Save");
                }, 500);
            }, 0);


        }

        $(event.target).parent().find('.addFollowOptionChoiceCheckbox').prop("checked", false);

        if ($(event.target).attr("from-add")) {
            $(event.target).parent().find('.followUpAddOptionInput').hide();
            $(event.target).hide();
        }
    },
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
    'click .submit': function(event) {
        const card = $(event.target).parents()[2];
        const target = $(card).find(".layer-3");
        const followup_answer = $(card).find(".followup_answer").val().trim();
        const feedback_text = $($(event.target).parents()[1]).find('.layer2-answered');

        if (!followup_answer) {
            return false;
        }

        feedback_text.text('Your response has been submitted!');
        $(event.target).attr('value', 'Edit Response');
        $(event.target).siblings('.skip').addClass('grey');
        $(".layer-3").not(target).slideUp();
        target.slideDown();

        var self = this;
        var answered = Meteor.user().profile.answered;
        answered[self.hash] = answered[self.hash] || [];
        answered[self.hash][1] = followup_answer;

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.answered': answered
            }
        });
        setTimeout(function() {
            feedback_text.text('');
        }, 5000);
    },
    'keypress input.followup_answer': function(event) {
        if (event.which === 13) {
            const card = $(event.target).parents()[2];
            const target = $(card).find('.layer-3');
            const followup_answer = event.target.value.trim();
            const feedback_text = $($(event.target).parents()[1]).find('.layer2-answered');

            if (!followup_answer) {
                return false;
            }

            feedback_text.text('Your response has been submitted!');
            $(event.target).siblings('.submit').attr('value', 'Edit Response');
            $(event.target).siblings('.skip').addClass('grey');
            $(".layer-3").not(target).slideUp();
            target.slideDown();

            var self = this;
            var answered = Meteor.user().profile.answered;
            answered[self.hash] = answered[self.hash] || [];
            answered[self.hash][1] = followup_answer;

            Meteor.users.update(Meteor.userId(), {
                $set: {
                    'profile.answered': answered
                }
            });
            setTimeout(function() {
                feedback_text.text('');
            }, 5000);
        }
    },
    'click .skip': function(event) {
        const card = $(event.target).parents()[2];
        const target = $(card).find(".layer-3");

        $(".layer-3").not(target).slideUp();
        target.slideDown();

        var self = this;
        var answered = Meteor.user().profile.answered;
        answered[self.hash] = answered[self.hash] || [];
        answered[self.hash][1] = '';

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.answered': answered
            }
        });
    },
    'click .see-more': function(event) {
        var self = this;
        var answered = Meteor.user().profile.answered;
        answered[self.hash] = answered[self.hash] || [];
        answered[self.hash][2] = true;
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.answered': answered
            }
        });
        if (sessionStorage.getItem('state') === '0') {
            sessionStorage.setItem('moved', self.layer_1.text);
        }
    },
    'click .delete': function(event, instance) {
        const qmodule = $(event.target).parents()[4];
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
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
        // //console.log(this);
        Questions.remove(this._id);
        return false;
    },
    'click .edit-tag': function(event, instance) {
        // const tag_editable = instance.tag_editable.get();
        var chips = null;
        var self = this;
        for (var i = 0; i < self.tags.length; i++) {
            Template.instance().tags.set(i, {
                tag: self.tags[i].name
            });
        }
        instance.tag_editable.set(true);
        chips = $(event.target).parent().find('.chips-initial');
        chips.show();
        chips.material_chip({
            data: Template.instance().tags.get()
        })
    },
    'click .cancel-edit-tag': function(event, instance) {
        var chips = null;
        instance.tag_editable.set(false);
        chips = $(event.target).parent().find('.chips-initial');
        chips.hide();
    },
    'click .save-tag': function(event, instance) {
        const prev_tags = instance.tags.get();
        const created_at = new Date();
        var chips = $(event.target).parent().find('.chips-initial').children('.chip');
        var tags = [];
        var self = this;

        for (var i = 0; i < chips.length; i++) {
            var tagname = $(chips[i]).clone().children().remove().end().text();
            var tagID = Tags.find({
                name: tagname
            }).fetch()[0];
            tags[i] = {
                tag: tagname
            };

            if (!tagID) {
                tagID = Tags.insert({
                    hash: '',
                    name: tagname,
                    created_at: created_at,
                    video_url: '',
                    science_texts: '',
                    questions: []
                });
                Tags.update(tagID, {
                    $set: {
                        hash: CryptoJS.MD5(tagID).toString()
                    }
                });
            } else {
                tagID = tagID._id;
            }

            // update tag with current question
            Tags.update(tagID, {
                $push: {
                    questions: {
                        hash: CryptoJS.MD5(self._id._str || self._id).toString(),
                        layer_1: {
                            text: self.layer_1.text
                        },
                        layer_2: {
                            text: self.layer_2.text
                        }
                    }
                }
            });
        }

        var difference = _.difference(_.pluck(prev_tags, "tag"), _.pluck(tags, "tag"));
        // remove this question from deleted tag
        for (var i = 0; i < difference.length; i++) {
            var tagname = difference[i];
            var tag = Tags.find({
                name: tagname
            }).fetch()[0];
            if (tag) {
                Tags.update(tag._id, {
                    $pull: {
                        questions: {
                            hash: CryptoJS.MD5(self._id._str || self._id).toString()
                        }
                    }
                });
            }
        }

        instance.tags.set(tags);

        for (var i = 0; i < tags.length; i++) {
            tags[i] = {
                name: tags[i].tag
            };
        }

        Questions.update(this._id, {
            $set: {
                tags: tags
            }
        });

        instance.tag_editable.set(false);
        chips = $(event.target).parent().find('.chips-initial');
        chips.hide();
    },
    'click .save-question-edit': function(event) {
        var currentLayer1 = this.layer_1;
        var editInputVal = $(event.target).parent().find(".question-edit-input").val().trim();

        if (editInputVal === '') {
            Materialize.toast("Please don't delete this question.", 2000, 'toast');
            return;
        }

        const created_at = new Date();

        var currentHistory = [];
        if ("edit_history" in currentLayer1) {
            currentHistory = currentLayer1.edit_history;
        }

        currentHistory.push({
            editor: Meteor.user().username,
            oldText: currentLayer1.text,
            created_at: created_at
        });
        currentLayer1.edit_history = currentHistory;

        currentLayer1.text = editInputVal;

        // alert("Your edit is: " + editInputVal);
        Questions.update({
            _id: this._id
        }, {
            $set: {
                layer_1: currentLayer1
            }
        });

        Materialize.toast("Your change is saved.", 2000, 'toast');

        $('#sliderControlDiv').show();
        $(event.target).parent().parent().parent().find(".question-display").show();
        $(event.target).parent().parent().parent().find(".question-edit-display").hide();
        $(event.target).parent().parent().parent().parent().find(".edit-question-hide").show();
    },
    'click .cancel-question-edit': function(event) {
        $(event.target).parent().parent().parent().parent().find(".edit-question-hide").show();
        $(event.target).parent().parent().parent().find(".question-display").show();
        $(event.target).parent().parent().parent().find(".question-edit-display").hide();
        $('#sliderControlDiv').show();
    },
    'click .edit-question-btn': function(event) {
        $(event.target).parent().parent().parent().find(".edit-question-hide").hide();
        $(event.target).parent().parent().find(".question-edit-display").show();
        $(event.target).parent().parent().find(".question-display").hide();
        $('#sliderControlDiv').hide();

    },
    'click .view-edit-history-btn': function(event) {
        var currentLayer1 = Questions.findOne({
            _id: this._id
        }).layer_1;

        if (!("edit_history" in currentLayer1)) {
            Materialize.toast("No History Found", 2000, 'toast');
            return;
        }

        $(event.target).parent().parent().find(".old-question-display").show();
        $(event.target).parent().parent().find(".hide-edit-history-btn").show();
        $(event.target).parent().parent().find(".view-edit-history-btn").hide();

    },
    'click .hide-edit-history-btn': function(event) {
        $(event.target).parent().parent().find(".old-question-display").hide();
        $(event.target).parent().parent().find(".hide-edit-history-btn").hide();
        $(event.target).parent().parent().find(".view-edit-history-btn").show();
    },
    'click .edit-l2-question-btn': function(event) {
        $(event.target).parent().parent().find(".l2-old-question-display").hide();
        $(event.target).hide();
        $(event.target).parent().parent().find(".layer2-edit").show();

    },
    'click .view-l2-edit-history-btn': function(event) {
        var targetLayer2ID = $(event.target).parent().parent().attr("layer-id");

        var foundLayer2ID = -1;

        for (var i = 0; i < this.layer_2.length; i++) {
            if (this.layer_2[i].layer_2_index == targetLayer2ID) {
                foundLayer2ID = this.layer_2[i].layer_2_index;
                break;
            }
        }

        if ("edit_history" in this.layer_2[foundLayer2ID]) {
            alert("Original Question: " + this.layer_2[foundLayer2ID].edit_history[0].oldText);
        } else {
            Materialize.toast("There is no edit history for this question.", 2000, 'toast');
        }

    },
    'click .hide-l2-edit-history-btn': function(event) {

    },
    'click .save-l2-question-edit': function(event) {
        var editInputVal = $(event.target).parent().find(".l2-question-edit-input").val().trim();

        if (editInputVal === '') {
            alert("Please do delete this question.");
            return;
        }

        const created_at = new Date();
        var currentLayer2 = this.layer_2;

        var targetLayer2ID = $(event.target).parent().parent().parent().attr("layer-id");
        var foundLayer2ID = -1;

        for (var i = 0; i < currentLayer2.length; i++) {
            if (currentLayer2[i].layer_2_index == targetLayer2ID) {
                foundLayer2ID = i;
                break;
            }
        }

        var currentHistory = [];

        if ("edit_history" in currentLayer2[foundLayer2ID]) {
            currentHistory = currentLayer2[foundLayer2ID].edit_history;
        }

        currentHistory.push({
            editor: Meteor.user().username,
            oldText: currentLayer2[foundLayer2ID].question,
            created_at: created_at
        });
        currentLayer2[foundLayer2ID].edit_history = currentHistory;

        currentLayer2[foundLayer2ID].question = editInputVal;

        Questions.update({
            _id: this._id
        }, {
            $set: {
                layer_2: currentLayer2
            }
        });

        $(event.target).parent().parent().hide();
        $(event.target).parent().parent().parent().find(".edit-l2-question-btn").show();
        $(event.target).parent().parent().parent().find(".l2-old-question-display").show();
        $('#sliderControlDiv').show();
    },
    'click .cancel-l2-question-edit': function(event) {
        $(event.target).parent().parent().hide();
        $(event.target).parent().parent().parent().find(".edit-l2-question-btn").show();
        $(event.target).parent().parent().parent().find(".l2-old-question-display").show();
    },
    'click .edit-option-btn': function(event) {
        $(event.target).parent().find('.option-input-field').show();
        $(event.target).hide();
        $('#sliderControlDiv').hide();
    },
    'click .save-l1-option-edit': function(event) {
        var userOptionEdit = $(event.target).parent().parent().find('.option-edit-input').val().trim();

        if (userOptionEdit == '') {
            alert("Please do not remove this option");
            return;
        }

        var currentLayer1 = this.layer_1;
        var currentOptionIndex = $(event.target).parent().parent().attr('data-option-index');
        var targetOptionArrayIndex = -1;

        for (var i = 0; i < currentLayer1.options.length; i++) {
            if (currentLayer1.options[i].option_index == currentOptionIndex) {
                targetOptionArrayIndex = i;
                break;
            }
        }
        const created_at = new Date();
        var currentEditHistory = [];
        if ("edit_history" in currentLayer1.options[i]) {
            currentEditHistory = currentLayer1.options[i].edit_history;
        }

        currentEditHistory.push({
            editor: Meteor.user().username,
            oldText: currentLayer1.options[targetOptionArrayIndex].option_text,
            created_at: created_at
        });
        currentLayer1.options[targetOptionArrayIndex].option_text = userOptionEdit;

        Questions.update({
            _id: this._id
        }, {
            $set: {
                layer_1: currentLayer1
            }
        });

        $(event.target).parent().parent().find('.edit-option-btn').show();
        $(event.target).parent().find('.edit-option-btn').show();
        $(event.target).parent().hide();
        $('#sliderControlDiv').show();
    },
    'click .cancel-l1-option-edit': function(event) {
        $(event.target).parent().parent().find('.edit-option-btn').show();
        $(event.target).parent().find('.edit-option-btn').show();
        $(event.target).parent().hide();
        $('#sliderControlDiv').show();
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
    'click .rateQuestion': function(event) {
        const qmodule = $(event.target).parents()[4];
        $('.rate-form').modal({
            dismissible: true, // Modal can be dismissed by clicking outside of the modal
            opacity: .5, // Opacity of modal background
            in_duration: 300, // Transition in duration
            out_duration: 200, // Transition out duration
            startingTop: '10%', // Starting top style attribute
            endingTop: '100%', // Ending top style attribute
        });
        $(qmodule).find('.rate-form').modal('open');
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
    },
    'submit form': function(event, instance) {
        event.preventDefault();

        const created_at = new Date();
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        var discussed = Meteor.user().profile.discussed || {};
        var cID = Comments.insert({
            text: event.target[0].value,
            owner: {
                _id: Meteor.user()._id,
                username: Meteor.user().username
            },
            created_at: created_at,
            upvote_count: 0,
            downvote_count: 0
        });

        // var lastChar = Router.current().originalUrl.charAt(Router.current().originalUrl.length - 1);

        // var processURL = Router.current().originalUrl;
        // if (lastChar == '/') {
        //     processURL = processURL.substring(0, str.length - 1);
        // }

        // processURL = processURL.substr(processURL.lastIndexOf('/') + 1);

        var noticeQuestion = Questions.find({
            hash: this.hash
        }).fetch()[0];

        var searchOwnerName = noticeQuestion.owner.username;
        var noticeString = "Question: " + noticeQuestion.layer_1.text;

        // insert notification only you are not operating your questions
        let inst = this;
        var sameUserCheck = searchOwnerName != Meteor.user().username;
        if (sameUserCheck) {
            let inst = this;
            let currentQuestionOwner = Questions.findOne({
                _id: this._id
            }).owner;

            Meteor.call('profile.getNotificationArrayOfUser', currentQuestionOwner.username, function(err, result) {
                if (result && result[1] == 1) {
                    let noticeType = 'comment';
                    let condition = inst.qcondition;

                    if (condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11) noticeType = 'mechanism';

                    var noticeID = Notifications.insert({
                        owner: {
                            _id: currentQuestionOwner._id,
                            username: currentQuestionOwner.username
                        },
                        raw_owner_name: searchOwnerName,
                        type: noticeType,
                        created_at: created_at,
                        typeid: inst.hash,
                        typestring: noticeString,
                        isRead: 0
                    });
                }
            });
        }

        Comments.update(cID, {
            $set: {
                hashcode: CryptoJS.MD5(cID).toString()
            }
        });

        try {
            Questions.update(noticeQuestion._id, {
                $push: {
                    comments: {
                        $each: [{
                            hashcode: CryptoJS.MD5(cID).toString(),
                            owner: {
                                _id: Meteor.user()._id,
                                username: Meteor.user().username
                            },
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
            ////console.log("Sending email with " + token + api);
            //console.log("Calling api: " + api);
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
                    //console.log("Email sent successfully!");
                    ////console.log("user accept n2 sending");
                }
            });
        }

        let currentQuestionOwner = Questions.findOne({
            _id: this._id
        }).owner;
        let currentQuestion = Questions.findOne({
            _id: this._id
        });

        if ('username' in currentQuestionOwner && sameUserCheck) {
            //console.log("Sending email to " + currentQuestionOwner.username + " ...");
            let currentQuestionOwnerProfile = UserEmail.findOne({
                username: currentQuestionOwner.username
            });

            if (currentQuestionOwnerProfile && 'email' in currentQuestionOwnerProfile && 'noticeSet' in currentQuestionOwnerProfile) {
                let currentQuestionOwnerNotificationSetting = currentQuestionOwnerProfile.noticeSet;

                if (parseInt(currentQuestionOwnerNotificationSetting[1]) === 1) {
                    Meteor.call('email.getToken', function(error, result) {
                        if (error) {
                            //console.log("Error: " + error);
                            return;
                        }
                        //console.log("Recieved email token.");

                        let currentToken = result;
                        Meteor.call('email.getAPI', function(error, result) {
                            let currentAPI = result;
                            //console.log("Recieved api.");
                            let condition = inst.qcondition;
                            if (condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11) {
                                postEmail(currentToken, currentAPI + "sendNewMechanismEmail",
                                    inst.hash,
                                    currentQuestionOwnerProfile.email, currentQuestion.layer_1
                                    .text, currentQuestionOwnerProfile.username);

                            } else {
                                postEmail(currentToken, currentAPI + "sendNewCommentEmail",
                                    inst.hash,
                                    currentQuestionOwnerProfile.email, currentQuestion.layer_1
                                    .text, currentQuestionOwnerProfile.username);
                            }
                        });
                    });
                }
            }
        }
    },
    'click #researcherFeedbackBtn': function(event) {
        const created_at = new Date();
        const feedback = $(event.target).parent().find('.researcherFeedback').val().trim();
        Meteor.call('questions.setFeedback', this._id, feedback, Meteor.user().username, created_at);
        var noticeQuestion = Questions.findOne({
            _id: this._id
        });

        var searchOwnerName = noticeQuestion.owner.username;
        var noticeString = "Question: " + noticeQuestion.layer_1.text;

        // insert notification only you are not operating your questions
        let inst = this;
        var sameUserCheck = searchOwnerName != Meteor.user().username;

        if (sameUserCheck) {
            let inst = this;
            let currentQuestionOwner = Questions.findOne({
                _id: this._id
            }).owner;
            Meteor.call('profile.getNotificationArrayOfUser', currentQuestionOwner.username, function(err, result) {
                if (result && result[4] == 1) {
                    var noticeID = Notifications.insert({
                        owner: {
                            _id: currentQuestionOwner._id,
                            username: currentQuestionOwner.username
                        },
                        raw_owner_name: searchOwnerName,
                        type: 'researcher feedback',
                        created_at: created_at,
                        typeid: inst.hash,
                        typestring: noticeString,
                        isRead: 0
                    });
                }
            });
        }

        $(event.target).parent().find('.researcherFeedback').attr('disabled', 'disabled');
        $(event.target).parent().find(".edit-feedback").html("&nbsp;&nbsp;Edit");
        $(event.target).parent().find('#researcherFeedbackBtn').hide();

        var currentQuestionID = this._id;
        var currentQuestionOwner = Questions.findOne({
            _id: currentQuestionID
        }).owner.username;
        var emailUser = UserEmail.findOne({
            username: currentQuestionOwner
        });


        function postEmail(token, api) {
            //console.log("Calling api: " + api);
            var emailUserAddr = emailUser.email;
            var emailQuestionHash = Questions.findOne({
                _id: currentQuestionID
            }).hash;
            var emailQuestionLayerOneQuestion = Questions.findOne({
                _id: currentQuestionID
            }).layer_1.text;

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
                    //console.log("Email successfully sent!");
                    ////console.log("user accept n0 sending");
                }
            });
        }

        if (emailUser !== 'undefined' && 'email' in emailUser && sameUserCheck) {

            if ('noticeSet' in emailUser) {
                //console.log("current user notice set is " + emailUser.noticeSet);
                if (parseInt(emailUser.noticeSet[4]) === 0) {
                    //console.log("user reject n4 sending");
                    return;
                }
            }

            Meteor.call('email.getToken', function(error, result) {
                //console.log("error" + error);
                //console.log("got token");

                var currentToken = result;
                Meteor.call('email.getAPI', function(error, result) {
                    var currentAPI = result;
                    //console.log("got api");
                    postEmail(currentToken, currentAPI + "sendNewFeedbackEmail");
                });
            });
        } else {
            return;
        }
    },
    'click #mechanismBtn': function(event) {
        let currentMech = this.layer_1.mechanism;
        const created_at = new Date();
        const mech = $(event.target).parent().find('.topMechanism').val().trim();

        currentMech.created_at = created_at;
        currentMech.text = mech;
        Meteor.call('questions.updateMechanism', this._id, currentMech);

        $(event.target).parent().find('.topMechanism').attr('disabled', 'disabled');
        $(event.target).parent().find(".edit-mech").html("&nbsp;&nbsp;Edit");
        $(event.target).parent().find('#mechanismBtn').hide();
    },
    'click .edit-mech': function(event) {
        $(event.target).parent().find('#mechanismBtn').toggle();
        let attr = $(event.target).parent().find('.topMechanism').attr('disabled')
        if (attr !== undefined) {
            $(event.target).html("&nbsp;&nbsp;Cancel");
            $(event.target).parent().find('.topMechanism').removeAttr('disabled');
        } else {
            $(event.target).html("&nbsp;&nbsp;Edit");
            $(event.target).parent().find('.topMechanism').val(this.layer_1.mechanism.text);
            $(event.target).parent().find('.topMechanism').attr('disabled', 'disabled');
        }
    },
    'click .edit-feedback': function(event) {
        $(event.target).parent().find('#researcherFeedbackBtn').toggle();
        let attr = $(event.target).parent().find('.researcherFeedback').attr('disabled')
        if (attr !== undefined) {
            $(event.target).html("&nbsp;&nbsp;Cancel");
            $(event.target).parent().find('.researcherFeedback').removeAttr('disabled');
        } else {
            $(event.target).html("&nbsp;&nbsp;Edit");
            $(event.target).parent().find('.researcherFeedback').val(this.layer_1.mechanism.feedback.text);
            $(event.target).parent().find('.researcherFeedback').attr('disabled', 'disabled');
        }
    },
    'click #mechHelp': function(event) {
        $(event.target).parent().parent().find('#mechTip').toggle();
    },
    'click #mechExHelp': function(event) {
        $(event.target).parent().parent().find('#mechEx').toggle();
    },
    'click #feedbackHelp': function(event) {
        $(event.target).parent().parent().find('#feedbackTip').toggle();
    }
});
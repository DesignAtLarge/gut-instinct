import './_.jade';

import {
    Tags,
    Questions,
    TagQuestions,
    PersonalQuestions
} from '../../../../imports/api/models.js';

import {
    mongoJsonify
} from '../../../../imports/api/parsing';

Template.tag.rendered = function() {

    $(document).ready(function() {
        setTimeout(function() {
            $('.collapsible').collapsible();
            //console.log("started collapsible");

            setTimeout(function() {
                $('.collapsible').collapsible();
                //console.log("started collapsible");
            }, 1500);

        }, 1500);
    });

    try {
        if (Meteor.user()) {
            const guide_completed = Meteor.user().profile.guide_completed;
            const toured = Meteor.user().profile.toured.tag;
            //console.log("toured and intro_completed in tag page are " + toured + " " + intro_completed);
            //alert("Whaaa");
            if (guide_completed) { //intro is completed, which means the shorter tour doesnt need to be run
                if (!toured) {
                    introJs().setOption('showProgress', true).onchange(function(target) {
                        //introJs().setOptions({'showProgress': true, 'doneLabel': 'Done tour'}).onchange(function(target) {
                        Meteor.users.update(Meteor.userId(), {
                            $set: {
                                'profile.toured.tag': true
                            }
                        });
                    }).start();
                } else { //toured is done - basically do nothing
                    //console.log("do nothing");
                }
            } else { //intro is not completed, which means run THE SHORTER TOUR.. and never set the toured bit or anything (toured bit doesnt even better)
                introJs(".tag-video").setOptions({
                    'showProgress': true,
                    'doneLabel': 'Done tour'
                }).start();
                //console.log(" intro_completed in short tour is " + intro_completed);
            }
        } else {
            //console.log("Meteor user never found duh!");
        }

    } catch (e) {}
};




Template.tag.onCreated(function() {
    let docentProgress = localStorage.getItem("docentProgress")
    if (!docentProgress) {
        localStorage.setItem("docentProgress", 25);
        docentProgress = 25;
    }
    this.progress = new ReactiveVar(docentProgress);
    //this.data = {}
    // this.chosen = {};

    this.dataObj = new ReactiveVar(null);
    var pathArray = location.href.split('/');
    let name = decodeURIComponent(pathArray[4]);
    let tag_data = Tags.find({
        name: name
    }).fetch()[0] || {};
    let inst = this;
    Meteor.call('tags.fetchTag', name, function(err, result) {
        if (err) {
            alert("Server Connection Error");
        } else {
            inst.dataObj.set(result);
        }
    });
});

Template.tag.helpers({
    getProgressData() {
        return {
            progress: Template.instance().progress.get()
        };
    },
    init: function(name) {
        try {
            Template.instance()._data = Tags.find({
                name: name
            }).fetch()[0] || {};
            const _id = Tags.find({
                name: name
            }).fetch()[0]._id;

            let topics_investigated = Meteor.user().profile.topics_investigated;

            topics_investigated[_id] = true;

            Meteor.users.update(Meteor.userId(), {
                $set: {
                    'profile.topics_investigated': topics_investigated
                }
            });

            // check this user has visited this tag or not
            var username = Meteor.user().username;
            var condition = Meteor.user().profile.condition;

            //docent-exp
            if (condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11) {
                if (Template.instance()._data.has_personal_question) {
                    var viewedUserList = Template.instance()._data.viewed_user;

                    if ($.inArray(Meteor.user().username, viewedUserList) > -1) {
                        // when user has viewed, keep going, nothing happened
                    } else {
                        var pathArray = location.href.split('/');
                        var protocol = pathArray[0];
                        var host = pathArray[2];
                        var questionURL = protocol + '//' + host;
                        // when user has not viewed this question, should redirect to question page
                        questionURL = questionURL + '/personal/' + name;
                        window.location.replace(questionURL);
                    }
                }
            } else { //for any conditions except 2 and 3, no /personal/ business but just head to /t/
                //
            }
        } catch (e) {}
    },
    data: function() {
        // const _id = Template.instance()._data._id;
        // return Tags.find({
        //         _id: _id
        //     }).fetch()[0] || Template.instance()._data;
        try {
            if (Template.instance().dataObj.get())
                return Template.instance().dataObj.get();
            else {
                const _id = Template.instance()._data._id;
                return Tags.find({
                    _id: _id
                }).fetch()[0] || Template.instance()._data;
            }
        } catch (e) {}
    },
    questionswithoutCondition: function() {
        try {
            var questions = Tags.find({
                _id: Template.instance()._data._id
            }).fetch()[0].questions;
            return Questions.find({
                hash: {
                    $in: _.map(questions, function(object) {
                        return object.hash;
                    })
                }
            }, {
                sort: {
                    created_at: -1
                }
            });
        } catch (e) {
            return [];
        }
    },
    questions: function() {
        try {
            ucondition = 0;
            if (Meteor.user()) {
                ucondition = Meteor.user().profile.condition;
                //console.log("my condition is in (questions-tag) " + ucondition);
            } else {
                //console.log("meteor user not ready - my condition is in (questions-tag) " + ucondition);
            }
            var questions = Tags.find({
                _id: Template.instance()._data._id
            }).fetch()[0].questions;
            return Questions.find({
                $and: [{
                        hash: {
                            $in: _.map(questions, function(object) {
                                return object.hash;
                            })
                        }
                    },
                    {
                        $or: [{
                                qcondition: ucondition
                            },
                            {
                                qcondition: 0
                            }
                        ]
                    }
                ]
            }, {
                sort: {
                    created_at: -1
                }
            });

            //).fetch();
            //vineet - does fetch go or not
        } catch (e) {
            return [];
        }
    },
    tag_question: function() {
        try {
            const hashcode = Tags.find({
                _id: Template.instance()._data._id
            }).fetch()[0].tag_question;
            return TagQuestions.find({
                hashcode: hashcode
            }).fetch()[0];
        } catch (e) {
            return {}
        }
    },
    getTranscript: function() {
        try {
            var transcript;

            if (Template.instance().dataObj.get())
                transcript = Template.instance().dataObj.get().transcript;
            else
                transcript = Tags.findOne({
                    _id: Template.instance()._data._id
                }).transcript;

            String.prototype.replaceAt = function(index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
            var sentence_count = 0;
            for (var i = 0; i < transcript.length; i++) {
                if (transcript[i] == '.') {
                    if (++sentence_count % 5 == 0) transcript = transcript.replaceAt(i, ".\n");
                }
            }
            transcript = transcript.replace(/(?:\r\n|\r|\n)/g, '<br/><br/>');
            return transcript;
        } catch (e) {}
    },
    getFeedback: function() {
        const topic_investigated = Meteor.user().profile.topics_investigated[Template.instance()._data._id];
        if (_.isUndefined(topic_investigated)) {
            return '';
        }
        const index = topic_investigated.chose;
        const hashcode = Tags.find({
            _id: Template.instance()._data._id
        }).fetch()[0].tag_question;
        const tag_question = TagQuestions.find({
            hashcode: hashcode
        }).fetch()[0];
        if (!tag_question) {
            return '';
        }
        return tag_question.choices[index].feedback;
        // console.log(this)
    },
    chose: function(index) {
        const topic_investigated = Meteor.user().profile.topics_investigated[Template.instance()._data._id];
        if (_.isUndefined(topic_investigated)) {
            return false;
        }
        return topic_investigated.chose == index;
    },
    answered_tag_question: function() {
        const topic_investigated = Meteor.user().profile.topics_investigated[Template.instance()._data._id];
        return topic_investigated;
        // if (_.isUndefined(topic_investigated)) {
        //     return false;
        // }
        // return true;
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
    isCondition1: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition1or3or7or5: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 3 || condition == 7 || condition == 5;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition1or3or5or8or10: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 3 || condition == 5 || condition == 8 || condition == 10;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition1or2or7or8or9: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 2 || condition == 7 || condition == 8 || condition == 9;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition2: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition7: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 7;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition1or2or8or9: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 1 || condition == 2 || condition == 8 || condition == 9;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition2or4or7or0or6or9or11: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2 || condition == 4 || condition == 7 || condition == 0 || condition == 6 || condition == 9 || condition == 11;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition2or4: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2 || condition == 4 || condition == 0;
            }
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
    isIntroCompleted: function() {
        if (Meteor.user()) {
            const intro_completed = Meteor.user().profile.intro_completed;
            //console.log("intro_completed check in isintrocompleted is " + intro_completed);
            //alert("hanging in");
            return intro_completed;
        }
    },
    isGuideCompleted: function() {
        try {
            if (Meteor.user()) {
                const guide_completed = Meteor.user().profile.guide_completed;
                //console.log("intro_completed check in isintrocompleted is " + intro_completed);
                //alert("hanging in");
                return guide_completed;
            }
        } catch (e) {}
    },
    personal_questions: function() {
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResult = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch();
        return personalFetchResult;
        // var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
        //     return !!el;
        // }).pop();
        // Meteor.call('personalQuestions.fetchPersonalQuestionsByTag', currentQueryTag, function(error, result) {
        //     localStorage.removeItem("personalFetchResult")
        //     localStorage.setItem("personalFetchResult", JSON.stringify(result));
        // });

        // return mongoJsonify(localStorage.getItem("personalFetchResult"));
    },
    personal_question_exist: function() {
        try {
            if (Meteor.user()) {
                var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
                    return !!el;
                }).pop();
                var personalFetchResult = PersonalQuestions.find({
                    "tag": currentQueryTag
                }).fetch();
                return personalFetchResult;
                if (personalFetchResult.length > 0) {
                    return true;
                }
                return false;
            }
        } catch (e) {}
    },
    getMendelCode: function() {
        return sessionStorage.mendelcode;
    },

});

Template.tag.events({
    'change #note-file-upload-btn': function(event) {
        $('#upload-selection-status-span').html("File Selected!");
    },
    'focus #add-learning-note-url-input': function(event) {
        if (!$('#add-learning-note-url-input').val().includes("http://")) {
            $('#add-learning-note-url-input').val("http://");
        }
    },
    'click #add-note-btn': function(event) {
        function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }


        $("#add-note-btn").hide();
        $("#tag-video-element")[0].pause();

        $("#learning-note-content-div").show();
        $("#learning-note-render-bin").show();

        // loop links
        var externalBtnNumber = $('.openExternalLinkBtn').length;
        for (var i = 0; i < externalBtnNumber; i++) {
            if ($($('.openExternalLinkBtn')[i]).attr('href') != '-1') {
                $($('.openExternalLinkBtn')[i]).show();
            } else {
                $($('.openExternalLinkBtn')[i]).hide();
            }
        }

        var videoTimingShowNumber = $('.video-target-timing-display').length;
        for (var i = 0; i < videoTimingShowNumber; i++) {
            var secondFormat = $($(".video-target-timing-display")[i]).attr('video-data-sec');
            secondFormat = secondsToHms(secondFormat);
            $($(".video-target-timing-display")[i]).html("@" + secondFormat);
        }

        $('#learningNoteHeader').click();
    },
    'click #learningNoteHeader': function(event) {
        event.preventDefault();

        function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }


        $("#add-note-btn").hide();
        $("#tag-video-element")[0].pause();

        $("#learning-note-content-div").show();
        $("#learning-note-render-bin").show();

        // loop links
        var externalBtnNumber = $('.openExternalLinkBtn').length;
        for (var i = 0; i < externalBtnNumber; i++) {
            if ($($('.openExternalLinkBtn')[i]).attr('href') != '-1') {
                $($('.openExternalLinkBtn')[i]).show();
            } else {
                $($('.openExternalLinkBtn')[i]).hide();
            }
        }

        var videoTimingShowNumber = $('.video-target-timing-display').length;
        for (var i = 0; i < videoTimingShowNumber; i++) {
            var secondFormat = $($(".video-target-timing-display")[i]).attr('video-data-sec');
            secondFormat = secondsToHms(secondFormat);
            $($(".video-target-timing-display")[i]).html("@" + secondFormat);
        }

        // $('#learningNoteHeader').click();
    },
    'click #go-to-guide-btn': function(event) {
        try {
            if (Meteor.user() && Meteor.user().profile.condition == 7) {
                //console.log("intro_completed before is "+ Meteor.user().profile.intro_completed);
                //console.log("updating intro_completed bit");
                //alert("whaa");
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.guide_completed': true
                    }
                });
                //console.log("updated intro_completed bit");
                //console.log("guide_completed after is "+ Meteor.user().profile.intro_completed);
                //alert("just hanging in");
            }
        } catch (e) {}
    },
    'click #save-note-btn': function(event) {
        if ($('#add-learning-note-input').val() === "") {
            alert("Empty notes cannot be saved. Please complete your note before saving it.");
            return;
        }

        function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
        }

        function ValidURL(str) {
            var pattern = new RegExp(
                '((([a-z\\d]([a-z\\d-]*[a-z\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\d+)?(\\//[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater
            if (!pattern.test(str)) {
                // alert("Please enter a valid URL.");
                return false;
            } else {
                return true;
            }
        }

        var userContent = $("#add-learning-note-input").val();
        var currentTime = ($("#tag-video-element")[0].currentTime).toFixed(2);
        var currentUser = Meteor.user().username;

        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var queryID = Tags.findOne({
            name: currentQueryTag
        })._id;

        var s3URL = "-1";
        var userURL = "-1";

        var uploader = new Slingshot.Upload("myImageUploads");

        var fileAttached = ($("#note-file-upload-btn")[0].files.length) > 0;

        var urlEmpty = $("#add-learning-note-url-input").val() === "" || $("#add-learning-note-url-input").val() ===
            "http://";

        if (!urlEmpty) {
            if (!ValidURL($("#add-learning-note-url-input").val())) {
                alert("Please enter a valid URL. For example: http://www.google.com");
                return;
            }
            console.log("Passed URL check");
            userURL = $("#add-learning-note-url-input").val();
        }

        if (fileAttached) {
            uploader.send(document.getElementById('note-file-upload-btn').files[0], function(error,
                downloadUrl) {
                if (error) {
                    // Log service detailed response.
                    // console.error('Error uploading', uploader.xhr.response);
                    alert(error);
                } else {
                    //downloadUrl is ready
                    s3URL = downloadUrl;
                    console.log("upload done, download url is ready");
                    Tags.update({
                        _id: queryID
                    }, {
                        $push: {
                            video_notes: {
                                $each: [{
                                    content: userContent,
                                    time: parseFloat(currentTime),
                                    author: currentUser,
                                    link_url: userURL,
                                    upload_file: s3URL
                                }],
                                $slice: -100000,
                                $sort: {
                                    time: -1
                                }
                            }
                        }
                    });
                }
            });
        } else {
            Tags.update({
                _id: queryID
            }, {
                $push: {
                    video_notes: {
                        $each: [{
                            content: userContent,
                            time: parseFloat(currentTime),
                            author: currentUser,
                            link_url: userURL,
                            upload_file: s3URL
                        }],
                        $slice: -100000,
                        $sort: {
                            time: -1
                        }
                    }
                }
            });
        }

        $("#add-learning-note-input").val("");
        $("#add-learning-note-input").attr("placeholder", "Note Saved! You can add more notes here.");
        $("#add-learning-note-url-input").val("");
        $("#add-learning-note-url-input").attr("placeholder", "Add URL to notes here...");

        $('#upload-selection-status-span').html("Attach file (Optional)");

        // 1500ms time out to make sure front end is loaded
        setTimeout(function() {
            var externalBtnNumber = $('.openExternalLinkBtn').length;
            for (var i = 0; i < externalBtnNumber; i++) {
                if ($($('.openExternalLinkBtn')[i]).attr('href') != '-1') {
                    $($('.openExternalLinkBtn')[i]).show();
                } else {
                    $($('.openExternalLinkBtn')[i]).hide();
                }
            }

            var videoTimingShowNumber = $('.video-target-timing-display').length;
            for (var i = 0; i < videoTimingShowNumber; i++) {
                var secondFormat = $($(".video-target-timing-display")[i]).attr('video-data-sec');
                secondFormat = secondsToHms(secondFormat);
                $($(".video-target-timing-display")[i]).html("@" + secondFormat);
            }
        }, 1500);

    },
    'click #add-url-btn': function(event) {
        //console.log("triger input");
        $("#add-learning-note-url-input").show();
    },
    'click .video-jump-link': function(event) {
        var newTime = $(event.target).attr("video-data-sec");
        //console.log("event target is:" + $(event.target)[0]);
        $("#tag-video-element")[0].currentTime = newTime;
    },
    // 'submit form': function(event, instance) {
    //     event.preventDefault();
    //     const contrib = event.target.contrib.value.trim();
    //     const created_at = new Date();
    //     const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];
    //     if (!contrib) return;
    //     const scID = ScienceCollabs.insert({
    //         hashcode: '',
    //         text: contrib,
    //         writer: { _id: Meteor.userId(), username: Meteor.user().username },
    //         created_at: created_at
    //     });
    //     ScienceCollabs.update(scID, {
    //         $set: {
    //             hashcode: CryptoJS.MD5(scID).toString()
    //         }
    //     });
    //     Tags.update(instance._data._id, {
    //         $push: {
    //             contributions: {
    //                 hashcode: CryptoJS.MD5(scID).toString(),
    //                 text: contrib,
    //                 writer: { _id: Meteor.userId(), username: Meteor.user().username },
    //                 created_at: created_at
    //             }
    //         }
    //     });
    //     UserMetrics.update({ _id: user_metric._id }, {
    //         $set: {
    //             number_of_science_articles: user_metric.number_of_science_articles + 1
    //         }
    //     });
    //     event.target.contrib.value = '';
    // },
    'click #addQuestiontoGutBoard': function(event, instance) {
        const guide_completed = Meteor.user().profile.guide_completed;
        //console.log("guide_completed is " + guide_completed);
        if (!guide_completed) {
            //alert("1.1");
            window.location.replace("/guide");
            //alert("1.2");
        } else {
            //alert("2.1");
            window.location.replace("/gutboard_slider_addq");
            //alert("2.2");
        }
    },

    /*'click #addQuestionControlr': function(event, instance) {
     const intro_completed = Meteor.user().profile.intro_completed;
     console.log("intro_completed is "+intro_completed);
     //alert("hanging in");
     if(!intro_completed){
     window.location.replace("/t/introduction");
     }
     else{
     window.location.replace("/t/guide");
     }
     },
     DO THIS LATER - IF I WANT TO LINK TO GUIDE BUTTON*/
    'click #updatePersonalQuestion': function(event) {
        // check user has got all questions
        var currentQueryTag = window.location.pathname.split('/').filter(function(el) {
            return !!el;
        }).pop();
        var personalFetchResultCount = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch().length;

        //save user's answer in db
        var personalFetchResult = PersonalQuestions.find({
            "tag": currentQueryTag
        }).fetch();
        // var personalFetchResultCount = mongoJsonify(localStorage.getItem("personalFetchResult")).length;

        // var personalFetchResult = mongoJsonify(localStorage.getItem("personalFetchResult"));


        for (var i = 0; i < personalFetchResultCount; i++) {
            if ($('#tag-' + personalFetchResult[i].cluster + '-answer-extra')[0].checked) {
                if ($('#tag-' + personalFetchResult[i].cluster + '-answer-extra-text-text')[0].value == '') {
                    Materialize.toast('Please specify your option.', 2000, 'toast');
                    return;
                }
            }
        }

        for (var i = 0; i < personalFetchResultCount; i++) {
            var check = $('#personal-q' + i).find('input:checkbox:checked').length;
            if (check < 1) {
                Materialize.toast('Please answer all the questions.', 2000, 'toast');
                return;
            }
        }

        for (var i = 0; i < personalFetchResult.length; i++) {
            var userRes = [];
            var checkExtra = false;
            var chosenOptions = $('#personal-q' + i).find('input:checkbox:checked');
            for (var j = 0; j < chosenOptions.length; j++) {
                var response = chosenOptions[j].getAttribute("personal-id");
                if (response.indexOf("extra") !== -1) {
                    checkExtra = true;
                    response = response.replace("extra", "");
                    response = response + ($('#personal-q' + i).find('input:checkbox').length - 1);
                }
                userRes.push(response);
            }

            var targetID = personalFetchResult[i]._id;
            var targetUser = Meteor.user().username;

            if (checkExtra) {
                // user choose the extra option
                // get the last index of choices
                var currentPushIndex = (personalFetchResult[i].choices.length);

                var newIndex = personalFetchResult[i].cluster + "-" + currentPushIndex;
                var currentCluster = personalFetchResult[i].cluster;
                var newText = $('#tag-' + currentCluster + "-answer-extra-text-text").val();

                //userRes = currentCluster + "-" + currentPushIndex;
                var newAuthor = Meteor.user().username;

                Meteor.call('personalQuestions.pushChoices', targetID, currentCluster, newIndex, "None", newText, newAuthor);
                // PersonalQuestions.update({
                //     _id: targetID
                // }, {
                //     $push: {
                //         choices: {
                //             cluster: currentCluster,
                //             index: newIndex,
                //             feedback: "None",
                //             text: newText,
                //             author: newAuthor
                //         }
                //     }
                // });

                Meteor.call('personalQuestions.setAnswers', targetID, targetUser, userRes);
                // PersonalQuestions.update({
                //     _id: targetID
                // }, {
                //     $push: {
                //         answers: {
                //             username: targetUser,
                //             response: userRes
                //         }
                //     }
                // });
            } else {
                Meteor.call('personalQuestions.setAnswers', targetID, targetUser, userRes);
                // PersonalQuestions.update({
                //     _id: targetID
                // }, {
                //     $push: {
                //         answers: {
                //             username: targetUser,
                //             response: userRes
                //         }
                //     }
                // });
            }
        }
        Materialize.toast('Responses Saved.', 2000, 'toast');
    },
    'click .answer-tag-question': function(event, instance) {
        // console.log($(event.target).parent().find('#test2').is(':checked'));
        const hashcode = Tags.find({
            _id: instance._data._id
        }).fetch()[0].tag_question;
        const tag_question = TagQuestions.find({
            hashcode: hashcode
        }).fetch()[0]
        const correct_answer = $(event.target).parent().find('#tag-question-answer-' + tag_question.correct_answer);
        const topics_investigated = Meteor.user().profile.topics_investigated;
        if (correct_answer.is(':checked')) {
            // const answer_text = tag_question.choices[tag_question.correct_answer].text;
            // $('.tag-question-feedback').text(tag_question.);
            $('.tag-question-feedback').text(tag_question.choices[tag_question.correct_answer].feedback);
            $('.tag-question-feedback').css({
                'color': '#4CAF50'
            });
            topics_investigated[instance._data._id] = {
                is_correct: true,
                chose: tag_question.correct_answer
            };
            // topics_investigated[Template.instance()._data._id] = true;
        } else {
            var i = 0;
            for (i = 0; i < tag_question.choices.length; i++) {
                if ($(event.target).parent().find('#tag-question-answer-' + i).is(':checked')) {
                    topics_investigated[instance._data._id] = {
                        is_correct: false,
                        chose: i
                    };
                    break;
                }
            }
            $('.tag-question-feedback').text(tag_question.choices[i].feedback);
            $('.tag-question-feedback').css({
                'color': '#F44336'
            });
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.topics_investigated': topics_investigated
            }
        });
    },
    'click .addq-clear': function(event) {
        event.preventDefault();
        const form = $(event.target).parents()[0];
        form.primary_question.value = '';
        form.followup_question.value = '';
        form.tags_entry.value = '';
        form.start_discussion.value = '';
    },
    'focus #url_attach': function(event) {
        if (!$('#url_attach').val().includes("http://")) {
            $('#url_attach').val("http://");
        }
    }
});
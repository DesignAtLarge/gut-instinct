import './_.jade';

import {
    Questions,
    Bookmarks,
    Tags,
    Comments,
    UserMetrics,
    TrainingQuestions
} from '../../../../imports/api/models.js';

var clickCounter = 0;
var boardQuestionCounter;

Template.gutboard_slider_vineet.rendered = function() {

    function promiseWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    $('body').css({
        'background-color': '#EEEEEE'
    });
    $('#tags_entry').material_chip();
    const query = Router.current().params.query;
    const state = query.s || sessionStorage.getItem('state') || 0;
    sessionStorage.setItem('state', state);
    const tabmap = {
        '0': 'contribute',
        '1': 'discussed',
        '2': 'answered',
        '3': 'mine',
    };

    try {
        const toured = Meteor.user().profile.toured.gutboard_slider;
        console.log("toured in gutboard_slider_vineet " + toured);
        if (!toured) {
            console.log("inside if");
            /*introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.gutboard_slider': true
                    }
                });
            }).start();*/

            //introJs().addHints();

            introJs().onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.gutboard_slider': true
                    }
                });
                console.log("here");
            }).addHints();
            console.log("there");
        }
    } catch (e) {}


    // try {
    //     const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];
    //     user_metric.visit_counter.gutboard++;
    //     UserMetrics.update({ _id: user_metric._id }, {
    //         $set: {
    //             visit_counter: user_metric.visit_counter
    //         }
    //     });
    // } catch (e) {}

    $('.indicator').hide();
    if (sessionStorage.getItem('state') < 4) {
        $('.indicator').show();
        $('#' + tabmap[sessionStorage.getItem('state')]).addClass('active');
    }
    $('ul.tabs').tabs();
    // $('.modal-trigger').leanModal();

    // if (sessionStorage.getItem('from_test') === 'true') {
    //     sessionStorage.setItem('from_test', false);
    //     window.location.reload();
    // }
    // if (sessionStorage.getItem('moved')) {
    //     $('#q-moved').openModal({
    //         complete: function() {}
    //     });
    //     $('#q-moved').show();
    // } else {
    //     // $('#alert').closeModal();
    //     $('#alert').modal('hide');
    //     $('#alert').hide();
    // }
    // sessionStorage.setItem('moved', '');

    // try {
    //     const toured = Meteor.user().profile.toured.gutboard;
    //     if (!toured) {
    //         introJs().setOption('showProgress', true).onchange(function(target) {
    //             Meteor.users.update(Meteor.userId(), {
    //                 $set: {
    //                     'profile.toured.gutboard': true
    //                 }
    //             });
    //             // sessionStorage.setItem('novice', false);
    //         }).start();
    //     }
    // } catch (e) {}

    //print number of card question in the view

    //wait here



    // $( document ).ready(function() {

    setTimeout(function() {

        var cardCounter = $('.cardquestion').length;

        boardQuestionCounter = cardCounter;

        if (cardCounter > 0) {
            console.log("number of card is " + cardCounter);

            var counter = 0;

            // init to hide all the question on the page
            for (counter = 1; counter < cardCounter; counter++) {
                $('.cardquestion').eq(counter).hide();
            }

        }

        // check redirect status
        // if user from training page, we should show the add box
        var historyURL = document.referrer;
        if (historyURL.indexOf("/guide") !== -1) {
            // user are coming from training page
            $("#addQuestionDiv").show();
            $("#sliderControl").hide();
            $("#backSliderControl").hide();
            $("#addQuestionControl").hide();
            $("#activeQuestionDiv").hide();
        }

        var allQuestionCard = $('.cardquestion');

        for (var i = 0; i < allQuestionCard.length; i++) {
            var currentHash = $(allQuestionCard[i]).attr('question-hash');

            var currentLayer1 = Questions.findOne({
                hash: currentHash
            }).layer_1;

            var currentResponseArr = currentLayer1.user_response;

            var currentQuestionID = currentHash;
            var currentUsername = Meteor.user().username;

            for (var k = 0; k < currentResponseArr.length; k++) {
                if (currentResponseArr[k].username == currentUsername) {
                    var targetUserResponse = currentResponseArr[k].response;

                    for (var j = 0; j < targetUserResponse.length; j++) {
                        var targetCheckBox = '#' + currentQuestionID + '-' + targetUserResponse[j];
                        console.log("CHECKING BOX:" + targetCheckBox);
                        $(targetCheckBox).prop('checked', true);
                    }
                    // return;
                }
            }

            var currentStats = currentLayer1.stats;

            var currentSum = 0;
            for (var j = 0; j < currentStats.length; j++) {
                if (isNaN(currentStats[j]) || (typeof currentStats[j] === 'undefined') || currentStats[j] === null) {
                    currentStats[j] = 0;
                    continue;
                }
                currentSum = currentSum + parseInt(currentStats[j]);
                console.log('increasing sum' + currentSum);
            }

            console.log('sum!' + currentSum);

            var appendid = '#' + currentHash + '-' + '0' + '-label';
            var targetPercentage = '%';

            for (var j = 0; j < currentStats.length; j++) {
                targetPercentage = Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100) + '%';
                appendid = '#' + currentHash + '-' + j + '-label';
                console.log('appending stats!!!' + appendid);
                //chen-write code to remove current append before appending new; do the same in qmode code
                $(appendid).append('<span style="font-style: italic; color: #bdbdbd;"> ' + currentStats[j] + ' Answer(s) / ' + targetPercentage + '</span> </div>');
            }
            /*
                            if(currentStats[currentStats.length]==1){
                                $(appendid).append('<span style="font-style: italic; color: #bdbdbd;"> ' + currentStats[currentStats.length]+ ' vote ( ' + targetPercentage + ' of votes) </span>');
                            }
                            else {
                                $(appendid).append('<span style="font-style: italic; color: #bdbdbd;"> ' + currentStats[currentStats.length]+ ' votes / ' + targetPercentage + '</span>');   
                            }
            */
        }

        console.log("rerender the layer 2");
        var allQuestionCard = $('.cardquestion');

        for (var i = 0; i < allQuestionCard.length; i++) {
            var currentHash = $(allQuestionCard[i]).attr('question-hash');

            var l2CurrentResponseArr = Questions.findOne({
                hash: currentHash
            }).layer_2_user_response;

            if (typeof layer_2_user_response === 'undefined') {
                continue;
            }

            var currentQuestionID = currentHash;
            var currentUsername = Meteor.user().username;

            for (var k = 0; k < l2CurrentResponseArr.length; k++) {

                if (l2CurrentResponseArr[k].username == currentUsername) {
                    var targetUserResponse = currentResponseArr[k].response;

                    for (var j = 0; j < targetUserResponse.length; j++) {

                        var targetCheckBox = '#' + currentQuestionID + '-layer2-' + currentResponseArr[k].layer_2_index + '-' + targetUserResponse[j];
                        console.log("CHECKING LAYER2 BOX:" + targetCheckBox);
                        $(targetCheckBox).prop('checked', true);
                    }
                    // return;
                }
            }
        }


    }, 2000);



    // });

};



Template.gutboard_slider_vineet.onCreated(function() {
    // const query = Router.current().params.query;
    this.qstatus = new ReactiveVar(sessionStorage.getItem('state'));

});

Template.gutboard_slider_vineet.helpers({
    init: function() {},

    questions: function() {

        // if(typeof targetUser === 'undefined'){
        //     return;
        // }
        //
        // var targetUser = Meteor.user().username;
        // localStorage.setItem("currentUserName", targetUser);

        return _.sortBy(Questions.find({}).fetch(), function(object) {
            return object.created_at.getTime();
        }).reverse();
    },
    qaccept: function(hashcode) {
        const qstatus = Template.instance().qstatus.get() || '0';
        try {
            var profile = Meteor.user().profile;
            if (qstatus == 0) {
                const answered = !profile.answered[hashcode] || profile.answered[hashcode].length < 3;
                return answered && !profile.discussed[hashcode];
            } else if (qstatus == 1) {
                return !!profile.discussed[hashcode];
            } else if (qstatus == 2) {
                return profile.answered[hashcode] && profile.answered[hashcode].length >= 3;
            } else if (qstatus == 3) {
                return this.owner._id === Meteor.userId();
            } else if (qstatus == 4) {
                return true;
            }
        } catch (e) {
            return false;
        }
    },
    qlength: function(state) {
        try {
            const questions = Questions.find({}).fetch();
            var profile = Meteor.user().profile;
            if (state == 0) {
                return _.filter(questions, function(question) {
                    const answered = !profile.answered[question.hash] || profile.answered[question.hash].length < 3;
                    return answered && !profile.discussed[question.hash];
                }).length;
            } else if (state == 1) {
                return _.filter(questions, function(question) {
                    return !!profile.discussed[question.hash];
                }).length;
            } else if (state == 2) {
                return _.filter(questions, function(question) {
                    return profile.answered[question.hash] && profile.answered[question.hash].length >= 3;
                }).length;
            } else if (state == 3) {
                return _.filter(questions, function(question) {
                    return question.owner._id === Meteor.userId();
                }).length;
            }
            return 0;
        } catch (e) {
            return 0;
        }
    }
});

Template.gutboard_slider_vineet.events({

    'click #contribute': function(event, instance) {
        // remove the extra cards

        setTimeout(function() {
            var cardCounter = $('.cardquestion').length;

            if (cardCounter > 0) {
                console.log("number of card is " + cardCounter);

                var counter = 0;

                // init to hide all the question on the page
                for (counter = 1; counter < cardCounter; counter++) {
                    $('.cardquestion').eq(counter).hide();
                }

            }
        }, 200);


        $('#sliderControlDiv').show();
    },

    'click #discussed': function(event, instance) {
        $('#sliderControlDiv').hide();
    },

    'click #mine': function(event, instance) {
        $('#sliderControlDiv').hide();
    },

    'click #answered': function(event, instance) {
        $('#sliderControlDiv').hide();
    },

    'click #sliderControl': function(event, instance) {
        if (clickCounter + 1 >= boardQuestionCounter) {
            alert("You have viewed all the current questions! Great work! Add your own questions!");
        } else {
            clickCounter = clickCounter + 1;
            $('.cardquestion').eq(clickCounter - 1).hide();
            $('.cardquestion').eq(clickCounter).show();

            $('#addQuestionDiv').hide();
            $('#sliderControl').show();
        }
    },
    'click #backSliderControl': function(event, instance) {
        if (clickCounter - 1 < 0) {
            alert("This is the first question. Please use right arrow to view more questions");
        } else {
            clickCounter = clickCounter - 1;
            $('.cardquestion').eq(clickCounter + 1).hide();
            $('.cardquestion').eq(clickCounter).show();
            $('#addQuestionDiv').hide();
            $('#sliderControl').show();
        }
    },

    'click .returnActiveQuestion': function(event, instance) {
        $("#addQuestionDiv").hide();
        $("#sliderControl").show();
        $("#addQuestionControl").show();
        $("#questionStatusTabs").show();
        $("#activeQuestionDiv").show();
        $("#backSliderControl").show();
        $('#upload-selection-status-span').html("Attach File (Optional)");

    },
    'focus #url_attach': function(event) {
        if (!$('#url_attach').val().includes("http://")) {
            $('#url_attach').val("http://");
        }
    },

    'click #addQuestionControl': function(event, instance) {

        /*//check training condition
        var userArray = TrainingQuestions.findOne({index: 0}).user_response;
        var targetUserName = Meteor.user().username;
        console.log("TrainingQuestions is"+TrainingQuestions);
        alert("vvaw");
        console.log("userArray.length is "+userArray.length);
        console.log("targetUserName is "+targetUserName);

        var doneTraining = false;
        console.log("doneTraining is "+doneTraining);
        for(var i = 0; i < userArray.length; i++) {
            if(userArray[i].username === targetUserName){
                doneTraining = true;
            }
            console.log("doneTraining inside loop is "+doneTraining);
        }
        console.log("doneTraining is "+doneTraining);*/

        const guide_completed = Meteor.user().profile.guide_completed;
        console.log("guide_completed is " + guide_completed);
        alert("hanging in");
        //if(!doneTraining) {
        if (!guide_completed) {
            alert("1.1");
            window.location.replace("/guide");
            alert("1.2");
        } else {
            /*$("#addQuestionDiv").show();
            $("#sliderControl").hide();
            $("#backSliderControl").hide();
            $("#addQuestionControl").hide();
            $("#activeQuestionDiv").hide();
            $("#questionStatusTabs").hide();*/
            alert("2.1");
            window.location.replace("/gutboard_slider_addq");
            alert("2.2");
        }
    },

    'click .tab-link': function(event, instance) {
        const tab = $(event.target).attr('id');
        const tabmap = {
            'contribute': '0',
            'discussed': '1',
            'answered': '2',
            'mine': '3',
            'all-questions': 4
        };
        if (tabmap[tab] < 4) {
            $('.indicator').show();
        } else {
            $('.indicator').hide();
        }
        sessionStorage.setItem('state', tabmap[tab]);
        instance.qstatus.set(tabmap[tab]);
        // Router.go('/gutboard?s=' + tabmap[tab]);
        return false;
    },
    'click .guttest-button': function() {
        sessionStorage.setItem('clicked-guttest', true);
    },
    'click .addq-clear': function(event) {
        event.preventDefault();
        const form = $(event.target).parents()[0];
        form.primary_question.value = '';
        form.followup_question.value = '';
        form.tags_entry.value = '';
        form.start_discussion.value = '';
    },
    'change #question-file-upload-btn': function(event) {
        $('#upload-selection-status-span').html("File Selected!");
    },
    'click .addq-nextstep': function() {
        console.log("current event target" + event.target);
        $($(event.target).parent().parent().next().children()[0]).click()
    },
    'click #addOptionQuestionBtn': function(event) {
        var currentOptionNumber = parseInt($(event.target).parent().find('.question-option').attr('option-number'));

        if ($(event.target).parent().find('#primary_question').val() == '') {
            alert("Please add your question before adding the options.");
            return;
        }

        if ($(event.target).parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() == '') {
            alert("Please complete this option before adding more options.");
            return;
        }

        $(event.target).parent().find('.question-option').attr('option-number', currentOptionNumber + 1);
        $(event.target).parent().find('.option-' + (currentOptionNumber + 1)).show();

    },
    'click #addOptionFollowupBtn': function(event) {
        var currentOptionNumber = parseInt($(event.target).parent().find('.followup-option').attr('option-number'));

        if ($(event.target).parent().find('#followup_question').val() == '') {
            alert("Please add your question before adding the options.");
            return;
        }

        if ($(event.target).parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() == '') {
            alert("Please complete this option before adding more options.");
            return;
        }

        $(event.target).parent().find('.followup-option').attr('option-number', currentOptionNumber + 1);
        $(event.target).parent().find('.option-' + (currentOptionNumber + 1)).show();

    },
    'submit form': function(event) {
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

        event.preventDefault();

        // const text = event.target.newq.value.trim();
        const primary_question = $('#primary_question').val().trim();
        const followup_question = $('#followup_question').val().trim();
        const user_url_attach = $('#url_attach').val().trim();


        if (primary_question == '') {
            alert("Please enter your question.");
            $('#layer1Adder').click();
            return;
        }

        var urlEmpty = user_url_attach === "" || user_url_attach === "http://";;
        var userURL = "-1";

        if (!urlEmpty) {
            if (!ValidURL(user_url_attach)) {
                alert("Please enter a valid URL. For example: http://google.com");
                return;
            }
            console.log("Passed URL check");
            userURL = user_url_attach;
        }


        // const editable = event.target.editable.checked;
        const comment = $('#start_discussion').val().trim().replace("\n", "<br>");
        const tagq = $('#tags_entry').val().replace(new RegExp('#', 'g'), ' ').split(' ');
        const created_at = new Date();
        // const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];

        var uploader = new Slingshot.Upload("myQuestionUploads");

        var fileAttached = ($("#question-file-upload-btn")[0].files.length) > 0;
        var s3URL = '-1';

        if (fileAttached) {
            uploader.send(document.getElementById('question-file-upload-btn').files[0], function(error, downloadUrl) {
                if (error) {
                    // Log service detailed response.
                    // console.error('Error uploading', uploader.xhr.response);
                    alert(error);
                } else {
                    //downloadUrl is ready
                    s3URL = downloadUrl;
                    console.log("upload done, download url is ready");
                    // create new question
                    var qID = Questions.insert({
                        hash: '',
                        owner: {
                            _id: Meteor.user()._id,
                            username: Meteor.user().username
                        },
                        layer_1: {
                            text: primary_question
                        },
                        layer_2: {
                            text: followup_question
                        },
                        tags: [],
                        comments: [],
                        created_at: created_at,
                        editable: false
                    });

                    // assign hashcode
                    Questions.update(qID, {
                        $set: {
                            hash: CryptoJS.MD5(qID).toString()
                        }
                    });

                    // grab tags for this question
                    var tags = [];
                    for (var i = 0; i < tagq.length; i++) {
                        var tagname = tagq[i].trim().toLowerCase();
                        while (tagname[0] === '#') {
                            tagname = tagname.substring(1);
                        }
                        if (!tagname) continue;
                        var tagID = Tags.find({
                            name: tagname
                        }).fetch()[0];

                        // create new tag if does not exist
                        if (!tagID) {
                            tagID = Tags.insert({
                                hash: '',
                                name: tagname,
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
                        } else {
                            tagID = tagID._id;
                        }

                        // add new question to this tag
                        Tags.update(tagID, {
                            $push: {
                                questions: {
                                    hash: CryptoJS.MD5(qID).toString(),
                                    layer_1: {
                                        text: primary_question
                                    },
                                    layer_2: {
                                        text: followup_question
                                    }
                                }
                            }
                        });
                        tagID = tagID._str || tagID;
                        tags.push({
                            hash: CryptoJS.MD5(tagID).toString(),
                            name: tagname
                        });
                    }

                    // assign tags with this question.
                    Questions.update(qID, {
                        $set: {
                            tags: tags
                        }
                    });

                    if (comment) {
                        var discussed = Meteor.user().profile.discussed;
                        var cID = Comments.insert({
                            text: comment,
                            owner: {
                                _id: Meteor.user()._id,
                                username: Meteor.user().username
                            },
                            created_at: created_at,
                            upvote_count: 0,
                            downvote_count: 0,
                            attached_file: s3URL,
                            attached_url: userURL
                        });
                        Comments.update(cID, {
                            $set: {
                                hash: CryptoJS.MD5(cID).toString()
                            }
                        });
                        Questions.update(qID, {
                            $push: {
                                comments: {
                                    hash: CryptoJS.MD5(cID).toString(),
                                    text: comment,
                                    created_at: created_at,
                                    owner: {
                                        _id: Meteor.user()._id,
                                        username: Meteor.user().username
                                    },
                                    attached_file: s3URL,
                                    attached_url: userURL
                                }
                            }
                        });

                        discussed[CryptoJS.MD5(qID).toString()] = true;
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
                    }

                    Meteor.users.update(Meteor.userId(), {
                        $push: {
                            'profile.questions': {
                                hash: CryptoJS.MD5(qID).toString(),
                                layer_1: {
                                    text: primary_question
                                },
                                layer_2: {
                                    text: followup_question
                                },
                                created_at: created_at
                            }
                        }
                    });

                    // UserMetrics.update({ _id: user_metric._id }, {
                    //     $set: {
                    //         number_of_questions: user_metric.number_of_questions + 1
                    //     }
                    // });
                    //
                    // $('#primary_question').val('');
                    // event.target.followup_question.value = '';
                    // event.target.start_discussion.value = '';
                    // event.target.tags_entry.value = '';
                    //
                    // $('#confirm-add').openModal();
                    // $('#confirm-add').show();

                    // event.target.newq.value = '';
                    // event.target.editable.checked = false;
                    // event.target.tagq.value = '';
                    // event.target.newc.value = '';
                    // return false;
                }
            });
        } else {
            // create new question
            var qID = Questions.insert({
                hash: '',
                owner: {
                    _id: Meteor.user()._id,
                    username: Meteor.user().username
                },
                layer_1: {
                    text: primary_question,
                    yes_answerers: {},
                    no_answerers: {}
                },
                layer_2: {
                    text: followup_question
                },
                tags: [],
                comments: [],
                created_at: created_at,
                editable: false
            });

            // assign hashcode
            Questions.update(qID, {
                $set: {
                    hash: CryptoJS.MD5(qID).toString()
                }
            });

            // grab tags for this question
            var tags = [];
            for (var i = 0; i < tagq.length; i++) {
                var tagname = tagq[i].trim().toLowerCase();
                while (tagname[0] === '#') {
                    tagname = tagname.substring(1);
                }
                if (!tagname) continue;
                var tagID = Tags.find({
                    name: tagname
                }).fetch()[0];

                // create new tag if does not exist
                if (!tagID) {
                    tagID = Tags.insert({
                        hash: '',
                        name: tagname,
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
                } else {
                    tagID = tagID._id;
                }

                // add new question to this tag
                Tags.update(tagID, {
                    $push: {
                        questions: {
                            hash: CryptoJS.MD5(qID).toString(),
                            layer_1: {
                                text: primary_question
                            },
                            layer_2: {
                                text: followup_question
                            }
                        }
                    }
                });
                tagID = tagID._str || tagID;
                tags.push({
                    hash: CryptoJS.MD5(tagID).toString(),
                    name: tagname
                });
            }

            // assign tags with this question.
            Questions.update(qID, {
                $set: {
                    tags: tags
                }
            });

            if (comment) {
                var discussed = Meteor.user().profile.discussed;
                var cID = Comments.insert({
                    text: comment,
                    owner: {
                        _id: Meteor.user()._id,
                        username: Meteor.user().username
                    },
                    created_at: created_at,
                    upvote_count: 0,
                    downvote_count: 0,
                    attached_file: "-1",
                    attached_url: userURL
                });
                Comments.update(cID, {
                    $set: {
                        hash: CryptoJS.MD5(cID).toString()
                    }
                });
                Questions.update(qID, {
                    $push: {
                        comments: {
                            hash: CryptoJS.MD5(cID).toString(),
                            text: comment,
                            created_at: created_at,
                            owner: {
                                _id: Meteor.user()._id,
                                username: Meteor.user().username
                            },
                            attached_file: s3URL,
                            attached_url: userURL
                        }
                    }
                });

                discussed[CryptoJS.MD5(qID).toString()] = true;
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
            }

            Meteor.users.update(Meteor.userId(), {
                $push: {
                    'profile.questions': {
                        hash: CryptoJS.MD5(qID).toString(),
                        layer_1: {
                            text: primary_question
                        },
                        layer_2: {
                            text: followup_question
                        },
                        created_at: created_at
                    }
                }
            });

            // UserMetrics.update({ _id: user_metric._id }, {
            //     $set: {
            //         number_of_questions: user_metric.number_of_questions + 1
            //     }
            // });
            //
            // event.target.primary_question.value = '';
            // event.target.followup_question.value = '';
            // event.target.start_discussion.value = '';
            // event.target.tags_entry.value = '';
            //
            // $('#confirm-add').openModal();
            // $('#confirm-add').show();

            // event.target.newq.value = '';
            // event.target.editable.checked = false;
            // event.target.tagq.value = '';
            // event.target.newc.value = '';
            // return false;
        }
        alert("Your question has been added!");
        $("#returnBoardBottom").click();
    }
});
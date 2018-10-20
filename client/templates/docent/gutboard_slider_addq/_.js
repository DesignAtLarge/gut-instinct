import './_.jade';

import {
    Questions,
    //     Tags,
    //     Comments
} from '../../../../imports/api/models.js';

var clickCounter = 0;
var boardQuestionCounter;
var five_opened = false;

Template.gutboard_slider_addq.rendered = function() {

    $(document).ready(function() {
        $('.modal').modal();
    });
    $('#step1-modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .3, // Opacity of modal background
        inDuration: 200, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '100%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
    });
    $('#step2-modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .3, // Opacity of modal background
        inDuration: 200, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '100%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
    });

    $(document).ready(function() {
        setTimeout(function() {
            $('.collapsible').collapsible();
            //console.log("started collapsible");

            setTimeout(function() {
                $('.collapsible').collapsible();
                //console.log("started collapsible");
            }, 1500);

        }, 1500);

        $('#addQuestionForm').on('keyup keypress', function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                e.preventDefault();
                return false;
            }
        });
    });

    function promiseWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    try {
        const toured = Meteor.user().profile.toured.gutboard_slider_addq;
        //console.log("toured in gutboard_slider_addq " + toured);
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.gutboard_slider_addq': true
                    }
                });
            }).start();
        }
    } catch (e) {}
};



Template.gutboard_slider_addq.onCreated(function() {
    let docentProgress = localStorage.getItem("docentProgress")
    if (!docentProgress) {
        localStorage.setItem("docentProgress", 85);
        docentProgress = 85;
    }
    this.progress = new ReactiveVar(docentProgress);
    // const query = Router.current().params.query;
    this.qstatus = new ReactiveVar(sessionStorage.getItem('state'));

    this.options = new ReactiveArray();
    this.options.push(optionDict(1));


});

Template.gutboard_slider_addq.helpers({
    getProgressData() {
        return {
            progress: Template.instance().progress.get()
        };
    },
    init: function() {

        var currentMendelCode = sessionStorage.mendelcode;
        if (currentMendelCode === undefined) {
            if (!Meteor.user().profile.intro_completed) {
                sessionStorage.setItem("mendelcode", "AmericanGutProject");
                return;
            }
            sessionStorage.setItem("mendelcode", "AmericanGutProject");
            //window.location.href = "/entrance?origin=gutboard_slider_addq";
            return;
        }

        localStorage.setItem("position-" + currentMendelCode, 0);
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
    options: function() {
        return Template.instance().options.get();
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
    isCondition2: function() {
        try {
            var condition = Meteor.user().profile.condition;
            //console.log("my condition is in" + condition);
            return condition == 2;
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
    isCondition0or10or11: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 0 || condition == 10 || condition == 11;
            }
        } catch (e) {
            return false;
        }
    },
    hasAddedMoreThanOneQuestion: function() {
        try {
            if (Meteor.user()) {
                return true;
                return (Meteor.user().profile.questions.length > 1 && Meteor.user().profile.intro_completed);
            }
        } catch (e) {}
    },
    exampleQuestions: function() {
        return _.sortBy(Questions.find({
            qcondition: -10
        }).fetch(), function(object) {
            return object.ex;
        });
    }
});

Template.gutboard_slider_addq.events({
    'click #sliderControl': function(event, instance) {
        if (clickCounter + 1 >= boardQuestionCounter) {
            Materialize.toast('You have viewed all the current questions! Great work. Add your own questions.', 3000, 'toast');
        } else {
            clickCounter = clickCounter + 1;
            $('.cardquestion').eq(clickCounter - 1).hide();
            $('.cardquestion').eq(clickCounter).show();

            $('#addQuestionDiv').hide();
            $('#sliderControl').show();
        }
    },
    'click #set-intro-completed-btn': function(event) {
        try {
            //console.log("intro_completed before is " + Meteor.user().profile.intro_completed);
            //console.log("updating intro_completed bit");
            //alert("whaa");
            Meteor.users.update(Meteor.userId(), {
                $set: {
                    'profile.intro_completed': true
                }
            });
            //console.log("updated intro_completed bit");
            //console.log("guide_completed after is " + Meteor.user().profile.intro_completed);
            //alert("just hanging in");
        } catch (e) {}
    },
    'click #backSliderControl': function(event, instance) {
        if (clickCounter - 1 < 0) {
            Materialize.toast('This is the first question. Please use right arrow to view more questions.', 3000, 'toast');
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


    'click .addq-nextstep': function(event) {
        let id = event.target.id;
        if (id == 'step-1') {
            if (validatePrimaryQuestion() == null) {

                //Template.instance().progress.set(parseInt(Template.instance().progress.get()) - 5);
                $("#check-step-1").hide();
                return;
            }
            $("#check-step-1").show();
            Template.instance().progress.set(90);
        }
        if (id == 'step-0') {
            $("#check-step-0").show();
        }
        if (id == 'step-2') {
            const followup_question = $('#followup_question').val().trim();
            const followup_question_op1 = $('#layer2Adder-input-1').val().trim();

            if (followup_question == '') {
                Materialize.toast('Please complete Step 2 by adding at least one follow-up question', 3000, 'toast-alert');
                //alert("Please add at least one follow-up question.");
                //$('#layer2Adder').click();
                //Template.instance().progress.set(parseInt(Template.instance().progress.get()) - 5);
                $("#check-step-2").hide();
                return;
            }

            if (followup_question_op1 == '') {
                Materialize.toast("Please complete Step 2 by adding at least one option to your follow-up question", 3000, 'toast-alert');
                //alert("Please add at least one option to your follow-up question.");
                //$('#layer2Adder').click();
                //Template.instance().progress.set(parseInt(Template.instance().progress.get()) - 5);
                $("#check-step-2").hide();
                return;
            }
            Template.instance().progress.set(95);
            $("#check-step-2").show();
        }
        if (id == 'step-3') $("#check-step-3").show();
        if (id == 'step-4') {
            const mechanism = $('#start_discussion').val().trim();
            if (mechanism == '') {
                let condition = Meteor.user().profile.condition;
                if (Meteor.user().profile.intro_completed && (condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11))
                    Materialize.toast('Please complete Step 4 by providing a mechanism', 3000, 'toast-alert');
                else
                    Materialize.toast('Please complete Step 4 by providing a comment', 3000, 'toast-alert');
                //alert("Please add at least one follow-up question.");
                //$('#layer2Adder').click();
                //Template.instance().progress.set(parseInt(Template.instance().progress.get()) - 3);
                $("#check-step-4").hide();
                return;
            }
            Template.instance().progress.set(98);
            $("#check-step-4").show();
        }
        $($(event.target).parent().parent().next().children()[0]).click();
    },

    'click .criteria-check': function(event) {
        for (var i = 0; i < 5; i++) {
            var item = document.getElementById("addq-checklist").getElementsByTagName("input")[i];
            if (!item.checked) {
                if (five_opened)($(event.target).parent().parent().parent().parent().next().children()[0]).click();
                $("#check-step-5").hide();
                five_opened = false;
                return;
            }
        }
        five_opened = true;
        $("#check-step-5").show();
        $($(event.target).parent().parent().parent().parent().next().children()[0]).click();
    },


    'click #addOptionQuestionBtn': function(event) {
        var currentOptionNumber = parseInt($(event.target).parent().find('.question-option').attr(
            'option-number'));

        if ($(event.target).parent().find('#primary_question').val() == '') {
            Materialize.toast("Please add your question before adding the options.", 3000, 'toast-alert');
            //alert("Please add your question before adding the options.");
            return;
        }

        if ($(event.target).parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() ==
            '') {
            Materialize.toast("Please complete this option before adding more options.", 3000, 'toast-alert');
            //alert("Please complete this option before adding more options.");
            return;
        }

        $(event.target).parent().find('.question-option').attr('option-number', currentOptionNumber + 1);
        $(event.target).parent().find('.option-' + (currentOptionNumber + 1)).show();

    },
    'click #addOptionFollowupBtn': function(event) {
        var currentOptionNumber = parseInt($(event.target).parent().parent().find('.followup-option').attr(
            'option-number'));

        if ($(event.target).parent().parent().find('#followup_question').val() == '') {
            Materialize.toast("Please add your question before adding the options.", 3000, 'toast-alert');
            //alert("Please add your question before adding the options.");
            return;
        }

        if ($(event.target).parent().parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() ==
            '') {
            Materialize.toast("Please complete this option before adding more options.", 3000, 'toast-alert');
            //alert("Please complete this option before adding more options.");
            return;
        }

        $(event.target).parent().parent().find('.followup-option').attr('option-number', currentOptionNumber + 1);
        $(event.target).parent().parent().find('.option-' + (currentOptionNumber + 1)).show();

    },
    'click #addExtraL2Question': function(event) {
        $('#addExtraL2QuestionOptionsDiv').hide();

        var extraFollowUpDivArr = $('.extra-followup');
        for (var followIndex = 0; followIndex < extraFollowUpDivArr.length; followIndex++) {
            if ($(extraFollowUpDivArr[followIndex]).css('display') == 'none') {

                if (followIndex - 1 >= 0 && $(extraFollowUpDivArr[followIndex - 1]).find(
                        '.extra-followup-question').val().trim() == '') {
                    Materialize.toast('Please enter a question before continue', 3000, 'toast-alert');
                    //alert('Please enter a question before continue');
                    return;
                }

                $(extraFollowUpDivArr[followIndex]).show();
                return;
            }
        }
    },
    'click .addExtraL2QuestionOptions': function(event) {
        var optionInputArr = $(event.target).parent().parent().parent().find('.question-each-option');

        //console.log('found total number of options ' + optionInputArr.length);
        for (var optionIndex = 0; optionIndex < optionInputArr.length; optionIndex++) {
            if ($(optionInputArr).eq(optionIndex).parent().parent().parent().parent().css('display') != 'none') {
                if ($(optionInputArr).eq(optionIndex).css('display') == 'none') {

                    if ($(optionInputArr).eq(optionIndex).parent().parent().parent().find('.extra-followup-question')
                        .val().trim() == '') {
                        Materialize.toast('Please enter your question before add more options.', 3000, 'toast-alert');
                        //alert('Please enter your question before add more options.');
                        return;
                    }

                    if ($(optionInputArr).eq(optionIndex - 1).find('.addOptionInputExtra').val().trim() ==
                        '') {
                        Materialize.toast('Please enter your option before continue', 3000, 'toast-alert');
                        //alert('Please enter your option before continue');
                        return;
                    }

                    $(optionInputArr).eq(optionIndex).show();
                    break;
                }
            }
        }
    },
    'submit form': function(event) {
        event.preventDefault();

        function ValidURL(str) {
            // var pattern = new RegExp(
            //     '((([a-z\\d]([a-z\\d-]*[a-z\d])*)\\.)+[a-z]{2,}|' + // domain name
            //     '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            //     '(\\:\d+)?(\\//[-a-z\\d%_.~+]*)*' + // port and path
            //     '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            //     '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater
            // if (!pattern.test(str)) {
            //     // alert("Please enter a valid URL.");
            //     return false;
            // } else {
            //     return true;
            // }
            var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
            return urlregex.test(str);
        }


        const primary_question = validatePrimaryQuestion();
        if (primary_question == null) {
            return;
        }

        const followup_question = $('#followup_question').val().trim();
        const user_url_attach = $('#url_attach').val().trim();


        const followup_question_op1 = $('#layer2Adder-input-1').val().trim();

        if (followup_question == '') {
            Materialize.toast('Please complete Step 2 by adding at least one follow-up question', 3000, 'toast-alert');
            //alert("Please add at least one follow-up question.");
            $('#layer2Adder').click();
            return;
        }

        if (followup_question_op1 == '') {
            Materialize.toast("Please complete Step 2 by adding at least one option to your follow-up question", 3000, 'toast-alert');
            //alert("Please add at least one option to your follow-up question.");
            $('#layer2Adder').click();
            return;
        }

        const mechanism = $('#start_discussion').val().trim();

        if (mechanism == '') {
            let condition = Meteor.user().profile.condition;
            if (Meteor.user().profile.intro_completed && (condition == 2 || condition == 4 || condition == 0 || condition == 6 || condition == 9 || condition == 11))
                Materialize.toast('Please complete Step 4 by providing a mechanism', 3000, 'toast-alert');
            else
                Materialize.toast('Please complete Step 4 by providing a comment', 3000, 'toast-alert');
            return;
        }

        var userOptionArray = $('.addOptionInput');
        var userOptionLayer1 = [];
        var userOptionLayer2 = [];

        var dbLayer1 = {};
        var dbLayer2 = [];

        var urlEmpty = user_url_attach === "" || user_url_attach === "http://";;
        var userURL = "-1";

        if (!urlEmpty) {
            if (!ValidURL(user_url_attach)) {
                Materialize.toast("Please enter a valid URL. For example: http://google.com", 3000, 'toast-alert');
                //alert("Please enter a valid URL. For example: http://google.com");
                return;
            }
            //console.log("Passed URL check");
            userURL = user_url_attach;
        }

        Template.instance().progress.set(100);

        let optionsTextArray = getOptionsText();
        for (let i = 0; i < optionsTextArray.length; i++) {
            let currentOption = optionsTextArray[i];
            userOptionLayer1.push({
                'option_text': currentOption,
                'option_index': i,
                'layer_1_option_author': Meteor.userId()
            });
        }

        for (let i = 0; i < userOptionArray.length; i++) {
            let index = parseInt($(userOptionArray[i]).attr("num"));
            let currentOption = $(userOptionArray[i]).val().trim();

            if (currentOption === '') {
                continue;
            }
            userOptionLayer2.push({
                'layer_2_index': 0,
                'option_text': currentOption,
                'option_index': index,
                'layer_2_option_author': Meteor.userId()
            });
            // if(i < 5) {
            //     userOptionLayer1.push({'option_text': currentOption, 'option_index': userOptionLayer1.length, 'layer_1_option_author': Meteor.userId()});
            // }
            // else{
            //     userOptionLayer2.push({'layer_2_index': 0, 'option_text': currentOption, 'option_index': i - 5, 'layer_2_option_author': Meteor.userId()});
            // }
        }

        dbLayer1.text = primary_question;
        dbLayer1.user_response = [];
        dbLayer1.stats = [];
        dbLayer1.options = userOptionLayer1;
        dbLayer1.mechanism = {};

        dbLayer2.push({});
        dbLayer2[0].layer_2_index = 0;
        dbLayer2[0].stats = [];
        dbLayer2[0].question = followup_question;
        dbLayer2[0].options = userOptionLayer2;
        dbLayer2[0].layer_2_author = Meteor.userId();


        var extraL2Question = $('.extra-followup-question');
        var vaildExtraL2QuestionCounter = 0;

        for (var i = 0; i < extraL2Question.length; i++) {
            if ($(extraL2Question[i]).val().trim() != '') {
                vaildExtraL2QuestionCounter++;
            }
        }

        //console.log("valid extra l2 counter " + vaildExtraL2QuestionCounter);

        for (var i = 0; i < vaildExtraL2QuestionCounter; i++) {
            var targetDivID = "#extra-followup-" + (i + 1);
            var dbLayer2New = {};
            dbLayer2New.layer_2_index = i + 1;
            dbLayer2New.stats = [];
            dbLayer2New.question = $('.extra-followup-question').eq(i).val().trim();
            dbLayer2New.options = [];
            dbLayer2New.layer_2_author = Meteor.userId();

            for (var optionIdx = 0; optionIdx < 5; optionIdx++) {

                var targetText = $(targetDivID).find('.addOptionInputExtra').eq(optionIdx).val();
                if (targetText == '') {
                    break;
                }

                dbLayer2New.options.push({
                    layer_2_index: i + 1,
                    option_text: targetText,
                    option_index: optionIdx,
                    layer_2_option_author: Meteor.userId()
                });
            }
            dbLayer2.push(dbLayer2New);
        }


        // const editable = event.target.editable.checked;
        const comment = $('#start_discussion').val().trim().replace("\n", "<br>"); //mechanism
        const tagq = $('#tags_entry').val().replace(new RegExp('#', 'g'), ' ').split(' ');
        const created_at = new Date();
        // const user_metric = UserMetrics.find({ user_id: Meteor.userId() }).fetch()[0];

        var uploader = new Slingshot.Upload("myQuestionUploads");

        var fileAttached = ($("#question-file-upload-btn")[0].files.length) > 0;
        var s3URL = '-1';

        var currentMendelCode = sessionStorage.getItem("mendelcode");

        if (currentMendelCode === undefined) {
            alert("ERROR: NO MENDEL CODE FOUND.");
            return;
        }

        if (fileAttached) {
            uploader.send(document.getElementById('question-file-upload-btn').files[0], function(error,
                downloadUrl) {
                Materialize.toast('Your file is uploading...', 3000, 'toast');
                if (error) {
                    // Log service detailed response.
                    // console.error('Error uploading', uploader.xhr.response);
                    alert(error);
                } else {
                    //downloadUrl is ready
                    s3URL = downloadUrl;
                    console.log("upload done, download url is ready");
                    // create new question

                    //preparation to insert user-condition
                    ucondition = 0;
                    if (Meteor.user()) {
                        ucondition = Meteor.user().profile.condition;
                        //console.log("my condition is in (addq1) " + ucondition);
                    } else {
                        //console.log("meteor user not ready - my condition is in (addq1) " + ucondition);
                    }

                    Meteor.call('questions.insertQuestion', Meteor.user().username, Meteor.user()._id, currentMendelCode, dbLayer1, dbLayer2, created_at, ucondition, function(error, result) {
                        var qID = result
                        Meteor.call('questions.setHash', qID);

                        try {
                            console.log("intro_completed before is " + Meteor.user().profile.intro_completed);
                            console.log("updating intro_completed bit2");
                            //alert("whaa");
                            Meteor.users.update(Meteor.userId(), {
                                $set: {
                                    'profile.intro_completed': true
                                }
                            });
                            console.log("updated intro_completed bit");
                            console.log("guide_completed after is " + Meteor.user().profile.intro_completed);
                            //alert("just hanging in2");
                        } catch (e) {}

                        // grab tags for this question
                        var tags = [];
                        for (var i = 0; i < tagq.length; i++) {
                            var tagname = tagq[i].trim().toLowerCase();
                            while (tagname[0] === '#') {
                                tagname = tagname.substring(1);
                            }
                            if (!tagname) continue;

                            tags.push(tagname);
                        }

                        Meteor.call('tags.insertTags', tags, created_at, qID, function(error, result) {
                            Meteor.call('questions.setTags', qID, result);
                        });

                        Meteor.call('user.updateProfileQuestions', qID, created_at);

                        if (comment) {
                            var discussed = Meteor.user().profile.discussed;
                            Meteor.call('comments.insertCommment', comment, created_at, s3URL, userURL, function(error, result) {
                                var cID = result;
                                Meteor.call('comments.setHash', cID);
                                Meteor.call('questions.pushComment', qID, cID, comment, created_at, s3URL, userURL);
                                Meteor.call('questions.setMechanism', qID, cID, comment, created_at, s3URL, userURL);
                                //Meteor.call('questions.setMechanism', qID, cID, comment, created_at, s3URL, userURL);
                                discussed[CryptoJS.MD5(qID).toString()] = true;
                                Meteor.call('user.updateProfileDiscussed', discussed);

                                Materialize.toast('Your question is being added to the Gut Board!', 2500, 'toast');
                                setTimeout(function() {
                                    Meteor.call('user.updateHasAddedQuestion');
                                    Meteor.call('user.updateIntroCompleted');
                                    window.location.replace("/gutboard/" + currentMendelCode);
                                }, 2500);
                            });
                        }

                    });

                }
            });
        }
        // else case: no file attached to comments section
        else {
            // create new question
            ucondition = 0;
            if (Meteor.user()) {
                ucondition = Meteor.user().profile.condition;
                // temp
                if (Meteor.user().username == 'expert') ucondition = 0;
                //console.log("my condition is in (addq2) " + ucondition);
            } else {
                //console.log("meteor user not ready - my condition is in (addq2) " + ucondition);
            }

            Meteor.call('questions.insertQuestion', Meteor.user().username, Meteor.user()._id, currentMendelCode, dbLayer1, dbLayer2, created_at, ucondition, function(error, result) {
                var qID = result
                Meteor.call('questions.setHash', qID);
                var tags = [];
                for (var i = 0; i < tagq.length; i++) {
                    var tagname = tagq[i].trim().toLowerCase();
                    while (tagname[0] === '#') {
                        tagname = tagname.substring(1);
                    }
                    if (!tagname) continue;

                    tags.push(tagname);
                }

                Meteor.call('tags.insertTags', tags, created_at, qID, function(error, result) {
                    Meteor.call('questions.setTags', qID, result);
                });

                Meteor.call('user.updateProfileQuestions', qID, created_at);


                if (comment) {
                    var discussed = Meteor.user().profile.discussed;
                    //console.log("0")
                    Meteor.call('comments.insertCommment', comment, created_at, "-1", userURL, function(error, result) {
                        //console.log("0.5")
                        var cID = result;
                        Meteor.call('comments.setHash', cID);
                        //console.log("1")
                        Meteor.call('questions.pushComment', qID, cID, comment, created_at, s3URL, userURL);
                        //console.log("2")
                        Meteor.call('questions.setMechanism', qID, cID, comment, created_at, s3URL, userURL);
                        //console.log("3")
                        //Meteor.call('questions.setMechanism', qID, cID, comment, created_at, s3URL, userURL);
                        discussed[CryptoJS.MD5(qID).toString()] = true;
                        //console.log("4")
                        Meteor.call('user.updateProfileDiscussed', discussed);
                        //console.log("5");


                        Materialize.toast('Your question is being added to the Gut Board!', 2500, 'toast');
                        setTimeout(function() {
                            Meteor.call('user.updateHasAddedQuestion');
                            Meteor.call('user.updateIntroCompleted');
                            window.location.replace("/gutboard/" + currentMendelCode);
                        }, 2500);
                    });
                    //console.log("6")
                }


            });

            // var qID = Questions.insert({
            //     hash: '',
            //     owner: {
            //         username: Meteor.user().username,
            //         _id: Meteor.user()._id
            //     },
            //     mendel_id: currentMendelCode,
            //     layer_1: dbLayer1,
            //     layer_2: dbLayer2,
            //     tags: [],
            //     comments: [],
            //     created_at: created_at,
            //     editable: false,
            //     layer_2_user_response: [],
            //     qcondition: ucondition
            // });


            // assign hashcode         
            // Questions.update(qID, {
            //     $set: {
            //         hash: CryptoJS.MD5(qID).toString()
            //     }
            // });

            // grab tags for this question
            // var tags = [];
            // for (var i = 0; i < tagq.length; i++) {
            //     var tagname = tagq[i].trim().toLowerCase();
            //     while (tagname[0] === '#') {
            //         tagname = tagname.substring(1);
            //     }
            //     if (!tagname) continue;
            //     var tagID = Tags.find({
            //         name: tagname
            //     }).fetch()[0];

            //     // create new tag if does not exist
            //     if (!tagID) {
            //         tagID = Tags.insert({
            //             hash: '',
            //             name: tagname,
            //             created_at: created_at,
            //             video_url: '',
            //             science_texts: '',
            //             questions: [],
            //             tag_question: ''
            //         });
            //         Tags.update(tagID, {
            //             $set: {
            //                 hash: CryptoJS.MD5(tagID).toString()
            //             }
            //         });
            //     } else {
            //         tagID = tagID._id;
            //     }

            //     // add new question to this tag
            //     Tags.update(tagID, {
            //         $push: {
            //             questions: {
            //                 hash: CryptoJS.MD5(qID).toString()
            //             }
            //         }
            //     });
            //     tagID = tagID._str || tagID;
            //     tags.push({
            //         hash: CryptoJS.MD5(tagID).toString(),
            //         name: tagname
            //     });
            // }

            // // assign tags with this question.
            // Questions.update(qID, {
            //     $set: {
            //         tags: tags
            //     }
            // });

            // if (comment) {
            //     var discussed = Meteor.user().profile.discussed;
            //     var cID = Comments.insert({
            //         text: comment,
            //         owner: {
            //             username: Meteor.user().username,
            //             _id: Meteor.user()._id
            //         },
            //         created_at: created_at,
            //         // upvote_count: 0,
            //         // downvote_count: 0,
            //         attached_file: "-1",
            //         attached_url: userURL
            //     });
            //     Comments.update(cID, {
            //         $set: {
            //             hash: CryptoJS.MD5(cID).toString()
            //         }
            //     });
            //     Questions.update(qID, {
            //         $push: {
            //             comments: {
            //                 hash: CryptoJS.MD5(cID).toString(),
            //                 text: comment,
            //                 created_at: created_at,
            //                 owner: {
            //                     _id: Meteor.user()._id,
            //                     username: Meteor.user().username
            //                 },
            //                 attached_file: s3URL,
            //                 attached_url: userURL
            //             }
            //         }
            //     });

            //     //vineet

            //     discussed[CryptoJS.MD5(qID).toString()] = true;
            //     Meteor.users.update(Meteor.userId(), {
            //         $set: {
            //             'profile.discussed': discussed
            //         }
            //     });
            // }

            // Meteor.users.update(Meteor.userId(), {
            //     $push: {
            //         'profile.questions': {
            //             hash: CryptoJS.MD5(qID).toString()
            //         }
            //     }
            // });

        }

        // setTimeout(function() {
        //     try {
        //         //console.log("intro_completed before is " + Meteor.user().profile.intro_completed);
        //         //console.log("updating intro_completed bit2");
        //         Meteor.call('user.updateHasAddedQuestion');
        //         Meteor.call('user.updateIntroCompleted');
        //         //console.log("updated intro_completed bit is " + Meteor.user().profile.intro_completed);
        //         //console.log("guide_completed after is " + Meteor.user().profile.intro_completed);
        //         //alert("just hanging in2");
        //     } catch (e) {}
        //     $("#returnBoardBottom").click();
        // }, 2500);
        // //alert("here");
        // //window.href.location("/gutboard");

        // if (fileAttached) {
        //     setTimeout(function() {
        //         Materialize.toast('Your file is uploading...', 3000, 'toast');
        //         Meteor.call('user.updateHasAddedQuestion');
        //         Meteor.call('user.updateIntroCompleted');
        //         window.location.replace("/gutboard/" + currentMendelCode);
        //     }, 4000);
        // } else {
        //     Materialize.toast('Your question is being added to the Gut Board!', 4000, 'toast');
        //     setTimeout(function() {
        //         Meteor.call('user.updateHasAddedQuestion');
        //         Meteor.call('user.updateIntroCompleted');
        //         window.location.replace("/gutboard/" + currentMendelCode);
        //     }, 2500);
        // }
    },


    'click .option-add': function(event, instance) {
        console.log('add an option');
        let options = Template.instance().options.get();
        let lastOption = options[options.length - 1];
        let newOption = optionDict(lastOption.id + 1);

        // push new option to array
        Template.instance().options.push(newOption);
    },


    'click .option-delete': function(event) {
        let options = Template.instance().options.get();
        if (options.length <= 1)
            return;

        console.log(event.currentTarget.id);
        let optionId = event.currentTarget.id.split('-')[2];
        let index = findIndexOfOptionId(optionId);

        // create new options array with removed option
        console.log('removing' + index);

        options.splice(index, 1);
        console.log(options);

        // set reduced options array to reactive array
        Template.instance().options.set(options);
    },

    'change .option-input': function(event) {
        // called when some change happens in text input, and then user leaves the element
        //console.log('event change - ' + event.target.value);
        let options = Template.instance().options.get();
        let optionId = event.currentTarget.id.split('-')[2];
        let index = findIndexOfOptionId(optionId);
        options[index].text = event.target.value.trim();

        // set reduced options array to reactive array
        Template.instance().options.set(options);
    },
    'keypress .option-input': function(event) {
        let currentInput = event.target.value;
        if (currentInput.length > 20) {
            if (!sessionStorage.getItem('warning')) {
                sessionStorage.setItem('warning', 'display');
                Materialize.toast('Your option is too long. Long options are hardly read or selected by others. Please consider adding a new question maybe?',
                    4000, 'toast-alert',
                    function() {
                        sessionStorage.removeItem('warning');
                    });
            }

        }
    },
    'keypress .addOptionInput': function(event) {
        let currentInput = event.target.value;
        if (currentInput.length > 20) {
            if (!sessionStorage.getItem('warning')) {
                sessionStorage.setItem('warning', 'display');
                Materialize.toast('Your option is too long. Long options are hardly read or selected by others. Please consider adding a new question maybe?',
                    4000, 'toast-alert',
                    function() {
                        sessionStorage.removeItem('warning');
                    });
            }
        }
    },
    'keypress #primary_question': function(event) {
        let currentInput = event.target.value;
        if (currentInput.length > 50) {
            if (!sessionStorage.getItem('warning')) {
                sessionStorage.setItem('warning', 'display');
                Materialize.toast('Your question is longer than 50 characters! Could you make it shorter?',
                    4000, 'toast-alert',
                    function() {
                        sessionStorage.removeItem('warning');
                    });
            }
        }
    },
    'keypress #followup_question': function(event) {
        let currentInput = event.target.value;
        if (currentInput.length > 50) {
            if (!sessionStorage.getItem('warning')) {
                sessionStorage.setItem('warning', 'display');
                Materialize.toast('Your question is longer than 50 characters! Could you make it shorter?',
                    4000, 'toast-alert',
                    function() {
                        sessionStorage.removeItem('warning');
                    });
            }
        }
    },
    'click .options-mul': function(event) {
        console.log('yes no clciked');
        //completely replace the options dictionary with a Yes/No template
        Template.instance().options.set(mulOptionData());
    },

    'click .options-yesno': function(event) {
        console.log('yes no clciked');
        //completely replace the options dictionary with a Yes/No template
        Template.instance().options.set(yesNoOptionData());
    },

    'click .options-frequency': function(event) {
        Template.instance().options.set(frequencyOptionData());
    },

    'click .options-time-quantity': function(event) {
        Template.instance().options.set(timeQuantityOptionData());
    },

    'click .options-volume-quantity': function(event) {
        Template.instance().options.set(volumeQuantityOptionData());
    },

    'click .options-weight-quantity': function(event) {
        Template.instance().options.set(weightQuantityOptionData());
    },

    'click .options-brand': function(event) {
        Template.instance().options.set(brandOptionData());
    },
    'click #exampleQs': function() {
        Meteor.call("user.viewedExamples");
    },
    'click .fileUpload': function(event) {
        $("#question-file-upload-btn").trigger('click');
    }
});


function optionDict(id, text = '', yesno = false) {
    return {
        'id': id,
        'checked': false,
        'text': text,
        'yesno': yesno
    }
}

function mulOptionData() {
    $(".option-add").show();
    return [optionDict(1), optionDict(2), optionDict(3), optionDict(4)];
}

function yesNoOptionData() {
    $(".option-add").hide();
    return [optionDict(1, 'Yes', true), optionDict(2, 'No', true)];
}

function frequencyOptionData() {
    $(".option-add").show();
    return [optionDict(1, 'Daily'), optionDict(2, 'Weekly'), optionDict(3, 'Fortnightly'), optionDict(4, 'Monthly'),
        optionDict(5, 'Yearly')
    ];
}

function timeQuantityOptionData() {
    $(".option-add").show();
    return [optionDict(1, 'Never'), optionDict(2, '1 time'), optionDict(3, '2 times'), optionDict(4, '3 times'),
        optionDict(5, '4 times')
    ];
}

function volumeQuantityOptionData() {
    $(".option-add").show();
    return [optionDict(1, '0 oz'), optionDict(2, '1 oz'), optionDict(3, '2 oz'), optionDict(4, '3 oz'), optionDict(5,
        '4 oz')];
}

function weightQuantityOptionData() {
    $(".option-add").show();
    return [optionDict(1, '0 lb'), optionDict(2, '1 lb'), optionDict(3, '2 lb'), optionDict(4, '3 lb'), optionDict(5,
        '4 lb')];
}

function brandOptionData() {
    $(".option-add").show();
    return [optionDict(1, 'First Brand'), optionDict(2, 'Second Brand'), optionDict(3, 'Third Brand'), optionDict(4,
        'Fourth Brand'), optionDict(5, 'Fifth Brand')];
}

function findIndexOfOptionId(id) {
    let options = Template.instance().options.get();
    for (let i = 0; i < options.length; i++) {
        if (options[i].id == id) {
            return i;
        }
    }
    return -1;
}

function validatePrimaryQuestion() {
    const primary_question = $('#primary_question').val().trim();
    if (primary_question == '') {
        Materialize.toast('Please complete Step 1 by adding your top-level question', 3000, 'toast-alert');
        return null;
    }

    if (getOptionsText().length < 1) {
        Materialize.toast('Please complete Step 1 by adding at least one option to your top-level question', 3000, 'toast-alert');
        return null;
    }

    return primary_question
}

function getOptionsText() {
    let result = [];
    let options = Template.instance().options.get();
    for (let i = 0; i < options.length; i++) {
        if (options[i].text != '') {
            result.push(options[i].text);
        }
    }
    return result;
}
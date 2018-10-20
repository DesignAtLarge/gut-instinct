import './_.jade';

Template.post_survey.rendered = function() {
    let condition = Meteor.user().profile.condition;
    let inst = Template.instance();
    Meteor.call("survey.getResponse", function(err, answers) {

        /* Populate checked answers to elements */
        if (answers != null) {
            userRes = answers;
            let percent_complete = 0;
            for (var i = 0; i < userRes.length; i++) {
                answered = false;
                if (userRes[i].response_type == "items") {
                    for (var j = 0; j < userRes[i].items.length; j++) {
                        $("#" + userRes[i].question_index + "-" + userRes[i].items[j].index + "-option" + userRes[i].items[j].answer_index).prop("checked", true);
                        if (userRes[i].items[j]["answer_text"] != "") answered = true;
                    }
                }
                if (userRes[i].response_type == "single") {
                    $("#" + userRes[i].question_index + "-option" + userRes[i].answer_index).prop("checked", true);
                    if (userRes[i]["answer_text"] != "") answered = true;
                }
                if (userRes[i].response_type == "multiple") {
                    for (var j = 0; j < userRes[i].answer_index.length; j++) {
                        $("#" + userRes[i].question_index + "-option" + userRes[i].answer_index[j]).prop("checked", true);
                    }
                    if (userRes[i]["answer_text"] != "") answered = true;
                }
                if (userRes[i].response_type == "open") {
                    $("#" + userRes[i].question_index + "-open").text(userRes[i].answer_text);
                    if (userRes[i]["answer_text"] != "") answered = true;
                }

                let surveyQuestions = inst.surveyQuestions.get();
                if ("open_ended_text" in userRes[i] && $("#" + userRes[i].question_index + '-option' + surveyQuestions[userRes[i].question_index].open_ended_index).is(':checked')) {
                    $("#" + userRes[i].question_index + '-open').text(userRes[i].open_ended_text);
                    $("#" + userRes[i].question_index + '-open').show();
                }

                if (answered) percent_complete++;
                // Hide second page of questions
                if (userRes[i].question_index >= 7) {
                    $("#" + userRes[i].question_index).hide();
                }
            }

            // total = 25
            // if (condition == 1 || condition == 8)
            //     total -= 2
            // if (condition == 3 || condition == 10 || condition == 5)
            //     total -= 1

            // if (!Meteor.user().profile.intro_completed) total -= 2;

            // percent_complete = ((percent_complete/total) * 100).toFixed(0);
            // $(".percent").html("Survey " + percent_complete + "% Complete")
        }

        condition = Meteor.user().profile.condition;

        setTimeout(function() {
            if (!Meteor.user().profile.intro_completed) {
                $("#3").hide();
                $("#4").hide();
            }

            // Nothing
            if (condition == 1 || condition == 8) {
                $("#0").hide();
                $("#1").hide();
                $("#2-1").hide();
            }

            // No learn
            if (condition == 3 || condition == 5 || condition == 10) {
                $("#0").hide();
                $("#1-1").hide();
                $("#2-1").hide();
            }

            // No guide
            if (condition == 1 || condition == 2 || condition == 8 || condition == 9) {
                $("#1-0").hide();
            }

            /* hide page of questions */
            let questions = inst.surveyQuestions.get();
            if (questions) {
                for (var i = 0; i < questions.length; i++) {
                    if (questions[i].index >= 7) {
                        $("#" + questions[i].index).hide();
                    }
                }
            }


            // Move first question to second page with magic
            $("#0").hide();

            $(".info").show();
            $('.materialize-textarea').trigger('autoresize');
        }, 1000);
    });
};

Template.post_survey.onCreated(function() {
    var inst = this;
    this.surveyQuestions = new ReactiveVar(null);
    try {
        if (Meteor.user()) {
            Meteor.call("survey.getQuestions", function(err, result) {
                let questions = result;
                inst.surveyQuestions.set(questions);
            });
        }
    } catch (e) {}

    this.curr_response = new ReactiveVar(null);
    Meteor.call("survey.getResponse", function(err, answers) {
        inst.curr_response.set(answers);
    });
});

Template.post_survey.helpers({
    getSurveyQuestions: function() {
        let questions = Template.instance().surveyQuestions.get();
        return questions;
    },
    isTaken: function(test) {

    },
    isSingleResponse: function(question) {
        return question.response_type == 'single';
    },
    isItemResponse: function(question) {
        return question.response_type == 'items';
    },
    isMultipleResponse: function(question) {
        return question.response_type == 'multiple';
    },
    isOpenResponse: function(question) {
        return question.response_type == 'open';
    },
    getOptions: function(question) {
        return question.options;
    },
    getItems: function(question) {
        return question.items;
    },
    isIndex1: function(question) {
        return question.index == 1;
    },
    isIndex2: function(question) {
        return question.index == 2;
    },
    isTrain: function(item) {
        return item["condition"] == "train";
    },
    isLearn: function(item) {
        return ("condition" in item && item["condition"] == "learn");
    },
    getHours: function() {
        date1 = new Date("September 9, 2017 23:59:00");
        date2 = new Date()
        return (Math.abs(date1 - date2) / 36e5).toFixed(0);
    },
    hasPlaceholder: function(q) {
        return ("placeholder" in q);
    }
});

Template.post_survey.events({
    /* automatically save on input change */

    /* Question 3 input */
    'click #3-option6': function(event) {
        if ($("#3-option6").is(':checked')) {
            $("#3-open").show();
        } else {
            $("#3-open").hide();
        }

    },
    /* Question 18 input */
    'click #18-option7': function(event) {
        if ($("#18-option7").is(':checked')) {
            $("#18-open").show();
        } else {
            $("#18-open").hide();
        }

    },
    /* Question 19 input */
    'change #19': function(event) {
        if ($("#19-option5").is(':checked')) {
            $("#19-open").show();
        } else {
            $("#19-open").hide();
        }
    },
    /* Question 20 input */
    'change #20': function(event) {
        if ($("#20-option0").is(':checked')) {
            $("#20-open").show();
        } else {
            $("#20-open").hide();
        }
    },
    'change .with-gap': _.debounce(function(event) {
        $("#save").trigger("click");
    }, 1000),

    'click #save': function(event) {
        event.preventDefault();

        let questions = Template.instance().surveyQuestions.get();

        var userRes = [];

        /* Initialize response with current response or new */
        if (Template.instance().curr_response.get() != null) {
            userRes = Template.instance().curr_response.get();
        } else {
            for (var i = 0; i < questions.length; i++) {
                if (questions[i].response_type == "items") {
                    let res = {}
                    res.question_index = questions[i].index;
                    res.question = questions[i].question;
                    res.response_type = questions[i].response_type;
                    res.items = []
                    questions[i]["items"].forEach(function(item) {
                        let j = {};
                        j.index = item["item_index"];
                        j.item = item["item"];
                        j.answer_text = ""
                        j.answer_index = -1;
                        res.items[item["item_index"]] = j;
                    });
                    userRes[i] = res;
                } else {
                    if (questions[i].response_type == "open") {
                        userRes[i] = {
                            "question_index": questions[i].index,
                            "question": questions[i].question,
                            "response_type": questions[i].response_type,
                            "answer_text": ""
                        };
                    } else {
                        userRes[i] = {
                            "question_index": questions[i].index,
                            "question": questions[i].question,
                            "response_type": questions[i].response_type,
                            "answer_text": "",
                            "answer_index": -1
                        };
                    }
                }
            }
        }
        percent_complete = 0;
        for (var i = 0; i < questions.length; i++) {
            let answer_index = -1;
            let answer_text = "";

            if (questions[i].response_type == "items") {
                let user_index = -1;
                for (var j = 0; j < questions[i].items.length; j++) {
                    for (var k = 0; k < questions[i].items[j].options.length; k++) {
                        if ($("#" + questions[i].index + "-" + questions[i].items[j].item_index + "-option" + k).is(':checked')) {
                            user_index = k;
                            userRes[i].items[j].answer_index = user_index;
                            userRes[i].items[j].answer_text = questions[i].items[j].options[k].option_text
                        }
                    }
                }
                if (user_index != -1) {
                    percent_complete += 1;
                }
                continue;
            }

            if (questions[i].response_type == "single") {
                let user_index = -1;
                for (let j = 0; j < questions[i].options.length; j++) {
                    if ($("#" + questions[i].index + "-option" + j).is(':checked')) {
                        user_index = j;
                        answer_index = user_index;
                        answer_text = questions[i].options[j].option_text;
                    }
                }

                if (user_index != -1) {
                    percent_complete += 1;
                }

                /* open responses */
                if ("open_ended_index" in questions[i]) {
                    let other_text = $("#" + questions[i].index + "-open").val().trim();
                    userRes[i].open_ended_text = other_text;
                }
                // if (user_index == -1) {
                //     Materialize.toast("Please answer every question", 2000, "toast");
                //     return;
                // }
            }

            if (questions[i].response_type == "multiple") {
                let user_index = -1;
                answer_index = []
                answer_text = []
                for (let j = 0; j < questions[i].options.length; j++) {
                    if ($("#" + questions[i].index + "-option" + j).is(':checked')) {
                        user_index = j;
                        answer_index.push(j);
                        answer_text.push(questions[i].options[j].option_text);
                    }
                }

                if (user_index != -1) {
                    percent_complete += 1;
                }

                if ("open_ended_index" in questions[i]) {
                    let other_text = $("#" + questions[i].index + "-open").val().trim();
                    userRes[i].open_ended_text = other_text;
                }
            }

            /* open responses */
            if (questions[i].response_type == "open") {
                let open_response = $("#" + questions[i].index + "-open").val().trim();
                if (open_response != "") {
                    answer_text = open_response;
                    percent_complete += 1;
                }
            }

            // If unchanged
            if (userRes[i].answer_text == answer_text) continue;

            if (questions[i].response_type != "items") {
                let response = userRes[i];
                response.answer_text = answer_text;
                if (questions[i].response_type != "open")
                    response.answer_index = answer_index;
                userRes[i] = response;
            }
        }
        condition = Meteor.user().profile.condition;
        total = 25
        if (condition == 1 || condition == 8)
            total -= 2
        if (condition == 3 || condition == 10 || condition == 5)
            total -= 1

        if (!Meteor.user().profile.intro_completed) total -= 2;

        percent_complete = ((percent_complete / total) * 100).toFixed(0);
        if (percent_complete >= 100) {
            Meteor.call('user.completedSurvey');
        } else {
            Meteor.call('user.beganSurvey');
        }
        // $(".percent").html("Survey " + percent_complete + "% Complete")
        console.log("saved!")
        Template.instance().curr_response.set(userRes);
        Meteor.call('survey.setResponses', userRes);
    },
    'click #page_1_next': function(event) {
        event.preventDefault();
        let questions = Template.instance().surveyQuestions.get();
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].index >= 7 && questions[i].index < 14) {
                $("#" + questions[i].index).show();
            } else {
                $("#" + questions[i].index).hide();
            }
        }
        $(".percent").html("Gut Survey " + 35 + "% Complete")
        $(".page_title").html("Part 2. Learning about the gut")

        let condition = Meteor.user().profile.condition;
        if (condition != 1 && condition != 3 && condition != 5 && condition != 8 && condition != 10)
            $("#0").show();
        $("#page_1_next").hide();
        $("#page_2_next").show();
        window.scrollTo(0, 0);
    },
    'click #page_2_next': function(event) {
        event.preventDefault();
        $("#0").hide();
        let questions = Template.instance().surveyQuestions.get();
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].index >= 14) {
                $("#" + questions[i].index).show();
            } else {
                $("#" + questions[i].index).hide();
            }
        }
        $(".percent").html("Gut Survey 70% Complete (Final questions)")
        $(".page_title").html("Part 3. Demography and final response")
        $("#page_2_next").hide();
        $("#submit").show();
        window.scrollTo(0, 0);
    },
    'click #submit': function(event) {
        event.preventDefault();
        $("#save").trigger("click");
        $(".percent").html("Gut Survey " + 100 + "% Complete");
        Meteor.call('user.clickedFinishSurvey');
        setTimeout(function() {
            window.location.replace('/gutboard');
        }, 1500);
    }
});
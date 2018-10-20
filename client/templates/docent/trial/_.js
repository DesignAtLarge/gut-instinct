import './_.jade';

Template.trial.rendered = function() {
    let inst = this;
    Meteor.call("test.getResponses", inst.data.type, function(err, responses) {
        if (!responses || responses.length == 0) {
            try {
                if (Meteor.user()) {
                    if (inst.data.type == "pre") {
                        let taken = Meteor.user().profile.took_pretest;
                        if (!taken) {
                            alert("Before accessing your peers' questions and Gut Instinct\‘s expert-curated material, you should finish two quick tasks: (1) Answer some quick questions about the microbiome, and (2) Use our Docent guide to gain basic microbiome knowledge. These tasks will set you on your way to asking and answering questions on Gut Instinct like a pro!");
                        }
                    } else {
                        let taken = Meteor.user().profile.took_posttest;
                        if (!taken) {
                            alert("In the next few pages, you will help improve Gut Instinct team by demonstrating how much you've learnt, and by providing feedback on your experience of using Gut Instinct.")
                        }
                    }
                    return;
                }
            } catch (e) {}
        }
        if (responses && responses.length == 3) {
            $("#trialProgress").html("Gut Check 40% Complete");
            $(".quickbites").hide();
            $(".mechanisms").show();
            return;
        }
        if (responses && responses.length == 5) {
            $("#trialProgress").html("Gut Check 70% Complete (Final questions)");
            $(".quickbites").hide();
            $(".mechanisms").hide();
            $(".scenarios").show();
            return;
        }
        if (responses && responses.length == 7) {
            if (inst.data.type == "pre")
                Meteor.call('user.updatePretestStatus');
            else
                Meteor.call('user.updatePosttestStatus');
            return;
        }
    });
};

Template.trial.onCreated(function() {
    var inst = this;
    this.testQuestionsQuickBites = new ReactiveVar(null);
    this.testQuestionsMechanism = new ReactiveVar(null);
    this.testQuestionsScenarios = new ReactiveVar(null);
    Meteor.call("test.getQuestions", Template.instance().data.type, function(err, questions) {
        if (err) {
            alert("Server Connection Error");
        } else {
            let facts = [];
            let mechanisms = [];
            let scenarios = [];

            for (var i = 0; i < questions.length; i++) {
                if (questions[i].question_type == "fact") {
                    facts.push(questions[i])
                }
                if (questions[i].question_type == "mechanism") {
                    mechanisms.push(questions[i])
                }
                if (questions[i].question_type == "scenario") {
                    scenarios.push(questions[i])
                }
            }
            inst.testQuestionsQuickBites.set(facts);
            inst.testQuestionsMechanism.set(mechanisms);
            inst.testQuestionsScenarios.set(scenarios);
        }
    });
});

Template.trial.helpers({
    isTaken: function(test) {
        try {
            if (Meteor.user()) {
                if (test == "pre") {
                    let taken = Meteor.user().profile.took_pretest;
                    if (!taken) return false;
                    else return true;
                } else {
                    let taken = Meteor.user().profile.took_posttest;
                    if (!taken) return false;
                    else return true;
                }
            }
        } catch (e) {}
    },
    isPre: function(test) {
        return test == 'pre';
    },
    isOpenResponse: function(question) {
        return question.response_type == 'open';
    },
    getTestQuickBites: function() {
        return Template.instance().testQuestionsQuickBites.get();
    },
    getTestMechanisms: function() {
        return Template.instance().testQuestionsMechanism.get();
    },
    getTestScenarios: function() {
        return Template.instance().testQuestionsScenarios.get();
    },
    getOptions: function(question) {
        return question.options;
    },
    isCondition5: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                ////console.log("my condition is in" + condition);
                return condition == 5;
            }
        } catch (e) {
            return false;
        }
    },
    getHours: function() {
        date1 = new Date("September 9, 2017 23:59:00");
        date2 = new Date()
        return (Math.abs(date1 - date2) / 36e5).toFixed(0);
    }
});

Template.trial.events({
    'click #save-quickbites': function(event) {
        event.preventDefault();

        let questions = Template.instance().testQuestionsQuickBites.get();
        let userRes = [];

        /* Check if all has been answered */
        for (var i = 0; i < questions.length; i++) {
            /* Find user's choice */
            if (questions[i].response_type == "open") {
                let text = $("#quickbite-" + questions[i].index).val().trim();
                if (text == "") {
                    Materialize.toast("Please answer every question", 2000, "toast");
                    return;
                }
            } else if (questions[i].response_type == "multiple") {
                let user_index = -1;
                for (let j = 0; j < questions[i].options.length; j++) {
                    if ($("#qb" + questions[i].index + "-option" + j).is(':checked')) {
                        user_index = j;
                    }
                }
                if (user_index == -1) {
                    Materialize.toast("Please answer every question", 2000, "toast");
                    // return;
                }
            }
        }


        for (var i = 0; i < questions.length; i++) {
            if (questions[i].response_type == "open") {
                let text = $("#quickbite-" + questions[i].index).val().trim();
                let response = {};
                response.question_id = questions[i]._id;
                response.question_index = questions[i].index;
                response.question_type = questions[i].question_type;
                response.response_type = questions[i].response_type;
                response.question = questions[i].question;
                response.answer = text;
                userRes.push(response);
            } else if (questions[i].response_type == "multiple") {
                let correct_index = questions[i].correct_answer_index;

                /* Find user's choice */
                let user_index = -1;
                for (let j = 0; j < questions[i].options.length; j++) {
                    if ($("#qb" + questions[i].index + "-option" + j).is(':checked')) {
                        user_index = j;
                    }
                }

                if (user_index == -1) {
                    Materialize.toast("Please answer each question", 2000, "toast");
                    return;
                }

                $("#qb" + i + "-option" + correct_index + "-correct").show();

                if ($("#qb" + questions[i].index + "-fb-" + correct_index).text().length > 0)
                    $("#qb" + questions[i].index + "-feedback-" + correct_index).show();

                if (($("#qb" + questions[i].index + "-option" + correct_index).is(':checked'))) {
                    $("#qb" + questions[i].index + "-option" + user_index + "-correct").show()
                    $("#qb" + questions[i].index + "-option" + user_index + "-incorrect").hide()
                    if ($("#qb" + questions[i].index + "-fb-" + user_index).text().length > 0)
                        $("#qb" + questions[i].index + "-feedback-" + user_index).show();
                } else {
                    $("#qb" + questions[i].index + "-option" + user_index + "-correct").hide()
                    $("#qb" + questions[i].index + "-option" + user_index + "-incorrect").show()
                    if ($("#qb" + questions[i].index + "-fb-" + user_index).text().length > 0)
                        $("#qb" + questions[i].index + "-feedback-" + user_index).show();
                }

                for (let j = 0; j < questions[i].options.length; j++) {
                    $("#qb" + questions[i].index + "-option" + j).attr("disabled", "disabled");
                }

                let response = {};
                response.question_id = questions[i]._id;
                response.question_index = questions[i].index;
                response.question_type = questions[i].question_type;
                response.response_type = questions[i].response_type;
                response.question = questions[i].question;
                response.user_answer_index = user_index;
                response.real_answer_index = correct_index;
                response.check_correct = (user_index == correct_index);
                userRes.push(response);
            }
        }
        $("#next-quickbites").attr("disabled", false);
        Meteor.call('test.setResponses', Template.instance().data.type, userRes);
    },
    'click #next-quickbites': function() {
        $("#trialProgress").html("Gut Check 40% Complete");
        $(".quickbites").hide();
        $(".mechanisms").show();
    },
    'click #save-mechanisms': function(event) {
        event.preventDefault();

        let mcQuestions = Template.instance().testQuestionsMechanism.get();
        let userRes = [];

        /* Check if all has been answered */
        for (var i = 0; i < mcQuestions.length; i++) {
            /* Find user's choice */
            let user_index = -1;
            for (let j = 0; j < mcQuestions[i].options.length; j++) {
                if ($("#q" + mcQuestions[i].index + "-option" + j).is(':checked')) {
                    user_index = j;
                }
            }
            if (user_index == -1) {
                Materialize.toast("Please answer each question", 2000, "toast");
                return;
            }
        }

        for (var i = 0; i < mcQuestions.length; i++) {
            let correct_index = mcQuestions[i].correct_answer_index;

            /* Find user's choice */
            let user_index = -1;
            for (let j = 0; j < mcQuestions[i].options.length; j++) {
                if ($("#q" + mcQuestions[i].index + "-option" + j).is(':checked')) {
                    user_index = j;
                }
            }

            if (user_index == -1) {
                Materialize.toast("Please answer each question", 2000, "toast");
                return;
            }

            $("#q" + mcQuestions[i].index + "-option" + correct_index + "-correct").show()
            if ($("#q" + mcQuestions[i].index + "-fb-" + correct_index).text().length > 0)
                $("#q" + mcQuestions[i].index + "-feedback-" + correct_index).show();

            if (($("#q" + mcQuestions[i].index + "-option" + correct_index).is(':checked'))) {
                $("#q" + mcQuestions[i].index + "-option" + user_index + "-correct").show()
                $("#q" + mcQuestions[i].index + "-option" + user_index + "-incorrect").hide()
                if ($("#q" + mcQuestions[i].index + "-fb-" + user_index).text().length > 0)
                    $("#q" + mcQuestions[i].index + "-feedback-" + user_index).show();
            } else {
                $("#q" + mcQuestions[i].index + "-option" + user_index + "-correct").hide()
                $("#q" + mcQuestions[i].index + "-option" + user_index + "-incorrect").show()
                if ($("#q" + mcQuestions[i].index + "-fb-" + user_index).text().length > 0)
                    $("#q" + mcQuestions[i].index + "-feedback-" + user_index).show();
            }

            for (let j = 0; j < mcQuestions[i].options.length; j++) {
                $("#q" + mcQuestions[i].index + "-option" + j).attr("disabled", "disabled");
            }

            let response = {};

            response.question_id = mcQuestions[i]._id;
            response.question_index = mcQuestions[i].index;
            response.question_type = mcQuestions[i].question_type;
            response.response_type = mcQuestions[i].response_type;
            response.question = mcQuestions[i].question;
            response.user_answer_index = user_index;
            response.real_answer_index = correct_index;
            response.check_correct = (user_index == correct_index);
            userRes.push(response);
        }

        $("#next-mechanisms").attr("disabled", false);

        Meteor.call('test.setResponses', Template.instance().data.type, userRes);
    },
    'click #next-mechanisms': function() {
        $("#trialProgress").html("Gut Check 70% Complete (Final questions)");
        $(".mechanisms").hide();
        $(".scenarios").show();
    },
    'click #scenarios-finish': function(event) {
        event.preventDefault();

        let questions = Template.instance().testQuestionsScenarios.get();
        let userRes = [];
        for (var i = 0; i < questions.length; i++) {
            let text = $("#scenarios-" + questions[i].index).val().trim();

            if (text.length < 20) {
                Materialize.toast("Please enter a response longer than 20 characters", 2000, "toast");
                return;
            }

            let response = {};
            response.question_id = questions[i]._id;
            response.question_index = questions[i].index;
            response.question_type = questions[i].question_type;
            response.response_type = questions[i].response_type;
            response.question = questions[i].question;
            response.answer = text;
            userRes.push(response);
        }

        Meteor.call('test.setResponses', Template.instance().data.type, userRes);

        let condition = Meteor.user().condition;

        if (localStorage.getItem("docentProgress"))
            localStorage.removeItem("docentProgress");

        // if (condition == 1 || condition == 2)
        //      window.location.replace('/t/introduction');
        // else
        $("#trialProgress").html("Gut Check 100% Complete");

        Materialize.toast("Thank you for answering the questions!", 2000, "toast");

        let inst = Template.instance();

        setTimeout(function() {
            if (inst.data.type == "pre") {
                Meteor.call('user.updatePretestStatus');
                window.location.replace('/guide');
            } else {
                Meteor.call('user.updatePosttestStatus');
                window.location.replace('/survey');
            }
        }, 2000);
    }
});
import './_.jade';

import {
    Questions,
    Bookmarks,
    FlaggedQues
} from '../../../../imports/api/models.js';


import {
    mongoJsonify
} from '../../../../imports/api/parsing';

var myCounter = 0;
var boardQuestionCounter;

// $(document).keydown(function(e) {
//     if (e.key == "ArrowLeft") $("#backSliderControl").trigger("click");
//     if (e.key == "ArrowRight") $("#sliderControl").trigger("click");
// })

$(window).on('resize', function() {
    var win = $(this);
    if (win.width() < 850) {
        $('#backSliderControl2').hide(); //.removeClass('slider-left');
        $('#sliderControl2').hide() //.removeClass('slider-right');
    } else {
        //$('#backSliderControl').addClass('slider-left');
        //$('#sliderControl').addClass('slider-right');
    }
});

function checkHeightTimer() {
    var qmoduleHeight = parseInt($('.cardquestion').eq(myCounter).css("height"));
    if (qmoduleHeight > $(window).innerHeight() && $(window).width() > 850) {
        $('#backSliderControl2').show(); //.addClass('slider-left');
        $('#sliderControl2').show(); //.addClass('slider-right');
    } else {
        $('#backSliderControl2').hide(); //.removeClass('slider-left');
        $('#sliderControl2').hide(); //.removeClass('slider-right');
    }
    setTimeout(checkHeightTimer, 500); //at 500 miliseconds
}

//checkHeightTimer();

Template.gutboard_slider.rendered = function() {
    /* preload questions */

    $(document).ready(function() {
        $('.modal').modal();
    });


    function promiseWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    $('body').css({
        'background-color': '#EEEEEE'
    });
    $('#tags_entry').material_chip();

    try {
        if (Meteor.user()) {
            const toured = Meteor.user().profile.toured.gutboard_slider;
            //console.log("toured in gutboard_slider " + toured)
            if (!toured) {
                introJs().setOption('showProgress', true).onchange(function(target) {
                    Meteor.call('user.updateProfileTouredGutBoardSlider');
                }).start();
            }
        }
    } catch (e) {}

    $('ul.tabs').tabs();

    var inst = Template.instance();

    setTimeout(function() {

        var cardCounter = $('#activeQuestionDiv').find('.cardquestion').length;
        var clickCounter = 0; //inst.position.get();

        boardQuestionCounter = inst.num_questions.get();

        if (cardCounter > 0) {
            //console.log("number of card is " + cardCounter);

            var counter = 0;

            // init to hide all the question on the page
            for (counter = 0; counter < cardCounter; counter++) {
                if ($('.cardquestion').eq(counter).parent().attr('id') === 'activeQuestionDiv') {
                    $('.cardquestion').eq(counter).hide();
                }
            }
            $('.cardquestion').eq(clickCounter).show();
        }

        $('#activeQuestionLoader').hide();
        $('#activeQuestionDiv').show();
        $('#sliderControlDiv').show();
        $('ul.tabs').addClass('animated fadeInDown');
        $('#questionStatusTabs').show();
        $('ul.tabs').tabs();
        $('.cardquestion').eq(clickCounter).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
        $('.cardquestion').eq(clickCounter).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
        $('.cardquestion').eq(clickCounter).find(".oi.edit-tag").attr("data-step", 9);
        $('.cardquestion').eq(clickCounter).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
        $('.cardquestion').eq(clickCounter).find("#authorMechanism").attr("data-step", 10);
        $('.cardquestion').eq(clickCounter).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
    }, 2000);

};



Template.gutboard_slider.onCreated(function() {
    // const query = Router.current().params.query;
    this.qstatus = new ReactiveVar(sessionStorage.getItem('state'));
    this.position = new ReactiveVar()
    this.num_questions = new ReactiveVar()
    this.num_cards = new ReactiveVar()

    /* Fetch only from this range */
    if (!sessionStorage.mendelcode) sessionStorage.setItem('mendelcode', this.data.mendelcode);
    let position = parseInt(localStorage.getItem("position-" + sessionStorage.mendelcode));
    if (!position) position = 0;
    this.rangeBegin = new ReactiveVar(position);
    this.rangeEnd = new ReactiveVar(position + 2);
});

Template.gutboard_slider.helpers({
    init: function(mendelcodeIGNORE) {
        //console.log("RENDER GUTBOARD WITH MENDEL - " + mendelcodeIGNORE);
        let mendelcode = sessionStorage.mendelcode;
        //sessionStorage.setItem('mendelcode', mendelcode);
        if (!sessionStorage.mendelcode) sessionStorage.setItem('mendelcode', mendelcodeIGNORE);

        let position = parseInt(localStorage.getItem("position-" + sessionStorage.mendelcode));



        if (position) {
            Template.instance().position.set(position);
            myCounter = position;
        } else {
            Template.instance().position.set(0);
            myCounter = 0;
        }


        function capitalizeFirstLetter(string) {
            console.log("Enter Capitalized First Letter!");
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        setTimeout(function() {
            if (mendelcode == "AmericanGutProject" || mendelcode == "AmericanGutProjectEXP2") {
                $('#mendelCodeHeader').html(
                    "<i class='material-icons' style='margin-right: 10px; margin-left: 25px;'>view_week</i> <img src='/images/logos/agp.png' height='60' style='padding-top: 5px;'/>");
            } else
                $('#mendelCodeHeader').html(
                    '&nbsp;&nbsp;<i class="material-icons" style="margin-right: 10px; margin-left: 25px;">view_week</i>' +
                    "#" + capitalizeFirstLetter(mendelcode));
        }, 1000)

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

    questionswithoutCondition: function() {

        if (typeof targetUser === 'undefined') {
            return;
        }

        var targetUser = Meteor.user().username;
        localStorage.setItem("currentUserName", targetUser);

        return _.sortBy(Questions.find({}).fetch(), function(object) {
            return object.created_at.getTime();
        }).reverse();
        // return _.sortBy(mongoJsonify(localStorage.getItem('ALLQs')), function(object) {
        //     return object.created_at.getTime();
        // }).reverse();
    },
    questions: function() {
        // try {
        //     if (Meteor.user()) {
        //         //console.log(mongoJsonify(sessionStorage.getItem('MENDELQs')));
        //         var db_question = _.sortBy(mongoJsonify(sessionStorage.getItem('MENDELQs')), function(object) {
        //                     var d = new Date(object.created_at);
        //                     return d.getTime();
        //                 }).reverse();

        //                 // console.log("current db length " + db_question.length);
        //                 // console.log("current db question " + db_question);
        //         return db_question;
        //     }
        // } catch(e) {}

        try {
            if (Meteor.user()) {
                var currentMendel = sessionStorage.mendelcode;
                //console.log("GET QUESTION SESSION - " + currentMendel);
                ucondition = 0;
                if (Meteor.user()) {
                    ucondition = Meteor.user().profile.condition;
                    //console.log("my condition is in (questions) " + ucondition);
                } else {
                    console.log("meteor user not ready - my condition is in (questions) " + ucondition);
                }
                var db_question;

                if (ucondition == 0) {
                    db_question = _.sortBy(Questions.find({}).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6 || ucondition == 8 || ucondition == 9 || ucondition == 10 || ucondition == 11) {
                    db_question = _.sortBy(Questions.find({

                        $or: [{
                                $and: [{
                                    mendel_id: currentMendel
                                }, {
                                    qcondition: ucondition
                                }]
                            },
                            {
                                /* want to see questions from all boards for exp */
                                qcondition: ucondition
                            }
                        ]
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else {
                    db_question = _.sortBy(Questions.find({

                        $or: [{
                                //$or: [{
                                $and: [{
                                    mendel_id: currentMendel
                                }, {
                                    qcondition: ucondition
                                }]

                                //}, {
                                //    mendel_id: "expertMendel"
                                //},]
                            },
                            {
                                // $or: [{
                                //     qcondition: ucondition
                                // }, {
                                qcondition: 0
                                // }]
                            }
                        ]
                        // $and: [{
                        //     $or: [{
                        //         mendel_id: currentMendel
                        //     }, {
                        //         mendel_id: "expertMendel"
                        //     }]
                        // },
                        //     {
                        //         $or: [{
                        //             qcondition: ucondition
                        //         }, {
                        //             qcondition: 0
                        //         }]
                        //     }
                        // ]
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                }

                let inst = Template.instance();

                let arr = db_question.slice(inst.rangeBegin.get(), inst.rangeEnd.get());

                Template.instance().num_cards.set(arr.length);

                return arr;
            }
        } catch (e) {}

    },
    getNewQuestionCounts: function() {
        var fetchArr = Questions.find({}).fetch();
        return fetchArr.length;
    },
    getNewQuestionCountsbyCondition: function() {
        try {
            if (Meteor.user()) {
                //var fetchArr = Questions.find({}).fetch();
                //get user condition first
                ucondition = 0;
                if (Meteor.user()) {
                    ucondition = Meteor.user().profile.condition;
                    //console.log("my condition is in (getnewquestions) " + ucondition);
                } else {
                    console.log("meteor user not ready - my condition is in (getnewquestions) " + ucondition);
                }
                var currentMendel = sessionStorage.mendelcode;
                var db_question;

                if (ucondition == 0) {
                    db_question = _.sortBy(Questions.find({}).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6 || ucondition == 8 || ucondition == 9 || ucondition == 10 || ucondition == 11) {
                    db_question = _.sortBy(Questions.find({

                        $or: [{
                                $and: [{
                                    mendel_id: currentMendel
                                }, {
                                    qcondition: ucondition
                                }]
                            },
                            {
                                /* want to see questions from all boards for exp */
                                qcondition: ucondition
                            }
                        ]
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else {
                    db_question = _.sortBy(Questions.find({

                        $or: [{
                                //$or: [{
                                $and: [{
                                    mendel_id: currentMendel
                                }, {
                                    qcondition: ucondition
                                }]

                                //}, {
                                //    mendel_id: "expertMendel"
                                //},]
                            },
                            {
                                // $or: [{
                                //     qcondition: ucondition
                                // }, {
                                qcondition: 0
                                // }]
                            }
                        ]
                        // $and: [{
                        //     $or: [{
                        //         mendel_id: currentMendel
                        //     }, {
                        //         mendel_id: "expertMendel"
                        //     }]
                        // },
                        //     {
                        //         $or: [{
                        //             qcondition: ucondition
                        //         }, {
                        //             qcondition: 0
                        //         }]
                        //     }
                        // ]
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                }
                Template.instance().num_questions.set(db_question.length);
                return db_question.length;
            }
        } catch (e) {}
    },
    getBookmarkQuestionCounts: function() {
        try {
            if (Meteor.user()) {
                var fetchArr = Bookmarks.find({
                    owner: {
                        username: Meteor.user().username,
                        _id: Meteor.user()._id,
                    }
                }).fetch();
                return fetchArr.length;
            }
        } catch (e) {}
    },
    getWrittenQuestionCounts: function() {
        try {
            if (Meteor.user()) {
                var fetchArr = Questions.find({
                    owner: {
                        username: Meteor.user().username,
                        _id: Meteor.userId()
                    }
                }).fetch();

                var writtenQuestionCounter = 0;
                let currentMendelCode = sessionStorage.mendelcode;

                if (typeof currentMendelCode === 'undefined') {
                    currentMendelCode = 'general';
                }

                //console.log('current Mendel id is' + currentMendelCode);

                for (var index = 0; index < fetchArr.length; index++) {
                    if ('mendel_id' in fetchArr[index] && fetchArr[index].mendel_id == currentMendelCode) {
                        writtenQuestionCounter++;
                    }
                }

                return writtenQuestionCounter;
            }
        } catch (e) {}
    },
    getStarQuestionCounts: function() {
        var fetchArr = Questions.find({
            star_question: 1
        }).fetch();
        return fetchArr.length;
    },
    getFlaggedQuestionCounts: function() {
        var fetchArr = FlaggedQues.find({}).fetch();
        return fetchArr.length;
    },
    getStarQuestionCountsbyCondition: function() {
        //get user condition first
        ucondition = 0;
        try {
            if (Meteor.user()) {
                ucondition = Meteor.user().profile.condition;
                //console.log("my condition is in (getstarred)" + ucondition);
                var fetchArr;

                if (ucondition == 0) {
                    fetchArr = _.sortBy(Questions.find({
                        star_question: 1
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6 || ucondition == 8 || ucondition == 9 || ucondition == 10 || ucondition == 11) {
                    fetchArr = _.sortBy(Questions.find({
                        $and: [{
                                star_question: 1
                            },
                            {
                                qcondition: ucondition
                            }
                        ]
                    }).fetch(), function(object) {
                        return object.created_at.getTime();
                    }).reverse();
                } else {
                    fetchArr = Questions.find({
                        $and: [{
                                star_question: 1
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
                    }).fetch();
                }
                return fetchArr.length;
            }
        } catch (e) {}
        //qcondition: ucondition
    },
    isCondition3: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 3;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition3or4: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 3 || condition == 4;
            }
        } catch (e) {
            return false;
        }
    },
    isCondition2or4or9or11: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                //console.log("my condition is in" + condition);
                return condition == 2 || condition == 4 || condition == 9 || condition == 11;
            }
        } catch (e) {
            return false;
        }
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
    bookmardedquestions: function() {
        //this function will return all the bookmarks
        //add the user check on the bookmark
        try {
            if (Meteor.user()) {
                var rawbk = Bookmarks.find({
                    owner: {
                        username: Meteor.user().username,
                        _id: Meteor.user()._id,
                    }
                }).fetch();

                var renderQuestion = [];
                var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

                for (var i = 0; i < rawbk.length; i++) {
                    if (checkForHexRegExp.test(rawbk[i]["typeid"])) {
                        renderQuestion[i] = Questions.findOne({
                            _id: new Mongo.ObjectID(rawbk[i]["typeid"])
                        });
                    } else {
                        renderQuestion[i] = Questions.findOne({
                            _id: (rawbk[i]["typeid"])
                        });
                    }
                }

                var returnRes = _.sortBy(renderQuestion, function(object) {
                    return object.created_at.getTime();
                }).reverse();

                return returnRes;
            }
        } catch (e) {}
    },
    getStarQuestions: function() {
        return Questions.find({
            star_question: 1
        }).fetch();
    },
    getFlaggedQuestions: function() {
        return FlaggedQues.find({}).fetch();
    },

    getStarQuestionsbyCondition: function() {
        ucondition = 0;
        if (Meteor.user()) {
            ucondition = Meteor.user().profile.condition;
            //console.log("my condition is in (starred_questions) " + ucondition);
        } else {
            console.log("meteor user not ready - my condition is in (starred_questions) " + ucondition);
        }
        //qcondition: ucondition
        if (ucondition == 0) {
            return _.sortBy(Questions.find({
                star_question: 1
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        } else if (ucondition == 1 || ucondition == 2 || ucondition == 5 || ucondition == 6 || ucondition == 8 || ucondition == 9 || ucondition == 10 || ucondition == 11) {
            return _.sortBy(Questions.find({
                $and: [{
                        star_question: 1
                    },
                    {
                        qcondition: ucondition
                    }
                ]
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        } else {
            return _.sortBy(Questions.find({
                $and: [{
                        star_question: 1
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
            }).fetch(), function(object) {
                return object.created_at.getTime();
            }).reverse();
        }
    },
    getMineQuestions: function() {
        try {
            if (Meteor.user()) {
                let currentMendel = sessionStorage.mendelcode;
                return Questions.find(

                    {
                        $and: [{
                                owner: {
                                    username: Meteor.user().username,
                                    _id: Meteor.userId()
                                }
                            },
                            {
                                mendel_id: currentMendel
                            }
                        ]


                    }
                ).fetch();
            }
        } catch (e) {}
    },
    qaccept: function(hashcode) {
        const qstatus = Template.instance().qstatus.get() || '0';
        try {
            if (Meteor.user()) {
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
                    const answered = !profile.answered[question.hash] || profile.answered[question.hash]
                        .length < 3;
                    return answered && !profile.discussed[question.hash];
                }).length;
            } else if (state == 1) {
                return _.filter(questions, function(question) {
                    return !!profile.discussed[question.hash];
                }).length;
            } else if (state == 2) {
                return _.filter(questions, function(question) {
                    return profile.answered[question.hash] && profile.answered[question.hash].length >=
                        3;
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
    },
    getPosition: function() {
        if (Template.instance().num_questions.get() == 0) return 0;
        return Template.instance().position.get() + 1;
    },
    isGutBoardEmpty: function(num_questions) {
        return (num_questions == 0);
    },
    exampleQuestions: function() {
        return _.sortBy(Questions.find({
            qcondition: -10
        }).fetch(), function(object) {
            return object.ex;
        });
    },
    isCondition0or10or11: function() {
        try {
            if (Meteor.user()) {
                var condition = Meteor.user().profile.condition;
                return condition == 0 || condition == 10 || condition == 11;
            }
        } catch (e) {
            return false;
        }
    }
});

Template.gutboard_slider.events({

    'click #contribute': function(event, instance) {
        event.preventDefault();
        clickCounter = Template.instance().position.get();
        // remove the extra cards
        $('#bookmarkQuestionDiv').hide();
        $('#starQuestionDiv').hide();
        $('#mineQuestionDiv').hide();
        $('#activeQuestionDiv').show();
        $('#sliderControlDiv').show();
        // setTimeout(function() {

        //     var cardCounter = $('#activeQuestionDiv').find('.cardquestion').length;
        //     if (cardCounter > 0) {
        //         var counter = 0;
        //         // init to hide all the question on the page
        //         for (counter = 1; counter < cardCounter; counter++) {
        //             if ($('.cardquestion').eq(counter).parent().attr('id') === 'activeQuestionDiv') {
        //                 $('.cardquestion').eq(counter).hide();
        //             }
        //         }
        //     };

        //     // display the first card
        //     $('.cardquestion').eq(clickCounter).show();

        //     // create check marks for questions and append stats to the questions
        //     var allQuestionCard = $('.cardquestion');

        //     for (var i = 0; i < allQuestionCard.length; i++) {
        //         var currentHash = $(allQuestionCard[i]).attr('question-hash');

        //         var currentLayer1 = Questions.findOne({
        //             hash: currentHash
        //         }).layer_1;

        //         var currentResponseArr = currentLayer1.user_response;

        //         var currentQuestionID = currentHash;
        //         var currentUsername = Meteor.user().username;

        //         for (var k = 0; k < currentResponseArr.length; k++) {
        //             if (currentResponseArr[k].username == currentUsername) {
        //                 var targetUserResponse = currentResponseArr[k].response;

        //                 for (var j = 0; j < targetUserResponse.length; j++) {
        //                     var targetCheckBox = '#' + currentQuestionID + '-' + targetUserResponse[
        //                             j];
        //                     $(targetCheckBox).prop('checked', true);
        //                 }
        //             }
        //         }

        //         // calculate the stats for rendering
        //         var currentStats = currentLayer1.stats;
        //         var currentSum = 0;
        //         for (var j = 0; j < currentStats.length; j++) {
        //             if (isNaN(currentStats[j]) || (typeof currentStats[j] === 'undefined') ||
        //                 currentStats[j] === null) {
        //                 currentStats[j] = 0;
        //                 continue;
        //             }
        //             currentSum = currentSum + parseInt(currentStats[j]);
        //         }

        //         // appending the stats after the question option
        //         var appendid = '#' + currentHash + '-' + '0' + '-label';
        //         var targetPercentage = '%';

        //         for (var j = 0; j < currentStats.length; j++) {
        //             targetPercentage = Math.floor(((currentStats[j] / currentSum).toFixed(5)) * 100) +
        //                 '%';
        //             appendid = '#' + currentHash + '-' + j + '-label-stats';
        //             $(appendid).html('  ' + currentStats[j] + ' Answer(s) / ' + targetPercentage);
        //         }

        //         // render layer2 data
        //         var currentHash = $(allQuestionCard[i]).attr('question-hash');

        //         var l2CurrentResponseArr = Questions.findOne({
        //             hash: currentHash
        //         }).layer_2_user_response;

        //         if (typeof layer_2_user_response === 'undefined') {
        //             continue;
        //         }

        //         var currentQuestionID = currentHash;
        //         var currentUsername = Meteor.user().username;

        //         for (var k = 0; k < l2CurrentResponseArr.length; k++) {

        //             if (l2CurrentResponseArr[k].username == currentUsername) {
        //                 var targetUserResponse = currentResponseArr[k].response;

        //                 for (var j = 0; j < targetUserResponse.length; j++) {

        //                     var targetCheckBox = '#' + currentQuestionID + '-layer2-' +
        //                         currentResponseArr[k].layer_2_index + '-' + targetUserResponse[j];
        //                     console.log("CHECKING LAYER2 BOX:" + targetCheckBox);
        //                     $(targetCheckBox).prop('checked', true);
        //                 }
        //             }
        //         }
        //     }

        //     $('#activeQuestionLoader').hide();
        //     $('#activeQuestionDiv').show();
        //     $('#sliderControlDiv').show();

        // }, 200);
    },

    'click #discussed': function(event, instance) {
        $('#sliderControlDiv').hide();
        $('#starQuestionDiv').hide();
    },

    'click #mine': function(event, instance) {
        $('#activeQuestionDiv').hide();
        $('#mineQuestionDiv').show();
        $('#sliderControlDiv').hide();
        $('#starQuestionDiv').hide();
        $('#bookmarkQuestionDiv').hide();
    },

    'click #answered': function(event, instance) {
        $('#activeQuestionDiv').hide();
        $('#mineQuestionDiv').hide();
        $('#starQuestionDiv').hide();
        $('#sliderControlDiv').hide();
        $('#bookmarkQuestionDiv').show();
    },

    'click #star': function(event, instance) {
        $('#mineQuestionDiv').hide();
        $('#bookmarkQuestionDiv').hide();
        $('#activeQuestionDiv').hide();
        $('#sliderControlDiv').hide();
        $('#starQuestionDiv').show();
    },

    'click #sliderControl': function(event, instance) {
        if ($('#sliderControlDiv').css('display') == 'none') return;

        var clickCounter = Template.instance().position.get();

        if (Template.instance().num_questions.get() == 0) {
            Materialize.toast("Oops, no questions have been added to GutBoard yet. Why don't you add one?", 4000)
            return;
        }

        if (clickCounter + 1 >= boardQuestionCounter) {
            Materialize.toast("You have viewed all the current questions! Great work, add your own questions now.", 4000)
            //alert("You have viewed all the current questions! Great work! Add your own questions!");
        } else {
            $('#activeQuestionDiv').hide();
            $('#sliderControlDiv').hide();
            Template.instance().position.set(Template.instance().position.get() + 1);
            clickCounter = clickCounter + 1;
            localStorage.setItem("position-" + sessionStorage.mendelcode, clickCounter);


            // hide all cards before show next one


            // $('.cardquestion').eq(0).hide();
            // $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").removeAttr("data-intro");
            // $('.cardquestion').eq(0).find(".oi.edit-tag").removeAttr("data-intro");
            // $('.cardquestion').eq(0).find("#authorMechanism").removeAttr("data-intro");

            // if (clickCounter == boardQuestionCounter - 1) {
            //     $('.cardquestion').eq(1).show();
            //     $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
            //     $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
            //     $('.cardquestion').eq(1).find(".oi.edit-tag").attr("data-step", 9);
            //     $('.cardquestion').eq(1).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
            //     $('.cardquestion').eq(1).find("#authorMechanism").attr("data-step", 10);
            //     $('.cardquestion').eq(1).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
            //     $('#addQuestionDiv').hide();
            //     $('#sliderControl').show();
            // }

            Template.instance().rangeBegin.set(Template.instance().position.get());
            Template.instance().rangeEnd.set(Template.instance().position.get() + 2);

            setTimeout(function() {
                $('.cardquestion').eq(1).hide();
                $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").removeAttr("data-intro");
                $('.cardquestion').eq(1).find(".oi.edit-tag").removeAttr("data-intro");
                $('.cardquestion').eq(1).find("#authorMechanism").removeAttr("data-intro");

                $('.cardquestion').eq(0).show();
                $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
                $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
                $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-step", 9);
                $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
                $('.cardquestion').eq(0).find("#authorMechanism").attr("data-step", 10);
                $('.cardquestion').eq(0).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
                $('#activeQuestionDiv').show();
                $('#sliderControlDiv').show();
            }, 0);


            // $('.cardquestion').eq(0).show();
            // $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
            // $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
            // $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-step", 9);
            // $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
            // $('.cardquestion').eq(0).find("#authorMechanism").attr("data-step", 10);
            // $('.cardquestion').eq(0).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
            // $('#addQuestionDiv').hide();
            // $('#sliderControl').show();
        }
        myCounter = clickCounter;
    },
    'click #sliderControl2': function(event, instance) {
        $("#sliderControl").trigger("click");
    },
    'click #backSliderControl': function(event, instance) {
        if ($('#sliderControlDiv').css('display') == 'none') return;

        var clickCounter = Template.instance().position.get();
        if (Template.instance().num_questions.get() == 0) {
            Materialize.toast("Oops, no questions have been added to GutBoard yet. Why don't you add one?", 4000)
            return;
        }
        if (clickCounter - 1 < 0) {
            Materialize.toast("This is the first question. Please use right arrow to view more questions.", 4000)
            //alert("This is the first question. Please use left arrow to view more questions.");
        } else {
            $('#activeQuestionDiv').hide();
            $('#sliderControlDiv').hide();
            Template.instance().position.set(Template.instance().position.get() - 1);
            clickCounter = clickCounter - 1;
            localStorage.setItem("position-" + sessionStorage.mendelcode, clickCounter);


            // hide all cards before show next one
            // $('.cardquestion').eq(0).hide();
            // $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").removeAttr("data-intro");
            // $('.cardquestion').eq(0).find(".oi.edit-tag").removeAttr("data-intro");
            // $('.cardquestion').eq(0).find("#authorMechanism").removeAttr("data-intro");

            Template.instance().rangeBegin.set(Template.instance().position.get());
            Template.instance().rangeEnd.set(Template.instance().position.get() + 2);

            setTimeout(function() {
                $('.cardquestion').eq(1).hide();
                $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").removeAttr("data-intro");
                $('.cardquestion').eq(1).find(".oi.edit-tag").removeAttr("data-intro");
                $('.cardquestion').eq(1).find("#authorMechanism").removeAttr("data-intro");

                $('.cardquestion').eq(0).show();
                $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
                $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
                $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-step", 9);
                $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
                $('.cardquestion').eq(0).find("#authorMechanism").attr("data-step", 10);
                $('.cardquestion').eq(0).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
                $('#activeQuestionDiv').show();
                $('#sliderControlDiv').show();
            }, 0);



            // $('.cardquestion').eq(1).show();
            // $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
            // $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
            // $('.cardquestion').eq(1).find(".oi.edit-tag").attr("data-step", 9);
            // $('.cardquestion').eq(1).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
            // $('.cardquestion').eq(1).find("#authorMechanism").attr("data-step", 10);
            // $('.cardquestion').eq(1).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
            // $('#addQuestionDiv').hide();
            // $('#sliderControl').show();
        }
        myCounter = clickCounter;
    },
    'click #backSliderControl2': function(event, instance) {
        $("#backSliderControl").trigger("click");
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
        //alert("hanging in");
        //if(!doneTraining) {
        if (!guide_completed) {

            window.location.replace("/guide");

        } else {
            window.location.replace("/gutboard_slider_addq");

        }
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
        var currentOptionNumber = parseInt($(event.target).parent().find('.question-option').attr(
            'option-number'));

        if ($(event.target).parent().find('#primary_question').val() === '') {
            Materialize.toast("Please add your question before adding the options.", 4000)
            //alert("Please add your question before adding the options.");
            return;
        }

        if ($(event.target).parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() === '') {
            Materialize.toast("Please complete this option before adding more options.", 4000);
            //alert("Please complete this option before adding more options.");
            return;
        }

        $(event.target).parent().find('.question-option').attr('option-number', currentOptionNumber + 1);
        $(event.target).parent().find('.option-' + (currentOptionNumber + 1)).show();

    },
    'keypress .addOptionInput': function(event) {
        let currentInput = event.target.value;
        if (currentInput.length > 20) {
            if (!sessionStorage.getItem('warning')) {
                sessionStorage.setItem('warning', 'display');
                Materialize.toast('Your option is longer than 20 characters! Could you make it shorter?',
                    4000, '',
                    function() {
                        sessionStorage.removeItem('warning');
                    });
            }
        }
    },
    'click #addOptionFollowupBtn': function(event) {
        var currentOptionNumber = parseInt($(event.target).parent().find('.followup-option').attr(
            'option-number'));

        if ($(event.target).parent().find('#followup_question').val() === '') {
            Materialize.toast("Please add your question before adding the options.", 4000)
            //alert("Please add your question before adding the options.");
            return;
        }

        if ($(event.target).parent().find('.option-' + (currentOptionNumber)).find('.addOptionInput').val() === '') {
            Materialize.toast("Please complete this option before adding more options.", 4000)
            //alert("Please complete this option before adding more options.");
            return;
        }

        $(event.target).parent().find('.followup-option').attr('option-number', currentOptionNumber + 1);
        $(event.target).parent().find('.option-' + (currentOptionNumber + 1)).show();

    },
    'click #randomShow': function(event, template) {
        var clickCounter = Template.instance().position.get();

        if (Template.instance().num_questions.get() == 0) {
            Materialize.toast("Oops, no questions have been added to GutBoard yet. Why don't you add one?", 4000)
            return;
        }

        $('#activeQuestionDiv').hide();
        $('#sliderControlDiv').hide();

        Materialize.toast("Showing a random question", 4000)

        /* Get only mendel questions */
        var currentMendel = sessionStorage.mendelcode;
        ucondition = 0;
        if (Meteor.user()) {
            ucondition = Meteor.user().profile.condition;
            //console.log("my condition is in (questions) " + ucondition);
        } else {
            console.log("meteor user not ready - my condition is in (questions) " + ucondition);
        }

        let qlength = Template.instance().num_questions.get();

        var randomIndex = Math.floor(Math.random() * (qlength - 1));

        /* Ensure new random */
        while (randomIndex == clickCounter && qlength != 1) {
            randomIndex = Math.floor(Math.random() * (qlength - 1));
        }

        Template.instance().position.set(randomIndex);
        Template.instance().rangeBegin.set(randomIndex);
        Template.instance().rangeEnd.set(randomIndex + 2);

        setTimeout(function() {
            $('.cardquestion').eq(1).hide();
            $('.cardquestion').eq(1).find(".oi.edit-question.edit-question-btn").removeAttr("data-intro");
            $('.cardquestion').eq(1).find(".oi.edit-tag").removeAttr("data-intro");
            $('.cardquestion').eq(1).find("#authorMechanism").removeAttr("data-intro");

            $('.cardquestion').eq(0).show();
            $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-step", 8);
            $('.cardquestion').eq(0).find(".oi.edit-question.edit-question-btn").attr("data-intro", "Need to rewrite a question? Do so here to improve and evolve the current question!");
            $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-step", 9);
            $('.cardquestion').eq(0).find(".oi.edit-tag").attr("data-intro", "Add relevant tags to the current question or remove irrelevant ones.");
            $('.cardquestion').eq(0).find("#authorMechanism").attr("data-step", 10);
            $('.cardquestion').eq(0).find("#authorMechanism").attr("data-intro", "You can also provide an explanation behind your own question to help others understand the reasoning behind your inquiry. Scientific feedback may also be provided by researchers!");
            $('#activeQuestionDiv').show();
            $('#sliderControlDiv').show();
        }, 0);

        myCounter = randomIndex;
        localStorage.setItem("position-" + sessionStorage.mendelcode, randomIndex);
    },
    'click #exampleQs': function() {
        Meteor.call("user.viewedExamples");
    }
});
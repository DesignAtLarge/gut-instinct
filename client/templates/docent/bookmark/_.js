import './_.jade';

import {
    Questions,
    Bookmarks,
    Articles,
    Tags,
    Comments,
    UserMetrics
} from '../../../../imports/api/models.js';

Template.bookmark.rendered = function() {
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
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];
        user_metric.visit_counter.gutboard++;
        // UserMetrics.update({ _id: user_metric._id }, {
        //     $set: {
        //         visit_counter: user_metric.visit_counter
        //     }
        // });
    } catch (e) {}

    $('.indicator').hide();
    if (sessionStorage.getItem('state') < 4) {
        $('.indicator').show();
        $('#' + tabmap[sessionStorage.getItem('state')]).addClass('active');
    }
    $('ul.tabs').tabs();
    // $('.modal-trigger').leanModal();

    if (sessionStorage.getItem('from_test') === 'true') {
        sessionStorage.setItem('from_test', false);
        window.location.reload();
    }
    if (sessionStorage.getItem('moved')) {
        $('#q-moved').openModal({
            complete: function() {}
        });
        $('#q-moved').show();
    } else {
        $('#alert').closeModal();
        $('#alert').hide();
    }
    sessionStorage.setItem('moved', '');
    try {
        const toured = Meteor.user().profile.toured.bookmark;
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.bookmark': true
                    }
                });
                // sessionStorage.setItem('novice', false);
            }).start();
        }
    } catch (e) {}

}

Template.bookmark.onCreated(function() {
    // const query = Router.current().params.query;
    this.qstatus = new ReactiveVar(sessionStorage.getItem('state'));
});

Template.bookmark.helpers({
    init: function() {},
    articles: function() {
        Template.instance().articles = _.shuffle(Articles.find({}).fetch());
        return Template.instance().articles;
    },

    articlesBK: function() {

    },
    isFirst: function() {
        var self = this;
        return _.isEqual(self, Template.instance().articles[0]);
    },
    topics: function() {
        return _.shuffle(Tags.find({}).fetch());
    },
    visited: function(name) {
        try {
            const _id = Tags.find({
                name: name
            }).fetch()[0]._id;
            return Meteor.user().profile.topics_investigated[_id];
        } catch (e) {
            return false;
        }
    },
    firstOf: function(array) {
        array = array[0] ? array : array.fetch();
        // console.log(_.isEqual(this, _.first(array)));
        return _.isEqual(this, _.first(array));
    },
    questions: function() {
        return _.sortBy(Questions.find({}).fetch(), function(object) {
            return object.created_at.getTime();
        }).reverse();
    },
    fetchbk: function() {
        //this function will return all the bookmarks
        //add the user check on the bookmark
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

        return _.sortBy(renderQuestion, function(object) {
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
    checkisq: function(typeString) {
        if (typeString == "q") {
            return true;
        }
        return false;
    },
    checkist: function(typeString) {
        if (typeString == "t") {
            return true;
        }
        return false;
    },
    checkisa: function(typeString) {
        if (typeString == "a") {
            return true;
        }
        return false;
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
    }
});

Template.bookmark.events({
    'click .tab-link': function(event, instance) {
        const tab = $(event.target).attr('id');
        const tabmap = {
            'questions': '0',
            'topics': '1',
            'articles': '2',
            'mynotes': '3',
            'all-content': '4'
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
    'click .show-question': function() {
        $('.questions-bk').show();
        $('.topics-bk').hide();
        $('.articles-bk').hide();
        $('.notes-bk').hide();
    },
    'click .show-topics': function() {
        $('.questions-bk').hide();
        $('.topics-bk').show();
        $('.articles-bk').hide();
        $('.notes-bk').hide();
    },
    'click .show-articles': function() {
        $('.questions-bk').hide();
        $('.topics-bk').hide();
        $('.articles-bk').show();
        $('.notes-bk').hide();
    },
    'click .show-notes': function() {
        $('.questions-bk').hide();
        $('.topics-bk').hide();
        $('.articles-bk').hide();
        $('.notes-bk').show();
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
    'submit form': function(event) {
        event.preventDefault();

        // const text = event.target.newq.value.trim();
        const primary_question = event.target.primary_question.value.trim();
        const followup_question = event.target.followup_question.value.trim();
        // const editable = event.target.editable.checked;
        const comment = event.target.start_discussion.value.trim().replace("\n", "<br>");
        const tagq = event.target.tags_entry.value.replace(new RegExp('#', 'g'), ' ').split(' ');
        const created_at = new Date();
        const user_metric = UserMetrics.find({
            user_id: Meteor.userId()
        }).fetch()[0];

        ucondition = 0;
        if (Meteor.user()) {
            ucondition = Meteor.user().profile.condition;
            console.log("my condition is in (bookmark) " + ucondition);
        } else {
            console.log("meteor user not ready - my condition is in (bookmark) " + ucondition);
        }

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
            editable: false,
            qcondition: ucondition
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
                downvote_count: 0
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
                        }
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

        event.target.primary_question.value = '';
        event.target.followup_question.value = '';
        event.target.start_discussion.value = '';
        event.target.tags_entry.value = '';

        $('#confirm-add').openModal();
        $('#confirm-add').show();

        // event.target.newq.value = '';
        // event.target.editable.checked = false;
        // event.target.tagq.value = '';
        // event.target.newc.value = '';
        return false;
    },
});
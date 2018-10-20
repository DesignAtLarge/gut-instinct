import './_.jade';

import {
    Questions,
    Bookmarks,
    Tags,
    Comments,
    UserMetrics
} from '../../../../imports/api/models.js';

Template.gutboard.rendered = function() {
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
        UserMetrics.update({
            _id: user_metric._id
        }, {
            $set: {
                visit_counter: user_metric.visit_counter
            }
        });
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
        const toured = Meteor.user().profile.toured.gutboard;
        console.log("toured in gutboard" + toured)
        if (!toured) {
            introJs().setOption('showProgress', true).onchange(function(target) {
                Meteor.users.update(Meteor.userId(), {
                    $set: {
                        'profile.toured.gutboard': true
                    }
                });
                // sessionStorage.setItem('novice', false);
            }).start();
        }
    } catch (e) {}

    // test notify js
    /*$.notify({
        // options
        //icon: 'glyphicon glyphicon-thumbs-up',
        //title: 'Welcome to the GutBoard!',
        //message: 'Tip: Need help? Click on Feeling Confused?'
    },{
        // settings
        type: 'info',
        allow_dismiss: true,
        showProgressbar: false,
        onShow: null,
        onShown: null,
        onClose: null,
        onClosed: null,
        icon_type: 'class',
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
        '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
        '<span data-notify="icon"></span> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });*/
}

Template.gutboard.onCreated(function() {
    // const query = Router.current().params.query;
    this.qstatus = new ReactiveVar(sessionStorage.getItem('state'));
});

Template.gutboard.helpers({
    init: function() {},
    questions: function() {
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

Template.gutboard.events({
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
            UserMetrics.update({
                _id: user_metric._id
            }, {
                $set: {
                    number_of_comments: user_metric.number_of_comments + 1
                }
            });
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

        UserMetrics.update({
            _id: user_metric._id
        }, {
            $set: {
                number_of_questions: user_metric.number_of_questions + 1
            }
        });

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
import './_.jade';

import {
    UserEmail
} from '../../../../../imports/api/models.js';
import {
    ExperimentStatus
} from '../../../../../imports/api/ga-models/constants.js';


Template.gaExperimentBoardItem.onCreated(function() {
    let inst = Template.instance();

    this.exp = new ReactiveVar(inst.data.exp);
    this.userflag = new ReactiveVar();
    this.reviewerFlags = new ReactiveArray();
    this.participantsInfo = new ReactiveArray();
    this.isPilot = new ReactiveVar(false);
    this.isFeedbacking = new ReactiveVar(false);
    this.isParticipant = new ReactiveVar(false);
    this.isFailedCriteria = new ReactiveVar(false);
    this.isWaitlist = new ReactiveVar(false);
    this.isAbuse = new ReactiveVar(false);
    this.stats = new ReactiveDict(undefined);
    this.stats.set('reviewerCount', 0);
    this.stats.set('pilotCount', 0);
    this.stats.set('participantCount', 0);
    this.selectedRole = new ReactiveVar('');

    let username = inst.data.exp.username;
    let reviewers = inst.data.exp.feedback_users;
    let exp_id = inst.data.exp._id;
    if (username) {
        Meteor.call("galileo.profile.getCtryFlag", username, "", function(err, result) {
            inst.userflag.set(result);
        })
    }

    if (reviewers) {
        Meteor.call("galileo.profile.getCtryFlagByArray", reviewers, function(err, result) {
            inst.reviewerFlags.set(result);
        })
    }

    if (exp_id) {
        Meteor.call("galileo.experiments.getExperimentWithParticipantData", exp_id, function(err, result) {
            inst.participantsInfo.set(result.participantInfoResults);
        })
    }
    Tracker.autorun(function() {
        let expId = inst.exp.get()._id;
        if (!expId) {
            return;
        }

        //TODO can pilots and participants be stored just like feedback_users?
        inst.stats.set('reviewerCount', inst.exp.get().feedback_users.length);

        //if have old experiments without pilot_users or participant count, won't do anything
        //in case of using old experiments
        if (inst.exp.get().pilot_users) {
            inst.stats.set('pilotCount', inst.exp.get().pilot_users.length);
        }

        if (inst.exp.get().run_users) {
            inst.stats.set('participantCount', inst.exp.get().run_users.length);
        }

        // Meteor.call("galileo.experiments.getExperimentStats", expId, function (err, result) {
        //     inst.stats.set('reviewerCount', result.reviewerCount);
        //     inst.stats.set('pilotCount', result.pilotCount);
        //     inst.stats.set('participantCount', result.participantCount);
        // });

        Meteor.call("galileo.experiments.getCurrentUserRole", expId, function(err, result) {
            if (!err && result) {
                inst.isFeedbacking.set(result.isReviewer);
                inst.isPilot.set(result.isPilotUser);
                inst.isParticipant.set(result.isParticipant);
                inst.isFailedCriteria.set(result.isFailedCriteria);
                inst.isWaitlist.set(result.isWaitlist);
            } else {
                console.error(err);
            }
        });

        // Meteor.call("galileo.pilot.isPilot", expId, function (err, is) {
        //     inst.isPilot.set(is);
        // });
        // Meteor.call("galileo.feedback.isFeedbacking", expId, '/browse item ', function (err, is) {
        //     inst.isFeedbacking.set(is);
        // });
        // Meteor.call("galileo.run.isParticipant", expId, function (err, is) {
        //     inst.isParticipant.set(is);
        // });
    });
});

Template.gaExperimentBoardItem.helpers({
    related_works: function() {
        let exp = Template.instance().exp.get();

        if (exp && exp.design && exp.design.related_works) {
            return exp.design.related_works;
        }
    },
    isAdmin: function() {
        return Meteor.user().profile.is_admin;
    },
    isEnded: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.status == ExperimentStatus.FINISHED;
        }
    },
    isRunning: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.status == ExperimentStatus.STARTED;
        }
    },
    show: function() {

        // TODO
        return true;
    },
    index: function() {
        return Template.instance().data.index;
    },
    showPilot: function() {
        return Template.instance().data && Template.instance().data.showPilot;
    },
    expId: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return Template.instance().exp.get()._id;
        }
    },
    hypothesis: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause + " " + exp.design.relation + " " + exp.design.effect;
        }
    },
    experimentObjective: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        }
    },
    username: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.username;
        }
    },
    userflag: function() {
        let flag = Template.instance().userflag.get();
        if (flag) {
            return flag;
        }
    },
    createDate: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp["create_date_time"];
        }
    },
    isNew: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            let date = exp["create_date_time"];
            let diff = (new Date()).getTime() - date.getTime();
            if (diff / 1000 / 60 / 60 / 24 <= 3) {
                return true;
            }
        }
    },
    encodeUrl: function(exp) {
        return encodeURIComponent("http://gutinstinct.ucsd.edu/galileo/experiment/" + exp._id);
    },
    isCreator: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.user_id === Meteor.userId();
        }
    },
    isPilot: function() {
        return Template.instance().isPilot.get();
    },
    isFeedbacking: function() {
        return Template.instance().isFeedbacking.get();
    },
    isParticipant: function() {
        return Template.instance().isParticipant.get();
    },
    isLookingForReviewers: function() {
        return Template.instance().exp.get() &&
            Template.instance().exp.get().status >= ExperimentStatus.OPEN_FOR_REVIEW &&
            Template.instance().exp.get().status < ExperimentStatus.REVIEWED;
    },
    isLookingForParticipants: function() {
        return Template.instance().exp.get() &&
            ((Template.instance().exp.get().status >= ExperimentStatus.READY_TO_RUN &&
                    Template.instance().exp.get().status <= ExperimentStatus.PREPARING_TO_START) ||
                (Template.instance().exp.get().status == ExperimentStatus.REVIEWED));
    },
    isFailedCriteria: function() {
        return Template.instance().isFailedCriteria.get();
    },
    isWaitlist: function() {
        return Template.instance().isWaitlist.get();
    },
    isAbuse: function() {
        return Template.instance().isAbuse.get();
    },
    isFlagged: function() {
        let exp = Template.instance().exp.get();
        // console.log(exp.flag_status);
        //return exp.flag_status;
        //above added by vineet -- no need to do the checks below..
        if (exp) {
            if (Template.instance().data.flag) {
                return exp.flag_status;
            } else {
                return true;
            }
        } else {
            return false;
        }
    },
    renderAbuseDetails: function() {
        let exp = Template.instance().exp.get();
        console.log("vineet " + exp.flag_reason);
        return exp.flag_reason;
    },
    getReviewerCount: function() {
        return Template.instance().stats.get('reviewerCount');
    },
    getReviewerFlags: function() {
        let flags = Template.instance().reviewerFlags.get();
        if (flags) {
            return flags;
        }
    },
    getPilotCount: function() {
        return Template.instance().stats.get('pilotCount');
    },
    getParticipantCount: function() {
        return Template.instance().stats.get('participantCount');
    },
    getParticipantFlags: function() {
        let partInfo = Template.instance().participantsInfo.get();
        if (partInfo) {
            return partInfo;
        }
    },
    isSpecificExp: function() {
        return (Template.instance().data.exp._id === "6ZzYBqgPADJGqJvgW");
    }
});

Template.gaExperimentBoardItem.events({
    "click .report-abuse-action": function() {
        if (!Meteor.user()) {
            $('#sign-in-modal').modal('open');
            return;
        }
        let inst = Template.instance();
        let expId = Template.instance().exp.get()._id;
        let reportReason = $("#" + expId + "-report-reason").val();
        Meteor.call("galileo.experiments.reportAbuse", expId, reportReason, function(err, can) {
            if (!err && can) {
                inst.isAbuse.set(true);
                Materialize.toast("Successfully reported an issue. Thank you for looking out for the Gut Instinct Community!", 3000, "toast rounded");
            } else {
                Materialize.toast("Sorry, you cannot report this experiment.", 3000, "toast rounded");
            }
            // document.location.reload(true);
        });
    },
    "click .unreport-abuse": function() {

        let inst = Template.instance();
        if (!Meteor.user()) {
            $('#sign-in-modal').modal('open');
            return;
        }

        let exp = Template.instance().exp.get();

        if (Meteor.user().profile.permission_group !== 1 && Meteor.user().username !== exp.flag_user) {
            Materialize.toast("Sorry, you cannot clear the issue with this experiment. A member of the Galileo research team will review it first.", 3000, "toast rounded");
            return;
        }

        let expId = Template.instance().exp.get()._id;
        Meteor.call("galileo.experiments.unreportAbuse", expId, function(err, can) {
            if (!err && can) {
                inst.isAbuse.set(false);
                Materialize.toast("Successfully cleared the issue", 3000, "toast rounded");
            } else {
                Materialize.toast("Sorry, you cannot clear this issue. A member of the Galileo research team will review it first.", 3000, "toast rounded");
            }
            // document.location.reload(true);
        });
    },
    "click .copy-exp-btn": function(event, instance) {
        let expId = $(event.target).attr("id").split('-')[2];
        let modal = $("#copy-exp-modal");
        modal.data('expId', expId);
        modal.modal({
            dismissible: true,
            ready: function() {
                modal.trigger('show');
            },
            complete: function() {

            },
        });
        modal.modal('open');
    },
});

import './_.jade';
import {
    ExperimentStatus,
    ErrorMessage,
    ParticipationStatus
} from "../../../../../imports/api/ga-models/constants";

let roles = {
    REVIEWER: 'Reviewer',
    PILOT: 'Pilot User',
    PARTICIPANT: 'Participant'
};

Template.gaExploreModal.onCreated(function() {
    this.selectedRole = new ReactiveVar('');
});

Template.gaExploreModal.helpers({
    experimentObjective: function() {
        let data = Template.instance().data;
        if (data && data.exp) {
            return "Does " + data.exp.design.cause + " affect " + data.exp.design.effect + "?";
        }
    },
    selectedRole: function() {
        return Template.instance().selectedRole.get();
    },
    showPilot: function() {
        return (Template.instance().data && Template.instance().data.showPilot);
    },
    showNotOpenForPilot: function() {
        let selectedRole = Template.instance().selectedRole.get();
        return (selectedRole === roles.PILOT && !isOpenForPilot());
    },
    showNotOpenForWaitlist: function() {
        let selectedRole = Template.instance().selectedRole.get();
        return (selectedRole === roles.PARTICIPANT && isOpenForWaitlist());
    },
    isRunning: function() {
        let data = Template.instance().data;

        if (data && data.exp) {
            return (data.exp.status === ExperimentStatus.STARTED)
        }
    },
    isEnded: function() {
        let data = Template.instance().data;

        if (data && data.exp) {
            return (data.exp.status === ExperimentStatus.FINISHED)
        }
    },
    inclusion: function() {
        if (Template.instance().data.exp) {
            return Template.instance().data.exp.design.criteria.inclusion.map((str, i) => {
                return {
                    index: i,
                    content: str
                };
            });
        }
    },
    exclusion: function() {
        if (Template.instance().data.exp) {
            return Template.instance().data.exp.design.criteria.exclusion.map((str, i) => {
                return {
                    index: i,
                    content: str
                };
            });
        }
    },
});

Template.gaExploreModal.events({
    'click #reviewerBtn': function(event, instance) {
        $("#reviewerBtn").attr('class', 'btn light-blue');
        $("#pilotBtn").attr('class', 'btn light-blue darken-4');
        $("#participantBtn").attr('class', 'btn light-blue darken-4');

        $('#proceedDiv').removeClass('hide');

        $('#reviewerContent').removeClass('hide');
        $('#pilotParticipantContent').addClass('hide');
        $('#participantContent').addClass('hide');

        instance.selectedRole.set(roles.REVIEWER);
    },

    'click #pilotBtn': function(event, instance) {
        $("#reviewerBtn").attr('class', 'btn light-blue darken-4');
        $("#pilotBtn").attr('class', 'btn light-blue');
        $("#participantBtn").attr('class', 'btn light-blue darken-4');

        $('#proceedDiv').removeClass('hide');

        $('#pilotParticipantContent').removeClass('hide');
        $('#reviewerContent').addClass('hide');
        $('#participantContent').addClass('hide');

        instance.selectedRole.set(roles.PILOT);
    },

    'click #participantBtn': function(event, instance) {
        $("#reviewerBtn").attr('class', 'btn light-blue darken-4');
        $("#pilotBtn").attr('class', 'btn light-blue darken-4');
        $("#participantBtn").attr('class', 'btn light-blue');

        $('#proceedDiv').removeClass('hide');

        $('#participantContent').removeClass('hide');
        $('#pilotParticipantContent').addClass('hide');
        $('#reviewerContent').addClass('hide');

        instance.selectedRole.set(roles.PARTICIPANT);
    },

    'click #proceedBtn': function(event, instance) {
        if (!Meteor.user()) {
            $('#sign-in-modal').modal('open');
            return;
        }

        let expId = instance.data.exp._id;
        let role = instance.selectedRole.get();
        if (role === 'Reviewer') {
            console.log("proceeding as reviewer");
            proceedAsReviewer(expId);
        } else if (role === 'Pilot User') {
            let pilotUrl = "/galileo/pilot/" + expId;
            proceedExplore("galileo.pilot.canPilot", pilotUrl, expId);
        } else if (role === 'Participant') {
            let joinUrl = "/galileo/join/" + expId;
            proceedExplore("galileo.run.canParticipate", joinUrl, expId);
        }
    }

});

function proceedAsReviewer(expId) {

    Meteor.call('galileo.feedback.joinAsReviewer', expId, function(err) {
        if (err) {
            Materialize.toast(err, 4000, "toast rounded");
        } else {
            window.location.href = "/galileo/feedback/" + expId;
        }
    });
}



function proceedExplore(methodName, url, expId, arr) {
    let inst = Template.instance();
    Meteor.call(methodName, expId, function(err, can) {
        if (!err && can && "galileo.run.canParticipate" === methodName) {
            Meteor.call("galileo.run.getParticipantStatus", expId, function(err, result) {
                if (result === ParticipationStatus.PASSED_CRITERIA || result === ParticipationStatus.PREPARING) {
                    window.location.href = "/galileo/me/dashboard";
                } else if (result === ParticipationStatus.FAILED_CRITERIA) {
                    window.location.href = "/galileo/join/failed/" + expId;
                } else if (result === ParticipationStatus.FINISHED) {
                    window.location.href = "/galileo/join/failedEnded/" + expId;
                } else {
                    let $list = $("input:checked");
                    let arr = [];
                    for (let i = 0; i < $list.length; i++) {
                        arr.push($("label[for=" + $list.eq(i).attr("id") + "]").text());
                    }

                    Meteor.call("galileo.run.submitCriteria", expId, arr, function(err, success) {
                        if (!err && success) {
                            //Materialize.toast("Congratulations, you've successfully joined this experiment!!", 3000, "toast rounded");
                            window.location.href = "/galileo/join/consent/" + expId;
                        } else {
                            window.location.href = "/galileo/join/failed/" + expId;
                        }
                    });
                }
            });
        } else if (!err && can) {
            window.location.href = url
        } else {
            if (err.error === ErrorMessage.MISSING_PHONE) {
                showPhoneModal(inst);
            } else if (err.error === ErrorMessage.EXP_END || err.error === ErrorMessage.EXP_START) {
                Meteor.call("galileo.run.addToWaitlist", expId, function(err) {
                    $("#explore-item-modal").modal('close');
                    window.location.href = '/galileo/browse'
                });
            } else {
                let msg = err.reason ? err.reason : err.error;
                Materialize.toast(msg, 4000, "toast rounded");
            }
        }
    });
}

function isOpenForPilot() {
    let data = Template.instance().data;
    if (data && data.exp) {
        return (data.exp.status >= ExperimentStatus.OPEN_FOR_PILOT && data.exp.status < ExperimentStatus.READY_TO_RUN)
    }
    return true;
}

function isOpenForWaitlist() {
    let data = Template.instance().data;
    if (data && data.exp) {
        return (data.exp.status >= ExperimentStatus.STARTED)
    }
    return true;
}

function showPhoneModal(instance) {
    let phoneModal = $('#add-phone-modal');
    phoneModal.modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        ready: function() {
            phoneModal.trigger('show');
        },
        complete: function() {
            if (phoneModal.data('goToJoin')) {
                $("#proceedBtn").click();
            }
        },
    });

    phoneModal.modal('open');
}
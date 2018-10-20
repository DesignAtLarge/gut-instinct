import './_.jade';
import {
    ExperimentStatus,
    ErrorMessage
} from "../../../../../imports/api/ga-models/constants";

Template.gaJoinConsent.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.gaJoinConsent.onCreated(function() {
    let inst = this;
    this.isLoading = new ReactiveVar(true);
    this.experiment = new ReactiveVar(undefined);
    this.userHasUsername = new ReactiveVar(true);
    this.userHasEmail = new ReactiveVar(true);

    Meteor.call("galileo.profile.hasUsername", Meteor.userId(), function(err, result) {
        if (err) {
            // alert("Server Connection Error");
        } else {
            inst.userHasUsername.set(result);
        }
    });

    Meteor.call("galileo.profile.hasEmail", Meteor.userId(), function(err, result) {
        if (err) {
            // alert("Server Connection Error");
        } else {
            inst.userHasEmail.set(result);
        }
    });

    Meteor.call("galileo.experiments.getExperiment", Template.instance().data.id, function(err, experiment) {
        inst.isLoading.set(false);
        if (err) {
            throw err;
        }
        inst.experiment.set(experiment);
        $("title").html("Galileo | Does " + experiment.design.cause + " affect " + experiment.design.effect + "?");
    });
});

Template.gaJoinConsent.helpers({
    isLoading: function() {
        return Template.instance().isLoading.get();
    },
    experimentTitle: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        }
    },
    isEnded: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp.status === ExperimentStatus.FINISHED;
        }
    },
    isRunning: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp.status === ExperimentStatus.STARTED;
        }
    },
    expId: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp._id;
        }
    },
    incompleteUsername: function() {
        return Template.instance().userHasUsername.get() === false;
    },
    incompleteEmail: function() {
        return Template.instance().userHasEmail.get() === false;
    },
});


Template.gaJoinConsent.events({
    "click #join": function(event) {
        let inst = Template.instance();
        if (Meteor.userId()) {
            resetMendelId();
            canParticipate(inst.data.id);
        } else {
            //not logged in
            $('#sign-in-modal').modal('open');
        }
    },
    "click #sign-in": function() {
        localStorage.setItem("loginRedirectUrl", window.location.pathname);
        window.location.href = "/galileo/signup/";
    }
});

function handleIsEnded(instance) {
    let exp = instance.experiment.get();
    if (exp) {
        return exp.status === ExperimentStatus.FINISHED;
    }
}

function handleIsRunning(instance) {
    let exp = instance.experiment.get();
    if (exp) {
        return exp.status === ExperimentStatus.STARTED;
    }
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
                $("#join").click();
            }
        },
    });

    phoneModal.modal('open');
}

function resetMendelId() {
    let exp = Template.instance().experiment.get();
    let expMendel = exp.mendel_ga_id;
    let currentUserMendel = localStorage.getItem("mendelcode_ga");

    if (expMendel && !currentUserMendel) {
        console.log("setting mendel to " + expMendel);
        localStorage.setItem("mendelcode_ga", expMendel);
    }
}

function canParticipate(expId) {
    let inst = Template.instance();
    Meteor.call("galileo.run.canParticipate", expId, function(err, can) {
        if (!err && can) {
            Meteor.call("galileo.run.addToExp", inst.experiment.get(), function(error, res) {
                if (!error && res) {
                    Materialize.toast("Congratulations, you've successfully joined this experiment!", 3000, "toast rounded");
                    window.location.href = "/galileo/join/passed/" + expId;
                } else if (!error && !res) {
                    Materialize.toast("You haven't found out yet if you are eligible to participate in this experiment", 3000, "toast rounded");
                    window.location.href = "/galileo/join/criteria/" + expId;
                }
            });
        } else {
            if (err.error === ErrorMessage.MISSING_PHONE) {
                showPhoneModal(inst);
            } else if (err.error === ErrorMessage.EXP_END || err.error === ErrorMessage.EXP_START) {
                Meteor.call("galileo.run.addToWaitlist", inst.experiment.get()._id, function() {
                    window.location.href = "/galileo/browse";
                });
            } else {
                let msg = err.error;
                $("#error-message").text(msg);
                $("#error-modal").modal('open');
            }
        }
    });
}
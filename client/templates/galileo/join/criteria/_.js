import './_.jade';
import {
    ParticipationStatus
} from "../../../../../imports/api/ga-models/constants";


Template.gaJoinCriteria.onCreated(function() {
    let inst = this;
    this.isSubmitLoading = new ReactiveVar(false);
    // this.criteria = new ReactiveArray();
    this.criteria_inclusion = new ReactiveArray();
    this.criteria_exclusion = new ReactiveArray();
    this.isCriteriaLoading = new ReactiveVar(true);
    this.experiment = new ReactiveVar(undefined);

    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, experiment) {
        if (err) {
            throw err;
        }
        inst.experiment.set(experiment);
        inst.criteria_inclusion.set(experiment.design.criteria.inclusion);
        inst.criteria_exclusion.set(experiment.design.criteria.exclusion);
        inst.isCriteriaLoading.set(false);

        let temp_sub = JSON.parse(localStorage.getItem('temp_submission'));
        if (temp_sub !== undefined && temp_sub !== null && temp_sub.id === inst.experiment.get()._id) {
            $("#submit").click();
        }
    });

    //Meteor.call("galileo.experiments.getShuffledCriteria", this.data.id,
    /*
    Meteor.call("galileo.experiments.getUnshuffledInclusionCriteria", this.data.id, function (err, criteria) {
        inst.isCriteriaLoading.set(false);
        if (!err && criteria) {
            inst.criteria_inclusion.set(criteria);
        }
    });
    Meteor.call("galileo.experiments.getUnshuffledExclusionCriteria", this.data.id, function (err, criteria) {
        inst.isCriteriaLoading.set(false);
        if (!err && criteria) {
            inst.criteria_exclusion.set(criteria);
        }
    });
    */

    this.userHasUsername = new ReactiveVar(true);
    this.userHasEmail = new ReactiveVar(true);

    Meteor.call("galileo.profile.hasUsername", Meteor.userId(), function(err, result) {
        if (err) {
            // alert("Server Connection Error");
        } else {
            inst.userHasUsername.set(result);
            console.log("in consent username: " + result);
        }
    });

    Meteor.call("galileo.profile.hasEmail", Meteor.userId(), function(err, result) {
        if (err) {
            // alert("Server Connection Error");
        } else {
            inst.userHasEmail.set(result);
        }
    });
});

Template.gaJoinCriteria.helpers({
    // criteria: function () {
    //     return Template.instance().criteria.get().map((str, i) => {
    //         return {
    //             index: i,
    //             content: str
    //         };
    //     });
    // },
    experimentTitle: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        }
    },
    inclusion: function() {
        return Template.instance().criteria_inclusion.get().map((str, i) => {
            return {
                index: i,
                content: str
            };
        });
    },
    exclusion: function() {
        return Template.instance().criteria_exclusion.get().map((str, i) => {
            return {
                index: i,
                content: str
            };
        });
    },
    isCriteriaLoading: function() {
        return Template.instance().isCriteriaLoading.get();
    },
    isSubmitLoading: function() {
        return Template.instance().isSubmitLoading.get();
    },
    incompleteUsername: function() {
        return Template.instance().userHasUsername.get() === false;
    },
    incompleteEmail: function() {
        return Template.instance().userHasEmail.get() === false;
    },
});

Template.gaJoinCriteria.events({
    "click #sign-in": function() {
        localStorage.setItem("loginRedirectUrl", window.location.pathname);
        window.location.href = "/galileo/signup/";
    },
    "click #submit": function(event, instance) {
        let expId = Template.instance().data.id;

        let temp_sub = JSON.parse(localStorage.getItem('temp_submission'));

        instance.isSubmitLoading.set(true);
        if (Meteor.userId()) {
            Meteor.call("galileo.run.getParticipantStatus", expId, function(err, result) {
                if (result === ParticipationStatus.PASSED_CRITERIA || result === ParticipationStatus.PREPARING) {
                    window.location.href = "/galileo/me/experiment/" + expId + "/my_participation";
                } else if (result === ParticipationStatus.FAILED_CRITERIA) {
                    window.location.href = "/galileo/join/failed/" + expId;
                } else if (result === ParticipationStatus.FINISHED) {
                    window.location.href = "/galileo/join/failedEnded/" + expId;
                } else {
                    let arr = [];
                    
                    if (temp_sub !== null && temp_sub !== undefined && temp_sub.id === expId) {
                        arr = temp_sub.arr;
                        localStorage.removeItem('temp_submission');
                    }
                    else {
                        let $list = $("input:checked");
                        for (let i = 0; i < $list.length; i++) {
                            arr.push($("label[for=" + $list.eq(i).attr("id") + "]").text());
                        }
                    }

                    Meteor.call("galileo.run.submitCriteria", expId, arr, function(err, success) {
                        if (!err && success) {
                            //Materialize.toast("Congratulations, you've successfully joined this experiment!!", 3000, "toast rounded");
                            window.location.href = "/galileo/join/consent/" + expId;
                        } else {
                            instance.isSubmitLoading.set(false);
                            window.location.href = "/galileo/join/failed/" + expId;
                        }
                    });
                }
            });
        } else {
            let id = Template.instance().data.id;

            let $list = $("input:checked");
            let arr = [];
            for (let i = 0; i < $list.length; i++) {
                arr.push($("label[for=" + $list.eq(i).attr("id") + "]").text());
            }

            let temp_submission = {
                id: id,
                arr: arr
            }

            localStorage.setItem("temp_submission", JSON.stringify(temp_submission));

            $('#sign-in-modal').modal('open');
        }
    },

    "click #back": function() {
        history.back();
    }
});
import './_.jade';
import {
    ErrorMessage
} from "../../../../../imports/api/ga-models/constants";

Template.gaJoinFailed.onCreated(function() {
    let inst = this;
    this.failedInclusionList = new ReactiveArray();
    this.failedExclusionList = new ReactiveArray();
    this.isReviewer = new ReactiveVar(false);

    //Meteor.call("galileo.experiments.getShuffledCriteria", this.data.id,
    Meteor.call("galileo.run.getFailedCriteriaList", inst.data.id, function(err, res) {
        console.log(res);
        if (!err && res !== undefined) {
            inst.failedInclusionList.set(res[0]);
            inst.failedExclusionList.set(res[1]);
        } else {
            Meteor.call("galileo.run.canParticipate", inst.data.id, function(error, result) {
                console.log(error);
                console.log(result);
                if (error.error == ErrorMessage.IS_REVIEWER_CANNOT_JOIN) {
                    inst.isReviewer.set(true);
                }
            });
        }
    });
});

Template.gaJoinFailed.helpers({
    failExclusion: function() {
        return Template.instance().failedExclusionList.get().length !== 0;
    },
    failInclusion: function() {
        return Template.instance().failedInclusionList.get().length !== 0;
    },
    failInclusionList: function() {
        return Template.instance().failedInclusionList.get();
    },
    failExclusionList: function() {
        return Template.instance().failedExclusionList.get();
    },
    isReviewer: function() {
        return Template.instance().isReviewer.get();
    }
});

Template.gaJoinFailed.events({
    'click #help-exclusion': function() {
        $("#helpcard-exclusion-").toggle();
    },
    'click #help-inclusion': function() {
        $("#helpcard-inclusion-").toggle();
    },
    'click .helpclose': function(event) {
        console.log(event);
        event.currentTarget.parentElement.parentElement.style.display = "none";
    }
});
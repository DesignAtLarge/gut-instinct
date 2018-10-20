import './_.jade';
import Helper from '../helper';
import {
    MeasureType
} from "../../../../../imports/api/ga-models/constants";

Template.gaExperimentDesignFollowupMessage.onCreated(function() {});

Template.gaExperimentDesignFollowupMessage.helpers({
    cause: function() {
        return Template.instance().data.design_cause.get();
    },
    effect: function() {
        return Template.instance().data.design_effect.get();
    },
    causeFollowup: function() {
        let cause = Template.instance().data.design_cause.get()
        return "Your data for " + cause + " has been successfully stored. Add more details about your activity in the past day to improve the quality of your results. Did you do something unique? Tell us more...";
    },
    effectFollowup: function() {
        let effect = Template.instance().data.design_effect.get()
        return "Your data for " + effect + " has been successfully stored. Add more details about your activity in the past day to improve the quality of your results. Did you do something unique? Tell us more...";
    }
});

Template.gaExperimentDesignFollowupMessage.events({});
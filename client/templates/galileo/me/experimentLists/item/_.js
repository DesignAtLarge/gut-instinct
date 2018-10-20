import './_.jade';
import {
    ExperimentStatus
} from "../../../../../../imports/api/ga-models/constants";
Template.gaExperimentItem.rendered = function() {

};

Template.gaExperimentItem.onCreated(function() {});

Template.gaExperimentItem.helpers({
    experimentObjective: function() {
        let exp = Template.instance().data.exp;
        if (exp) {
            return "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        }
    },
    username: function() {
        let exp = Template.instance().data.exp;
        if (exp) {
            return exp.username;
        }
        return "";
    },
    date: function() {
        let exp = Template.instance().data.exp;
        if (exp) {
            return exp.design.create_date_time;
        }
        return "";
    },
    id: function() {
        let exp = Template.instance().data.exp;
        if (exp) {
            return exp._id;
        }
        return "";
    },
    isCompleted: function() {
        var data = Template.instance().data;
        if (data && data.exp) {
            return (data.exp.status == ExperimentStatus.FINISHED)
        }
        return false;
    }
});
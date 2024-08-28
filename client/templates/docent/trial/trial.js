import { Template } from 'meteor/templating';

import './trial.html';

Template.trial.rendered = function () {

};

Template.trial.onCreated(function () { 
    var inst = this;
    this.testQuestionsQuickBites = new ReactiveVar(null);
    this.testQuestionsMechanism = new ReactiveVar(null);
    this.testQuestionsScenarios = new ReactiveVar(null);
    
});

Template.trial.helpers({
    isTaken: function(test) {
        return false;
    },
    isPre: function(test) {
        return test == 'pre';
    },
    isOpenResponse: function(question) {
        return question.response_type == 'open';
    },
    getTestQuickBites: function() {
        return Template.instance().testQuestionsQuickBites.get();
    },
    getTestMechanisms: function() {
        return Template.instance().testQuestionsMechanism.get();
    },
    getTestScenarios: function() {
        return Template.instance().testQuestionsScenarios.get();
    },
    getOptions: function(question) {
        return question.options;
    },
    isCondition5: function() {
        return false;
    },
    getHours: function() {
        date1 = new Date("September 9, 2017 23:59:00");
        date2 = new Date()
        return (Math.abs(date1 - date2) / 36e5).toFixed(0);
    }
});


Template.trial.events({
  
});
import { Template } from 'meteor/templating';

import './entrance.html';

Template.entrance.rendered = function () {

};

Template.entrance.onCreated(function () { });

Template.entrance.helpers({

    isIntroCompleted: function() {
        return false;
    },
    isGuideCompleted: function() {
        return false;
    },
    getNewQuestionCountsbyCondition: function(currentMendel) {
        return 3;
    },
    getUsersCounts: function(currentMendel) {
        return 3;
    },
    tookPretest: function() {
        return false;
    }
});


Template.entrance.events({
  
});
import './_.jade';

Template.gaJoinPassed.helpers({
    expId: function() {
        return Template.instance().data.id;
    }
});
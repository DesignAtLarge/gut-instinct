import './_.jade';

Template.gaSurvey.rendered = function() {

};

Template.gaSurvey.onCreated(function() {
    this.name = ReactiveVar("Josh");
});

Template.gaSurvey.helpers({
    name: function() {
        return Template.instance().name.get();
    },
});

Template.gaSurvey.events({});
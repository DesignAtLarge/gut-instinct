import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

Template.gaSurvey.rendered = function () {

};

Template.gaSurvey.onCreated(function () {
    this.name = ReactiveVar("Josh");
});

Template.gaSurvey.helpers({
    name: function () {
        return Template.instance().name.get();
    },
});

Template.gaSurvey.events({});
import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

Template.gaJoinPassed.helpers({
    expId: function() {
        return Template.instance().data.id;
    }
});
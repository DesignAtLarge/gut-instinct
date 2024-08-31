import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';


Template.gaPreTest.events({
    'click #finish-pre-test-btn': function(event) {
        Meteor.call("galileo.tour.finishPretest", function(err) {
            if (err) {
                alert("Server Connection Error");
            } else {
                window.location.href = "/galileo/intuition";
            }
        });
    }
});
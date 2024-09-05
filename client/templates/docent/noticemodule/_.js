import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';


Template.noticemodule.rendered = function() {

}

Template.noticemodule.onCreated(function() {
    // const query = Router.current().params.query;
    this.qstatus = new ReactiveVar(sessionStorage.getItem('state'));
});

Template.noticemodule.helpers({
    init: function() {},
    checkStar: function(data) {
        return (data.type == 'star');
    }
});

Template.noticemodule.events({

});
import './_.jade';

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
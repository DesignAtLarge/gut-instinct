import './_.jade'

Template.gaIntuitionBoardItem.rendered = function() {

}

Template.gaIntuitionBoardItem.helpers({
    escapeIntuition: function(intuition) {
        return encodeURI(intuition);
    },
    hasTag: function() {
        if (Template.instance().data.tags) {
            return Template.instance().data.tags.length > 0;
        } else {
            return false;
        }
    },
    hasMechanism: function() {
        return Template.instance().data.mechanism != undefined;
    }
})

Template.gaIntuitionBoardItem.events({
    "click .design": function() {
        var intuitionId = Template.instance().data.id;
        Meteor.call("galileo.tour.setSelectedIntuitionId", intuitionId);
        Meteor.call("galileo.tour.finishIntuitionBoard");

        //TODO: Tell the owner of the intuition that his/hers intuition is selected

        window.location.href = "/galileo/create?intid=" + intuitionId;
    }
});
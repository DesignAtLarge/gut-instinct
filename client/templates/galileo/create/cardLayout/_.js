// import { emailList } from '/imports/api/models';

Template.cardLayout.helpers({
    nextButtonText: function() {
        let data = Template.instance().data;
        if (data && data.nextButtonText) {
            return data.nextButtonText
        } else {
            if (data && data.nextOnly) {
                return "Let's go";
            } else {
                return "Next";
            }
        }
    },
});

Template.cardLayout.events({
    'click #nextBtn': function() {
        let type = Template.instance().data.type;
        let designId = Template.instance().data.designId;
        Meteor.call("galileo.experiments.design.setTimeStamp", designId, type);
    },
    'click #finishBtn': function() {
        let type = Template.instance().data.type;
        let designId = Template.instance().data.designId;
        Meteor.call("galileo.experiments.design.setTimeStamp", designId, type);

    },
});
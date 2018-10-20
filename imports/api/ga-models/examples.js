import {
    Meteor
} from 'meteor/meteor';

export const Examples = new Mongo.Collection('ga_examples');

Meteor.methods({
    'galileo.examples.getExamples': function(currentParentTemplate) {
        return Examples.find({
            status: 1,
            parent_template: currentParentTemplate
        }).fetch();
    }
});


function generateExampleObject(mendelCode) {
    return {
        "mendel_code": mendelCode,
        "parent_template": "",
        "stage_id": "0-0",
        "versions": [{
            "create_data_time": new Date()
        }],
        "status": 1,
        "data": ""
    }
}
import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaCriteria.rendered = function() {};

Template.gaCriteria.onCreated(function() {
    this.inclusionCriteria = new ReactiveArray();
    this.exclusionCriteria = new ReactiveArray();

});

Template.gaCriteria.helpers({
    nextDisabled: function() {
        return false;
    },
    inclusionCriteria: function() {
        return Template.instance().inclusionCriteria;
    },
    exclusionCriteria: function() {
        return Template.instance().exclusionCriteria;
    },
    hypothesis: function() {
        let data = Template.instance().data;
        if (data) {
            return data.cause.get() + " " + data.relation.get() + " " + data.effect.get();
        }
    },
    experimentInstruction: function() {
        let data = Template.instance().data;
        if (data && data.instructions) {
            return data.instructions.get();
        }
    },
    ControlexpInstructions: function() {
        let data = Template.instance().data;
        if (data && data.condition.control.steps) {
            return data.condition.control.steps.get();
        }
    },
    hasExperimentInstruction: function() {
        let data = Template.instance().data;
        return (data && data.instructions && data.instructions.get().length > 0);
    },
    hasControlInstructions: function() {
        let data = Template.instance().data;

        return (data && data.controlSteps.get().length > 0);
    },
    hasExperimentalInstructions: function() {
        let data = Template.instance().data;

        return (data && data.experimentalSteps.get().length > 0);
    },
    controlSteps: function() {
        return Template.instance().data.controlSteps.get();
    },
    controlCondition: function() {
        return Template.instance().data.controlCondition.get();
    },
    experimentalCondition: function() {
        return Template.instance().data.experimentalCondition.get();
    },
    experimentalSteps: function() {
        return Template.instance().data.experimentalSteps.get();
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishProvideCriteria";
    },
    getDesignId: function() {
        return Template.instance().data.designId.get();
    },
});

Template.gaCriteria.events({
    'show .card-frame': function() {

        let inst = Template.instance();

        let ic = inst.data.inclusionCriteria.get();
        let ec = inst.data.exclusionCriteria.get();

        if (hasCriteria(ic, ec)) {

            // Add array and push empty string to the end
            let iarr = ic.slice();
            let earr = ec.slice();
            iarr.push("");
            earr.push("");

            // Set the template variables
            inst.inclusionCriteria.set(iarr.map((str, id) => {
                return {
                    'id': id,
                    'checked': false,
                    'text': str,
                    'fixed': false
                }
            }));
            inst.exclusionCriteria.set(earr.map((str, id) => {
                return {
                    'id': id,
                    'checked': false,
                    'text': str,
                    'fixed': id < 4
                }
            }));
        } else {
            inst.inclusionCriteria.set(defaultInclusionCriteria());
            inst.exclusionCriteria.set(defaultExclusionCriteria());
        }
    },
    'click .next-action': function() {

        let inst = Template.instance();
        let designId = inst.data.designId.get();

        let ic = getCriteria(inst.inclusionCriteria.get());
        let ec = getCriteria(inst.exclusionCriteria.get());

        inst.data.inclusionCriteria.set(ic);
        inst.data.exclusionCriteria.set(ec);

        Meteor.call("galileo.experiments.design.setInclusionCriteria", designId, ic);
        Meteor.call("galileo.experiments.design.setExclusionCriteria", designId, ec);
    }
});

function getCriteria(criteriaArr) {
    let a = [];
    for (let i = 0; i < criteriaArr.length; i++) {
        let criterion = criteriaArr[i];
        let text = criterion.text.trim();
        if (text.length > 0) {
            a.push(criterion.text);
        }
    }
    return a;
}

function defaultInclusionCriteria() {
    return [
        optionDict(1, '', false, 'travel to different cities every week'),
        optionDict(2, '', false, 'drink at least one cup of coffee daily'),
        optionDict(3, '', false, 'suffer from at least one IBD symptom'),
    ];
}

function defaultExclusionCriteria() {
    return [
        optionDict(1, 'under 18 years of age', true),
        optionDict(2, 'pregnant', true),
        optionDict(3, 'potentially cognitively impaired', true),
        optionDict(4, 'a prisoner or incarcerated', true, null, true),
        optionDict(5, '', false, ' are lactose intolerant'),
        optionDict(6, "", false, " don't speak english"),
    ];
}

function optionDict(id, text = '', fixed = false, placeholder = 'Add another criterion', hasHelp = false) {
    return {
        'id': id,
        'checked': false,
        'text': text,
        'fixed': fixed,
        'placeholder': placeholder,
        'hasHelp': hasHelp
    }
}

function hasCriteria(inclusionCriteria, exclusionCriteria) {

    // Hardcoded. Since there will absolutely be elements in exclusion criteria
    return exclusionCriteria.length > 0;
}
import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaCriteriaDemo.rendered = function() {
    $(".card-frame").show().trigger("show");
};

Template.gaCriteriaDemo.onCreated(function() {
    this.inclusionCriteria = new ReactiveArray();
    this.exclusionCriteria = new ReactiveArray();
    this.exp = new ReactiveVar(undefined);

    let inst = this;
    Meteor.call("galileo.experiments.getExperiment", this.data.expId, function(err, exp) {
        if (exp) {
            inst.exp.set(exp);
        }
    });
});

Template.gaCriteriaDemo.helpers({
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
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause + " " + exp.design.relation + " " + exp.design.effect;
        }
    }
});

Template.gaCriteriaDemo.events({
    'show .card-frame': function() {
        let inst = Template.instance();

        if (hasCriteria()) {

            let ic = inst.data.inclusionCriteria.get();
            let ec = inst.data.exclusionCriteria.get();

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
        let exp = inst.exp.get();
        if (!exp) return;

        let designId = exp["curr_design_id"];

        let ic = getCriteria(inst.inclusionCriteria.get());
        let ec = getCriteria(inst.exclusionCriteria.get());

        Meteor.call("galileo.experiments.design.setInclusionCriteria", designId, ic);
        Meteor.call("galileo.experiments.design.setExclusionCriteria", designId, ec);

        window.location.href = '/galileo/me/experiment/' + inst.data.expId;
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
        optionDict(4, 'a prisoner or incarcerated', true),
        optionDict(5, '', false, ' are lactose intolerant'),
        optionDict(6, "", false, " don't speak english"),
    ];
}

function optionDict(id, text = '', fixed = false, placeholder = 'Add another criterion') {
    return {
        'id': id,
        'checked': false,
        'text': text,
        'fixed': fixed,
        'placeholder': placeholder
    }
}

function hasCriteria() {
    let inst = Template.instance();

    if (inst.data && inst.data.inclusionCriteria && inst.data.exclusionCriteria) {
        // Hardcoded. Since there will absolutely be elements in exclusion criteria
        return inst.data.exclusionCriteria.length > 0;
    } else {
        return false;
    }

}
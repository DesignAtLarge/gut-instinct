import './_.jade';
let nlp = require('compromise');
let elasticlunr = require('elasticlunr');

Template.gaExperimentBoard.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.gaExperimentBoard.onCreated(function() {
    let inst = this;
    this.experiments = new ReactiveArray();
    this.experimentsSearchDisplay = new ReactiveArray();
    this.elasticSearch = new ReactiveVar(undefined);
    this.isFeedbackStep = new ReactiveVar(false);
    this.noneValidSearchResult = new ReactiveVar(false);
    this.isLoaded = new ReactiveVar(false);
    this.selectedExp = new ReactiveVar(undefined);
    this.showPilot = new ReactiveVar(false);

    this.userHasUsername = new ReactiveVar(true);
    this.userHasEmail = new ReactiveVar(true);

    Meteor.call("galileo.profile.hasUsername", Meteor.userId(), function(err, result) {
        if (err) {
            // alert("Server Connection Error");
        } else {
            inst.userHasUsername.set(result);
            console.log("in consent username: " + result);
        }
    });

    Meteor.call("galileo.profile.hasEmail", Meteor.userId(), function(err, result) {
        if (err) {
            // alert("Server Connection Error");
        } else {
            inst.userHasEmail.set(result);
        }
    });

    Meteor.call("galileo.experiments.getExperiments", localStorage.mendelcode_ga, function(err, experiments_res) {
        inst.isLoaded.set(true);
        if (err) {
            throw err;
        }
        let exp_search_engine = elasticlunr(function() {
            this.addField('exp_cause');
            this.addField('exp_effect')
        });

        // more normalization with clearStopWords
        let exp_stop_words = ['does', 'Does', 'affect', 'Affect'];
        elasticlunr.addStopWords(exp_stop_words);
        elasticlunr.clearStopWords();

        // map each exp into search db
        experiments_res.forEach(function(exp_item, exp_index) {
            exp_cause_norm = nlp(exp_item.design.cause).normalize().out('text');
            exp_effect_norm = nlp(exp_item.design.effect).normalize().out('text');
            exp_obj = {
                exp_cause: exp_cause_norm,
                exp_effect: exp_effect_norm,
                id: exp_item._id
            };
            exp_search_engine.addDoc(exp_obj);
        });

        experiments_res.sort(function(a, b){
            let keyA = undefined, keyB = undefined;

            if (a.create_date_time && b.create_date_time) {
                keyA = a.create_date_time;
                keyB = b.create_date_time;
            }
            else if (a.create_date_time || b.create_date_time) {
                if (a.create_date_time) {
                    keyA = a.create_date_time;
                    keyB = b.status_change_date_time;
                }
                else if (b.create_date_time) {
                    keyA = a.status_change_date_time;
                    keyB = b.create_date_time;
                }
            }
            else {
                keyA = a.status_change_date_time;
                keyB = b.status_change_date_time;
            }
            // Compare the 2 dates
            if(keyA < keyB) return 1;
            if(keyA > keyB) return -1;
            return 0;
        });
        inst.elasticSearch.set(exp_search_engine);
        inst.experiments.set(experiments_res);
    });

});


Template.gaExperimentBoard.helpers({
    isLoaded: function() {
        return Template.instance().isLoaded.get();
    },
    experiments: function() {
        let defaultExp = Template.instance().experiments.get();
        let searchResultExp = Template.instance().experimentsSearchDisplay.get();
        if (searchResultExp) {
            let filteredExp = [];

            searchResultExp.forEach(function(exp_item, exp_index) {
                let targetExpId = exp_item.ref;
                let targetExp = defaultExp.filter(exp => exp._id == targetExpId)[0];
                filteredExp.push(targetExp);
            });
            // if no search result, we show all exp
            if (filteredExp.length === 0) {
                return defaultExp;
            }
            return filteredExp;
        } else {
            return defaultExp;
        }
    },
    hasExperiment: function() {
        return Template.instance().experiments.get().length > 0;
    },
    isFeedbackStep: function() {
        return Template.instance().isFeedbackStep.get();
    },
    selectedExp: function() {
        return Template.instance().selectedExp.get();
    },
    expId: function() {
        if (Template.instance.selectedExp != undefined) {
            return Template.instance().selectedExp.get()._id;
        }
    },
    showPilot: function() {
        return Template.instance().showPilot.get();
    },
    hasInitSearch: function() {
        return Template.instance().experimentsSearchDisplay.get().length > 0;
    },
    hasGreaterThanOneSearchResult: function() {
        return Template.instance().experimentsSearchDisplay.get().length > 1;
    },
    getSearchCount: function() {
        return Template.instance().experimentsSearchDisplay.get().length;
    },
    noneValidSearchResult: function() {
        return Template.instance().noneValidSearchResult.get();
    },
    incompleteUsername: function() {
        return Template.instance().userHasUsername.get() === false;
    },
    incompleteEmail: function() {
        return Template.instance().userHasEmail.get() === false;
    },
});

Template.gaExperimentBoard.events({
    'keyup #search_input': function(event, instance) {
        if ($("#search_input").val().length === 0) {
            instance.noneValidSearchResult.set(false);
        }
        let searchKeyword = nlp($("#search_input").val()).normalize().out('text');
        let search_engine = instance.elasticSearch.get();
        let result = search_engine.search(searchKeyword, {
            fields: {
                exp_cause: {
                    expand: true
                },
                exp_effect: {
                    expand: true
                }
            },
            bool: "OR",
            expand: true
        });

        function updateDOM(result) {
            instance.experimentsSearchDisplay.set(result);
            if ($("#search_input").val().length !== 0 && result.length === 0) {
                instance.noneValidSearchResult.set(true);
            } else {
                instance.noneValidSearchResult.set(false);
            }
        }
        updateDOM(result);

    },

    'click #designExpBtn': function() {
        if (Meteor.user()) {
            window.location.href = '/galileo/createdemo'
        } else {
            $('#sign-in-modal').modal('open');
        }
    },

    // handling button clicks for each item
    "click .feedback-btn": function(event, instance) {
        $("#reviewerBtn").click();
        handleExploreClick(event, instance);
    },

    "click .pilot-btn": function(event, instance) {
        $("#pilotBtn").click();
        handleExploreClick(event, instance);
    },
    "click .join-btn": function(event, instance) {
        $("#participantBtn").click();
        handleExploreClick(event, instance);
    },
    "click .admin-btn-review": function(event, instance) {
        let expIndex = event.currentTarget.id.split('-')[2];
        let exp = instance.experiments.get()[expIndex];
        window.location.href = "/galileo/feedback/" + exp._id;
        //$('#explore-item-modal').modal('open');
    },
    "click .admin-btn-creator": function(event, instance) {
        let expIndex = event.currentTarget.id.split('-')[2];
        let exp = instance.experiments.get()[expIndex];
        window.location.href = "/galileo/me/experiment/" + exp._id + "/info";
        //$('#explore-item-modal').modal('open');
    },
    "click .admin-btn-dash": function(event, instance) {
        let expIndex = event.currentTarget.id.split('-')[2];
        let exp = instance.experiments.get()[expIndex];
        window.location.href = "/galileo/me/dashboard/" + exp.user_id;
        //$('#explore-item-modal').modal('open');
    },
    "click .join-specific-btn": function(event, instance) {
        $("#participantBtn").click();
        $("#pilotBtn").addClass('disabled');
        $("#reviewerBtn").addClass('disabled');

        let expIndex = event.currentTarget.id.split('-')[3];
        let exp = instance.experiments.get()[expIndex];
        instance.selectedExp.set(exp);
        $('#explore-item-modal').modal('open');
    },
    'click #signin': function() {
        $('#sign-in-modal').modal('close');
        window.location.href = "/galileo/signup/"
    },
    

});

function handleExploreClick(event, instance) {
    let expIndex = event.currentTarget.id.split('-')[2];
    let exp = instance.experiments.get()[expIndex];
    instance.selectedExp.set(exp);
    $('#explore-item-modal').modal('open');
}

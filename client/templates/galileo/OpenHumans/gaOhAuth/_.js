import './_.jade';


Template.gaOhAuth.onCreated(function() {
    let inst = this;
    this.isSubmitLoading = new ReactiveVar(false);
    this.isDataLoading = new ReactiveVar(true);
    this.ohDataSourceIds = new ReactiveVar(null);
    this.ohClientId = new ReactiveVar(null);

    let expId = this.data.id;

    Meteor.call("galileo.experiments.getOpenHumansSources", expId, function(err, result) {
        if (result && result.clientId && result.dataSourceIds && result.dataSourceIds.length > 0) {
            inst.isDataLoading.set(false);
            inst.ohDataSourceIds.set(result.dataSourceIds);
            inst.ohClientId.set(result.clientId)
        } else {
            window.location.href = "/galileo/me/experiment/" + expId + "/my_participation";
        }
    });
});


Template.gaOhAuth.rendered = function() {
    // when oauth is complete from open humans side, it redirects back to this page with "code" parameter set
    // if code is not set, that means that user didn't authorize this OpenHumans project
    let code = getUrlParameter("code");
    if (code !== null && code !== undefined) {
        let expId = Template.instance().data.id;
        window.location.href = "/galileo/me/experiment/" + expId + "/my_participation";
    }
};

Template.gaOhAuth.helpers({
    isDataLoading: function() {
        return Template.instance().isDataLoading.get();
    },
    isSubmitLoading: function() {
        return Template.instance().isSubmitLoading.get();
    },
    ohDataSourceIdsVar: function() {
        return Template.instance().ohDataSourceIds;
    },
    ohOAuthUrl: function() {
        let baseUrl = "https://www.openhumans.org/direct-sharing/projects/oauth2/authorize/";
        let client_id = Template.instance().ohClientId.get();
        let response_type = "code";
        return baseUrl + "?client_id=" + client_id + "&response_type=" + response_type;
    }
});

Template.gaOhAuth.events({
    "click #show-me": function(event, instance) {
        let id = '#oh-steps';
        $(id).show(400);
        scrollTo(id);
        startStepAnimation();
        $('#buttondiv1').hide();
    },

    'click .helpbtn': function(event) {
        let btnId = event.currentTarget.id;
        let res = btnId.split('-');
        let helpcardId = '#helpcard-' + res[1] + '-' + res[2];
        let $helpCard = $(helpcardId);

        console.log(helpcardId);
        if ($helpCard.hasClass("active")) {
            $helpCard.removeClass("active").slideToggle(200);
            return;
        }

        $('.helpcard.active').removeClass("active").hide();

        $helpCard.addClass("active").slideToggle(200);
    },
    'click .helpclose': function(event) {
        let cardId = event.target;
        $(cardId).closest('.card').removeClass("active").slideToggle(200);
    },

    "click #back": function() {
        history.back();
    },

    "click .skip": function() {
        let expId = Template.instance().data.id;
        window.location.href = "/galileo/me/experiment/" + expId + "/my_participation";
    },

});

function scrollTo(element) {
    // calling with timeout 0 beause we need to wait until element is visible
    setTimeout(function() {
        $('html, body').animate({
            scrollTop: $(element).offset().top - 100
        }, 500)
    }, 0);
}

function getUrlParameter(sParam) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function startStepAnimation() {
    let totalImages = 10;
    let currentStep = 0;

    setInterval(function() {
        let nextStep = (currentStep + 1) % totalImages;
        let $hideImg = $("#oh-step" + currentStep);
        let $showImg = $("#oh-step" + nextStep);
        $hideImg.addClass('hide');
        $showImg.removeClass('hide');
        currentStep = nextStep;
    }, 2000);
}
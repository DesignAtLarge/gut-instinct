window.onload = checkPath;

function redirect(newPath) {
    const baseUrl = 'http://localhost:3000';

    const newUrl = baseUrl + newPath;

    window.location.href = newUrl;
}


function checkPath() {
    var path = window.location.pathname;

    if (path === '/') {
        Blaze.render(Template.gaIntro, document.body);
        //redirect('/galileo');
    }
    else if (path === '/galileo') {
        redirect('/galileo/landing');
    }
    else if (path === '/login-admin') {
        if (!Meteor.user()) {
            Blaze.render(Template.login, document.body);
        } else {
            redirect('/consent');
        }
    }
    else if (path === '/signup') {
        if (!Meteor.user()) {
            Blaze.render(Template.signup, document.body);
        } else {
            Blaze.render(Template.loading_wheel, document.body);
            // Tushar hardcoded to route into /galileo space
            redirect('/galileo/consent');
        }
    }
    else if (path === '/consent') {
        if (!Meteor.user().profile.consent_agreed) {
            Meteor.call("galileo.profile.updateProfile");
            Blaze.render(Template.consent, document.body);
        } else {
            redirect('/intro');
        }
    }
    else if (path === '/tutorial') {
        Blaze.render(Template.tutorial, document.body);
    }
    else if (path === '/galileo/addcriteria') {
        Blaze.render(Template.gaCriteriaDemo, document.body);
      /*  Blaze.renderWithData(Template.gaCriteriaDemo, {
            expId: this.params.query.expid
        }, document.body);*/
    }

    else if (path === '/galileo/signup') {
        Blaze.render(Template.signup, document.body);
        $("title").html("Signup");
    }
    else if (path === '/galileo/blog/tutorial') {
        Blaze.render(Template.gabTutorial, document.body);
    }
    else if (path === '/galileo/console') {
        Blaze.render(Template.gaConsole, document.body);
    }
    else if (path === '/galileo/ethics') {
        Blaze.render(Template.gaEthicsDemo, document.body);
    }
    else if (path === '/galileo/home') {
        Blaze.render(Template.gaHome, document.body);
    }
    else if (path === '/galileo/consent') {
        Blaze.render(Template.consent, document.body);
    }
    else if (path === '/galileo/username') {
        Blaze.renderWithData(Template.username, {
            isGalileo: true
        }, document.body);
    }
    else if (path === '/galileo/landing') {
        Blaze.render(Template.gaLanding, document.body);
    }
    else if (path === '/galileo/entrance') {
        Blaze.render(Template.entrance, document.body);
    }
    else if (path === '/login') {
        Blaze.render(Template.login, document.body);
        $("title").html("Login");
    }
    else if (path === '/') {
        Blaze.render(Template.gaHome, document.body);
        $("title").html("Gut Instinct");
    }


    else if (path === '/trial') {
        Blaze.render(Template.trial, document.body);
        $("title").html("Trial");
    }
    else if (path === '/landing') {
        Blaze.render(Template.landing, document.body);
    }
    else if (path === '/galileo') {
        $("title").html("Gut Instinct");
    } else if (path === '/galileo/browse/GLUTEN') {
        $("title").html("Gut Instinct | GLUTEN");
    }
}

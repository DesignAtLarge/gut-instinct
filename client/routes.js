window.onload = checkPath;
function checkPath() {
    var path = window.location.pathname;

    if (path === '/') {
        Blaze.render(Template.gaExperimentBoard, document.body);
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

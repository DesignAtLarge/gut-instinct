

window.onload = checkPath;

function redirect(newPath) {
    const baseUrl = 'http://localhost:3000';

    const newUrl = baseUrl + newPath;

    window.location.href = newUrl;
}

function checkPath() {
    var path = window.location.pathname;
    var url = new URL(window.location.href);
    var params = new URLSearchParams(url.search);
    let currentUser = Meteor.userId();
    switch (path) {
        case '/survey':
            Blaze.renderWithData(Template.post_survey, function () {
                return {
                    type: "post"
                };
            }, document.body);
            break;
        default:
    }
}
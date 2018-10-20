import './_.jade'
import {
    MendelCode
} from '../../../../../imports/api/ga-models/constants'

Template.gaNavbar.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.gaNavbar.onCreated(function() {

    let self = this;

    this.intuitionAmount = new ReactiveVar(0);
    this.experimentAmount = new ReactiveVar(0);
    this.username = new ReactiveVar("");
    this.notifications = new ReactiveArray();
    this.needTourBanner = new ReactiveVar(false);
    this.mendelcode_ga = new ReactiveVar(undefined);
    this.mendel_name = new ReactiveVar(undefined);

    setInterval(function() {
        // Meteor.call("galileo.experiments.getExperimentAmount", function (err, amount) {
        //     if (err) {
        //         alert("Server Connection Error");
        //     }
        //     else {
        //         self.experimentAmount.set(amount);
        //     }
        // });
        //
        // Meteor.call("galileo.intuition.getIntuitionAmount", function (err, amount) {
        //     if (err) {
        //         alert("Server Connection Error");
        //         throw new Error("intuitionAmount");
        //     }
        //     else {
        //         self.intuitionAmount.set(amount);
        //     }
        // });

        if (Meteor.userId()) {
            Meteor.call("users.getUsername", function(err, username) {
                if (err) {
                    alert("Server Connection Error");
                }
                self.username.set(username);
            });

            Meteor.call("galileo.notification.getUnreadNotifications", function(err, notis) {
                if (err) {
                    alert("Server Connection Error");
                } else {
                    self.notifications.set(notis);
                }
            });
        }
    }, 1000);

    let mendelcode = localStorage.mendelcode_ga;
    Meteor.call('galileo.boards.getMendelName', mendelcode, function(err, res) {
        if (err) {
            alert("Server Connection Error");
        } else {
            self.mendel_name.set(res);
        }
    });

    let path = window.location.pathname;
    let regex = new RegExp("\/galileo\/blog\/why-exp-");

    if (path.match(regex) != null) {

        let regex1 = new RegExp("(?:\/galileo\/blog\/why-exp-)(.+)")
        let regex2 = new RegExp("(\/galileo\/blog\/why-exp)")

        path1 = path.match(regex1)
        path = path1[1].toUpperCase();

        Meteor.call('galileo.boards.getBlogBoard', path, function(err, result) {
            self.mendelcode_ga.set(result);
        })
    }

    $(document).ready(function() {
        let tabStr = testUrl(location.href);
        if (tabStr) {
            selectTab(tabStr);
        }
    });
    Tracker.autorun(function() {
        Meteor.call("galileo.tour.needTourBanner", window.location.pathname, function(err, need) {
            self.needTourBanner.set(need);
        });
    });
});

Template.gaNavbar.helpers({
    loggedIn: function() {
        return Meteor.userId();
    },
    username: function() {
        return Template.instance().username.get();
    },
    intuitionAmount: function() {
        return Template.instance().intuitionAmount.get();
    },
    experimentAmount: function() {
        return Template.instance().experimentAmount.get();
    },
    notifications: function() {

        return Template.instance().notifications.get();
    },
    hasNotification: function() {
        return Template.instance().notifications.get().length !== 0;
    },
    needTourBanner: function() {
        return Template.instance().needTourBanner.get();
    },
    getMendel: function() {
        if (Template.instance().mendel_name.get()) {
            return Template.instance().mendel_name.get();
        }
    },
    hasMendel: function() {
        let mendel = localStorage.mendelcode_ga;
        if (mendel && mendel.length > 0) {
            return true;
        } else {
            return false;
        }
    },
});

Template.gaNavbar.events({
    "click #sign-in": function(event) {
        localStorage.mendelcode_ga = Template.instance().mendelcode_ga.get();
    },
    "click #logout": function(event) {
        if (confirm("Are you sure you want to log out? You can just close the tab and open it later without having to log back in.")) {
            window.location.href = "/logout";
        }
    },
    "click #markAllAsRead": function(event) {
        Meteor.call("galileo.notification.markAllRead", function(err, result) {
            if (err) {
                console.log(err);
            }
        });
    },
    "click #navbar-notification-btn": function(event) {
        let $mask = $("#ga-navbar-notification-mask");
        let $panel = $("#ga-navbar-notification-panel");
        if ($panel.hasClass("active")) {
            $mask.fadeOut();
            $panel.removeClass("active");
        } else {
            $mask.fadeIn();
            $panel.addClass("active");
        }
    },
    "click #ga-navbar-notification-mask": function(event) {
        let $mask = $("#ga-navbar-notification-mask");
        let $panel = $("#ga-navbar-notification-panel");
        $panel.removeClass("active");
        $mask.fadeOut();
    },
    "click #navbar-account-btn": function(event) {
        let $mask = $("#ga-navbar-account-mask");
        let $panel = $("#ga-navbar-account-panel");
        if ($panel.hasClass("active")) {
            $mask.fadeOut();
            $panel.removeClass("active");
            console.log("called here");
        } else {
            console.log("called here else");
            $mask.fadeIn();
            $panel.addClass("active");
        }
    },
    "click #ga-navbar-account-mask": function(event) {
        let $mask = $("#ga-navbar-account-mask");
        let $panel = $("#ga-navbar-account-panel");
        $panel.removeClass("active");
        $mask.fadeOut();
    },
    "click #close-navbar-tour": function(event) {
        Template.instance().needTourBanner.set(false);
        event.stopPropagation();
    },

    "click .testPilotMsg": function(event) {
        Meteor.call("galileo.pilot.sendNotificationMessage");
    },
    "click #designTab": function() {
        if (Meteor.userId()) {
            if (/galileo\/createedu/.test(location.href) || /galileo\/createdemo/.test(location.href)) {
                window.alert("You are already creating an experiment.");
            } else {
                //window.location.href='/galileo/createedu';
                //fixed by vineet to remove createdu..
                window.location.href = '/galileo/createdemo';
            }
        } else {
            $('#sign-in-modal').modal('open');
        }
    },
    "click #dashboardTab": function() {
        if (Meteor.userId()) {
            window.location.href = '/galileo/me/dashboard';
        } else {
            $('#sign-in-modal').modal('open');
        }
    },
    "click #viewAllTab": function() {
        if (Meteor.userId()) {
            //window.location.href='/galileo/createedu';
            //fixed by vineet to remove createdu..
            window.location.href = '/galileo/browse';
        } else {
            window.location.href = '/galileo/browse'
            // $('#sign-in-modal').modal('open');
        }
    }
});

function testUrl(url) { // tests which page you are one
    if (/galileo\/browse/.test(url)) {
        return "viewAllTab";
    } else if (/galileo\/createedu/.test(url) || /galileo\/createdemo/.test(url)) {
        return "designTab";
    } else if (/galileo\/me/.test(url)) {
        return "dashboardTab";
    }
    return "";
}

function selectTab(element) {
    $(document).ready(function() {
        element = "#" + element;
        document.querySelector(element).classList.add("tabColor");
    });
}
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import './main.html';

Meteor.startup(() => {
  window.onload = checkPath;
});

function checkPath() {
  var path = window.location.pathname;
  if (path === '/galileo/signup') {
    Blaze.render(Template.signup, document.body);
    $("title").html("Signup");
  }
  else if (path === '/login') {
    Blaze.render(Template.login, document.body);
    $("title").html("Login");
  }
  else if (path === '/') {
    Blaze.render(Template.gaHome, document.body);
    $("title").html("Gut Instinct");
  }
  else if (path === '/galileo/home') {
    Blaze.render(Template.gaHome, document.body);
  }
  else if (path === '/galileo/consent') {
    Blaze.render(Template.consent, document.body);
  }
  else if (path === '/galileo/username') {
    Blaze.render(Template.username, document.body);
  }
  else if (path === '/galileo/landing') {
    Blaze.render(Template.gaLanding, document.body);
  }
  else if (path === '/galileo/entrance') {
    Blaze.render(Template.entrance, document.body);
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


import './templates/login/_.js';
import './templates/signup/_.js';
import './templates/username/_.js';
import './templates/landing/_.js';
import './templates/consent/_.js';
import './templates/entrance/_.js';

import './templates/galileo/assets/navbar/_.js';
import './templates/galileo/gaHome/_.js';
import './templates/galileo/gaLanding/_.js';
import './templates/galileo/create/helpLayout/_.js';
import './templates/galileo/create/imageModal/_.js';

import './templates/docent/loading_wheel/_.js';
import './templates/docent/trial/_.js';





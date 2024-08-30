import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import './main.html';

Meteor.startup(() => {
  window.onload = checkPath;
});

function checkPath() {
  var path = window.location.pathname;

  if (path === '/') {
    Blaze.render(Template.gaExperimentBoard, document.body);
  }
  else if (path === '/galileo/signup') {
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

import './templates/galileo/assets/editable/_.js';
import './templates/galileo/assets/fileUploadBtn/_.js';
import './templates/galileo/assets/gaEmailDropdown/_.js';
import './templates/galileo/assets/gaTimeDropdown/_.js';
import './templates/galileo/assets/gaVideoLearnLayout/_.js';
import './templates/galileo/assets/navbarNotificationItem/_.js';
import './templates/galileo/assets/navbar/_.js';

import './templates/galileo/browse/board/_.js';
import './templates/galileo/browse/copyExpModal/_.js';
import './templates/galileo/browse/exploreModal/_.js';
import './templates/galileo/browse/item/_.js';

import './templates/galileo/gaHome/_.js';
import './templates/galileo/gaLanding/_.js';
import './templates/galileo/console/_.js';
import './templates/galileo/error/_.js';

import './templates/galileo/design/criteria/_.js';
import './templates/galileo/design/followupMessage/_.js';
import './templates/galileo/design/hypothesis/_.js';
import './templates/galileo/design/instructions/_.js';
import './templates/galileo/design/main/_.js';
import './templates/galileo/design/measures/_.js';
import './templates/galileo/design/result/_.js';
import './templates/galileo/design/textMessageModal/_.js';
import './templates/galileo/design/helper.js';

import './templates/galileo/create/cardLayout/_.js';
import './templates/galileo/create/checklist/_.js';
import './templates/galileo/create/exampleLayout/_.js';
import './templates/galileo/create/faqs/_.js';
import './templates/galileo/create/gaCondition/_.js';
import './templates/galileo/create/gaConsent/_.js';
import './templates/galileo/create/helpLayout/_.js';
import './templates/galileo/create/imageModal/_.js';
import './templates/galileo/create/gaCreateControlIntro/_.js';
import './templates/galileo/create/gaCreateFinish/_.js';
import './templates/galileo/create/gaCreateMain/_.js';
import './templates/galileo/create/gaCreateTrial/_.js';
import './templates/galileo/create/gaCriteria/_.js';
import './templates/galileo/create/gaCriteriaDemo/_.js';
import './templates/galileo/create/gaEthics/_.js';
import './templates/galileo/create/gaEthicsDemo/_.js';
import './templates/galileo/create/gaExperimentStartTime/_.js';
import './templates/galileo/create/gaFrequencyDropdown/_.js';
import './templates/galileo/create/gaHypothesis/_.js';
import './templates/galileo/create/gaIdentifyVariables/_.js';
import './templates/galileo/create/gaMeasureCause/_.js';
import './templates/galileo/create/gaMeasureEffect/_.js';
import './templates/galileo/create/gaPhase1End/_.js';
import './templates/galileo/create/gaSetReminder/_.js';
import './templates/galileo/create/gaSummary/_.js';
import './templates/galileo/create/gaSummary2/_.js';
import './templates/galileo/create/gaSurvey/_.js';
import './templates/galileo/create/gaWelcomeCard/_.js';
import './templates/galileo/create/orderedList/_.js';

import './templates/docent/loading_wheel/_.js';
import './templates/docent/trial/_.js';





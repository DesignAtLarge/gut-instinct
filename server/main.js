import { Meteor } from 'meteor/meteor';
import {
  Mongo
} from 'meteor/mongo';
import { SurveyQuestions } from '../imports/api/models.js';
import { Boards } from '../imports/api/ga-models/boards.js';
import { Examples } from '../imports/api/ga-models/examples.js';
import fs from 'fs';
import path from 'path';

import '../imports/api/ga-models/master.js';

Meteor.startup(() => {
  loadDatabase();
});
function loadDatabase() {
  SurveyQuestions.dropCollectionAsync();
  Boards.dropCollectionAsync();
  Examples.dropCollectionAsync();
  //Meteor.users.dropCollectionAsync();
  try {
    const surveyQuestionsDataFile = fs.readFileSync("/Users/gunasekharathuluri/NodeProjects/migration_gut-instinct/script/source/survey_questions.json", 'utf8');
    const boardsDataFile = fs.readFileSync("/Users/gunasekharathuluri/NodeProjects/migration_gut-instinct/script/source/galileo_boards.json", 'utf8');
    const examplesDataFile = fs.readFileSync("/Users/gunasekharathuluri/NodeProjects/migration_gut-instinct/script/source/galileo_examples.json", 'utf8');

    const surveyQuestionsData = JSON.parse(surveyQuestionsDataFile);
    const boardsData = JSON.parse(boardsDataFile);
    const examplesData = JSON.parse(examplesDataFile);

    surveyQuestionsData.forEach(data => {
      SurveyQuestions.insertAsync(data);
    });
    boardsData.forEach(data => {
      Boards.insertAsync(data);
    });
    examplesData.forEach(data => {
      Examples.insertAsync(data);
    });
  
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
  }
}

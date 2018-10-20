import {
    Mongo
} from 'meteor/mongo';
export const TabooWords = new Mongo.Collection('const_taboo_words');
export const emailList = new Mongo.Collection('const_mail_list');
/*
{
    hashcode: string,
    name: string,
    questions: [QuestionID],
    video_url: string,
    tag_question: TagQuestion
    science_texts: string,
    created_at: Date
}
*/
export const Tags = new Mongo.Collection('tags');

/*
{
    hashcode: string,
    text: string,
    owner: UserID,
    created_at: Date
    tags: [TagID],
    comments: [CommentID],
    contribs: [ScienceCollabsID],
    upvote_count: integer,
    downvote_count: integer,
    editable: boolean
}
*/
export const Questions = new Mongo.Collection('questions');


/*
 {
 hashcode: string,
 text: string,
 writer: UserID,
 created_at: Date
 }
 */

export const VideoQuestion = new Mongo.Collection('videoquestions');


/*
{
    hashcode: string,
    text: string,
    writer: UserID,
    created_at: Date
}
*/

export const Bookmarks = new Mongo.Collection('bookmarks');

export const FlaggedQues = new Mongo.Collection('flaggedquestions');

/*
 {
 hashcode: string,
 text: string,
 writer: UserID,
 created_at: Date
 }
 */

export const Notifications = new Mongo.Collection('notification');

export const UserEmail = new Mongo.Collection('user_email');

export const GutProfile = new Mongo.Collection('gut_profile');

export const UserTestResponse = new Mongo.Collection('user_test_response');

export const UserSurveyResponse = new Mongo.Collection('user_survey_response');

export const UserGuideResponse = new Mongo.Collection('user_guide_response');


/*
{
    hashcode: string,
    type: string,
    type_id: string,
    writer: UserID,
    created_at: Date
}
 */

export const Comments = new Mongo.Collection('comments');

/*
{
    hashcode: string,
    tag: string,
    text: string,
    writer: UserID,
    created_at: Date
}
*/
export const ScienceCollabs = new Mongo.Collection('science_collabs');

/*
{
    hashcode: string,
    tag: string,
    question: string,
    choices: [string],
    correct_answer: integer // index of choices
}
*/
export const TagQuestions = new Mongo.Collection('tag_questions');

export const PersonalQuestions = new Mongo.Collection('personal_questions');

export const TrainingQuestions = new Mongo.Collection('training_questions');

export const TestQuestions = new Mongo.Collection('test_questions');

export const SurveyQuestions = new Mongo.Collection('survey_questions');
//export const TestQuestionsMC = new Mongo.Collection('test_questions_mc');
//export const TestQuestionsFR = new Mongo.Collection('test_questions_fr');

/*
{
    hashcode: string,
    question: string,
    choices: [string],
    correct_answer: integer // index of choices
}
*/
export const LearnQuestions = new Mongo.Collection('learn_questions');

/*
    learn_question: hashcode,
    text: string,
    created_at: string,
    owner: { userID, username }
*/
export const LearnDiscussions = new Mongo.Collection('learn_discussions');

/*
{
    hashcode: string,
    url: string,
    title: string,
    image: string,
    snippet: string,
    by: string
}
*/
export const Articles = new Mongo.Collection('articles');

/*
{
    user_id: ID,
    login_counter: integer,
    visit_counter: {
        page: integer, ...
    },
    time_spent: [ { page: string, entered: Date, exited: Date, duration: integer } ]
    number_of_questions: integer,
    number_of_comments: integer,
    number_of_science_articles: integer
}
*/
export const UserMetrics = new Mongo.Collection('user_metrics');

// overall metrics: total and average for number_of_questions, number_of_comments, number_of_science_articles.
// overall metrics: average depth of discussion per page


export const ViewedExamples = new Mongo.Collection('viewed_examples');

/*
{
    created_at: Date,
    user_id:     ID,
    condition:   int
}
*/
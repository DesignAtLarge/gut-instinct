 [![CircleCI](https://circleci.com/gh/DesignAtLarge/gutgame-proto.svg?style=svg&circle-token=09c9f5ce4219d2bf02d113c2d2acc9fd397902cf)](https://circleci.com/gh/DesignAtLarge/gutgame-proto)
-----------------
<div align="center">
  <img src="https://s3.amazonaws.com/gut-instinct/github_readme_logo_min.png"><br><br>
</div>

-----------------
[Gut Instinct](http://gutinstinct.ucsd.edu/info) - Collaboratively creating scientific theories!
==================================================

Welcome
--------------------------------------
Gut Instinct is currently under deployment. Stay tuned to see more results!

Contribution Guides
--------------------------------------
1. [Getting Involved](http://gutinstinct.ucsd.edu/info)
2. [Core Style Guide](https://google.github.io/styleguide/jsguide.html)
3. Read Gut Instinct [Contribution Guidelines](https://github.com/DesignAtLarge/gutgame-proto/blob/mendel/CONTRIBUTING.md)

Environments in which to use Gut Instinct
--------------------------------------
- Browser support: If you are using Internet Explorer or Safari, you may experience some problems using the system. We recommend that you use other, free browsers, like [Chrome](https://www.google.com/chrome/browser/desktop/index.html) or [Firefox](https://www.mozilla.org/en-US/firefox/new/) to visit Gut Instinct.
- Screen size: We recommend you to use screen larger than 1366x768.

What you need to build your own Gut Instinct
--------------------------------------
- Web Server: Node.js >= 8.11.1, npm >= 6.0.1, Meteor = 1.6.1.4
- Database: MongoDB
- Email: [Deploy and config Email Notification System - TODO](http://github.com/)
- File Storage: AWS S3
- OAuth APIs: Google, Facebook, Reddit, OpenHumans
- Media Storage: YouTube

How to build your own Gut Instinct
--------------------------------------
### Building Gut Instinct on Internet?
TODO: Update deployment google doc to here.

### Building Gut Instinct on localhost?
+ Step 1: Make sure ```settings_dev.json``` is in the ```INPROGRESS``` folder, and it contains all the API keys. We highly recommended you to add this file to ```.gitignore``` due to security purpose.

+ Step 2: ```cd``` into this repo, and run ```npm install``` and ```meteor npm install``` in your terminal.

+ Step 3: Run ```npm run start``` in your terminal.

+ Step 4: Before open ```http://localhost:3000```, make sure all data is ready in DB, and all the document fields are updated.

#### How to populate starter DB to localhost?

+ Step 1: Make sure ```DB_CONFIG.py``` is in the ```INPROGRESS/scripts/POPULATE``` folder, and it is up to date.  This file is ignored in git system due to security purpose.

+ Step 2: ```cd``` into ```INPROGRESS/scripts/POPULATE``` folder.

+ Step 3: Run these four python scripts in your terminal (must in this order):

  * ```python 0_populate_guide_questions.py```
  * ```python 1_populate_tags.py```
  * ```python 2_populate_questions.py```
  * ```python 3_populate_personal_questions.py```
  * ```python 4_populate_galileo_intuition.py```
  * ```python 5_populate_galileo_experiments.py```
  * ```python 6_populate_test_questions.py```

Running Tests
--------------------------------------
TBD

Questions?
--------------------------------------
If you have any questions, please feel free to contact us by sending us an email to gutinstinct-at-ucsd-dot-edu

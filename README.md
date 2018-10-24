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

Environments in which to use Gut Instinct
--------------------------------------
- Browser support: If you are using Internet Explorer or Safari, you may experience some problems using the system. We recommend that you use other, free browsers, like [Chrome](https://www.google.com/chrome/browser/desktop/index.html) or [Firefox](https://www.mozilla.org/en-US/firefox/new/) to visit Gut Instinct.
- Screen size: We recommend you to use screen larger than 1366x768.

What you need to build your own Gut Instinct
--------------------------------------
- Web Server: Node.js >= 8.11.1, npm >= 6.0.1, Meteor = 1.6.1.4
- (Optional) Email: [Deploy and config Email Notification System - TODO](http://github.com/)
- (Optional) File Storage: AWS S3
- (Optional) OAuth APIs: Google, Facebook, Reddit, OpenHumans
- (Optional) Media Storage: YouTube

How to build your own Gut Instinct
--------------------------------------
### Building Gut Instinct on localhost?
+ Step 1: Clone this repo to your home directory.

+ Step 2: Make sure ```settings_dev.json``` is under the repo folder, and it contains all the API keys. We highly recommended you to add this file to ```.gitignore``` due to security purpose.

+ Step 3: Run ```npm install``` and ```meteor npm install``` in your terminal.

+ Step 4: Run ```npm run start``` in your terminal.

+ Step 5: Before opening ```http://localhost:3000```, ```cd``` ```script``` folder, run ```./poulate_db.bash```.

### Building Gut Instinct on Internet?
TODO: Update deployment google doc to here.


Questions?
--------------------------------------
If you have any questions, please feel free to contact us by sending us an email to gutinstinct-at-ucsd-dot-edu

Contribution Guides
--------------------------------------
1. [Getting Involved](http://gutinstinct.ucsd.edu/info)
2. [Core Style Guide](https://google.github.io/styleguide/jsguide.html)
3. Read Gut Instinct [Contribution Guidelines](https://github.com/DesignAtLarge/gutgame-proto/blob/mendel/CONTRIBUTING.md)

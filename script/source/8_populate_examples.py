# from DB_CONFIG_KEY import *
import time
import subprocess
import sys
import md5
import json
import os

from pymongo import MongoClient

def connect(heroku=False):
    print "Connecting to Mongo"
    url = ''
    if heroku:
        url = DB_AUTH_URL

    else:
        command = subprocess.Popen(["meteor", "mongo", "-U"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = command.communicate()

        # exit when error
        if error:
            print "ERROR FOUND:"
            print error
            print "QUITTING"
            sys.exit(1)

        url = output.strip() # Mongo Client URL

    print "------------------------ !!!!!!!!!!!!!!!!! ------------------------ "
    print "Please check the target DB is corrent: \n" + url
    print "\nPopulate operation will start in 10 second\n"
    print "Press Ctrl+C to STOP\n"
    time.sleep(10)
    print "\nStart populate...\n"
    time.sleep(3)

    try:
        if heroku:
            return DB_INSTANCE
        else:
            return MongoClient(url).meteor
    except:
        return None

def populate_test(db):
    print "Populating Example Items in DB ..."
    db.ga_examples.delete_many({});
    f = open(os.path.dirname(os.path.realpath(__file__)) + '/galileo_examples.json')
    examples = json.loads(f.read())
    for example in examples:
        print("inserting example: " + str(example))
        db.ga_examples.insert(example)


if __name__ == "__main__":
    db = connect(heroku=len(sys.argv) > 1 and sys.argv[1] == 'heroku')
    if not db:
        print "CANNOT CONNECT TO DATABASE"
        sys.exit(1)
    populate_test(db)

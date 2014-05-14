sqs-poller
----------
A simple AWS sqs message poller with configurable winston back-end for multiple logging & storage formats (local file, syslog, etc...)
Can run once untill sqs queue is empty (or max uptime reached), or run 'forever'- constantly long polling the sqs.

Installation
------------
Get the script files (git / zip)
npm install

Configuration:
--------------

1. Configure the aws_config.json file with your aws credentials and desired region and sqs queue url
2. Configure the desired log formats, and syslog parameters on logger.js

Run:
----
single run (suitable to be executed by a cron job every minute):
node poller

forever run (forever running script, with almost realtime retrieval of messages):
node poller multi



Notes:
------

1. Make sure you have a working nodejs environment + npm (see http://nodejs.org/download/ and https://github.com/joyent/node/wiki/installation)
2. Recommended to create a seperate IAM user (or role if running this script on AWS) and providing it with minimal permission set

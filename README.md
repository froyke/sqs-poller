sqs-poller
----------
A simple nodejs AWS SQS message poller with configurable winston back-end for multiple logging & storage formats (local file, syslog, etc...). <br>
This could be a great way to push (actually pull) these messages into Splunk, Logstash, and SIEM systems that are run behind the firewall.<br>
This script can run once - until sqs queue is empty (or max_uptime reached), or run 'forever' - long polling the sqs and getting messages in real-time (ish)

Installation
------------

1. Make sure you have nodejs installed (>0.8) and npm.  [nodejs installation instructions]
2. Get the script files using git or direct download: <br>
```
wget https://github.com/froyke/sqs-poller/archive/master.zip
unzip master.zip
mv sqs-poller-master sqs-poller
cd sqs-poller
```


3. Install dependencies<br>
```
npm install
```

Configuration
--------------

1. Configure the **aws_config.json** file with your aws credentials and desired region and sqs queue url
2. Configure the desired log formats, and syslog parameters in **logger.js**

Run
----
* single run (suitable to be executed by a cron job every minute):
```
node poller
```

* forever run (forever running script, with almost realtime retrieval of messages):
```
node poller multi
```


Notes
------

1. Recommended to create a seperate IAM user (or role if running this script on AWS instance) and providing it with minimal permission set (read / delete messages)

[nodejs installation instructions]: https://github.com/joyent/node/wiki/installation
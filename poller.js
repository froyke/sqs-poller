/* ****** Configuration Section **********/
ENABLE_CONSOLE = true;
ENABLE_FILE = true;
ENABLE_SYSLOG = true;
LOG_FILE_PATH = "./D9_events.log";
SYSLOG_OPTS = { host:"localhost", port:514, protocol:"udp4", facility:"local1", app_name:"D9_events", level:"info"}; // winston-syslog options. Read more at: https://github.com/indexzero/winston-syslog
WORKER_MAX_UPTIME_MS = 60000; // 1 min - this is to ensure that 1 minute cron jobs will not accumulate long lasting workers
/******************************************/

"use strict";

var winston = require('winston');
var transports = [];
if(ENABLE_CONSOLE) transports.push( new winston.transports.Console({level:"debug"}));
if(ENABLE_FILE) transports.push( new winston.transports.File({ filename: LOG_FILE_PATH, level:"info", json:false }));
if(ENABLE_SYSLOG){
	require('winston-syslog').Syslog;
	transports.push ( new winston.transports.Syslog(SYSLOG_OPTS));
} 
var logger = new (winston.Logger)({ transports:transports});
var AWS = require('aws-sdk');
var awsConf = require('./aws_config');
var sqsURL = awsConf.sqsURL; // added sqsURL to the 'standard' aws_config.json
AWS.config.update(awsConf);
var sqs = new AWS.SQS();

function readMessage() {
	sqs.receiveMessage({
		"QueueUrl": sqsURL,
		"MaxNumberOfMessages": 10,
		"VisibilityTimeout": 30,
		"WaitTimeSeconds": 20 ,
		"AttributeNames": ["SentTimestamp"]
	}, handleSqsResponse);
	
	function handleSqsResponse (err, data) {
		if(err) logger.error("handleSqsResponse error:" + err);
		if (data && data.Messages) {
			data.Messages.forEach(processMessage)		
			readMessage(); // continue reading until draining the queue (or UPTIME reached)
		}
		else{
			logger.debug("no data in sqs.");
			process.exit();
		}
	}

	// 'processing' is mainly writing to logs using winston. Could add here any transformations and transmission to remote systems
	function processMessage(sqsMessage){
		// Parse sqs message 
		//var sentTime = new Date(parseInt(sqsMessage.Attributes.SentTimestamp)).toISOString(); //not currently using it
		var msgObj = JSON.parse(sqsMessage.Body);
				
		// Process
		logger.info(msgObj.Message);
		
		// Delete message from queue after processing
		sqs.deleteMessage({
	   		"QueueUrl" : sqsURL,
	   		"ReceiptHandle" : sqsMessage.ReceiptHandle
	   	}, function(err, data){	if(err) logger.error(err);}); 
	}
}



// Main - start / control sequence 
var multi = process.argv.indexOf("multi") > -1 ;
if(multi){
	var fork = require('child_process').fork;
	var workers = 0;
	setInterval(function(){
		if(workers == 0){
			workers ++;
			fork("poller").on("exit", function(arg){workers--}); //fork a child worker and listen for its exit
		}
	},5000);
}
else{
	readMessage();
	// do not let worker live / hang forever (not to stack workers and for memory leaks)
	setTimeout(function () {
		logger.debug('worker uptime exceeded');
		process.exit();
	}, WORKER_MAX_UPTIME_MS);
}

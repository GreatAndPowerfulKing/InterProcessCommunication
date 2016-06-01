var api = {};
global.api = api;
api.net = require('net');

var user = { name: 'Marcus Aurelius', age: 1895 };

var tasks = [2, 17, 3, 2, 5, 7, 15, 22, 1, 14, 15, 9, 0, 11];
var results = [];
var workers = [];
var resultsForWorker = {};

var server = api.net.createServer(function(socket) {

	console.log('Connected: ' + socket.localAddress);

	workers.push(socket);
	runTasks();

	socket.on('data', function(data) {
		var result = JSON.parse(data);
		var index = workers.indexOf(socket);
		console.log('Result from socket ' + index + ': ' + result);
		resultsForWorker[index] = result;

		if (Object.keys(resultsForWorker).length == workers.length) {
			createResults();
			console.log('Result: ' + results);
		}
	});

	socket.on('close', function(had_error) {
		var index = workers.indexOf(socket);
		console.log('Socket ' + index + ' was closed. Had error: ' + had_error);
		workers.splice(index, 1);
		runTasks();
	})

}).listen(2000);

function runTasks() {
	resultsForWorker = {};
	var tasksForWorkerCount;
	if (workers.length == 0) {
		tasksForWorkerCount = tasks.length;
	} else {
		tasksForWorkerCount = (Math.max(Math.round(tasks.length / workers.length + 0.5), 1));
	}
	for (var i = 0; i < workers.length; i++) {
		var begining = i * tasksForWorkerCount;
		var end = Math.min((i + 1) * tasksForWorkerCount, tasks.length);
		workers[i].write(JSON.stringify(tasks.slice(begining, end)));
	};
}

function createResults() {
	results = [];
	for (var i = 0; i < workers.length; i++) {
		results = results.concat(resultsForWorker[i]);
	};
}

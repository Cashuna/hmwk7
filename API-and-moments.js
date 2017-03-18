//=================================global=declarations======================================  
// Initialize Firebase
var config = {
	apiKey: "AIzaSyAqYitEGrrcx3aOHxm1SpBUs5k_uoYep7M",
	authDomain: "testdatabase-1bf64.firebaseapp.com",
	databaseURL: "https://testdatabase-1bf64.firebaseio.com",
	storageBucket: "testdatabase-1bf64.appspot.com",
	messagingSenderId: "637415651063"
  };
firebase.initializeApp(config);

var fireBaseData = firebase.database();

//Initialization
var schedule = [];
var trainName = "";
var destination ="";
var inputTrainTime = "", trainTime =0; 
var inputfrequency = "", frequency =0;
var millisecInDay = 86400000; //(60*60*6)*4); will call moment function with min... as an argument, expecting conversion to milliseconds

//========================================events=============================================  
  
$("#submit").on("click", function() {
    
    $("#train-list").empty();  
	event.preventDefault();
	

	//Gets values from user input, using moment here will store NaN
	trainName = $("#train-name").val().trim();
	destination = $("#destination").val().trim();
	inputTrainTime = $("#first-train-time").val().trim();
	inputfrequency = $("#Hz").val().trim();

	//Implement values
	trainTime = convertTime(inputTrainTime);
	frequency = convertHowOften(inputfrequency);
	buildSchedule(trainTime, frequency);

	//Store values on db
	fireBaseData.ref().push({

		trainName: trainName,
		destination: destination,
		//firstTrainTime: moment(trainTime, "HH:mm").format("HH:mm"),
		runsEvery: moment.duration(schedule[0]).humanize(),
		nextArrival: findNextArrival(schedule),
		minutesAway: "Not Defined",
		dataAdded: firebase.database.ServerValue.TIMESTAMP // Server time is good because there's no timezone variation
	});  

	//Clears the form input values on click
	$("#train-name").val("");
	$("#destination").val("");
	$("#first-train-time").val("");
	$("#Hz").val("");
	$("train-list").empty();

	// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
	fireBaseData.ref().on("child_added", function(childSnapshot){

		$("#train-list")
		.append("<tr><td> " +childSnapshot.val().trainName+
		" </td><td> " +childSnapshot.val().destination+
		" </td><td> " +childSnapshot.val().runsEvery+ 
  		" </td><td> " +childSnapshot.val().nextArrival+ 
  		" </td><td> " +childSnapshot.val().minutesAway+
  		" </td></tr>");
  		
  	});
	
});

//=======================================functions=============================================

function convertTime(time){
 var tHr = moment(time, "HH:mm").format("HH");
 var tMin = moment(time, "HH:mm").format("mm")
 tHr = Number(tHr);
 tMin = Number(tMin);
 var tCombined = moment.duration({hours: tHr, minutes: tMin});
 
 return tCombined._milliseconds; //property of the duration object to get value for ms;
}

function convertHowOften(howOften){
	howOften = Number(howOften);
	var addThis = moment.duration(howOften, 'm')._milliseconds;
	return addThis;
}

function buildSchedule(trainStarts, freq){
	
	do{
		schedule.push(trainStarts);
		trainStarts = trainStarts + freq;
		console.log("This is buildSchedule trainStarts in the array: "+trainStarts);
		console.log(trainStarts);
		console.log(freq);
	}while (trainStarts < moment.duration(24, 'h')._milliseconds) //this will work in this loop because sT will change before the condition is true
	console.log("This is schedule: "+ schedule);

}

function findNextArrival (array){
	var currentTime = new Date().getHours();//get current time in milliseconds
	var arriving = new Date().getTime(); //sets a data object for moments to perform calculation
	for(var i=0; i<array.length; i++)
	{
		debugger;
		if ((moment.duration(currentTime, 'h')._milliseconds) > array[i]){//this array is already in moments, may have to add momment(array[i]) for proper evaluation
			continue;
		}
		else{
			arriving = moment(array[i]).from((moment.duration(currentTime, 'h')._milliseconds));
			console.log("This is findNextArrival arriving: "+ arriving);
			break;
		}
	}
	return arriving;
}

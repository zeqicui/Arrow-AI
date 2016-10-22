var dataArray = [];

var instructions = "Please move your hand over the leap motion sensor...";
var time = 15;
var currentTest = 1;

 var requested =  false; 

var singleTapCount = 0;
var STINT = 0;
var STSTDEV = 0;
var messages = "";
var controllerOptions = {enableGestures: false};
var startTime;
var intervals = [];

var fingerDown = false;
var lastTap = 0; 

var LRTapCount = 0;
var LRIntervals = [];
var rightZone = false; //To detect which region we are in
var rightExited = false; //Once the tap is completed, we don't wanna throw error until they leave the region'
var rightTapped = false; //To prevent taps from being done in the same region more than once
var leftZone = false;
var leftExited = false;
var leftTapped = false;
var expectedDirection = 1; //1 is right and -1 is right, it will be inverted with every tap

var FHPCycleCount = 0;
var FHPIntervals = [];

function updateUI() {
    document.querySelector('.instructions').innerHTML = instructions;
    document.querySelector('.results').innerHTML = singleTapCount;
    document.querySelector('.messages').innerHTML = messages;
    document.querySelector('.data').innerHTML = dataArray;
    document.querySelector('.time').innerHTML = time;
}

function countdown(){
    var counter = 3;     
    document.querySelector('#countdown').innerHTML = counter;
    var interval = setInterval(function() {
        counter--;
        document.querySelector('#countdown').innerHTML = counter;
        console.log(counter);
        // Display 'counter' wherever you want to display it.
        if (counter == 0) {
            // Display a login box     
            document.querySelector('#countdown').innerHTML = counter;
            clearInterval(interval);
            document.getElementById("countdown").style.display="none";

            if (currentTest == 1)
                document.getElementById("test1").style.display="block";
                document.getElementById("test2").style.display="none";
                document.getElementById("test3").style.display="none";
            if (currentTest == 2)
                document.getElementById("test1").style.display="none";
                document.getElementById("test2").style.display="block";
                document.getElementById("test3").style.display="none";
            if (currentTest == 3)
                document.getElementById("test1").style.display="none";
                document.getElementById("test2").style.display="none";
                document.getElementById("test3").style.display="block";

            return;
        }
    }, 1000);
}





function countLeftRightTaps() {
    startTime = null; 
    Leap.loop(controllerOptions, function(frame) {


        if ( startTime != null && time > 0) {
            time = 15 - Math.floor((frame.timestamp - startTime)/1000000);
        }

        //Make sure that hands are visible before the timer starts
        if (frame.hands.length == 0) {
            messages = "No hands are visible. Please make sure your right hands is over the sensor";
        //Make sure that both hands are not in view
        } else if (frame.hands.length == 2) {
            messages = "You have placed both your hands over the sensor, please remove your left hands"; 
        } else {
            var hand = frame.hands[0];
            //Ensure that patient is using their right hand
            if (hand.type == "right") { 
                 if (hand.pitch() < -0.10 || hand.pitch > 0.15) {
                    messages = "Your hand is not flat. Please make sure your hand it parallel to the floor"
                } else {
                    //If the start time is not set, start it
                    if (startTime == null) {
                        startTime = frame.timestamp;
                        time = 0;
                        instructions = "Get Ready...";
                        countdown();
                    }
                    // Once 15 seconds have passed, return the counts and the intervals
                    if (frame.timestamp - startTime >= 15000000) {
                        //Code to send the data to the server
                    }

                    //Get the instance of the hand then the index finger
                    var indexFinger = hand.indexFinger;
                    var fingerPosition = indexFinger.tipPosition;

                    if (fingerPosition[0] > 45) {
                        rightZone = true;
                    } else if (fingerPosition[0] < -45) {
                        leftZone = true;
                    } else {
                        rightZone = false;
                        leftZone = false;
                    }

                    if (expectedDirection == 1 && rightZone && rightExited == false ) {
                        if (fingerPosition[1]  < 100) {
                            fingerDown = true;
                        } else if (fingerPosition[1]  > 100 && fingerDown == true) {
                            LRTapCount += 1;
                            fingerDown = false;
                            expectedDirection *= -1; 
                            if (LRTapCount > 1) {
                                var intervalC = frame.timestamp - lastTap;
                                intervals.push(intervalC);
                                lastTap = frame.timestamp;
                            } else {
                                lastTap = frame.timestamp;
                            }
                        }
                    }
                }
            }
        }
    });
}
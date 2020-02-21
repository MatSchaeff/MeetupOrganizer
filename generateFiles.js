'use strict';
var https = require('https');
var fs = require('fs');

var url_list_bad = 'https://www.meetup.com/mu_api/urlname/events/eventId/attendees?queries=(endpoint:Geneva-Badminton-Club/events/,meta:(method:get),params:(only:%27id,name,local_date%27),ref:eventAttendees_Geneva-Badminton-Club)';
var url_list_sports = 'https://www.meetup.com/mu_api/urlname/events/eventId/attendees?queries=(endpoint:GenevaSportsClub/events/,meta:(method:get),params:(only:%27id,name,local_date%27),ref:eventAttendees_GenevaSportsClub)';

var list_badminton_events = [];
var list_sports_events = [];

function ajaxCall(url, callback){
    https.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var full_data = JSON.parse(body);
            callback(full_data);
            // console.log("Got a response: ", body);
        });
    }).on('error', function(e){
        console.log("Got an error: ", e);
    });
}

function saveFile(data, filename){
    var stringData = JSON.stringify(data);
    fs.writeFileSync(filename, stringData);
}

function getUrl(id,type){
    if(type=="bad"){
        return "https://www.meetup.com/mu_api/urlname/events/eventId/attendees?queries=(endpoint:Geneva-Badminton-Club/events/"+id+"/rsvps,meta:(method:get),params:(desc:!t,fields:'answers,pay_status,self,web_actions,attendance_status',only:'answers,response,attendance_status,guests,member,pay_status,updated',order:time),ref:eventAttendees_Geneva-Badminton-Club,type:attendees)";
    }
    else{
        return "https://www.meetup.com/mu_api/urlname/events/eventId/attendees?queries=(endpoint:GenevaSportsClub/events/"+id+"/rsvps,meta:(method:get),params:(desc:!t,fields:'answers,pay_status,self,web_actions,attendance_status',only:'answers,response,attendance_status,guests,member,pay_status,updated',order:time),ref:eventAttendees_Geneva-Badminton-Club,type:attendees)";
    }
    
}
function getEventData(){
    list_badminton_events.forEach(function(ev,idx){
        var url= getUrl(ev.id,"badminton");
        ajaxCall(url,function(d){
            var filename = __dirname + "/badminton_events/" + ev.id + ".json";
            saveFile(d,filename);
            console.log("badminton event ",idx," - file saved!");
        })
    })
    list_sports_events.forEach(function(ev,idx){
        var url= getUrl(ev.id,"sports");
        ajaxCall(url,function(d){
            var filename = __dirname + "/sports_events/" + ev.id + ".json";
            saveFile(d,filename);
            console.log("sports event ",idx," - file saved!");
        })
    })
}

function main(){
    ajaxCall(url_list_bad,function(data){
        list_badminton_events = data.responses[0].value;
        saveFile(list_badminton_events, __dirname + "/badminton_events.json");
        console.log("list of badminton events - file saved!");
        ajaxCall(url_list_sports,function(data){
            list_sports_events = data.responses[0].value;
            saveFile(list_sports_events, __dirname + "/sports_events.json");
            console.log("list of sports events - file saved!");
            getEventData();
        })
    })
}

main();

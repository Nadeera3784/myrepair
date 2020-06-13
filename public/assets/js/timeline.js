/* 
  scheduler

  dp.autoRefreshInterval = 10; 
dp.autoRefreshMaxCount = 10;
dp.autoRefreshEnabled = true;

dp.onAutoRefresh = function(args) { 
  dp.events.load("/getEvents");
};


dp.events.load(
    "/getEvents",
    function success(args) {
      dp.message("Events loaded");
    },
    function error(args) {
      dp.message("Loading failed.");
    }
  );


[
    {
      id: 1
      start: "2018-01-01T09:00:00",
      end: "2018-01-01T13:00:00",
      text: "Event 1",
      resource: "A",
      cssClass: "my-event",
      resizeDisabled: true
    },
    {
      id: 2
      start: "2018-01-02T09:00:00",
      end: "2018-01-02T13:00:00",
      resource: "B",
      text: "Event 2"
    }
    ]
*/



  var dp = new DayPilot.Scheduler("dp", {
    timeHeaders: [{"groupBy":"Month"},{"groupBy":"Day","format":"d"}],
    scale: "Day",
    days: DayPilot.Date.today().daysInMonth(),
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    timeRangeSelectedHandling: "Disabled",
    moveBy :  "none"
  });



  dp.rowHeaderColumns = [
    { name: "Name", display: "name"},
    { name: "Beds", display: "size"}
  ];

  // dp.resources = {};
  
  dp.events.list = [
    {
      "id": 1,
      "resource": "5e95ed4f0b15f318d4b9076f",
      "start": "2020-04-04T00:00:00",
      "end": "2020-04-08T00:00:00",
      "text": "Booked 4837498439",
      "cssClass": "event_booked",
    },
    {
        "id": 2,
        "resource": "5e95ed770b15f318d4b90770",
        "start": "2020-04-05T00:00:00",
        "end": "2020-04-10T00:00:00",
        "text": "Booked 338439483434",
        "cssClass": "event_booked",
      }
  ];

  dp.onBeforeEventRender = function(args) {
    args.data.bubbleHtml = "Additional information for: " + args.e.text;
  };


  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        dp.resources = JSON.parse(xmlHttp.response);
        dp.init();
      }
  }
  xmlHttp.open("GET", AppHelper.baseUrl+"agent/timeline_rooms", true);
  xmlHttp.send(null);



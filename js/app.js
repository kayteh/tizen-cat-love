function rotateElement(elementID, angle)
{
   var element = document.querySelector("#" + elementID);

   element.style.transform = "rotate(" + angle + "deg)";
}

function updateTime()
{
   var datetime = tizen.time.getCurrentDateTime(),
       hour = datetime.getHours(),
       minute = datetime.getMinutes(),
       second = datetime.getSeconds();

   /* Rotate the hour/minute/second hands */
   rotateElement("hand-main-hour", (hour + (minute / 60) + (second / 3600)) * 30);
   rotateElement("hand-main-minute", (minute + second / 60) * 6);
   rotateElement("hand-main-second", second * 6);
}

function bindEvents()
{
   /* Add an event listener to update the screen immediately when the device wakes up */
   document.addEventListener("visibilitychange", function()
   {
      if (!document.hidden)
      {
         updateTime();
      }
   });

   /* Add eventListener to update the screen when the time zone changes */
   tizen.time.setTimezoneChangeListener(function()
   {
      updateTime();
   });
}
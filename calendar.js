(function () {

  function applyChanges() {

    if (typeof scheduler === "undefined") {
      setTimeout(applyChanges, 200);
      return;
    }

    scheduler.templates.quick_info_title = function(start, end, event) {
      return event.text;
    };

    scheduler.templates.quick_info_content = function(start, end, event) {
      let html = "";

      if (event.location) {
        const locationText =
          typeof event.location === "object"
            ? event.location.text
            : event.location;

        if (locationText) {
          html +=
            "<div style='margin-bottom:12px'>" +
            locationText +
            "</div>";
        }
      }

      const match =
        String(event.url || "").match(/event_id=([^&]+)/);

      if (match) {
        const eventId = encodeURIComponent(match[1]);

        html +=
          "<a href='https://krisbaxtina-create.github.io/dobro-calendar/?event=" +
          eventId +
          "' target='_self' " +
          "style='" +
          "display:inline-block;" +
          "margin-top:4px;" +
          "color:#6d28d9;" +
          "font-weight:700;" +
          "text-decoration:none;" +
          "cursor:pointer" +
          "'>" +
          "Подробнее →" +
          "</a>";
      }

      return html;
    };

    if (!document.getElementById("dobro-calendar-custom-style")) {
      const style = document.createElement("style");
      style.id = "dobro

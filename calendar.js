(function () {
  function applyChanges() {
    if (typeof scheduler === "undefined") {
      setTimeout(applyChanges, 300);
      return;
    }

    scheduler.templates.quick_info_title = function (start, end, event) {
      return event.text;
    };

    scheduler.templates.quick_info_content = function (start, end, event) {
      var html = "";

      if (event.location) {
        var place = typeof event.location === "object"
          ? event.location.text
          : event.location;

        if (place) {
          html += "<div style=\"margin-bottom:12px\">" + place + "</div>";
        }
      }

      var match = String(event.url || "").match(/event_id=([^&]+)/);

      if (match) {
        html +=
          "<a href=\"https://krisbaxtina-create.github.io/dobro-calendar/?event=" +
          encodeURIComponent(match[1]) +
          "\" target=\"_self\" style=\"color:#6d28d9;font-weight:700;text-decoration:none\">" +
          "Подробнее →</a>";
      }

      return html;
    };

    var style = document.createElement("style");
    style.textContent = ".dhx_qi_big_icon.icon_subscribe{display:none!important;}";
    document.head.appendChild(style);
  }

  setTimeout(applyChanges, 1500);
})();

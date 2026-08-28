(function () {

  function applyChanges() {

    if (typeof scheduler === "undefined") {
      setTimeout(applyChanges, 300);
      return;
    }

    // Заголовок без цепочки и ссылки на Яндекс
    scheduler.templates.quick_info_title = function (start, end, event) {
      return event.text;
    };

    // Содержимое карточки
    scheduler.templates.quick_info_content = function (start, end, event) {

      var html = "";

      // Место проведения
      if (event.location) {

        var place =
          typeof event.location === "object"
            ? event.location.text
            : event.location;

        if (place) {
          html +=
            "<div style=\"margin-bottom:12px\">" +
            place +
            "</div>";
        }
      }

      // Получаем event_id Яндекса
      var match =
        String(event.url || "").match(/event_id=([^&]+)/);

      if (match) {

        var detailsUrl =
          "https://krisbaxtina-create.github.io/dobro-calendar/?event=" +
          encodeURIComponent(match[1]);

        html +=
          "<button type=\"button\" " +
          "class=\"dobro-details-button\" " +
          "data-url=\"" + detailsUrl + "\">" +
          "Подробнее →" +
          "</button>";
      }

      return html;
    };

    // Стили
    if (!document.getElementById("dobro-calendar-style")) {

      var style = document.createElement("style");
      style.id = "dobro-calendar-style";

      style.textContent =
        ".dhx_qi_big_icon.icon_subscribe{" +
        "display:none!important;" +
        "}" +

        ".dobro-details-button{" +
        "display:inline-block!important;" +
        "background:none!important;" +
        "border:0!important;" +
        "padding:0!important;" +
        "margin:0!important;" +
        "color:#6d28d9!important;" +
        "font:inherit!important;" +
        "font-weight:700!important;" +
        "text-decoration:none!important;" +
        "cursor:pointer!important;" +
        "pointer-events:auto!important;" +
        "}" +

        ".dobro-details-button:hover{" +
        "text-decoration:underline!important;" +
        "}";

      document.head.appendChild(style);
    }
  }

  // Перехватываем нажатие раньше Open Web Calendar
  document.addEventListener(
    "mousedown",
    function (e) {
      var button = e.target.closest(".dobro-details-button");

      if (button) {
        e.stopPropagation();
      }
    },
    true
  );

  document.addEventListener(
    "click",
    function (e) {

      var button = e.target.closest(".dobro-details-button");

      if (!button) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      var url = button.getAttribute("data-url");

      if (url) {
        window.location.assign(url);
      }
    },
    true
  );

  setTimeout(applyChanges, 1500);

})();

(function () {

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatTime(date) {
    if (!(date instanceof Date)) {
      return "";
    }

    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function repositionQuickInfo() {
    setTimeout(function () {

      var popup = document.querySelector(".dhx_cal_quick_info");

      if (!popup) {
        return;
      }

      var rect = popup.getBoundingClientRect();
      var margin = 12;

      // Если карточка выходит за нижнюю границу окна —
      // поднимаем её вверх, не меняя ширину.
      if (rect.bottom > window.innerHeight - margin) {

        var overflow =
          rect.bottom - window.innerHeight + margin;

        var currentTop =
          parseFloat(popup.style.top) || rect.top;

        popup.style.top =
          Math.max(margin, currentTop - overflow) + "px";
      }

      // Не даём карточке выйти за верх окна.
      var newRect = popup.getBoundingClientRect();

      if (newRect.top < margin) {
        popup.style.top =
          (parseFloat(popup.style.top) +
            (margin - newRect.top)) + "px";
      }

    }, 30);
  }

  function applyChanges() {

    if (typeof scheduler === "undefined") {
      setTimeout(applyChanges, 300);
      return;
    }

    // Полное название мероприятия
    scheduler.templates.quick_info_title = function (start, end, event) {
      return escapeHtml(event.text);
    };

    // Убираем название календаря
    scheduler.templates.quick_info_date = function () {
      return "";
    };

    // Содержимое карточки
    scheduler.templates.quick_info_content = function (start, end, event) {

      var html = "";

      var startTime = formatTime(start);
      var endTime = formatTime(end);

      // Время
      if (startTime) {
        html +=
          "<div class=\"dobro-info-line\">" +
          escapeHtml(startTime);

        if (endTime) {
          html += " - " + escapeHtml(endTime);
        }

        html += "</div>";
      }

      // Место
      if (event.location) {

        var place =
          typeof event.location === "object"
            ? event.location.text
            : event.location;

        if (place) {
          html +=
            "<div class=\"dobro-info-line\">" +
            escapeHtml(place) +
            "</div>";
        }
      }

      // Получаем event_id Яндекс.Календаря
      var match =
        String(event.url || "").match(/event_id=([^&]+)/);

      // Кнопка «Подробнее»
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

        // Убираем «Добавить в календарь»
        ".dhx_qi_big_icon.icon_subscribe{" +
        "display:none!important;" +
        "}" +

        // Фиксированная ширина карточки.
        // Длинное название увеличивает её вниз.
        ".dhx_cal_quick_info{" +
        "width:260px!important;" +
        "max-width:260px!important;" +
        "}" +

        // Заголовок может занимать несколько строк
        ".dhx_cal_qi_title{" +
        "height:auto!important;" +
        "min-height:0!important;" +
        "}" +

        ".dhx_cal_qi_tcontent{" +
        "height:auto!important;" +
        "min-height:0!important;" +
        "white-space:normal!important;" +
        "overflow:visible!important;" +
        "text-overflow:clip!important;" +
        "word-break:normal!important;" +
        "overflow-wrap:break-word!important;" +
        "line-height:1.25!important;" +
        "padding-top:0!important;" +
        "padding-bottom:0!important;" +
        "}" +

        // Убираем стандартную строку с названием календаря
        ".dhx_cal_qi_tdate{" +
        "display:none!important;" +
        "}" +

        // Компактное содержимое
        ".dhx_cal_qi_content{" +
        "padding-top:6px!important;" +
        "padding-bottom:8px!important;" +
        "}" +

        ".dobro-info-line{" +
        "margin:0!important;" +
        "padding:0!important;" +
        "line-height:1.35!important;" +
        "}" +

        // Подробнее
        ".dobro-details-button{" +
        "display:block!important;" +
        "background:none!important;" +
        "border:0!important;" +
        "padding:0!important;" +
        "margin:5px 0 0 0!important;" +
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

    // Перенос карточки вверх у нижнего края экрана
    if (!window.dobroQuickInfoPositionAttached) {

      window.dobroQuickInfoPositionAttached = true;

      if (typeof scheduler.attachEvent === "function") {
        scheduler.attachEvent(
          "onQuickInfo",
          function () {
            repositionQuickInfo();
            return true;
          }
        );
      }

      window.addEventListener(
        "resize",
        repositionQuickInfo
      );
    }
  }

  // Рабочая логика кнопки «Подробнее»
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

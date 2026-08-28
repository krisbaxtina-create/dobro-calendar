(function () {

  /* =========================================================
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
     ========================================================= */

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

  function getRussianMonth(date) {
    var months = [
      "ЯНВАРЬ",
      "ФЕВРАЛЬ",
      "МАРТ",
      "АПРЕЛЬ",
      "МАЙ",
      "ИЮНЬ",
      "ИЮЛЬ",
      "АВГУСТ",
      "СЕНТЯБРЬ",
      "ОКТЯБРЬ",
      "НОЯБРЬ",
      "ДЕКАБРЬ"
    ];

    return months[date.getMonth()];
  }


  /* =========================================================
     ПОЗИЦИОНИРОВАНИЕ ВСПЛЫВАЮЩЕЙ КАРТОЧКИ
     ========================================================= */

  function repositionQuickInfo() {

    setTimeout(function () {

      var popup = document.querySelector(".dhx_cal_quick_info");

      if (!popup) {
        return;
      }

      var rect = popup.getBoundingClientRect();
      var margin = 20;

      /*
       * Если карточка выходит за нижний край экрана,
       * поднимаем её вверх.
       */
      if (rect.bottom > window.innerHeight - margin) {

        var overflow =
          rect.bottom - window.innerHeight + margin;

        var currentTop =
          parseFloat(popup.style.top);

        if (isNaN(currentTop)) {
          currentTop = rect.top + window.scrollY;
        }

        popup.style.top =
          Math.max(
            margin,
            currentTop - overflow - 10
          ) + "px";
      }

      /*
       * Не позволяем карточке уйти выше окна.
       */
      var newRect = popup.getBoundingClientRect();

      if (newRect.top < margin) {

        var top =
          parseFloat(popup.style.top);

        if (isNaN(top)) {
          top = margin;
        }

        popup.style.top =
          (top + margin - newRect.top) + "px";
      }

    }, 40);
  }


  /* =========================================================
     ОСНОВНЫЕ ИЗМЕНЕНИЯ OPEN WEB CALENDAR
     ========================================================= */

  function applyChanges() {

    if (typeof scheduler === "undefined") {
      setTimeout(applyChanges, 300);
      return;
    }


    /* ---------------------------------------------------------
       БОЛЬШОЙ МЕСЯЦ + ГОД
       --------------------------------------------------------- */

    scheduler.templates.month_date = function (date) {

      return (
        "<div class=\"dobro-month-title\">" +
          "<div class=\"dobro-month-name\">" +
            getRussianMonth(date) +
          "</div>" +
          "<div class=\"dobro-month-year\">" +
            date.getFullYear() +
          "</div>" +
        "</div>"
      );
    };


    /* ---------------------------------------------------------
       ЗАГОЛОВОК ВСПЛЫВАЮЩЕЙ КАРТОЧКИ
       --------------------------------------------------------- */

    scheduler.templates.quick_info_title =
      function (start, end, event) {

        return escapeHtml(event.text);
      };


    /*
     * Отключаем стандартную строку,
     * где Open Web Calendar показывал
     * название календаря / категорию.
     */
    scheduler.templates.quick_info_date =
      function () {
        return "";
      };


    /* ---------------------------------------------------------
       СОДЕРЖИМОЕ ВСПЛЫВАЮЩЕЙ КАРТОЧКИ
       --------------------------------------------------------- */

    scheduler.templates.quick_info_content =
      function (start, end, event) {

        var html = "";

        var startTime = formatTime(start);
        var endTime = formatTime(end);


        /* Время */

        if (startTime) {

          html +=
            "<div class=\"dobro-info-line\">" +
              "<span class=\"dobro-info-icon\">◷</span>" +
              "<span>" +
                escapeHtml(startTime);

          if (endTime) {
            html +=
              "–" +
              escapeHtml(endTime);
          }

          html +=
              "</span>" +
            "</div>";
        }


        /* Место */

        if (event.location) {

          var place =
            typeof event.location === "object"
              ? event.location.text
              : event.location;

          if (place) {

            html +=
              "<div class=\"dobro-info-line\">" +
                "<span class=\"dobro-info-icon\">⌖</span>" +
                "<span>" +
                  escapeHtml(place) +
                "</span>" +
              "</div>";
          }
        }


        /* event_id Яндекс.Календаря */

        var match =
          String(event.url || "")
            .match(/event_id=([^&]+)/);


        /* Кнопка Подробнее */

        if (match) {

          var detailsUrl =
            "https://krisbaxtina-create.github.io/dobro-calendar/?event=" +
            encodeURIComponent(match[1]);

          html +=
            "<button " +
              "type=\"button\" " +
              "class=\"dobro-details-button\" " +
              "data-url=\"" +
              detailsUrl +
              "\">" +
              "Подробнее →" +
            "</button>";
        }

        return html;
      };


    /* =========================================================
       СТИЛИ
       ========================================================= */

    if (!document.getElementById("dobro-calendar-style")) {

      var style =
        document.createElement("style");

      style.id = "dobro-calendar-style";

      style.textContent = `

        /* =====================================================
           ОСНОВА СТРАНИЦЫ
           ===================================================== */

        html,
        body {
          background:#F5F0E8 !important;
        }

        body {
          margin:0 !important;
          padding:28px !important;
          box-sizing:border-box !important;
        }

        .dhx_cal_container {
          background:#FBF8F2 !important;
          border-radius:34px !important;
          overflow:hidden !important;
          box-shadow:
            0 12px 35px rgba(40,30,20,0.06) !important;
        }


        /* =====================================================
           ВЕРХНЯЯ ЧАСТЬ
           ===================================================== */

        .dhx_cal_navline {
          height:190px !important;
          background:#FBF8F2 !important;
          border:0 !important;
        }


        /* Большой месяц */

        .dhx_cal_date {
          position:absolute !important;
          top:28px !important;
          left:38px !important;
          width:auto !important;
          height:auto !important;
          line-height:1 !important;
          text-align:left !important;
          color:#111111 !important;
        }

        .dobro-month-title {
          display:flex !important;
          flex-direction:column !important;
          align-items:flex-start !important;
        }

        .dobro-month-name {
          font-size:46px !important;
          line-height:0.95 !important;
          font-weight:900 !important;
          letter-spacing:-1.8px !important;
          color:#111111 !important;
        }

        .dobro-month-year {
          margin-top:7px !important;
          font-size:32px !important;
          line-height:1 !important;
          font-weight:400 !important;
          color:#111111 !important;
        }


        /* =====================================================
           КНОПКИ НАЗАД / ВПЕРЁД / СЕГОДНЯ
           ===================================================== */

        .dhx_cal_prev_button,
        .dhx_cal_next_button,
        .dhx_cal_today_button {
          top:130px !important;
          height:42px !important;
          border:1px solid #E5DDD1 !important;
          border-radius:13px !important;
          background:#F7F1E8 !important;
          box-shadow:none !important;
          color:#111111 !important;
          font-weight:600 !important;
          transition:
            background .15s ease,
            transform .15s ease !important;
        }

        .dhx_cal_prev_button:hover,
        .dhx_cal_next_button:hover,
        .dhx_cal_today_button:hover {
          background:#EFE7DB !important;
        }

        .dhx_cal_prev_button:active,
        .dhx_cal_next_button:active,
        .dhx_cal_today_button:active {
          transform:scale(.97) !important;
        }


        .dhx_cal_prev_button {
          left:38px !important;
          width:58px !important;
        }

        .dhx_cal_next_button {
          left:106px !important;
          width:58px !important;
        }

        .dhx_cal_today_button {
          left:174px !important;
          width:105px !important;
        }


        /*
         * Убираем меню-гамбургер:
         * справа сверху пока ничего не размещаем.
         */

        .dhx_cal_tab,
        .dhx_cal_navline .dhx_cal_menu_button,
        .dhx_cal_menu_button {
          display:none !important;
        }


        /* =====================================================
           ШАПКА ДНЕЙ НЕДЕЛИ
           ===================================================== */

        .dhx_cal_header {
          background:#FBF8F2 !important;
          border-top:1px solid #DED5C8 !important;
          border-bottom:1px solid #DED5C8 !important;
        }

        .dhx_scale_bar {
          background:#FBF8F2 !important;
          border-color:#DED5C8 !important;
          color:#171717 !important;
          font-size:13px !important;
          font-weight:800 !important;
          text-transform:uppercase !important;
        }


        /* =====================================================
           СЕТКА КАЛЕНДАРЯ
           ===================================================== */

        .dhx_cal_data {
          background:#FBF8F2 !important;
        }

        .dhx_month_body {
          background:#FBF8F2 !important;
          border-color:#D8D0C5 !important;
        }

        .dhx_month_head {
          background:transparent !important;
          border:0 !important;

          /*
           * Тёмная плашка с номером дня
           */
          color:#FFFFFF !important;
          background:#171717 !important;

          width:36px !important;
          height:30px !important;

          margin:0 !important;
          padding:0 !important;

          display:flex !important;
          align-items:center !important;
          justify-content:center !important;

          border-radius:6px !important;

          font-size:13px !important;
          font-weight:800 !important;

          line-height:30px !important;

          position:relative !important;
          top:7px !important;
          left:7px !important;

          box-sizing:border-box !important;
        }


        /*
         * Ячейки сетки остаются прямыми:
         * специально НЕ добавляем border-radius.
         */

        .dhx_cal_data table,
        .dhx_cal_data td {
          border-color:#D8D0C5 !important;
        }


        /* =====================================================
           СОБЫТИЯ
           ===================================================== */

        .dhx_cal_event_clear {
          margin-left:7px !important;
          margin-right:7px !important;
          padding:7px 11px !important;

          min-height:30px !important;
          height:auto !important;

          border-radius:8px !important;

          font-size:12px !important;
          line-height:1.25 !important;
          font-weight:600 !important;

          white-space:normal !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;

          box-sizing:border-box !important;

          box-shadow:none !important;
        }


        /*
         * Первый календарь — фиолетовый
         */

        .CALENDAR-INDEX-0,
        .CALENDAR-INDEX-0 .dhx_body,
        .CALENDAR-INDEX-0 .dhx_title {
          background:#CFA6F2 !important;
          color:#171717 !important;
          border-color:#CFA6F2 !important;
          border-radius:8px !important;
        }


        /*
         * Второй календарь — оранжевый
         */

        .CALENDAR-INDEX-1,
        .CALENDAR-INDEX-1 .dhx_body,
        .CALENDAR-INDEX-1 .dhx_title {
          background:#FFB454 !important;
          color:#171717 !important;
          border-color:#FFB454 !important;
          border-radius:8px !important;
        }


        /* Убираем декоративную точку */

        .dhx_cal_event_clear::before,
        .dhx_cal_qi_tcontent::before {
          display:none !important;
        }


        /* =====================================================
           ВСПЛЫВАЮЩАЯ КАРТОЧКА
           ===================================================== */

        .dhx_cal_quick_info {

          width:330px !important;
          max-width:calc(100vw - 40px) !important;

          height:auto !important;

          padding:0 !important;

          background:#FBF8F2 !important;

          border:1px solid #E5DDD1 !important;
          border-radius:22px !important;

          box-shadow:
            0 15px 38px rgba(35,25,15,0.15) !important;

          overflow:hidden !important;
        }


        /* Верх карточки */

        .dhx_cal_qi_title {
          position:relative !important;

          height:auto !important;
          min-height:0 !important;

          padding:24px 48px 7px 24px !important;

          background:#FBF8F2 !important;

          border:0 !important;
        }


        /* Полное название */

        .dhx_cal_qi_tcontent {

          height:auto !important;
          min-height:0 !important;

          padding:0 !important;
          margin:0 !important;

          white-space:normal !important;

          overflow:visible !important;
          text-overflow:clip !important;

          overflow-wrap:anywhere !important;
          word-break:normal !important;

          color:#171717 !important;

          font-size:23px !important;
          line-height:1.15 !important;
          font-weight:800 !important;
        }


        /*
         * Стандартная строка календаря скрыта.
         */

        .dhx_cal_qi_tdate {
          display:none !important;
        }


        /*
         * Кнопка закрытия
         */

        .dhx_cal_qi_close {
          position:absolute !important;
          top:18px !important;
          right:18px !important;

          width:30px !important;
          height:30px !important;

          border-radius:50% !important;

          background:transparent !important;

          color:#171717 !important;
        }


        /* Содержимое */

        .dhx_cal_qi_content {

          padding:5px 24px 24px 24px !important;

          background:#FBF8F2 !important;

          color:#171717 !important;

          font-size:14px !important;
          line-height:1.45 !important;
        }


        /*
         * Время и место идут подряд
         */

        .dobro-info-line {

          display:flex !important;
          align-items:flex-start !important;

          gap:9px !important;

          margin:0 0 4px 0 !important;
          padding:0 !important;

          color:#171717 !important;

          line-height:1.4 !important;
        }

        .dobro-info-icon {

          display:inline-flex !important;

          width:18px !important;
          min-width:18px !important;

          justify-content:center !important;

          color:#171717 !important;

          font-size:16px !important;
          line-height:1.25 !important;
        }


        /* Подробнее */

        .dobro-details-button {

          display:block !important;

          width:100% !important;

          margin:17px 0 0 0 !important;
          padding:11px 16px !important;

          box-sizing:border-box !important;

          background:transparent !important;

          border:2px solid #7C3AED !important;
          border-radius:12px !important;

          color:#7C3AED !important;

          font:inherit !important;
          font-weight:800 !important;

          text-align:center !important;

          cursor:pointer !important;
          pointer-events:auto !important;

          transition:
            background .15s ease,
            color .15s ease,
            transform .15s ease !important;
        }

        .dobro-details-button:hover {
          background:#7C3AED !important;
          color:#FFFFFF !important;
        }

        .dobro-details-button:active {
          transform:scale(.98) !important;
        }


        /*
         * Добавить в календарь — скрыто
         */

        .dhx_qi_big_icon.icon_subscribe {
          display:none !important;
        }


        /* =====================================================
           МОБИЛЬНАЯ ВЕРСИЯ
           ===================================================== */

        @media (max-width:700px) {

          body {
            padding:8px !important;
          }

          .dhx_cal_container {
            border-radius:20px !important;
          }

          .dhx_cal_navline {
            height:165px !important;
          }

          .dhx_cal_date {
            top:22px !important;
            left:20px !important;
          }

          .dobro-month-name {
            font-size:34px !important;
            letter-spacing:-1px !important;
          }

          .dobro-month-year {
            font-size:26px !important;
          }

          .dhx_cal_prev_button,
          .dhx_cal_next_button,
          .dhx_cal_today_button {
            top:112px !important;
          }

          .dhx_cal_prev_button {
            left:20px !important;
          }

          .dhx_cal_next_button {
            left:87px !important;
          }

          .dhx_cal_today_button {
            left:154px !important;
          }

          .dhx_scale_bar {
            font-size:10px !important;
          }

          .dhx_month_head {
            width:29px !important;
            height:26px !important;
            line-height:26px !important;
            font-size:11px !important;

            top:5px !important;
            left:5px !important;
          }

          .dhx_cal_event_clear {

            margin-left:4px !important;
            margin-right:4px !important;

            padding:5px 7px !important;

            font-size:10px !important;
          }

          .dhx_cal_quick_info {
            width:calc(100vw - 28px) !important;
            max-width:360px !important;
          }

          .dhx_cal_qi_title {
            padding:
              20px 44px 6px 20px !important;
          }

          .dhx_cal_qi_tcontent {
            font-size:20px !important;
          }

          .dhx_cal_qi_content {
            padding:
              5px 20px 20px 20px !important;
          }

        }

      `;

      document.head.appendChild(style);
    }


    /* =========================================================
       ПОЗИЦИЯ QUICK INFO
       ========================================================= */

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


    /*
     * Перерисовываем календарь, чтобы сразу применился
     * новый шаблон месяца.
     */
    try {
      scheduler.updateView();
    } catch (e) {}
  }


  /* =========================================================
     КНОПКА «ПОДРОБНЕЕ»
     Рабочую логику V1/V2 сохраняем.
     ========================================================= */

  document.addEventListener(
    "mousedown",
    function (e) {

      var button =
        e.target.closest(".dobro-details-button");

      if (button) {
        e.stopPropagation();
      }
    },
    true
  );


  document.addEventListener(
    "click",
    function (e) {

      var button =
        e.target.closest(".dobro-details-button");

      if (!button) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      var url =
        button.getAttribute("data-url");

      if (url) {
        window.location.assign(url);
      }
    },
    true
  );


  /* =========================================================
     ЗАПУСК
     ========================================================= */

  setTimeout(applyChanges, 1500);

})();

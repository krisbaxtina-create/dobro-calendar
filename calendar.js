(function () {

  /* =========================================================
     ОБЩИЕ ФУНКЦИИ
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

  function getRussianWeekday(date) {
    var days = [
      "ВОСКРЕСЕНЬЕ",
      "ПОНЕДЕЛЬНИК",
      "ВТОРНИК",
      "СРЕДА",
      "ЧЕТВЕРГ",
      "ПЯТНИЦА",
      "СУББОТА"
    ];

    return days[date.getDay()];
  }


  /* =========================================================
     НАША ВЕРХНЯЯ ПАНЕЛЬ
     ========================================================= */

  function setDobroHeader() {

    if (typeof scheduler === "undefined") {
      return;
    }

    /*
     * Используем штатную систему DHTMLX.
     * Первая строка — месяц и год.
     * Вторая — назад, вперёд, сегодня.
     *
     * Hamburger/menu сюда специально не включаем.
     */
    scheduler.config.header = {
      rows: [
        {
          cols: [
            "date",
            "spacer"
          ]
        },
        {
          cols: [
            "prev",
            "next",
            "today",
            "spacer"
          ]
        }
      ]
    };
  }


  /* =========================================================
     ПОЗИЦИЯ ВСПЛЫВАЮЩЕЙ КАРТОЧКИ
     ========================================================= */

  function repositionQuickInfo() {

    setTimeout(function () {

      var popup =
        document.querySelector(".dhx_cal_quick_info");

      if (!popup) {
        return;
      }

      var rect =
        popup.getBoundingClientRect();

      var margin = 16;


      /*
       * Если карточка выходит вниз —
       * поднимаем её.
       */
      if (rect.bottom > window.innerHeight - margin) {

        var overflow =
          rect.bottom -
          window.innerHeight +
          margin;

        var currentTop =
          parseFloat(popup.style.top);

        if (isNaN(currentTop)) {
          currentTop =
            rect.top + window.scrollY;
        }

        popup.style.top =
          Math.max(
            margin,
            currentTop - overflow - 8
          ) + "px";
      }


      /*
       * Не даём карточке уйти выше окна.
       */
      var corrected =
        popup.getBoundingClientRect();

      if (corrected.top < margin) {

        var top =
          parseFloat(popup.style.top);

        if (isNaN(top)) {
          top = margin;
        }

        popup.style.top =
          (top + margin - corrected.top) +
          "px";
      }

    }, 40);
  }


  /* =========================================================
     ОСНОВНЫЕ НАСТРОЙКИ
     ========================================================= */

  function applyChanges() {

    if (typeof scheduler === "undefined") {
      setTimeout(applyChanges, 300);
      return;
    }


    /* ---------------------------------------------------------
       HEADER
       --------------------------------------------------------- */

    setDobroHeader();


    /*
     * OWC сам пересобирает header при смене месяца
     * и изменении размера окна.
     * Поэтому после его действий снова возвращаем наш header.
     */

    if (!window.dobroHeaderEventsAttached) {

      window.dobroHeaderEventsAttached = true;

      scheduler.attachEvent(
        "onBeforeViewChange",
        function () {
          setDobroHeader();
          return true;
        }
      );

      scheduler.attachEvent(
        "onSchedulerResize",
        function () {
          setDobroHeader();
          return true;
        }
      );
    }


    /* ---------------------------------------------------------
       МЕСЯЦ + ГОД
       --------------------------------------------------------- */

    scheduler.templates.month_date =
      function (date) {

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
       ДНИ НЕДЕЛИ
       --------------------------------------------------------- */

    scheduler.templates.month_scale_date =
      function (date) {
        return getRussianWeekday(date);
      };


    /* ---------------------------------------------------------
       НОМЕР ДНЯ
       ВАЖНО: сам .dhx_month_head больше НЕ переделываем.
       --------------------------------------------------------- */

    scheduler.templates.month_day =
      function (date) {

        return (
          "<span class=\"dobro-day-number\">" +
            date.getDate() +
          "</span>"
        );
      };


    /* ---------------------------------------------------------
       ВСПЛЫВАЮЩАЯ КАРТОЧКА
       --------------------------------------------------------- */

    scheduler.templates.quick_info_title =
      function (start, end, event) {

        return escapeHtml(event.text);
      };


    /*
     * Убираем название календаря.
     */
    scheduler.templates.quick_info_date =
      function () {
        return "";
      };


    scheduler.templates.quick_info_content =
      function (start, end, event) {

        var html = "";

        var startTime =
          formatTime(start);

        var endTime =
          formatTime(end);


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


        /* ID события */

        var match =
          String(event.url || "")
            .match(/event_id=([^&]+)/);


        /* Подробнее */

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

    var oldStyle =
      document.getElementById("dobro-calendar-style");

    if (oldStyle) {
      oldStyle.remove();
    }


    var style =
      document.createElement("style");

    style.id =
      "dobro-calendar-style";

    style.textContent = `

      /* =====================================================
         СТРАНИЦА
         ===================================================== */

      html {
        background:#F5F0E8 !important;
      }

      body {
        margin:0 !important;
        padding:14px !important;

        min-height:100vh !important;

        box-sizing:border-box !important;

        background:#F5F0E8 !important;
      }


      .dhx_cal_container {

        width:100% !important;

        height:calc(100vh - 28px) !important;
        min-height:620px !important;

        box-sizing:border-box !important;

        background:#FBF8F2 !important;

        border-radius:30px !important;

        overflow:hidden !important;

        box-shadow:
          0 10px 30px
          rgba(45,35,25,0.06) !important;
      }


      /* =====================================================
         ВЕРХНЯЯ ПАНЕЛЬ
         ===================================================== */

      .dhx_cal_navline {

        min-height:146px !important;
        height:146px !important;

        box-sizing:border-box !important;

        padding:
          22px
          26px
          14px
          26px !important;

        background:#FBF8F2 !important;

        border:0 !important;
      }


      /*
       * Прячем гамбургер Open Web Calendar.
       */

      .owc_nav_burger_menu,
      .hamburger-menu {
        display:none !important;
      }


      /* =====================================================
         МЕСЯЦ
         ===================================================== */

      .dhx_cal_date {

        text-align:left !important;

        justify-content:flex-start !important;
        align-items:flex-start !important;

        overflow:visible !important;

        color:#111111 !important;
      }


      .dobro-month-title {

        display:flex !important;
        flex-direction:column !important;

        align-items:flex-start !important;
        justify-content:flex-start !important;

        width:100% !important;

        text-align:left !important;
      }


      .dobro-month-name {

        margin:0 !important;
        padding:0 !important;

        font-size:40px !important;
        line-height:.95 !important;

        font-weight:900 !important;

        letter-spacing:-1.5px !important;

        color:#111111 !important;
      }


      .dobro-month-year {

        margin-top:5px !important;

        font-size:27px !important;
        line-height:1 !important;

        font-weight:400 !important;

        color:#111111 !important;
      }


      /* =====================================================
         КНОПКИ НАВИГАЦИИ
         ===================================================== */

      .dhx_cal_prev_button,
      .dhx_cal_next_button,
      .dhx_cal_today_button {

        height:36px !important;

        min-height:36px !important;

        margin-top:4px !important;

        background:#F6EFE6 !important;

        border:
          1px solid #E2D8CB !important;

        border-radius:11px !important;

        box-shadow:none !important;

        color:#171717 !important;

        font-size:13px !important;
        font-weight:700 !important;
      }


      .dhx_cal_prev_button,
      .dhx_cal_next_button {

        width:48px !important;
        min-width:48px !important;
      }


      .dhx_cal_today_button {

        width:96px !important;
        min-width:96px !important;
      }


      .dhx_cal_prev_button:hover,
      .dhx_cal_next_button:hover,
      .dhx_cal_today_button:hover {

        background:#ECE3D8 !important;
      }


      /* =====================================================
         ДНИ НЕДЕЛИ
         ===================================================== */

      .dhx_cal_header {

        background:#FBF8F2 !important;

        border-top:
          1px solid #D8D0C5 !important;

        border-bottom:
          1px solid #D8D0C5 !important;
      }


      .dhx_scale_bar {

        background:#FBF8F2 !important;

        border-color:#D8D0C5 !important;

        color:#171717 !important;

        font-size:12px !important;

        font-weight:800 !important;

        line-height:1.1 !important;

        text-transform:uppercase !important;
      }


      /* =====================================================
         СЕТКА
         ===================================================== */

      .dhx_cal_data {
        background:#FBF8F2 !important;
      }


      .dhx_month_body {

        background:#FBF8F2 !important;

        border-color:#D8D0C5 !important;
      }


      /*
       * Ключевое исправление.
       *
       * Сам контейнер номера дня остаётся штатного размера.
       * Мы больше НЕ превращаем его во flex,
       * НЕ задаём ему ширину 36px
       * и НЕ двигаем position/top/left.
       */

      .dhx_month_head {

        background:#FBF8F2 !important;

        border-color:#D8D0C5 !important;

        color:#171717 !important;

        text-align:left !important;

        box-sizing:border-box !important;
      }


      /*
       * Чёрная плашка теперь находится ВНУТРИ
       * штатного контейнера номера дня.
       */

      .dobro-day-number {

        display:inline-flex !important;

        align-items:center !important;
        justify-content:center !important;

        min-width:26px !important;
        height:24px !important;

        margin:
          2px
          0
          0
          6px !important;

        padding:
          0
          5px !important;

        box-sizing:border-box !important;

        background:#171717 !important;

        border-radius:5px !important;

        color:#FFFFFF !important;

        font-size:11px !important;
        line-height:24px !important;

        font-weight:800 !important;
      }


      .dhx_cal_data table,
      .dhx_cal_data td {

        border-color:#D8D0C5 !important;
      }


      /* =====================================================
         СОБЫТИЯ
         ===================================================== */

      .dhx_cal_event_clear {

        margin-left:6px !important;
        margin-right:6px !important;

        padding:
          5px
          9px !important;

        box-sizing:border-box !important;

        border-radius:8px !important;

        font-size:11px !important;

        line-height:1.2 !important;

        font-weight:650 !important;

        white-space:nowrap !important;

        overflow:hidden !important;

        text-overflow:ellipsis !important;

        box-shadow:none !important;
      }


      /*
       * Фиолетовый календарь
       */

      .CALENDAR-INDEX-0,
      .CALENDAR-INDEX-0 .dhx_body,
      .CALENDAR-INDEX-0 .dhx_title {

        background:#CFA6F2 !important;

        border-color:#CFA6F2 !important;

        color:#171717 !important;

        border-radius:8px !important;
      }


      /*
       * Оранжевый календарь
       */

      .CALENDAR-INDEX-1,
      .CALENDAR-INDEX-1 .dhx_body,
      .CALENDAR-INDEX-1 .dhx_title {

        background:#FFB454 !important;

        border-color:#FFB454 !important;

        color:#171717 !important;

        border-radius:8px !important;
      }


      .dhx_cal_event_clear::before,
      .dhx_cal_qi_tcontent::before {

        display:none !important;
      }


      /* =====================================================
         QUICK INFO
         ===================================================== */

      .dhx_cal_quick_info {

        width:310px !important;

        max-width:
          calc(100vw - 32px) !important;

        height:auto !important;

        padding:0 !important;

        background:#FBF8F2 !important;

        border:
          1px solid #E4DACE !important;

        border-radius:20px !important;

        box-shadow:
          0 14px 34px
          rgba(40,30,20,0.14) !important;

        overflow:hidden !important;
      }


      .dhx_cal_qi_title {

        position:relative !important;

        height:auto !important;

        min-height:0 !important;

        padding:
          18px
          42px
          5px
          20px !important;

        box-sizing:border-box !important;

        background:#FBF8F2 !important;

        border:0 !important;
      }


      /*
       * Здесь главное изменение:
       * 23px -> 18px.
       */

      .dhx_cal_qi_tcontent {

        height:auto !important;

        min-height:0 !important;

        margin:0 !important;
        padding:0 !important;

        color:#171717 !important;

        font-size:18px !important;

        line-height:1.18 !important;

        font-weight:800 !important;

        letter-spacing:0 !important;

        white-space:normal !important;

        overflow:visible !important;

        text-overflow:clip !important;

        overflow-wrap:break-word !important;

        word-break:normal !important;
      }


      .dhx_cal_qi_tdate {

        display:none !important;
      }


      .dhx_cal_qi_content {

        padding:
          4px
          20px
          20px
          20px !important;

        box-sizing:border-box !important;

        background:#FBF8F2 !important;

        color:#171717 !important;

        font-size:13px !important;

        line-height:1.35 !important;
      }


      .dobro-info-line {

        display:flex !important;

        align-items:flex-start !important;

        gap:7px !important;

        margin:
          0
          0
          3px
          0 !important;

        padding:0 !important;

        color:#171717 !important;

        font-size:13px !important;

        line-height:1.35 !important;
      }


      .dobro-info-icon {

        display:inline-flex !important;

        width:16px !important;
        min-width:16px !important;

        align-items:center !important;
        justify-content:center !important;

        color:#171717 !important;

        font-size:14px !important;

        line-height:1.2 !important;
      }


      /* =====================================================
         КНОПКА ПОДРОБНЕЕ
         ===================================================== */

      .dobro-details-button {

        display:block !important;

        width:100% !important;

        margin:
          13px
          0
          0
          0 !important;

        padding:
          9px
          13px !important;

        box-sizing:border-box !important;

        background:transparent !important;

        border:
          2px solid #7C3AED !important;

        border-radius:11px !important;

        color:#7C3AED !important;

        font:inherit !important;

        font-size:13px !important;

        font-weight:800 !important;

        line-height:1.2 !important;

        text-align:center !important;

        cursor:pointer !important;

        pointer-events:auto !important;
      }


      .dobro-details-button:hover {

        background:#7C3AED !important;

        color:#FFFFFF !important;
      }


      .dhx_qi_big_icon.icon_subscribe {

        display:none !important;
      }


      /* =====================================================
         ПЛАНШЕТЫ
         ===================================================== */

      @media
      (max-width:1000px) {

        body {
          padding:8px !important;
        }


        .dhx_cal_container {

          height:
            calc(100vh - 16px) !important;

          border-radius:22px !important;
        }


        .dhx_cal_navline {

          min-height:130px !important;

          height:130px !important;

          padding:
            18px
            20px
            10px
            20px !important;
        }


        .dobro-month-name {

          font-size:32px !important;

          letter-spacing:-1px !important;
        }


        .dobro-month-year {

          font-size:23px !important;
        }


        .dhx_scale_bar {

          font-size:10px !important;
        }


        .dhx_cal_event_clear {

          margin-left:3px !important;
          margin-right:3px !important;

          padding:
            4px
            6px !important;

          font-size:10px !important;
        }

      }


      /* =====================================================
         МОБИЛЬНАЯ ВЕРСИЯ
         ===================================================== */

      @media
      (max-width:650px) {

        body {

          padding:4px !important;
        }


        .dhx_cal_container {

          width:100% !important;

          height:
            calc(100vh - 8px) !important;

          min-height:600px !important;

          border-radius:16px !important;
        }


        .dhx_cal_navline {

          min-height:112px !important;

          height:112px !important;

          padding:
            14px
            12px
            8px
            12px !important;
        }


        .dobro-month-name {

          font-size:27px !important;

          letter-spacing:-.5px !important;
        }


        .dobro-month-year {

          margin-top:3px !important;

          font-size:20px !important;
        }


        .dhx_cal_prev_button,
        .dhx_cal_next_button {

          width:40px !important;

          min-width:40px !important;

          height:32px !important;

          min-height:32px !important;
        }


        .dhx_cal_today_button {

          width:82px !important;

          min-width:82px !important;

          height:32px !important;

          min-height:32px !important;

          font-size:11px !important;
        }


        .dhx_scale_bar {

          font-size:8px !important;

          font-weight:700 !important;
        }


        .dobro-day-number {

          min-width:21px !important;

          height:20px !important;

          margin-left:3px !important;

          padding:
            0
            3px !important;

          border-radius:4px !important;

          font-size:9px !important;

          line-height:20px !important;
        }


        .dhx_cal_event_clear {

          margin-left:2px !important;

          margin-right:2px !important;

          padding:
            3px
            4px !important;

          border-radius:5px !important;

          font-size:8px !important;

          line-height:1.15 !important;
        }


        .dhx_cal_quick_info {

          width:
            calc(100vw - 20px) !important;

          max-width:320px !important;
        }


        .dhx_cal_qi_title {

          padding:
            16px
            38px
            4px
            17px !important;
        }


        .dhx_cal_qi_tcontent {

          font-size:16px !important;
        }


        .dhx_cal_qi_content {

          padding:
            3px
            17px
            17px
            17px !important;

          font-size:12px !important;
        }


        .dobro-info-line {

          font-size:12px !important;
        }


        .dobro-details-button {

          margin-top:11px !important;

          padding:
            8px
            11px !important;

          font-size:12px !important;
        }

      }

    `;

    document.head.appendChild(style);


    /* =========================================================
       QUICK INFO POSITION
       ========================================================= */

    if (!window.dobroQuickInfoPositionAttached) {

      window.dobroQuickInfoPositionAttached = true;

      scheduler.attachEvent(
        "onQuickInfo",
        function () {

          repositionQuickInfo();

          return true;
        }
      );


      window.addEventListener(
        "resize",
        repositionQuickInfo
      );
    }


    /*
     * Перерисовываем после смены шаблонов.
     */
    try {

      scheduler.updateView();

    } catch (e) {}
  }


  /* =========================================================
     РАБОЧАЯ КНОПКА «ПОДРОБНЕЕ»
     ЭТУ ЛОГИКУ НЕ МЕНЯЕМ.
     ========================================================= */

  document.addEventListener(
    "mousedown",
    function (e) {

      var button =
        e.target.closest(
          ".dobro-details-button"
        );

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
        e.target.closest(
          ".dobro-details-button"
        );

      if (!button) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      var url =
        button.getAttribute(
          "data-url"
        );

      if (url) {
        window.location.assign(url);
      }
    },
    true
  );


  /* =========================================================
     ЗАПУСК
     ========================================================= */

  setTimeout(
    applyChanges,
    1500
  );

})();

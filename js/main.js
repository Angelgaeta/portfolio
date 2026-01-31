/*======== Fonction de chargement de fenêtre ========*/
$(window).on("load", function () {
  $(".loader").fadeOut();
  $(".preloader").delay(1000).fadeOut();

  if ($(".portfolio-items").length && $.fn.isotope) {
    var $elements = $(".portfolio-items"),
      $filters = $(".portfolio-filter ul li");

    $elements.isotope();

    $filters.on("click", function () {
      $filters.removeClass("active");
      $(this).addClass("active");

      var selector = $(this).data("filter");
      $elements.isotope({
        filter: selector,
        hiddenStyle: { transform: "scale(.2) skew(30deg)", opacity: 0 },
        visibleStyle: { transform: "scale(1) skew(0deg)", opacity: 1 },
        transitionDuration: ".5s",
      });
    });
  }
});

/*======== Document Ready Function ========*/
$(document).ready(function () {
  "use strict";

  /*======== SimpleBar Setup ========*/
  $(".pt-page").each(function () {
    var id = $(this).attr("id");
    if (!id) return;
    var el = document.getElementById(id);
    if (el && typeof SimpleBar !== "undefined") new SimpleBar(el);
  });

  $(document).on("mouseup", function (e) {
    var headerContainer = $(".header-main");
    if (
      !headerContainer.is(e.target) &&
      headerContainer.has(e.target).length === 0 &&
      $(e.target).closest(".header-toggle").length === 0
    ) {
      $(".header-content").removeClass("on");
    }
  });

  /*======== Fitty Setup ========*/
  if (typeof fitty === "function") {
    fitty(".header-name", { multiLine: false, maxSize: 20, minSize: 10 });
  }

  /*======== Active Current Link ========*/
  $(".nav-menu a").on("click", function () {
    $(".header-content").removeClass("on");
  });

  /*======== Mobile Toggle Click Setup ========*/
  $(".header-toggle").on("click", function () {
    $(".header-content").toggleClass("on");
  });

  /*========Clients OwlCarousel Setup========*/
  if ($(".clients .owl-carousel").length && $.fn.owlCarousel) {
    $(".clients .owl-carousel").owlCarousel({
      loop: true,
      margin: 30,
      autoplay: true,
      smartSpeed: 500,
      responsiveClass: true,
      autoplayHoverPause: true,
      dots: false,
      responsive: {
        0: { items: 2 },
        500: { items: 3 },
        700: { items: 4 },
        1000: { items: 6 },
      },
    });
  }

  /*========Testimonials OwlCarousel Setup========*/
  if ($(".testimonials .owl-carousel").length && $.fn.owlCarousel) {
    $(".testimonials .owl-carousel").owlCarousel({
      loop: true,
      margin: 30,
      autoplay: true,
      smartSpeed: 500,
      responsiveClass: true,
      dots: false,
      autoplayHoverPause: true,
      responsive: { 0: { items: 1 }, 800: { items: 1 }, 1000: { items: 2 } },
    });
  }

  /*======== Portfolio Image Link Setup ========*/
  if ($(".portfolio-items .image-link").length && $.fn.magnificPopup) {
    $(".portfolio-items .image-link").magnificPopup({
      type: "image",
      gallery: { enabled: true },
    });
  }

  /*======== Portfolio Video Link Setup ========*/
  if ($(".portfolio-items .video-link").length && $.fn.magnificPopup) {
    $(".portfolio-items .video-link").magnificPopup({
      type: "iframe",
      gallery: { enabled: true },
    });
  }

  /*======== Portfolio Ajax Link Setup ========*/
  ajaxPortfolioSetup(
    $(".portfolio-items .ajax-link"),
    $(".ajax-portfolio-popup"),
  );

  /*======== Portfolio Tilt Setup ========*/
  if ($("#portfolio .item figure").length && $.fn.tilt) {
    $("#portfolio .item figure").tilt({
      maxTilt: 3,
      glare: true,
      maxGlare: 0.6,
      reverse: true,
    });
  }

  /*======== Google Map Setup ========*/
  if ($("#map").length && typeof google !== "undefined" && google.maps) {
    initMap();
  }

  /*======== Contact Form Setup ========*/
  contactFormSetup();

  /*======== Quick Quote (Devis) Setup ========*/
  quickQuoteFormSetup();

  // si navigation one-page : clique contact -> re-check
  $(document).on("click", 'a[href="#contact"]', function () {
    setTimeout(quickQuoteFormSetup, 120);
  });
});

/*********** Function Ajax Portfolio Setup **********/
function ajaxPortfolioSetup($ajaxLink, $ajaxContainer) {
  if (!$ajaxLink.length || !$ajaxContainer.length) return;

  $ajaxLink.on("click", function (e) {
    e.preventDefault();

    var link = $(this).attr("href");
    if (!link || link === "#") return;

    $ajaxContainer.find(".content-wrap .popup-content").empty();
    $ajaxContainer.addClass("on");

    $.ajax({
      url: link,
      beforeSend: function () {
        $ajaxContainer.find(".ajax-loader").show();
      },
      success: function (result) {
        $ajaxContainer.find(".content-wrap .popup-content").html(result);
      },
      complete: function () {
        $ajaxContainer.find(".ajax-loader").hide();
      },
      error: function () {
        $ajaxContainer.find(".ajax-loader").hide();
        $ajaxContainer
          .find(".content-wrap .popup-content")
          .html(
            '<h1 class="text-center">Something went wrong! Retry or refresh the page.</h1>',
          );
      },
    });
  });

  $ajaxContainer.find(".popup-close").on("click", function () {
    $ajaxContainer.removeClass("on");
  });
}

/********** Function Map Initialization **********/
function initMap() {
  var $map = $("#map");
  var latitude = parseFloat($map.data("latitude"));
  var longitude = parseFloat($map.data("longitude"));
  var zoom = parseInt($map.data("zoom"), 10) || 12;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return;

  var cordinates = new google.maps.LatLng(latitude, longitude);

  var styles = [
    {
      stylers: [
        { saturation: -100 },
        { gamma: 0.8 },
        { lightness: 4 },
        { visibility: "on" },
      ],
    },
    {
      featureType: "landscape.natural",
      stylers: [
        { visibility: "on" },
        { color: "#5dff00" },
        { gamma: 4.97 },
        { lightness: -5 },
        { saturation: 100 },
      ],
    },
  ];

  var mapOptions = {
    zoom: zoom,
    center: cordinates,
    mapTypeControl: false,
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: false,
    styles: styles,
  };

  var map = new google.maps.Map(document.getElementById("map"), mapOptions);
  new google.maps.Marker({
    position: cordinates,
    map: map,
    title: "We are here!",
  });
}

/********** Function Contact Form Setup **********/
function contactFormSetup() {
  if (!$("#contact-form").length) return;

  $(".input__field").each(function () {
    $(this).parent(".input").toggleClass("input--filled", !!$(this).val());
  });

  $(".input__field").on("keyup", function () {
    $(this).parent(".input").toggleClass("input--filled", !!$(this).val());
  });

  $("#contact-form").on("submit", function (e) {
    e.preventDefault();

    var name = $("#cf-name").val(),
      email = $("#cf-email").val(),
      message = $("#cf-message").val(),
      required = 0;

    $(".cf-validate", this).each(function () {
      if ($(this).val() === "") {
        $(this).addClass("cf-error");
        required += 1;
      } else {
        $(this).removeClass("cf-error");
      }
    });

    if (required !== 0) return;

    $.ajax({
      type: "POST",
      url: "mail.php",
      data: { cf_name: name, cf_email: email, cf_message: message },
      dataType: "json",
      success: function (data) {
        showAlertBox(data?.status || 500, data?.message || "Message envoyé.");
        if (data && data.status === 200)
          $("#contact-form .input__field").val("").trigger("keyup");
      },
      error: function (xhr) {
        showAlertBox(
          xhr?.status || 500,
          "Oups… une erreur s'est produite. Réessaie plus tard.",
        );
      },
    });
  });
}


/* =========================
 * Quick Quote Setup (Tabs + Wizard Freelance + Form CDI)
 * ========================= */
function quickQuoteFormSetup() {
  const $form = $("#quick-quote-form");
  if (!$form.length) return;

  // anti double init
  if ($form.data("qq-initialized")) return;
  $form.data("qq-initialized", true);

  // Tabs
  const $root = $("#qq"); // container de la section contact
  const $tabs = $root.find(".qq-tab");
  const $mode = $form.find("#qq-mode");

  const $panelFreelance = $form.find("#qq-panel-freelance");
  const $panelCDI = $form.find("#qq-panel-cdi");

  // Freelance fields
  const $email = $form.find("#qq-email");
  const $type = $form.find("#qq-type");
  const $msg = $form.find("#qq-msg");

  const $step1 = $form.find('#qq-panel-freelance .qq-step[data-step="1"]');
  const $step2 = $form.find('#qq-panel-freelance .qq-step[data-step="2"]');
  const $step3 = $form.find('#qq-panel-freelance .qq-step[data-step="3"]');

  const $bar = $("#qq-progress-bar");
  const $label = $("#qq-progress-label");

  const $helper = $form.find("#qq-panel-freelance .qq-helper");

  const $submitFreelance = $form.find("#qq-submit-freelance");

  // CDI fields
  const $emailCDI = $form.find("#qq-email-cdi");
  const $role = $form.find("#qq-role");
  const $msgCDI = $form.find("#qq-msg-cdi");
  const $submitCDI = $form.find("#qq-submit-cdi");

  function isValidEmail(v) {
    const val = (v || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(val);
  }

  /* ---------- UI Tabs ---------- */
  function setTabUI(mode) {
    $tabs.each(function () {
      const on = $(this).data("mode") === mode;
      $(this)
        .toggleClass("is-active", on)
        .attr("aria-selected", on ? "true" : "false")
        // style inline safe si ton CSS ne le fait pas
        .css({
          background: on ? "rgba(99,102,241,.22)" : "rgba(255,255,255,.06)",
          borderColor: on ? "rgba(99,102,241,.75)" : "rgba(255,255,255,.18)",
        });
    });
  }

  function setMode(mode) {
    $mode.val(mode);

    const isCDI = mode === "cdi";
    // Show/hide panels
    $panelFreelance.prop("hidden", isCDI);
    $panelCDI.prop("hidden", !isCDI);

    setTabUI(mode);

    // Copie email (petit bonus UX)
    if (isCDI && $email.val() && !$emailCDI.val()) $emailCDI.val($email.val());
    if (!isCDI && $emailCDI.val() && !$email.val()) $email.val($emailCDI.val());

    // Sync states
    if (isCDI) {
      syncCDI();
      setTimeout(() => $role.trigger("focus"), 30);
    } else {
      initFreelanceLocks(); // garantit steps clean
      updateFreelanceSteps();
      setTimeout(() => $email.trigger("focus"), 30);
    }
  }

  /* ---------- Freelance Wizard ---------- */
  function initFreelanceLocks() {
    $step2.addClass("is-locked").removeClass("is-open is-done");
    $step3.addClass("is-locked").removeClass("is-open is-done");
    $form.find("#qq-step-2").text("Verrouillé");
    $form.find("#qq-step-3").text("Verrouillé");
  }

  function updateFreelanceSteps() {
    const hasEmail = isValidEmail($email.val());
    const hasType = !!$type.val();
    const hasMsg = ($msg.val() || "").trim().length >= 10;

    $step1.toggleClass("is-done", hasEmail);
    $form.find("#qq-step-1").text(hasEmail ? "OK ✅" : "À compléter");

    if (hasEmail) {
      $step2.removeClass("is-locked").addClass("is-open");
      $step2.toggleClass("is-done", hasType);
      $form.find("#qq-step-2").text(hasType ? "OK ✅" : "À compléter");
    } else {
      $step2.addClass("is-locked").removeClass("is-open is-done");
      $form.find("#qq-step-2").text("Verrouillé");
    }

    if (hasEmail && hasType) {
      $step3.removeClass("is-locked").addClass("is-open");
      $step3.toggleClass("is-done", hasMsg);
      $form.find("#qq-step-3").text(hasMsg ? "OK ✅" : "À compléter");
    } else {
      $step3.addClass("is-locked").removeClass("is-open is-done");
      $form.find("#qq-step-3").text("Verrouillé");
    }

    // progress
    let progress = 33;
    let txt = "1/3";
    if (hasEmail) { progress = 66; txt = "2/3"; }
    if (hasEmail && hasType) { progress = 85; txt = "3/3"; }
    if (hasEmail && hasType && hasMsg) { progress = 100; txt = "3/3"; }

    if ($bar.length) $bar.css("width", progress + "%");
    if ($label.length) $label.text(txt);

    // submit
    $submitFreelance.prop("disabled", !(hasEmail && hasType && hasMsg));
  }

  function isStep3Unlocked() {
    return isValidEmail($email.val()) && !!$type.val();
  }

  // Starter chips (data-fill)
  const mapSelect = {
    vitrine: "Site vitrine",
    app: "Application web",
    ux: "UI/UX (Figma)",
    refonte: "Refonte",
    maintenance: "Maintenance",
  };

  $form.on("click", "#qq-panel-freelance .qq-chip[data-fill]", function () {
    const fill = String($(this).data("fill") || "").trim();

    $form.find("#qq-panel-freelance .qq-chip[data-fill]")
      .removeClass("is-selected")
      .attr("aria-pressed", "false");

    $(this).addClass("is-selected").attr("aria-pressed", "true");

    // si step3 verrouillée => guide
    if (!isStep3Unlocked()) {
      const target = !isValidEmail($email.val()) ? $email.get(0) : $type.get(0);
      target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      (!isValidEmail($email.val()) ? $email : $type).trigger("focus");
      return;
    }

    if (!$type.val() && mapSelect[fill]) {
      $type.val(mapSelect[fill]).trigger("change");
    }

    if ($helper.length) {
      $helper.stop(true, true).slideDown(150);
      $helper.get(0)?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    }

    updateFreelanceSteps();
  });

  // Priority chips
  $form.on("click", "#qq-panel-freelance .qq-chip--single", function () {
    const $btn = $(this);
    const $group = $btn.closest("[data-group]");
    $group.find(".qq-chip--single").removeClass("is-selected").attr("aria-pressed", "false");
    $btn.addClass("is-selected").attr("aria-pressed", "true");
    $form.find("#qq-priority").val($btn.data("value") || "");
  });

  /* ---------- CDI Validation ---------- */
  function syncCDI() {
    const okEmail = isValidEmail($emailCDI.val());
    const okRole = ($role.val() || "").trim().length >= 2;
    const okMsg = ($msgCDI.val() || "").trim().length >= 10;

    $submitCDI.prop("disabled", !(okEmail && okRole && okMsg));
  }

  /* ---------- Bindings ---------- */
  // Tabs clicks
  $tabs.on("click", function () {
    const mode = $(this).data("mode");
    setMode(mode);
  });

  // Freelance listeners
  $email.on("input change blur keyup", updateFreelanceSteps);
  $type.on("change input", updateFreelanceSteps);
  $msg.on("input change keyup blur", updateFreelanceSteps);

  // CDI listeners
  $emailCDI.on("input change blur keyup", syncCDI);
  $role.on("input change keyup blur", syncCDI);
  $msgCDI.on("input change keyup blur", syncCDI);

  // Init
  initFreelanceLocks();
  updateFreelanceSteps();
  setMode("freelance");
}

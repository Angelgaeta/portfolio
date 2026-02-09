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

  /*======== Tools OwlCarousel Setup ========*/
  if ($(".tools .owl-carousel").length && $.fn.owlCarousel) {
    $(".tools .owl-carousel").owlCarousel({
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

  // Quick quote wizard removed (portfolio mode)
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
          "Oups… une erreur s'est produite. Veuillez réessayer plus tard.",
        );
      },
    });
  });
}

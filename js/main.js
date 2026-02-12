/*======== Fonction de chargement de fenêtre ========*/
$(window).on("load", function () {
  $(".loader").fadeOut();
  $(".preloader").delay(300).fadeOut();

  if ($(".portfolio-items").length && $.fn.isotope) {
    var $elements = $(".portfolio-items"),
      $filters = $(".portfolio-filter ul li"),
      $filtersList = $(".portfolio-filter ul").first();

    function setActiveFilter($target) {
      $filters
        .removeClass("active")
        .attr("aria-pressed", "false")
        .attr("aria-selected", "false")
        .attr("tabindex", "-1");

      $target
        .addClass("active")
        .attr("aria-pressed", "true")
        .attr("aria-selected", "true")
        .attr("tabindex", "0");
    }

    $elements.isotope();

    if ($filtersList.length) {
      $filtersList.attr("role", "tablist").attr("aria-label", "Filtrer les projets");
    }

    $filters.each(function () {
      var $item = $(this);
      var isActive = $item.hasClass("active");
      $item.attr("role", "tab");
      $item.attr("aria-selected", isActive ? "true" : "false");
      $item.attr("aria-pressed", isActive ? "true" : "false");
      $item.attr("tabindex", isActive ? "0" : "-1");
    });

	    $filters.on("click", function () {
	      var $current = $(this);
	      setActiveFilter($current);

      var selector = $current.data("filter");
      $elements.isotope({
        filter: selector,
        hiddenStyle: { transform: "scale(.2) skew(30deg)", opacity: 0 },
        visibleStyle: { transform: "scale(1) skew(0deg)", opacity: 1 },
	        transitionDuration: ".5s",
	      });
	    });

	    // Keyboard support for filter "tabs" (li are now focusable)
	    $filters.on("keydown", function (e) {
	      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
	        e.preventDefault();
	        $(this).trigger("click");
	        return;
	      }

	      if (
	        e.key !== "ArrowRight" &&
	        e.key !== "ArrowLeft" &&
	        e.key !== "ArrowDown" &&
	        e.key !== "ArrowUp"
	      ) {
	        return;
	      }

	      e.preventDefault();
	      var currentIndex = $filters.index(this);
	      var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
	      var nextIndex = (currentIndex + dir + $filters.length) % $filters.length;
	      var $next = $filters.eq(nextIndex);
	      $next.focus().trigger("click");
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
    var isOpen = $(".header-content").hasClass("on");
    $(this).attr("aria-expanded", isOpen);
    $(this).attr("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
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
  var canUseTilt = true;
  if (typeof window.matchMedia === "function") {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canUseTilt = false;
    }
    if (!window.matchMedia("(pointer: fine)").matches) {
      canUseTilt = false;
    }
  }
  if (navigator.connection && navigator.connection.saveData) {
    canUseTilt = false;
  }

  if (canUseTilt && $("#portfolio .item figure").length && $.fn.tilt) {
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
  setupLinkedInFeed();

  // Quick quote wizard removed (portfolio mode)
});

/********** Function LinkedIn Feed Setup **********/
function setupLinkedInFeed() {
  var feed = document.querySelector("[data-linkedin-feed]");
  if (!feed) return;

  var categoryContainer = document.querySelector("[data-linkedin-categories]");
  var summaryContainer = document.querySelector("[data-linkedin-summary]");
  var storageKey = "knowledge_feed_interactions_v1";
  var state = {
    posts: [],
    category: "all",
    interactions: {},
  };

  function esc(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCompactNumber(num) {
    var n = Number(num) || 0;
    return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }

  function sortPosts(posts) {
    var clone = posts.slice();
    clone.sort(function (a, b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    return clone;
  }

  function normalizeCategory(value) {
    var c = String(value || "").trim();
    return c || "General";
  }

  function normalizePost(raw) {
    var post = raw || {};
    var tags = Array.isArray(post.tags) ? post.tags : [];
    return {
      id: String(post.id || post.url || Math.random()),
      title: String(post.title || "Article"),
      excerpt: String(post.excerpt || ""),
      content: String(post.content || post.excerpt || ""),
      date: String(post.date || ""),
      category: normalizeCategory(post.category),
      url: String(post.url || "https://www.linkedin.com/in/angeliqueredjdal/"),
      embedUrl: String(post.embedUrl || ""),
      likes: Math.max(0, Number(post.likes) || 0),
      comments: Math.max(0, Number(post.comments) || 0),
      views: Math.max(0, Number(post.views) || 0),
      readTimeMin: Math.max(1, Number(post.readTimeMin) || 3),
      tags: tags.slice(0, 5).map(function (tag) { return String(tag); }),
    };
  }

  function loadInteractions() {
    try {
      var parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (parsed && typeof parsed === "object") {
        state.interactions = parsed;
      }
    } catch (e) {
      state.interactions = {};
    }
  }

  function saveInteractions() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.interactions));
    } catch (e) {
      // ignore storage quota errors
    }
  }

  function getPostInteraction(postId) {
    if (!state.interactions[postId]) {
      state.interactions[postId] = { liked: false, saved: false };
    }
    return state.interactions[postId];
  }

  function getFilteredPosts() {
    var sorted = sortPosts(state.posts);
    if (state.category === "all") return sorted;
    return sorted.filter(function (post) {
      return normalizeCategory(post.category).toLowerCase() === state.category;
    });
  }

  function renderCategories() {
    if (!categoryContainer) return;
    var categories = state.posts.reduce(function (acc, post) {
      var c = normalizeCategory(post.category).toLowerCase();
      if (!acc.includes(c)) acc.push(c);
      return acc;
    }, []);
    categories.sort();

    var buttons = ['<button type="button" class="linkedin-filter ' + (state.category === "all" ? "is-active" : "") + '" data-linkedin-category="all" aria-pressed="' + (state.category === "all" ? "true" : "false") + '">Tous</button>'];
    categories.forEach(function (cat) {
      var label = cat.charAt(0).toUpperCase() + cat.slice(1);
      var active = state.category === cat;
      buttons.push('<button type="button" class="linkedin-filter ' + (active ? "is-active" : "") + '" data-linkedin-category="' + esc(cat) + '" aria-pressed="' + (active ? "true" : "false") + '">' + esc(label) + "</button>");
    });
    categoryContainer.innerHTML = buttons.join("");
  }

  function renderSummary() {
    if (!summaryContainer) return;
    var postsCount = state.posts.length;
    var categoriesCount = state.posts.reduce(function (acc, post) {
      var key = normalizeCategory(post.category).toLowerCase();
      if (!acc.includes(key)) acc.push(key);
      return acc;
    }, []).length;
    var totalViews = state.posts.reduce(function (sum, post) {
      return sum + (Number(post.views) || 0);
    }, 0);

    summaryContainer.innerHTML =
      '<div class="linkedin-summary-item"><strong>' + esc(String(postsCount)) + "</strong><span>Articles</span></div>" +
      '<div class="linkedin-summary-item"><strong>' + esc(String(categoriesCount)) + "</strong><span>Catégories</span></div>" +
      '<div class="linkedin-summary-item"><strong>' + esc(formatCompactNumber(totalViews)) + "</strong><span>Vues cumulées</span></div>";
  }

  function tagsMarkup(tags) {
    if (!tags || !tags.length) return "";
    return (
      '<div class="linkedin-post-tags">' +
      tags.map(function (tag) {
        return '<span>#' + esc(tag) + "</span>";
      }).join("") +
      "</div>"
    );
  }

  function postCard(post, featured) {
    var interaction = getPostInteraction(post.id);
    var likeCount = post.likes;
    var viewCount = post.views;
    var isExpanded = !!interaction.expanded;
    var hasEmbed = !!(post.embedUrl && /^https:\/\/www\.linkedin\.com\/embed\/feed\/update\/urn:li:(share|activity):\d+/i.test(post.embedUrl));
    if (hasEmbed) {
      return (
        '<article class="linkedin-native-frame' + (featured ? " is-featured" : "") + '">' +
        '<iframe src="' + esc(post.embedUrl) + '" title="Post LinkedIn intégré" loading="lazy" frameborder="0" allowfullscreen></iframe>' +
        "</article>"
      );
    }
    var textSource = post.content || post.excerpt || "";
    var previewMax = 90;
    var needsExpand = textSource.length > previewMax;
    var previewText = needsExpand ? textSource.slice(0, previewMax).replace(/\s+\S*$/, "") + "..." : textSource;
    var readMoreLabel = isExpanded ? "Voir moins" : "Voir plus";

    var embedMarkup = "";

    var textMarkup =
      '<p class="linkedin-post-preview' + (isExpanded ? " is-hidden" : "") + '">' + esc(previewText) + "</p>" +
      '<div class="linkedin-post-full' + (isExpanded ? " is-visible" : "") + '"><p>' + esc(textSource) + "</p></div>" +
      (needsExpand
        ? '<button type="button" class="linkedin-readmore-btn" data-action="expand" data-post-id="' + esc(post.id) + '" aria-expanded="' + (isExpanded ? "true" : "false") + '">' + esc(readMoreLabel) + "</button>"
        : "");

    var tagsAndKpiMarkup =
      tagsMarkup(post.tags) +
      '<div class="linkedin-post-kpi">' +
      "<span>" + esc(formatCompactNumber(viewCount)) + " vues</span>" +
      "<span>" + esc(formatCompactNumber(likeCount)) + " réactions</span>" +
      "<span>" + esc(formatCompactNumber(post.comments)) + " commentaires</span>" +
      "</div>";

    return (
      '<article class="linkedin-post glass-card' + (featured ? " is-featured" : "") + '">' +
      '<header class="linkedin-post-head">' +
      '<img src="img/photo-portrait.jpg" alt="Photo Angélique Redjdal" loading="lazy" decoding="async" width="52" height="52">' +
      '<div class="linkedin-post-meta">' +
      "<h4>Angélique Redjdal</h4>" +
      "<p>Blog de connaissances • Partage d'apprentissage</p>" +
      '<span>' + esc(formatDate(post.date)) + " • " + esc(String(post.readTimeMin)) + " min</span>" +
      "</div>" +
      "</header>" +
      '<div class="linkedin-post-body">' +
      '<span class="linkedin-post-category">' + esc(post.category) + "</span>" +
      "<h5>" + esc(post.title) + "</h5>" +
      textMarkup +
      embedMarkup +
      tagsAndKpiMarkup +
      "</div>" +
      '<footer class="linkedin-post-actions">' +
      '<button type="button" class="linkedin-action-btn" data-action="copy" data-link="' + esc(post.url) + '">Copier le lien</button>' +
      '<button type="button" class="linkedin-action-btn" data-action="share" data-title="' + esc(post.title) + '" data-link="' + esc(post.url) + '">Partager l\'article</button>' +
      '<a href="' + esc(post.url) + '" target="_blank" rel="noopener noreferrer" data-action="open-link" data-post-id="' + esc(post.id) + '">Lire sur LinkedIn</a>' +
      "</footer>" +
      "</article>"
    );
  }

  function render() {
    var posts = getFilteredPosts();
    var featuredIndex = -1;
    var html = posts
      .map(function (post, index) {
        return postCard(post, index === featuredIndex);
      })
      .join("");
    feed.innerHTML = html || '<p class="linkedin-empty">Aucun article pour cette categorie.</p>';
    renderCategories();
    renderSummary();
  }

  if (categoryContainer) {
    categoryContainer.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-linkedin-category]");
      if (!btn) return;
      state.category = btn.getAttribute("data-linkedin-category") || "all";
      render();
    });
  }

  function incrementPostView(postId) {
    var target = state.posts.find(function (post) {
      return post.id === postId;
    });
    if (!target) return;

    target.views = (Number(target.views) || 0) + 1;
    render();

    fetch("track-post-view.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("track_failed");
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) return;
        if (typeof data.views === "number") {
          target.views = Math.max(0, Number(data.views) || target.views);
          render();
        }
      })
      .catch(function () {
        // keep optimistic UI value when tracking endpoint is unavailable
      });
  }

  feed.addEventListener("click", function (event) {
    var link = event.target.closest('a[data-action="open-link"]');
    if (link) {
      var linkedPostId = link.getAttribute("data-post-id");
      if (linkedPostId) {
        incrementPostView(linkedPostId);
      }
      return;
    }

    var button = event.target.closest(".linkedin-action-btn, .linkedin-readmore-btn");
    if (!button) return;
    var action = button.getAttribute("data-action");
    var postId = button.getAttribute("data-post-id");

    if (action === "copy") {
      var link = button.getAttribute("data-link") || "";
      if (link && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function () {
          button.textContent = "Lien copié";
          button.classList.add("is-active");
          setTimeout(function () {
            button.textContent = "Copier le lien";
            button.classList.remove("is-active");
          }, 1300);
        });
      }
      return;
    }

    if (action === "share") {
      var shareUrl = button.getAttribute("data-link") || "";
      var shareTitle = button.getAttribute("data-title") || "Article";
      if (navigator.share) {
        navigator.share({ title: shareTitle, url: shareUrl }).catch(function () {});
      } else if (shareUrl && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(function () {
          button.textContent = "Lien copié";
          button.classList.add("is-active");
          setTimeout(function () {
            button.textContent = "Partager l'article";
            button.classList.remove("is-active");
          }, 1300);
        });
      }
      return;
    }

    if (!postId) return;
    var interaction = getPostInteraction(postId);
    if (action === "expand") {
      var opening = !interaction.expanded;
      interaction.expanded = opening;
      if (opening) {
        incrementPostView(postId);
      }
    }
    saveInteractions();
    render();
  });

  loadInteractions();
  fetch("data/posts.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("posts_load_failed");
      return res.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts)) throw new Error("posts_invalid");
      state.posts = posts.map(normalizePost);
      render();
    })
    .catch(function () {
      state.posts = [
        normalizePost({
          id: "fallback-1",
          title: "Ajouter tes premiers articles",
          excerpt: "Renseigne data/posts.json avec titre, resume, categorie, date et lien source.",
          url: "https://www.linkedin.com/in/angeliqueredjdal/",
          date: "",
          category: "General",
          views: 0,
          readTimeMin: 2,
        }),
      ];
      render();
    });
}

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
  var $form = $("#contact-form");
  var $submitBtn = $form.find('button[type="submit"]').first();
  var $status = $("#contact-form-status");
  var $csrfField = $("#cf-csrf-token");
  var $honeypotField = $("#cf-website");
  var submitDefaultLabel = $submitBtn.length ? $submitBtn.text() : "Envoyer";
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var messageMin = 10;
  var messageMax = 2000;
  var nameMax = 80;
  var emailMax = 120;

  function setStatus(message, type) {
    if (!$status.length) return;
    $status
      .removeClass("sr-only is-loading is-success is-error")
      .addClass("is-visible")
      .text(message || "");

    if (type === "loading") {
      $status.addClass("is-loading");
    } else if (type === "success") {
      $status.addClass("is-success");
    } else if (type === "error") {
      $status.addClass("is-error");
    }
  }

  function clearStatus() {
    if (!$status.length) return;
    $status
      .text("")
      .removeClass("is-visible is-loading is-success is-error")
      .addClass("sr-only");
  }

  clearStatus();

  function loadCsrfToken() {
    return $.ajax({
      type: "GET",
      url: "mail.php",
      data: { action: "csrf" },
      dataType: "json",
      cache: false,
    })
      .done(function (data) {
        var token = data && data.csrf_token ? String(data.csrf_token) : "";
        if ($csrfField.length) $csrfField.val(token);
      })
      .fail(function () {
        if ($csrfField.length) $csrfField.val("");
      });
  }

  loadCsrfToken();

  $(".input__field").each(function () {
    $(this).parent(".input").toggleClass("input--filled", !!$(this).val());
  });

  $(".input__field").on("keyup", function () {
    $(this).parent(".input").toggleClass("input--filled", !!$(this).val());
    clearStatus();
  });

  $(".cf-validate").on("input", function () {
    var $field = $(this);
    var errorId = $field.attr("aria-describedby");
    var $errorMsg = errorId ? $("#" + errorId) : $();
    var value = $.trim($field.val());

    if (!value) return;

    if ($field.attr("id") === "cf-email" && !emailPattern.test(value)) return;

    $field.removeClass("cf-error").removeAttr("aria-invalid");
    if ($errorMsg.length) {
      $errorMsg.text("").addClass("sr-only").removeClass("cf-error-visible");
    }
  });

  $form.on("submit", function (e) {
    e.preventDefault();
    if ($form.hasClass("is-submitting")) return;

    var name = $.trim($("#cf-name").val()).replace(/\s+/g, " "),
      email = $.trim($("#cf-email").val()),
      message = $.trim($("#cf-message").val()),
      csrfToken = $.trim($csrfField.val()),
      website = $honeypotField.length ? $.trim($honeypotField.val()) : "",
      required = 0,
      $firstInvalid = $();

    $(".cf-validate", this).each(function () {
      var $field = $(this);
      var errorId = $field.attr("aria-describedby");
      var $errorMsg = errorId ? $("#" + errorId) : $();
      if ($field.val() === "") {
        $field.addClass("cf-error").attr("aria-invalid", "true");
        if ($errorMsg.length) {
          $errorMsg.text("Ce champ est requis").removeClass("sr-only").addClass("cf-error-visible");
        }
        if (!$firstInvalid.length) $firstInvalid = $field;
        required += 1;
      } else {
        $field.removeClass("cf-error").removeAttr("aria-invalid");
        if ($errorMsg.length) {
          $errorMsg.text("").addClass("sr-only").removeClass("cf-error-visible");
        }
      }
    });

    if (required !== 0) {
      setStatus("Merci de compléter les champs requis.", "error");
      if ($firstInvalid.length) $firstInvalid.trigger("focus");
      return;
    }
    if (!emailPattern.test(email)) {
      var $emailField = $("#cf-email");
      var $emailError = $("#cf-email-error");
      $emailField.addClass("cf-error").attr("aria-invalid", "true");
      if ($emailError.length) {
        $emailError
          .text("Email invalide")
          .removeClass("sr-only")
          .addClass("cf-error-visible");
      }
      setStatus("Merci de vérifier votre adresse email.", "error");
      $emailField.trigger("focus");
      return;
    }
    if (name.length > nameMax) {
      setStatus("Le nom est trop long.", "error");
      $("#cf-name").addClass("cf-error").attr("aria-invalid", "true").trigger("focus");
      return;
    }
    if (email.length > emailMax) {
      setStatus("L'email est trop long.", "error");
      $("#cf-email").addClass("cf-error").attr("aria-invalid", "true").trigger("focus");
      return;
    }
    if (message.length < messageMin) {
      setStatus("Le message doit contenir au moins 10 caractères.", "error");
      $("#cf-message").addClass("cf-error").attr("aria-invalid", "true").trigger("focus");
      return;
    }
    if (message.length > messageMax) {
      setStatus("Le message est trop long.", "error");
      $("#cf-message").addClass("cf-error").attr("aria-invalid", "true").trigger("focus");
      return;
    }
    if (!csrfToken) {
      setStatus("Session expirée, merci de réessayer.", "error");
      loadCsrfToken();
      return;
    }

    if ($submitBtn.length) {
      $submitBtn.prop("disabled", true).attr("aria-busy", "true").text("Envoi...");
    }
    $form.addClass("is-submitting");
    setStatus("Envoi en cours...", "loading");

    $.ajax({
      type: "POST",
      url: "mail.php",
      data: {
        cf_name: name,
        cf_email: email,
        cf_message: message,
        csrf_token: csrfToken,
        website: website,
      },
      dataType: "json",
      success: function (data) {
        var statusCode = data?.status || 500;
        var messageText = data?.message || "Message envoyé.";
        showAlertBox(statusCode, messageText);
        if (data && data.status === 200) {
          $("#contact-form .input__field").val("").trigger("keyup");
          if ($honeypotField.length) $honeypotField.val("");
          loadCsrfToken();
          setStatus(messageText, "success");
        } else {
          if (statusCode === 403 || statusCode === 429) loadCsrfToken();
          setStatus(messageText, "error");
        }
      },
      error: function (xhr) {
        var backendMessage = xhr?.responseJSON?.message;
        var fallbackMessage =
          backendMessage || "Oups… une erreur s'est produite. Veuillez réessayer plus tard.";
        showAlertBox(
          xhr?.status || 500,
          fallbackMessage,
        );
        if (xhr?.status === 403 || xhr?.status === 429) loadCsrfToken();
        setStatus(fallbackMessage, "error");
      },
      complete: function () {
        if ($submitBtn.length) {
          $submitBtn
            .prop("disabled", false)
            .removeAttr("aria-busy")
            .text(submitDefaultLabel);
        }
        $form.removeClass("is-submitting");
      },
    });
  });
}

/********** Function Navigation UX Setup **********/
function setupNavigationUX() {
  var $headerContent = $(".header-content");
  var $headerMain = $(".header-main");
  var $headerToggle = $(".header-toggle");
  var $navLinks = $(".nav-menu a.pt-link");
  var $floatingCta = $(".floating-cta");
  var menuObserver = null;
  var lastMenuOpen = false;
  var sectionData = $navLinks
    .map(function () {
      var hash = this.getAttribute("href");
      if (!hash || hash.charAt(0) !== "#") return null;
      var el = document.getElementById(hash.slice(1));
      if (!el) return null;
      return { hash: hash, el: el };
    })
    .get();

  function isMobileMenuContext() {
    return window.matchMedia("(max-width: 991px)").matches;
  }

  function getMenuFocusable() {
    if (!$headerMain.length) return $();
    return $headerMain
      .find('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      .filter(":visible");
  }

  function syncMenuA11y() {
    var isOpen = $headerContent.hasClass("on");
    var mobileContext = isMobileMenuContext();

    document.body.classList.toggle("menu-open", mobileContext && isOpen);
    $headerToggle.attr("aria-expanded", isOpen ? "true" : "false");
    $headerToggle.attr("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");

    if (mobileContext) {
      $headerMain.attr("aria-hidden", isOpen ? "false" : "true");
    } else {
      $headerMain.attr("aria-hidden", "false");
    }

    if (!lastMenuOpen && isOpen && mobileContext) {
      var $focusables = getMenuFocusable();
      var $firstLink = $focusables.filter(".pt-link").first();
      ($firstLink.length ? $firstLink : $focusables.first()).trigger("focus");
    }

    lastMenuOpen = isOpen;
  }

  function closeMobileMenu() {
    if (!$headerContent.hasClass("on")) return;
    $headerContent.removeClass("on");
    syncMenuA11y();
  }

  function setCurrentLink(hash) {
    if (!hash) hash = "#home";

    $navLinks.removeClass("active").removeAttr("aria-current");

    var $target = $navLinks.filter('[href="' + hash + '"]').first();
    if (!$target.length) return;

    $target.addClass("active").attr("aria-current", "page");
  }

  // Keyboard support for mobile toggle (role=button on <a> without href).
  $headerToggle.on("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
    e.preventDefault();
    $(this).trigger("click");
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileMenu();
      return;
    }

    if (e.key !== "Tab" || !$headerContent.hasClass("on") || !isMobileMenuContext()) return;

    var $focusables = getMenuFocusable();
    if (!$focusables.length) return;

    var first = $focusables.get(0);
    var last = $focusables.get($focusables.length - 1);
    var active = document.activeElement;

    if (!$.contains($headerMain.get(0), active)) {
      e.preventDefault();
      $(first).trigger("focus");
      return;
    }

    if (e.shiftKey && active === first) {
      e.preventDefault();
      $(last).trigger("focus");
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      $(first).trigger("focus");
    }
  });

  $navLinks.on("click", function () {
    setCurrentLink(this.getAttribute("href"));
    closeMobileMenu();
  });

  $(window).on("hashchange", function () {
    setCurrentLink(window.location.hash);
  });

  setCurrentLink(window.location.hash || $(".nav-menu a.pt-link.active").attr("href"));

  if ($headerContent.length) {
    menuObserver = new MutationObserver(syncMenuA11y);
    menuObserver.observe($headerContent.get(0), { attributes: true, attributeFilter: ["class"] });
  }

  syncMenuA11y();

  var ticking = false;

  function updateScrollProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var progress = max > 0 ? window.scrollY / max : 0;
    doc.style.setProperty("--scroll-progress", progress.toFixed(4));
    document.body.classList.toggle("has-scrolled", window.scrollY > 12);

    if (sectionData.length) {
      var marker = window.innerHeight * 0.34;
      var activeHash = sectionData[0].hash;
      sectionData.forEach(function (item) {
        var rect = item.el.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom > marker) {
          activeHash = item.hash;
        }
      });
      setCurrentLink(activeHash);
    }
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateScrollProgress();
      ticking = false;
    });
  }

  updateScrollProgress();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () {
    requestUpdate();
    if (!isMobileMenuContext()) closeMobileMenu();
    syncMenuA11y();
  });

  if ($floatingCta.length && "IntersectionObserver" in window) {
    var contactSection = document.getElementById("contact");
    if (contactSection) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            $floatingCta.toggleClass("is-hidden", entry.isIntersecting);
          });
        },
        { threshold: 0.25 },
      );
      observer.observe(contactSection);
    }
  }
}

/* global google */
(function ($) {
  "use strict";

  /* =========================
   * Window Load
   * ========================= */
  $(window).on("load", function () {
    $(".loader").fadeOut();
    $(".preloader").delay(1000).fadeOut();

    if ($(".portfolio-items").length && $.fn.isotope) {
      var $elements = $(".portfolio-items");
      var $filters = $(".portfolio-filter ul li");

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

  /* =========================
   * Document Ready
   * ========================= */
  $(function () {
    /* SimpleBar */
    $(".pt-page").each(function () {
      var id = $(this).attr("id");
      if (!id) return;
      var el = document.getElementById(id);
      if (el && typeof SimpleBar !== "undefined") new SimpleBar(el);
    });

    /* Close mobile menu */
    $(document).on("mouseup", function (e) {
      var $header = $(".header-main");
      if (
        !$header.is(e.target) &&
        $header.has(e.target).length === 0 &&
        $(e.target).closest(".header-toggle").length === 0
      ) {
        $(".header-content").removeClass("on");
      }
    });

    if (typeof fitty === "function") {
      fitty(".header-name", { multiLine: false, maxSize: 20, minSize: 10 });
    }

    $(".nav-menu a").on("click", function () {
      $(".header-content").removeClass("on");
    });

    $(".header-toggle").on("click", function () {
      $(".header-content").toggleClass("on");
    });

    /* Carousels */
    if ($(".clients .owl-carousel").length && $.fn.owlCarousel) {
      $(".clients .owl-carousel").owlCarousel({
        loop: true,
        margin: 30,
        autoplay: true,
        smartSpeed: 500,
        dots: false,
        responsive: {
          0: { items: 2 },
          500: { items: 3 },
          700: { items: 4 },
          1000: { items: 6 },
        },
      });
    }

    if ($(".testimonials .owl-carousel").length && $.fn.owlCarousel) {
      $(".testimonials .owl-carousel").owlCarousel({
        loop: true,
        margin: 30,
        autoplay: true,
        smartSpeed: 500,
        dots: false,
        responsive: { 0: { items: 1 }, 1000: { items: 2 } },
      });
    }

    /* Popups */
    if ($(".portfolio-items .image-link").length && $.fn.magnificPopup) {
      $(".portfolio-items .image-link").magnificPopup({
        type: "image",
        gallery: { enabled: true },
      });
    }

    if ($(".portfolio-items .video-link").length && $.fn.magnificPopup) {
      $(".portfolio-items .video-link").magnificPopup({
        type: "iframe",
        gallery: { enabled: true },
      });
    }

    /* Tilt */
    if ($("#portfolio .item figure").length && $.fn.tilt) {
      $("#portfolio .item figure").tilt({
        maxTilt: 3,
        glare: true,
        maxGlare: 0.6,
        reverse: true,
      });
    }

    /* Map */
    if ($("#map").length && typeof google !== "undefined" && google.maps) {
      initMap();
    }

    /* Forms */
    contactFormSetup();
    quickQuoteFormSetup();
  });

  /* =========================
   * Quick Quote – Full Wizard + Step locks + AJAX submit
   * (Compatible avec ta STEP 3 améliorée : priority/pages/users/stack/hosting/assets/links)
   * ========================= */
  
  

  function quickQuoteFormSetup() {
  const $form = $("#quick-quote-form");
  if (!$form.length) return;
  if ($form.data("init")) return;
  $form.data("init", true);

  /* =========================
   * Grab fields
   * ========================= */
  const $name = $form.find("#qq-name"); // optional
  const $email = $form.find("#qq-email");
  const $type = $form.find("#qq-type");
  const $msg = $form.find("#qq-msg");

  // Step 3 (improved)
  const $budget = $form.find("#qq-budget");
  const $deadline = $form.find("#qq-deadline");
  const $hosting = $form.find("#qq-hosting"); // select name="hosting_domain"
  const $assets = $form.find("#qq-assets");
  const $links = $form.find("#qq-links");
  const $priority = $form.find("#qq-priority"); // hidden input name="priority"

  // Conditional wizard fields
  const $pages = $form.find("#qq-pages"); // name="pages"
  const $users = $form.find("#qq-users"); // name="users"
  const $stack = $form.find("#qq-stack"); // name="stack"

  /* =========================
   * UI refs
   * ========================= */
  const $bar = $("#qq-progress-bar");
  const $label = $("#qq-progress-label");
  const $step2Status = $("#qq-step-2");
  const $step3Status = $("#qq-step-3");
  const $submit = $("#qq-submit");
  const $errors = $form.find(".qq-errors");

  /* =========================
   * Wizard UI refs (inside step 3)
   * ========================= */
  const $helper = $form.find(".qq-helper");
  const $wTitle = $helper.find(".qq-helper-title");
  const $wSub = $helper.find(".qq-helper-sub");
  const $question = $helper.find(".qq-w-question");
  const $opts = $helper.find(".qq-w-options");
  const $next = $helper.find("#qq-w-next");
  const $back = $helper.find("#qq-w-back");
  const $gen = $helper.find("#qq-w-generate");
  const $wProg = $helper.find(".qq-w-progress");

  // Conditional blocks (wrappers)
  const $blockPages = $("#qq-block-pages");
  const $blockUsers = $("#qq-block-users");
  const $blockStack = $("#qq-block-stack");

  /* =========================
   * Helpers
   * ========================= */
  const DEBUG_QQ = false; // true => console logs

  function logQQ(...args) {
    if (DEBUG_QQ && window.console) console.log("[QQ]", ...args);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test((v || "").trim());
  }

  function toast(msg, ok = false) {
    if ($errors.length) {
      $errors
        .html(`<div class="alert ${ok ? "alert-success" : "alert-danger"}" style="margin:0;">${msg}</div>`)
        .show();
      setTimeout(() => $errors.fadeOut(300), 3500);
    } else {
      // fallback
      alert(msg);
    }
  }

  function showErrors(list) {
    if (!$errors.length) return;
    if (!list.length) {
      $errors.hide().empty();
      return;
    }
    $errors
      .html(
        `<div class="alert alert-danger" style="margin:0;">
          <ul style="margin:0; padding-left:18px;">
            ${list.map((e) => `<li>${e}</li>`).join("")}
          </ul>
        </div>`,
      )
      .show();
  }

  function setStatus($el, text, ok) {
    $el.text(text).toggleClass("is-ok", !!ok);
  }

  function setStepLock(stepNumber, locked) {
    const $step = $form.find(`.qq-step[data-step="${stepNumber}"]`);
    $step.toggleClass("is-locked", locked);

    // Disable inputs in step
    $step.find("input, select, textarea").prop("disabled", locked);

    // If step 3 locked, wizard buttons should also be disabled (keeps UX coherent)
    if (stepNumber === 3) {
      $step.find("#qq-w-next, #qq-w-back, #qq-w-generate").prop("disabled", locked);
    }
  }

  function computeStep() {
    const ok1 = isValidEmail($email.val());
    const ok2 = ok1 && !!$type.val();
    const ok3 = ok2 && ($msg.val() || "").trim().length >= 10;

    if (!ok1) return 1;
    if (!ok2) return 2;
    if (!ok3) return 3;
    return 3;
  }

  function updateLocksAndProgress() {
    const okEmail = isValidEmail($email.val());
    const okType = !!$type.val();
    const okMsg = ($msg.val() || "").trim().length >= 10;

    setStepLock(2, !okEmail);
    setStepLock(3, !(okEmail && okType));

    setStatus($step2Status, okEmail ? "À compléter" : "Verrouillé", okEmail);
    setStatus($step3Status, okEmail && okType ? "À compléter" : "Verrouillé", okEmail && okType);

    const step = computeStep();
    const percent = step === 1 ? 33 : step === 2 ? 66 : 100;
    $bar.css("width", percent + "%");
    $label.text(`${step}/3`);

    $submit.prop("disabled", !(okEmail && okType && okMsg));
  }

  function isStep3Unlocked() {
    return isValidEmail($email.val()) && !!$type.val();
  }

  /* =========================
   * Init lock state
   * ========================= */
  setStepLock(2, true);
  setStepLock(3, true);
  $submit.prop("disabled", true);

  /* =========================
   * Field listeners
   * ========================= */
  $name.on("input", updateLocksAndProgress);
  $email.on("input", updateLocksAndProgress);
  $type.on("change", updateLocksAndProgress);
  $msg.on("input", updateLocksAndProgress);

  $budget.on("change", updateLocksAndProgress);
  $deadline.on("change", updateLocksAndProgress);
  $hosting.on("change", updateLocksAndProgress);
  $assets.on("change", updateLocksAndProgress);
  $links.on("input", updateLocksAndProgress);

  $pages.on("change", updateLocksAndProgress);
  $users.on("change", updateLocksAndProgress);
  $stack.on("input", updateLocksAndProgress);

  /* =========================
   * Priority chips (single choice)
   * HTML: buttons .qq-chip--single inside [data-group="priority"] + hidden #qq-priority
   * ========================= */
  $form.on("click", ".qq-chip--single", function () {
    const $btn = $(this);
    const $group = $btn.closest("[data-group]");
    $group.find(".qq-chip--single").removeClass("is-selected").attr("aria-pressed", "false");
    $btn.addClass("is-selected").attr("aria-pressed", "true");
    $priority.val($btn.data("value") || "");
    updateLocksAndProgress();
  });

  /* =========================
   * Wizard config
   * (vitrine/app/ux/refonte/maintenance)
   * ========================= */
  let wizardType = null;
  let stepIndex = 0;
  let answers = {};

  const wizard = {
    vitrine: {
      title: "🧱 Site vitrine",
      sub: "On cadre l’objectif + le contenu + les options.",
      show: { pages: true },
      typeValue: "Site vitrine",
      steps: [
        { q: "Objectif principal ?", opts: ["Présenter mon activité", "Obtenir des contacts", "Être crédible"] },
        { q: "Style souhaité ?", opts: ["Sobre / pro", "Créatif", "Premium", "Je ne sais pas"] },
        { q: "Fonctions utiles ?", opts: ["Formulaire", "SEO", "Blog", "Portfolio/Galerie"], multi: true },
      ],
    },
    app: {
      title: "🧩 Application web",
      sub: "On clarifie le besoin produit (users + features).",
      show: { users: true },
      typeValue: "Application web",
      steps: [
        { q: "Problème à résoudre ?", opts: ["Gagner du temps", "Automatiser", "Centraliser"] },
        { q: "Qui l’utilise ?", opts: ["Moi", "Mon équipe", "Clients", "Public"] },
        { q: "Fonctionnalités ?", opts: ["Connexion", "Admin", "Paiement", "Exports", "Notifications"], multi: true },
      ],
    },
    ux: {
      title: "🎨 UI/UX (Figma)",
      sub: "Point de départ + livrables + niveau de fidélité.",
      show: {},
      typeValue: "UI/UX (Figma)",
      steps: [
        { q: "Point de départ ?", opts: ["Idée", "Site existant", "Maquettes déjà faites"] },
        { q: "Objectif UX ?", opts: ["Clarté", "Conversion", "Préparer le dev", "Refonte"] },
        { q: "Livrables ?", opts: ["Wireframes", "Maquettes", "Prototype", "Design system"], multi: true },
      ],
    },
    refonte: {
      title: "🔁 Refonte / amélioration",
      sub: "On identifie ce qui ne va pas + ce qu’on garde + la priorité.",
      show: { pages: true },
      typeValue: "Refonte",
      steps: [
        { q: "Qu’est-ce qui pose problème aujourd’hui ?", opts: ["Design daté", "Trop lent", "Pas de demandes", "Difficile à modifier"] },
        { q: "Qu’est-ce qu’on garde ?", opts: ["Logo/charte", "Textes", "Structure", "Je ne sais pas"], multi: true },
        { q: "Priorité refonte ?", opts: ["Design", "SEO", "Conversion", "Performance"], multi: true },
      ],
    },
    maintenance: {
      title: "🛠️ Maintenance / bug",
      sub: "On qualifie le souci pour le diagnostiquer vite.",
      show: { stack: true },
      typeValue: "Maintenance",
      steps: [
        { q: "Type de demande ?", opts: ["Bug", "Ajout de petite fonctionnalité", "Mise à jour / sécurité", "Optimisation vitesse"] },
        { q: "Impact ?", opts: ["Bloquant", "Gênant", "Mineur"] },
        { q: "Quand le problème arrive ?", opts: ["Tout le temps", "Parfois", "Depuis une mise à jour", "Je ne sais pas"] },
      ],
    },
  };

  function setChipSelected($chip, selected) {
    $chip.toggleClass("is-selected", selected);
    $chip.attr("aria-pressed", selected ? "true" : "false");
  }

  function applyConditionalBlocks() {
    const conf = wizard[wizardType] || {};
    const show = conf.show || {};
    if ($blockPages.length) $blockPages.toggle(!!show.pages);
    if ($blockUsers.length) $blockUsers.toggle(!!show.users);
    if ($blockStack.length) $blockStack.toggle(!!show.stack);
  }

  function renderWizardStep() {
    const conf = wizard[wizardType];
    if (!conf) return;
    const step = conf.steps[stepIndex];

    $wTitle.text(conf.title);
    $wSub.text(conf.sub || "");

    applyConditionalBlocks();

    $question.text(step.q);
    $opts.empty();
    $wProg.text(`Étape ${stepIndex + 1} / ${conf.steps.length}`);
    $next.prop("disabled", true);

    step.opts.forEach((o) => {
      const $b = $('<button type="button" class="qq-chip" aria-pressed="false"></button>').text(o);
      const isMulti = !!step.multi;

      // restore selection
      if (isMulti) {
        const arr = answers[stepIndex] || [];
        if (arr.includes(o)) setChipSelected($b, true);
      } else if (answers[stepIndex] === o) {
        setChipSelected($b, true);
      }

      $b.on("click", function () {
        if (isMulti) {
          answers[stepIndex] = answers[stepIndex] || [];
          const idx = answers[stepIndex].indexOf(o);
          if (idx >= 0) {
            answers[stepIndex].splice(idx, 1);
            setChipSelected($b, false);
          } else {
            answers[stepIndex].push(o);
            setChipSelected($b, true);
          }
          $next.prop("disabled", (answers[stepIndex] || []).length === 0);
        } else {
          answers[stepIndex] = o;
          $opts.find(".qq-chip").each(function () {
            setChipSelected($(this), $(this).text() === o);
          });
          $next.prop("disabled", false);
        }
      });

      $opts.append($b);
    });

    $back.toggle(stepIndex > 0);
    $next.toggle(stepIndex < conf.steps.length - 1);
    $gen.toggle(stepIndex === conf.steps.length - 1);

    const v = answers[stepIndex];
    if (Array.isArray(v)) $next.prop("disabled", v.length === 0);
    else if (typeof v === "string") $next.prop("disabled", !v);
  }

  /* =========================
   * Wizard start — robust (no dead buttons)
   * ========================= */
  $form.on("click", '.qq-chip[data-fill]', function () {
    const fill = String($(this).data("fill") || "").trim();
    logQQ("Click data-fill:", fill);

    // Step 3 locked => guide user
    if (!isStep3Unlocked()) {
      toast("Commence par indiquer ton email + type de projet 🙂");
      const target = !isValidEmail($email.val()) ? $email.get(0) : $type.get(0);
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "center" });
      (!isValidEmail($email.val()) ? $email : $type).focus();
      return;
    }

    // Wizard DOM missing => can't render
    if (!$helper.length || !$opts.length || !$next.length || !$gen.length) {
      logQQ("Wizard DOM missing", {
        helper: !!$helper.length,
        opts: !!$opts.length,
        next: !!$next.length,
        gen: !!$gen.length,
      });
      toast("Le configurateur n’est pas disponible (structure HTML manquante).");
      return;
    }

    // No config => obsolete button
    if (!wizard[fill]) {
      logQQ("No wizard config for:", fill);
      toast("Cette option n’est pas encore disponible 🙂 Choisis une autre option.");
      return;
    }

    // Start
    wizardType = fill;
    stepIndex = 0;
    answers = {};

    const conf = wizard[wizardType];
    if (conf && conf.typeValue) {
      $type.val(conf.typeValue).trigger("change");
    }

    $helper.slideDown(150);
    renderWizardStep();

    const el = $helper.get(0);
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $next.on("click", function () {
    stepIndex++;
    renderWizardStep();
  });

  $back.on("click", function () {
    stepIndex = Math.max(0, stepIndex - 1);
    renderWizardStep();
  });

  function buildProBrief() {
    const lines = [];
    const conf = wizard[wizardType];

    const priority = ($priority.val() || "").trim();
    const budget = ($budget.val() || "").trim();
    const deadline = ($deadline.val() || "").trim();
    const hosting = ($hosting.val() || "").trim();
    const assets = ($assets.val() || "").trim();
    const links = ($links.val() || "").trim();

    const pages = ($pages.val() || "").trim();
    const users = ($users.val() || "").trim();
    const stack = ($stack.val() || "").trim();

    lines.push(`Projet : ${$type.val() || "—"}`);
    if (priority) lines.push(`Priorité : ${priority}`);

    if (conf) {
      conf.steps.forEach((s, i) => {
        const v = answers[i];
        if (!v || (Array.isArray(v) && !v.length)) return;
        lines.push(`${s.q} ${Array.isArray(v) ? v.join(", ") : v}`);
      });
    }

    if (pages) lines.push(`Pages : ${pages}`);
    if (users) lines.push(`Utilisateurs : ${users}`);
    if (stack) lines.push(`Tech/stack : ${stack}`);

    if (budget) lines.push(`Budget : ${budget}`);
    if (deadline) lines.push(`Échéance : ${deadline}`);
    if (hosting) lines.push(`Domaine/Hébergement : ${hosting}`);
    if (assets) lines.push(`Contenus : ${assets}`);
    if (links) lines.push(`Liens : ${links}`);

    lines.push("Question : Quel est le résultat idéal attendu ? (1 phrase)");

    return "- " + lines.join("\n- ");
  }

  $gen.on("click", function () {
    const brief = buildProBrief();
    $msg.val(brief).trigger("input").focus();
    updateLocksAndProgress();
  });

  /* =========================
   * Disable chips that have no config (optional)
   * ========================= */
  $form.find('.qq-chip[data-fill]').each(function () {
    const fill = String($(this).data("fill") || "").trim();
    if (!wizard[fill]) {
      $(this).addClass("is-disabled").attr("title", "Option bientôt disponible");
      // If you want to truly disable:
      // $(this).prop("disabled", true);
    }
  });

  /* =========================
   * AJAX submit
   * ========================= */
  $form.on("submit", function (e) {
    e.preventDefault();
    showErrors([]);

    const errs = [];
    if (!isValidEmail($email.val())) errs.push("Merci d’indiquer un email valide.");
    if (!$type.val()) errs.push("Merci de choisir un type de projet.");
    if (($msg.val() || "").trim().length < 10) errs.push("Décris ton besoin en au moins 10 caractères.");

    // Honeypot
    if (($form.find('input[name="website"]').val() || "").trim().length) {
      // OK response to not help bots
      toast("Merci 🙂 Votre demande a bien été envoyée.", true);
      return false;
    }

    if (errs.length) {
      showErrors(errs);
      return false;
    }

    $.ajax({
      type: "POST",
      url: $form.attr("action") || "mail.php",
      data: $form.serialize(),
      dataType: "json",
      success: function (data) {
        const code = data.status || 200;
        const msg = data.message || "Message envoyé";
        toast(msg, code === 200);

        if (code === 200) {
          $form.trigger("reset");
          $helper.hide();
          wizardType = null;
          stepIndex = 0;
          answers = {};
          setStepLock(2, true);
          setStepLock(3, true);
          updateLocksAndProgress();
        }
      },
      error: function () {
        showErrors(["Erreur lors de l’envoi. Tu peux me contacter directement par email."]);
      },
    });
  });

  // First paint
  updateLocksAndProgress();
}


  /* =========================
   * Contact Form (ton existant)
   * ========================= */
  function contactFormSetup() {
    if (!$("#contact-form").length) return;

    $("#contact-form").on("submit", function (e) {
      e.preventDefault();

      $.ajax({
        type: "POST",
        url: "mail.php",
        data: $(this).serialize(),
        dataType: "json",
        success: function (data) {
          showAlertBox(data.status || 200, data.message || "Message envoyé");
        },
        error: function () {
          showAlertBox(500, "Erreur lors de l’envoi");
        },
      });
    });
  }

  function showAlertBox(code, msg) {
    const $box = $('<div class="alert"></div>')
      .addClass(code === 200 ? "alert-success" : "alert-danger")
      .html(msg);
    $("#contact-form .alert-container")
      .html($box)
      .fadeIn(300)
      .delay(4000)
      .fadeOut(400);
  }

  /* =========================
   * Map
   * ========================= */
  function initMap() {
    const $map = $("#map");
    const lat = parseFloat($map.data("latitude"));
    const lng = parseFloat($map.data("longitude"));
    if (isNaN(lat) || isNaN(lng)) return;

    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: { lat, lng },
      disableDefaultUI: true,
    });

    new google.maps.Marker({ position: { lat, lng }, map });
  }
})(jQuery);

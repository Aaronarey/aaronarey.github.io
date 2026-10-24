/*
  sections.js - makes the hobby page work like a single-page app.
  Only the section picked in the nav is shown, the matching nav link
  is marked as the current page, and the tab title changes to
  "Lifting 🏋️ <section h2>". Home is shown by default.
*/
(function () {
  "use strict";

  var SITE_NAME = "Lifting";
  var DIVIDER = " 🏋️ ";
  var sections = document.querySelectorAll("main section");
  var links = document.querySelectorAll("header nav a");

  function showSection(id) {
    var target = document.getElementById(id);

    // Fall back to Home if the hash doesn't match a section
    if (!target || target.tagName !== "SECTION") {
      target = sections[0];
    }

    sections.forEach(function (section) {
      section.hidden = section !== target;
    });

    links.forEach(function (link) {
      if (link.getAttribute("href") === "#" + target.id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.title = SITE_NAME + DIVIDER + target.querySelector("h2").textContent;
    window.scrollTo(0, 0);
  }

  function showFromHash() {
    showSection(window.location.hash.slice(1));
  }

  // The back and forward buttons change the hash, so listen for that too
  window.addEventListener("hashchange", showFromHash);
  showFromHash();
})();

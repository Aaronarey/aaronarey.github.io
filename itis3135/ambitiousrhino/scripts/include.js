/*
  include.js - loads shared HTML fragments into a page.
  Works the same way as Paul Browne's HTMLInclude:
  any element with a data-include="path/to/file.html" attribute
  is replaced by the contents of that file.
  After the header loads, the link for the current page gets
  aria-current="page" so it can be styled and read by screen readers.
*/
(function () {
  "use strict";

  function markCurrentPage() {
    var current = window.location.pathname.split("/").pop() || "index.html";
    var links = document.querySelectorAll("header nav a");
    links.forEach(function (link) {
      if (link.getAttribute("href") === current) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  var targets = document.querySelectorAll("[data-include]");
  var loads = Array.prototype.map.call(targets, function (el) {
    var file = el.getAttribute("data-include");
    return fetch(file)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load " + file);
        }
        return response.text();
      })
      .then(function (html) {
        el.outerHTML = html;
      })
      .catch(function (error) {
        console.error(error);
      });
  });

  Promise.all(loads).then(markCurrentPage);
})();

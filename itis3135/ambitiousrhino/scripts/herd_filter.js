/*
  herd_filter.js - Dynamic feature 2: the filter on The Herd page.
  When a radio button in #herd-filter changes, every product article
  whose data-use list doesn't include the chosen use gets hidden,
  and #filter-status says how many rhinos are left.
  Uses the "hidden" property and dataset, as described on MDN:
  https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
*/
(function () {
  "use strict";

  var form = document.getElementById("herd-filter");
  var status = document.getElementById("filter-status");
  if (!form || !status) {
    return;
  }

  var products = document.querySelectorAll("article[data-use]");

  // Readable names for the status message
  var useNames = {
    phone: "phones",
    laptop: "laptops",
    outdoor: "trips off the grid"
  };

  function applyFilter(use) {
    var shown = 0;

    products.forEach(function (product) {
      var uses = product.dataset.use.split(" ");
      var match = use === "all" || uses.indexOf(use) !== -1;
      product.hidden = !match;
      if (match) {
        shown += 1;
      }
    });

    if (use === "all") {
      status.textContent = "Showing all " + products.length + " rhinos.";
    } else {
      status.textContent = "Showing " + shown + " of " + products.length +
        " rhinos for " + useNames[use] + ".";
    }
  }

  form.addEventListener("change", function (event) {
    if (event.target.name === "use") {
      applyFilter(event.target.value);
    }
  });

  // The form has no submit button, but stop Enter from reloading the page
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  // Browsers can remember the checked radio when you come back with the
  // Back button, so filter by whatever is checked right now instead of
  // assuming "Everything". pageshow also fires for back/forward cache restores.
  function applyCheckedFilter() {
    var checked = form.querySelector("input[name='use']:checked");
    applyFilter(checked ? checked.value : "all");
  }

  applyCheckedFilter();
  window.addEventListener("pageshow", applyCheckedFilter);
})();

/*
  introductions.js - builds the "Meet the Herd" page from the class
  introduction form data at https://intro-form.tommyhost.ing/

  Fields used from each submission:
  img, pictureAlt, firstName, nickname, lastName, prettyNameDivider,
  adjectives, animal, quote, quoteAuthor, funnyItem,
  personalInfo.personalBackground, and baseSiteUrl.

  Everything is written with textContent (never innerHTML), so nothing a
  classmate typed into the form can run as code on this page.
*/
(function () {
  "use strict";

  const API_URL = "https://intro-form.tommyhost.ing/";
  const MY_USERNAME = "areyes24";

  const grid = document.getElementById("intro-grid");
  const statusLine = document.getElementById("intro-status");
  const searchBox = document.getElementById("intro-search");
  const spotlightButton = document.getElementById("spotlight-button");
  const spotlight = document.getElementById("spotlight");

  let people = [];

  // Small helpers -------------------------------------------------------

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  // Only data:image strings and https links are shown as pictures,
  // so a bad value can't cause a broken-image or mixed-content error
  function safeImage(value) {
    const src = text(value);
    if (src.startsWith("data:image/") || src.startsWith("https://")) {
      return src;
    }
    return "images/rhino_logo.svg";
  }

  // Some classmates typed their own quotation marks, so strip them
  // before this page adds its own curly quotes
  function stripQuotes(value) {
    return text(value).replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, "").trim();
  }

  function safeLink(value) {
    const url = text(value);
    return url.startsWith("https://") ? url : "";
  }

  function makeElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (content) {
      element.textContent = content;
    }
    return element;
  }

  // Turn one API record into a clean object --------------------------------

  function toPerson(username, record) {
    const data = (record && record.introductionData) || {};
    const info = data.personalInfo || {};
    const first = text(data.firstName);
    const last = text(data.lastName);
    const nickname = text(data.nickname);

    let displayName = first + " " + last;
    if (nickname && nickname !== first) {
      displayName = first + " “" + nickname + "” " + last;
    }

    return {
      username: username,
      name: displayName.trim() || username,
      lastName: last || username,
      divider: text(data.prettyNameDivider) || "~",
      mascot: (text(data.adjectives) + " " + text(data.animal)).trim(),
      animal: text(data.animal),
      image: safeImage(data.img),
      alt: text(data.pictureAlt) || "Photo of " + (first || username),
      quote: stripQuotes(data.quote),
      quoteAuthor: text(data.quoteAuthor),
      funnyItem: text(data.funnyItem),
      background: text(info.personalBackground),
      site: safeLink(record && record.baseSiteUrl)
    };
  }

  // Build one card ---------------------------------------------------------

  function buildCard(person) {
    const card = makeElement("article", "intro-card");
    if (person.username === MY_USERNAME) {
      card.classList.add("intro-card-me");
      card.appendChild(makeElement("p", "me-badge", "That's me!"));
    }

    const picture = document.createElement("img");
    picture.src = person.image;
    picture.alt = person.alt;
    picture.width = 240;
    picture.height = 240;
    picture.loading = "lazy";
    card.appendChild(picture);

    card.appendChild(makeElement("h3", "intro-name", person.name));

    if (person.mascot) {
      card.appendChild(makeElement("p", "mascot-chip", person.mascot));
    }

    if (person.quote) {
      const quote = makeElement("blockquote", "intro-quote", "“" + person.quote + "”");
      card.appendChild(quote);
      if (person.quoteAuthor) {
        card.appendChild(makeElement("p", "quote-author", "— " + person.quoteAuthor));
      }
    }

    if (person.funnyItem) {
      const fun = makeElement("p", "fun-fact");
      fun.appendChild(makeElement("strong", "", "Fun fact: "));
      fun.appendChild(document.createTextNode(person.funnyItem));
      card.appendChild(fun);
    }

    if (person.site) {
      const link = makeElement("a", "intro-link", "Visit their site");
      link.href = person.site;
      card.appendChild(link);
    }

    return card;
  }

  // Draw the grid, filtered by the search box -----------------------------

  function render() {
    const query = searchBox.value.trim().toLowerCase();
    const matches = people.filter(function (person) {
      const haystack = (person.name + " " + person.mascot).toLowerCase();
      return haystack.includes(query);
    });

    grid.replaceChildren();
    matches.forEach(function (person) {
      grid.appendChild(buildCard(person));
    });

    const animals = new Set(people.map(function (person) {
      return person.animal.toLowerCase();
    }).filter(Boolean));

    if (matches.length === 0) {
      statusLine.textContent = "No classmates match “" + searchBox.value + "”.";
    } else if (query) {
      statusLine.textContent = "Showing " + matches.length + " of " + people.length + " classmates.";
    } else {
      statusLine.textContent = people.length + " classmates, " + animals.size + " different animals.";
    }
  }

  // Spotlight: a random classmate, shown bigger with their background ----

  function showSpotlight() {
    if (people.length === 0) {
      return;
    }
    const person = people[Math.floor(Math.random() * people.length)];

    spotlight.replaceChildren();

    const picture = document.createElement("img");
    picture.src = person.image;
    picture.alt = person.alt;
    picture.width = 200;
    picture.height = 200;
    spotlight.appendChild(picture);

    const details = document.createElement("div");
    const title = person.mascot
      ? person.name + " " + person.divider + " " + person.mascot
      : person.name;
    details.appendChild(makeElement("h3", "spotlight-name", title));
    if (person.background) {
      details.appendChild(makeElement("p", "", person.background));
    }
    if (person.quote) {
      details.appendChild(makeElement("blockquote", "intro-quote", "“" + person.quote + "”"));
    }
    spotlight.appendChild(details);
    spotlight.hidden = false;
  }

  // Load the data -----------------------------------------------------------

  async function loadIntroductions() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Server answered " + response.status);
      }
      const all = await response.json();

      people = Object.keys(all)
        .map(function (username) {
          return toPerson(username, all[username]);
        })
        .sort(function (a, b) {
          return a.lastName.localeCompare(b.lastName);
        });

      searchBox.disabled = false;
      spotlightButton.disabled = false;
      render();
    } catch (error) {
      // Shown on the page instead of the console, so nothing turns red
      statusLine.textContent = "The class introductions couldn't load right now. Please refresh to try again.";
    }
  }

  searchBox.addEventListener("input", render);
  spotlightButton.addEventListener("click", showSpotlight);
  loadIntroductions();
})();

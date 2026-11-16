/*
  introduction.js - runs the Introduction Form page.
  It checks the required fields, adds and deletes course boxes,
  clears and resets the form, and on Submit swaps the form for a
  finished introduction page built from whatever was typed in.
*/
(function () {
  "use strict";

  var DEFAULT_IMAGE = "images/aaron.jpg";

  var formElement = document.getElementById("intro-form");
  var formIntro = document.getElementById("form-intro");
  var coursesBox = document.getElementById("courses");
  var result = document.getElementById("result");

  /* Saved copies so Reset can bring back the courses and footer links the page started with */
  var startingCourses = coursesBox.innerHTML;
  var startingFooterLinks = null;
  var courseCount = coursesBox.querySelectorAll(".course").length;

  function valueOf(id) {
    return document.getElementById(id).value.trim();
  }

  /* Small helper: makes an element, optionally with text inside it */
  function make(tag, text) {
    var el = document.createElement(tag);
    if (text) {
      el.textContent = text;
    }
    return el;
  }

  /* Builds one list item that looks like "<strong>Label:</strong> text" */
  function makeBullet(label, text) {
    var li = make("li");
    li.appendChild(make("strong", label + ":"));
    li.appendChild(document.createTextNode(" " + text));
    return li;
  }

  /* Stops the form from submitting when a required field is empty */
  function validateForm() {
    var required = formElement.querySelectorAll("[required]");
    for (var i = 0; i < required.length; i++) {
      if (required[i].value.trim() === "") {
        required[i].setCustomValidity("Please fill out this field.");
        required[i].reportValidity();
        required[i].setCustomValidity("");
        return false;
      }
    }
    return formElement.reportValidity();
  }

  /* Adds a new set of empty course text boxes with its own delete button */
  function addCourse() {
    courseCount++;
    var n = courseCount;
    var fields = [
      ["dept", "Department", "ITIS"],
      ["number", "Number", "3135"],
      ["name", "Name", "Front-End Web App Development"],
      ["reason", "Reason for Taking", "Why you are taking this course"]
    ];
    var group = make("fieldset");
    group.className = "course";
    group.appendChild(make("legend", "Course"));
    fields.forEach(function (field) {
      var label = make("label", field[1]);
      label.htmlFor = "course-" + field[0] + "-" + n;
      var input = make("input");
      input.type = "text";
      input.id = "course-" + field[0] + "-" + n;
      input.name = "course-" + field[0];
      input.placeholder = field[2];
      input.required = true;
      group.appendChild(label);
      group.appendChild(input);
    });
    var deleteButton = make("button", "Delete Course");
    deleteButton.type = "button";
    deleteButton.className = "delete-course";
    group.appendChild(deleteButton);
    coursesBox.appendChild(group);
    group.querySelector("input").focus();
  }

  /* Deletes the course whose Delete Course button was clicked */
  function deleteCourse(event) {
    if (event.target.classList.contains("delete-course")) {
      event.target.closest(".course").remove();
    }
  }

  /* Empties every field so the placeholders show */
  function clearForm() {
    formElement.querySelectorAll("input, textarea").forEach(function (field) {
      field.value = "";
    });
  }

  /* Puts the footer links back the way they were when the page loaded */
  function restoreFooterLinks() {
    var list = document.querySelector("footer nav ul");
    if (list && startingFooterLinks !== null) {
      list.innerHTML = startingFooterLinks;
    }
  }

  /* Resets all progress: default values, starting courses, original footer, and shows the form again */
  function resetProgress() {
    coursesBox.innerHTML = startingCourses;
    courseCount = coursesBox.querySelectorAll(".course").length;
    restoreFooterLinks();
    result.innerHTML = "";
    result.hidden = true;
    formElement.hidden = false;
    formIntro.hidden = false;
  }

  /* Swaps the footer links for the names and URLs typed into the form */
  function updateFooterLinks() {
    var list = document.querySelector("footer nav ul");
    if (!list) {
      return;
    }
    if (startingFooterLinks === null) {
      startingFooterLinks = list.innerHTML;
    }
    var names = formElement.querySelectorAll("[name='link-name']");
    var urls = formElement.querySelectorAll("[name='link-url']");
    list.innerHTML = "";
    names.forEach(function (nameField, i) {
      var li = make("li");
      var a = make("a", nameField.value.trim());
      a.href = urls[i].value.trim();
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  /* Gathers the form data and builds the introduction page in place of the form */
  function showIntroduction() {
    var nameParts = [valueOf("first-name")];
    if (valueOf("middle-name")) {
      nameParts.push(valueOf("middle-name"));
    }
    if (valueOf("nickname")) {
      nameParts.push("\"" + valueOf("nickname") + "\"");
    }
    nameParts.push(valueOf("last-name"));
    var heading = make("h6", nameParts.join(" ") + " " + valueOf("divider") + " " +
      valueOf("mascot-adjective") + " " + valueOf("mascot-animal"));

    /* Picture: the uploaded file if there is one, otherwise the default image */
    var figure = make("figure");
    var img = make("img");
    var file = document.getElementById("picture").files[0];
    img.src = file ? URL.createObjectURL(file) : DEFAULT_IMAGE;
    img.alt = valueOf("picture-alt");
    img.width = 400;
    figure.appendChild(img);
    figure.appendChild(make("figcaption", valueOf("picture-caption")));

    var statement = make("p", valueOf("personal-statement"));

    var list = make("ul");
    list.appendChild(makeBullet("Personal Background", valueOf("personal-background")));
    list.appendChild(makeBullet("Professional Background", valueOf("professional-background")));
    list.appendChild(makeBullet("Academic Background", valueOf("academic-background")));
    list.appendChild(makeBullet("Primary Work Computer", valueOf("primary-computer")));
    list.appendChild(makeBullet("Primary Work Location", valueOf("primary-location")));
    list.appendChild(makeBullet("Alternate Computer & Location", valueOf("alternate-computer")));

    var coursesItem = make("li");
    coursesItem.appendChild(make("strong", "Courses I'm Taking & Why:"));
    var courseList = make("ol");
    coursesBox.querySelectorAll(".course").forEach(function (course) {
      var get = function (name) {
        return course.querySelector("[name='course-" + name + "']").value.trim();
      };
      courseList.appendChild(makeBullet(get("dept") + " " + get("number") + " - " + get("name"), get("reason")));
    });
    coursesItem.appendChild(courseList);
    list.appendChild(coursesItem);

    if (valueOf("funny-thing")) {
      list.appendChild(makeBullet("Funny/Interesting Item to Remember Me by", valueOf("funny-thing")));
    }
    if (valueOf("share")) {
      list.appendChild(makeBullet("Something I'd Like to Share", valueOf("share")));
    }

    var quote = make("blockquote");
    quote.appendChild(make("p", "\"" + valueOf("quote") + "\""));
    quote.appendChild(make("p", "~ " + valueOf("quote-author")));

    var resetParagraph = make("p");
    var resetLink = make("a", "Reset and fill out the form again");
    resetLink.href = "#";
    resetLink.addEventListener("click", function (event) {
      event.preventDefault();
      formElement.reset();
      window.scrollTo(0, 0);
    });
    resetParagraph.appendChild(resetLink);

    result.innerHTML = "";
    [heading, figure, statement, list, quote, resetParagraph].forEach(function (el) {
      result.appendChild(el);
    });

    updateFooterLinks();
    formElement.hidden = true;
    formIntro.hidden = true;
    result.hidden = false;
    window.scrollTo(0, 0);
  }

  /* Prevents the page refresh, then only builds the introduction if the form is complete */
  formElement.addEventListener("submit", function (event) {
    event.preventDefault();
    if (validateForm()) {
      showIntroduction();
    }
  });

  formElement.addEventListener("reset", resetProgress);
  document.getElementById("clear-form").addEventListener("click", clearForm);
  document.getElementById("add-course").addEventListener("click", addCourse);
  coursesBox.addEventListener("click", deleteCourse);
})();

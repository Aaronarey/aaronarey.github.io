/*
  slideshow.js - Dynamic feature 1: the "Meet the Herd" slideshow on the home page.
  It cycles through all six products, swapping the picture, alt text,
  and caption inside #herd-slideshow every five seconds.
  Previous / Next step through the herd by hand, and Pause stops the timer.
  Visitors who have "reduce motion" turned on in their system settings
  start paused, so nothing moves unless they press Next or Play.
  Timer pattern based on MDN's setInterval and prefers-reduced-motion docs:
  https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
*/
(function () {
  "use strict";

  var SLIDE_DELAY = 5000; // milliseconds each slide stays up

  // One entry per product: picture, alt text, product name, and a one-line pitch
  var slides = [
    {
      src: "images/black-rhino-20k-power-bank.svg",
      alt: "Black Rhino 20K power bank with a lime lightning horn and a display reading 100 percent",
      name: "Black Rhino 20K",
      pitch: ", the flagship of the herd, charges a phone four times."
    },
    {
      src: "images/calf-5k-power-bank.svg",
      alt: "Calf 5K, a small lime power bank with four charge lights",
      name: "Calf 5K",
      pitch: " slips into a pocket and gives your phone one full charge."
    },
    {
      src: "images/bull-10k-magnetic-power-bank.svg",
      alt: "Bull 10K, a blue power bank with a lime magnetic charging ring",
      name: "Bull 10K",
      pitch: " snaps onto your phone and charges it wirelessly."
    },
    {
      src: "images/white-rhino-27k-laptop-power-bank.svg",
      alt: "White Rhino 27K, a wide power bank with a laptop icon and a 140W display",
      name: "White Rhino 27K",
      pitch: " runs a laptop all day and is still allowed on a plane."
    },
    {
      src: "images/horn-65w-wall-charger.svg",
      alt: "Horn 65W, a navy wall charger cube with two prongs and three ports",
      name: "Horn 65W",
      pitch: " charges your phone, tablet, and laptop from one outlet."
    },
    {
      src: "images/savanna-solar-28w-panel.svg",
      alt: "Savanna Solar, a three-panel folding solar charger under a lime sun",
      name: "Savanna Solar 28W",
      pitch: " turns sunshine into charge anywhere without an outlet."
    }
  ];

  var slideshow = document.getElementById("herd-slideshow");
  if (!slideshow) {
    return;
  }

  var image = slideshow.querySelector("img");
  var caption = slideshow.querySelector("figcaption");
  var pauseButton = slideshow.querySelector("[data-slide='pause']");
  var current = 0;
  var timer = null;

  // Puts slide number "index" on screen, wrapping around at either end
  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    var slide = slides[current];
    image.src = slide.src;
    image.alt = slide.alt;
    caption.innerHTML = "<strong>" + slide.name + "</strong>" + slide.pitch;
  }

  function play() {
    stop();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, SLIDE_DELAY);
    pauseButton.textContent = "Pause";
    // While playing, announcing every slide would be noisy for screen readers
    caption.setAttribute("aria-live", "off");
  }

  function stop() {
    window.clearInterval(timer);
    timer = null;
    pauseButton.textContent = "Play";
    caption.setAttribute("aria-live", "polite");
  }

  // One click listener on the section handles all three buttons
  slideshow.addEventListener("click", function (event) {
    var action = event.target.getAttribute("data-slide");
    if (action === "next") {
      stop();
      showSlide(current + 1);
    } else if (action === "previous") {
      stop();
      showSlide(current - 1);
    } else if (action === "pause") {
      if (timer) {
        stop();
      } else {
        play();
      }
    }
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    stop();
  } else {
    play();
  }
})();

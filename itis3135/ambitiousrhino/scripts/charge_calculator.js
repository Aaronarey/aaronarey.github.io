/*
  charge_calculator.js - Dynamic feature 3: the Charge Calculator page.
  Reads the device and rhino chosen in #charge-calculator, works out how
  many full charges that rhino gives the device, and writes the answer
  into the form's <output>. It recalculates on Calculate and whenever
  either dropdown changes.

  Math: rhino watt-hours = mAh x 3.7 V / 1000, and only 70% of that
  reaches the device (the rest is lost as heat). Charges = usable Wh
  divided by the device's battery size in Wh.
  Device battery sizes are rounded typical values, not exact specs.
  <output> element reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output
*/
(function () {
  "use strict";

  var VOLTS = 3.7;        // nominal voltage of a lithium-ion cell
  var EFFICIENCY = 0.7;   // share of stored energy that reaches the device

  // name: shown in the answer; mah: capacity; watts: fastest wired output
  var rhinos = {
    calf: { name: "Calf 5K", mah: 5000, watts: 20 },
    bull: { name: "Bull 10K", mah: 10000, watts: 20 },
    black: { name: "Black Rhino 20K", mah: 20000, watts: 65 },
    white: { name: "White Rhino 27K", mah: 27000, watts: 140 }
  };

  // name: shown in the answer; wh: battery size; watts: power it needs to charge
  var devices = {
    "phone": { name: "phone", wh: 12, watts: 18 },
    "big-phone": { name: "large phone", wh: 17, watts: 20 },
    "tablet": { name: "tablet", wh: 28, watts: 20 },
    "laptop": { name: "13-inch laptop", wh: 50, watts: 45 },
    "gaming-laptop": { name: "gaming laptop", wh: 90, watts: 100 }
  };

  var form = document.getElementById("charge-calculator");
  if (!form) {
    return;
  }
  var result = form.elements.result;

  function chargesFor(rhino, device) {
    var usableWh = (rhino.mah * VOLTS / 1000) * EFFICIENCY;
    return usableWh / device.wh;
  }

  // Smallest rhino that is fast enough and gives at least one full charge
  function bestFit(device) {
    var keys = Object.keys(rhinos);
    for (var i = 0; i < keys.length; i += 1) {
      var rhino = rhinos[keys[i]];
      if (rhino.watts >= device.watts && chargesFor(rhino, device) >= 1) {
        return rhino;
      }
    }
    return null;
  }

  function describe(charges, deviceName) {
    if (charges < 1) {
      return "about " + Math.round(charges * 100) + "% of one charge for your " + deviceName;
    }
    var rounded = charges.toFixed(1);
    return "about " + rounded + " full charge" + (rounded === "1.0" ? "" : "s") +
      " for your " + deviceName;
  }

  function calculate() {
    var rhino = rhinos[form.elements.rhino.value];
    var device = devices[form.elements.device.value];
    var message;

    if (rhino.watts < device.watts) {
      message = "The " + rhino.name + " tops out at " + rhino.watts +
        "W, which is too slow to charge a " + device.name + " that needs about " +
        device.watts + "W.";
    } else {
      message = "The " + rhino.name + " gives " +
        describe(chargesFor(rhino, device), device.name) + ".";
    }

    var best = bestFit(device);
    if (best && best !== rhino) {
      message += " Smallest rhino that gives a full charge: the " + best.name + ".";
    } else if (!best) {
      message += " No rhino gives a " + device.name +
        " a full charge yet, so keep its own charger close by.";
    }

    result.value = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener("change", calculate);

  // Show an answer right away, and refresh it if the Back button brings
  // the page back with different choices still selected
  calculate();
  window.addEventListener("pageshow", calculate);
})();

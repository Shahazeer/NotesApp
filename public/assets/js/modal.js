"use strict";

const modals = document.querySelectorAll(".modal");
const overlays = document.querySelectorAll(".overlay");
const btnCloseModals = document.querySelectorAll(".close-modal");
const notes = document.querySelectorAll(".note");

for (let i = 0; i < notes.length; i++) {
  notes[i].addEventListener("click", function () {
    modals[i].classList.remove("hidden");
    overlays[i].classList.remove("hidden");
  });

  btnCloseModals[i].addEventListener("click", function () {
    modals[i].classList.add("hidden");
    overlays[i].classList.add("hidden");
  });

  overlays[i].addEventListener("click", function () {
    modals[i].classList.add("hidden");
    overlays[i].classList.add("hidden");
  });
}

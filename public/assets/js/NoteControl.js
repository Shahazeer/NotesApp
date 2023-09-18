"use strict";

let addNote = document.getElementById("add");
let noteContainer = document.getElementsByClassName("notes")[0];
const homeButton = document.getElementById("home");
let noteCount = 0;
const defaultNoteName = "Note"; // Initial default note name
const maxNotes = 48;
var userNotes = [];
var dataNotes = [];

document.addEventListener("DOMContentLoaded", function () {
  const welcomeMessageElement = document.querySelector(".welcome");
  fetch("/session")
    .then((response) => response.json())
    .then((data) => {
      if (data.notes) {
        // userNotes = JSON.parse(data);
        userNotes = data.notes;
        console.log(userNotes);

        const username = data.username; // Assuming the username is included in the response
        welcomeMessageElement.textContent = `Welcome, ${username}!`;

        ExistingNotes(userNotes);
      } else {
        console.log("Failed to retrieve notes from");
      }
    })
    .catch((err) => {
      console.log("Failed");
    });
});

function ExistingNotes(userNotes) {
  dataNotes = [];
  dataNotes.push(userNotes);

  // console.log(dataNotes);
  dataNotes[0].forEach((note) => {
    console.log(note);
  });

  // console.log(dataNotes);
  dataNotes[0].forEach((note) => {
    const noteId = note.ID;
    const noteName = note.NoteName;
    const noteData = note.NoteData;
    // console.log(noteName.noteData);
    const addANote = AddNoteFromDB(noteId, noteName, noteData);
    noteContainer.appendChild(addANote);

    // Add event listener to open modal when the note is clicked
    OpenModal(addANote);

    // Add event listener to close the modal when the close button is clicked
    CloseButtonModal(addANote);

    // Add event listener to update the note name when edited inside the modal
    const modalNoteName = addANote.querySelector(".modal-note-name");
    const noteHeader = addANote.querySelector(".note-header");

    ChangeNoteName(modalNoteName, noteHeader);

    UpdateNote(addANote, noteId);

    DeleteNote(addANote, noteId);
  });
}

addNote.addEventListener("click", function () {
  if (noteCount < maxNotes) {
    noteCount++;

    const addANote = AddNote();
    noteContainer.appendChild(addANote);
    location.reload();
  } else {
    alert("Max limit of 48 notes reached");
  }
});

function AddNote() {
  const addANote = document.createElement("div");
  addANote.className = "note";
  const noteName = defaultNoteName;
  const noteData = "";
  const noteId = generateRandomId();

  const newNote = {
    id: noteId,
    noteName: noteName,
    noteData: noteData,
  };

  fetch("/add-note", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newNote),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
    })
    .catch((err) => {
      console.error("Failed to add the new note:", err);
    });

  addANote.innerHTML = `
    <img src="/assets/Images/postit-p_256.webp" alt="" class="note-image">
    <textarea class="note-header" contenteditable="true" readonly>${noteName}</textarea>
    <div class="modal hidden">
      <button class="close-modal">&times;</button>
      <textarea class="modal-note-name" maxlength="30" contenteditable="true">${noteName}</textarea>
      <img src="/assets/Images/delete.png" alt="" class="delete-modal-button"></img>
      <img src="/assets/Images/update.png" alt="" class="update-modal-button"></img>
      <div hidden>${noteId}</div>
      <textarea class="note-content lined" contenteditable="true"  maxlength="10000" placeholder="Click here to edit..."></textarea>
    </div>
    <div class="overlay hidden"></div>`;

  return addANote;
}

function AddNoteFromDB(noteId, noteName, noteData) {
  const addANote = document.createElement("div");
  addANote.className = "note";
  // const noteName = defaultNoteName;

  addANote.innerHTML = `
    <img src="/assets/Images/postit-p_256.webp" alt="" class="note-image">
    <textarea class="note-header" contenteditable="true" readonly>${noteName}</textarea>
    <div class="modal hidden">
      <button class="close-modal">&times;</button>
      <textarea class="modal-note-name" maxlength="30" contenteditable="true">${noteName}</textarea>
      <img src="/assets/Images/delete.png" alt="" class="delete-modal-button"></img>
      <img src="/assets/Images/update.png" alt="" class="update-modal-button"></img>
      <div hidden>${noteId}</div>
      <textarea class="note-content lined" contenteditable="true"  maxlength="10000" placeholder="Click here to edit...">${noteData}</textarea>
    </div>
    <div class="overlay hidden"></div>`;

  return addANote;
}

function DeleteNote(addANote, noteId) {
  const deleteButton = addANote.querySelector(".delete-modal-button");
  deleteButton.addEventListener("click", function () {
    // Remove the note when the delete button is clicked
    noteCount--;
    addANote.remove();

    fetch(`/delete-note/${noteId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message); // Log the response from the server
        // Remove the note from the client-side only if the server successfully deleted it
        if (data.message === "Note deleted successfully") {
          noteCount--;
          addANote.remove();
        }
      })
      .catch((err) => {
        console.error("Failed to delete the note:", err);
      });
  });
}

function ChangeNoteName(modalNoteName, noteHeader) {
  modalNoteName.addEventListener("input", function () {
    const newName = modalNoteName.value;
    noteHeader.value = newName;
  });
}

function CloseButtonModal(addANote) {
  const closeBtn = addANote.querySelector(".close-modal");
  closeBtn.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent the modal from closing when the close button is clicked
    const modal = this.closest(".modal");
    const overlay = modal.nextElementSibling;
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  });
}

function OpenModal(addANote) {
  addANote.addEventListener("click", function () {
    const modal = this.querySelector(".modal");
    const overlay = this.querySelector(".overlay");
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const modals = document.querySelectorAll(".modal");
    const overlays = document.querySelectorAll(".overlay");
    for (let i = 0; i < modals.length; i++) {
      modals[i].classList.add("hidden");
      overlays[i].classList.add("hidden");
    }
  }
});

function UpdateNote(addANote, noteId) {
  const updateButton = addANote.querySelector(".update-modal-button");
  updateButton.addEventListener("click", function () {
    const noteData = addANote.querySelector(".note-content").value;
    const noteName = addANote.querySelector(".modal-note-name").value;

    const updatedNote = {
      noteName: noteName,
      noteData: noteData,
    };

    fetch(`/update-note/${noteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedNote),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message); // Log the response from the server
      })
      .catch((err) => {
        console.error("Failed to update the note:", err);
      });
  });
}

function generateRandomId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 10; // Adjust the length as needed
  let randomId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomIndex);
  }

  return randomId;
}

homeButton.addEventListener("click", function () {
  window.location.href = "/home";
});

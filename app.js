const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");

//init app & middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  //Rendering of HTML page to the browser
  res.sendFile(__dirname + "/login.html");
});
//db connection
let db;
var userNotes;
var currentUserId, currentUser;

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("Server started on http://localhost:3000");
    });
    db = getDb();
  }
});

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  const userDetails = {
    username,
    email,
    password,
    notes: [],
  };

  console.log(`Recieved Data:
              Username: ${username}
              email: ${email}
              password: ${password}`);

  db.collection("Users")
    .insertOne(userDetails)
    .then((result) => {
      const user_id = result.insertedId;

      res.sendFile(__dirname + "/login.html");
    })
    .catch((err) => {
      res.status(500).json({ error: "Couldn't create a new user" });
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(500).json({ error: "Email/Password field empty" });
  }

  // const authentication = { username: `${email}`, password: `${password}` };
  db.collection("Users")
    .findOne({ email, password })
    .then((user) => {
      console.log(`Login Successful ${user.username}`);
      // res.status(200).json({ message: "Login Successful" });
      currentUser = user.username;
      userNotes = user.notes;
      currentUserId = user._id;
      // console.log(currentUserId);
      res.sendFile(__dirname + "/index.html");
    })
    .catch(() => {
      res.status(500).json({ error: "Invalid Email/Password" });
    });
});

app.get("/session", (req, res) => {
  if (userNotes) {
    res.status(200).json({ notes: userNotes, username: currentUser });
  } else {
    res.status(500).json({ error: "Failed to retrieve user's notes" });
  }
});

app.patch("/add-note", (req, res) => {
  const { id, noteName, noteData } = req.body;

  db.collection("Users")
    .updateOne(
      { _id: currentUserId },
      {
        $push: {
          notes: {
            ID: id,
            NoteName: noteName,
            NoteData: noteData,
          },
        },
      }
    )
    .then(() => {
      // Send a success response to the client
      res.status(200).json({ message: "Note added successfully" });
    })
    .catch((err) => {
      console.error("Failed to add the note to the database:", err);
      // Send an error response to the client
      res.status(500).json({ error: "Failed to add the note" });
    });
});

app.patch("/update-note/:noteId", (req, res) => {
  const id = req.params.noteId;
  const { noteName, noteData } = req.body;

  db.collection("Users")
    .updateOne(
      { _id: currentUserId, "notes.ID": id },
      {
        $set: {
          "notes.$.NoteName": noteName,
          "notes.$.NoteData": noteData,
        },
      }
    )
    .then(() => {
      res
        .status(200)
        .json({ message: "Note updated successfully", updatedNote });
    })
    .catch((err) => {
      res.status(500).json({ error: "Note not updated" });
    });
  console.log("Note updated successfully");
});

app.delete("/delete-note/:noteId", (req, res) => {
  const noteId = req.params.noteId;
  db.collection("Users")
    .updateOne(
      { _id: currentUserId },
      {
        $pull: {
          notes: {
            ID: noteId,
          },
        },
      }
    )
    .then(() => {
      res.status(200).json({ message: "Note deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to delete the note" });
    });
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

const express = require("express"),
  router = express.Router({ mergeParams: true }),
  User = require("../models/user");

//(OK)TODO: user doesn't send back ALL data, such as passwords, tokens etc. to the frontend

//(OK)TODO: when deleting a comment, should update the user

//TODO: fix update

//INDEX - GET all users
router.get("/users", async (req, res) => {
  console.log("REQUEST ::  get all users");
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: e.toString(),
    });
  }
});

// SHOW - get specific user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    console.log("RETURNING A USER: " + user);
    res.send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// CREATE - post a new user
router.post("/users", async (req, res) => {
  console.log(`REQUEST :: create user  ${req.body.username}`);

  //Difficulties = ["Easy", "Medium", "Hard"],
  // qTypes = ["Array", "String", "Linked List", "Stack/Queue", "Tree", "Heap", "HashTable", "Graph", "Sort", "Bit Manipulation", "Greedy", "Dynamic Programming"];

  const newUser = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    validated: req.body.validated,
  };

  const alreadyExistent = await User.find({
    $or: [{ email: newUser.email }, { username: newUser.username }],
  });

  console.log("alreadyExistent: " + alreadyExistent.username);
  if (alreadyExistent.length > 0) {
    console.error(`STATUS :: Conflict`);
    return res.status(409).send();
  }

  try {
    const user = new User(newUser);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
    console.log(`STATUS :: Success`);
  } catch (e) {
    console.error(`STATUS :: Oops. Something went wrong. ` + e.toString());
    res.status(500).json({
      error: true,
      message: e.toString(),
    });
  }
});

//UPDATE - updates a user
router.patch("/users/:id", async (req, res) => {
  console.log("REQUEST ::  update user " + req.params.id);
  const updates = Object.keys(req.body);
  console.log("keys = " + updates.toString());
  const allowedUpdates = [
    "firstname",
    "lastname",
    "email",
    "username",
    "password",
  ];
  const updatesAreValid = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!updatesAreValid) {
    return res.status(400).send({ error: "Updates not valid !" });
  }
  try {
    const user = await User.findById(req.params.id);

    updates.forEach((update) => (user[update] = req.body[update]));
    user.save();

    if (!user) {
      res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e.toString() });
  }
});

//DESTROY - delete user's info
router.delete("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.status(200).send(user);
    console.log("user deleted successfully");
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

module.exports = router;

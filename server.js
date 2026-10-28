const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory storage (Module 03 replaces this with a database)
const users = [];
const blogs = [];

app.get("/", (req, res) => {
  res.send("BlogSpace backend is running!");
});

// GET ALL BLOGS
app.get("/api/blogs", (req, res) => {
  res.json(blogs);
});

// CREATE BLOG
app.post("/api/blogs", (req, res) => {
  const { title, content, category } = req.body;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof content !== "string" || !content.trim()
  ) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const newBlog = {
    id: Date.now(),
    title: title.trim(),
    content: content.trim(),
    category:
      typeof category === "string" && category.trim()
        ? category.trim()
        : "Other",
    createdAt: new Date().toISOString(),
  };

  blogs.unshift(newBlog);

  res.status(201).json({
    message: "Blog created successfully",
    blog: newBlog,
  });
});

// DELETE BLOG
app.delete("/api/blogs/:id", (req, res) => {
  const index = blogs.findIndex((b) => b.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Blog not found" });
  }

  blogs.splice(index, 1);
  res.json({ message: "Blog deleted successfully" });
});

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (users.find((u) => u.email === cleanEmail)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    };

    users.push(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || !password
    ) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = users.find((u) => u.email === email.trim().toLowerCase());
    const valid = user && (await bcrypt.compare(password, user.password));

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Bad JSON / unexpected errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ message: "Invalid request" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
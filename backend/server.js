
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Task Schema and Model
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Project Task Management API is running!");
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Could not fetch tasks"
    });
  }
});

// Add a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const newTask = await Task.create({ title });
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: "Could not create task"
    });
  }
});

// Update task status
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Ongoing", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: "Could not update task"
    });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: "Could not delete task"
    });
  }
});

// Connect MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
}

startServer();

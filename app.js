const express = require("express");
const app = express();
const port = 3000;

const Pool = require("pg").Pool;
const pool = new Pool({
  host: "localhost",
  database: "db_tasks",
  user: "postgres",
  password: "123456",
  port: 5432,
});

// middleware
app.use(express.json());

app.post("/tasks", async (req, res, next) => {
  try {
    let desc = req.body.description;
    let deadline = req.body.deadline;
    let priority = req.body.priority;
    let is_completed = req.body.is_completed;

    let task = await pool.query(
      "INSERT INTO tasks (description, deadline, priority, is_completed) VALUES ($1, $2, $3,$4)",
      [desc, deadline, priority, is_completed]
    );

    res.json({ data: task.rowCount });
  } catch (error) {
    next(error);
  }
});

app.get("/tasks", async function (req, res, next) {
  try {
    let task = await pool.query("SELECT * FROM tasks");

    res.json(task.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/tasks/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    let task = await pool.query("SELECT * FROM tasks WHERE ID = $1", [id]);

    if (task.rows.length === 0) {
      res.status(404).json({ message: "Task not found" });
    }

    res.json(task.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put("tasks/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    let [desccription, deadline, priority, is_completed] = req.body;

    let task = await pool.query(
      "UPDATE tasks SET description = $1, deadline = $2, priority = $3, is_completed = $4 WHERE id = $5 ",
      [description]
    );
  } catch (error) {
    next(error);
  }
});

// internal server error
app.use((err, req, res, next) => {
  console.log(err);

  res.status(500).json({ err: err.message });
});

app.listen(port, function () {
  console.log(`app listening on port ${port}`);
});

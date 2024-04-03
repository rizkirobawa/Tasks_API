const router = require("express").Router();

const Pool = require("pg").Pool;
const pool = new Pool({
  host: "localhost",
  database: "db_tasks",
  user: "postgres",
  password: "123456",
  port: 5432,
});

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/tasks/create", (req, res) => {
  res.render("tasks/create");
});

router.post("/tasks", async (req, res, next) => {
  try {
    let desc = req.body.description;
    let deadline = req.body.deadline;
    let priority = req.body.priority;
    let is_completed = req.body.is_completed;

    if (!desc || !deadline || !priority || !is_completed) {
      return res.status(400).json({
        status: false,
        message: `description, deadline, priority, is_completed are required`,
      });
    }

    let task = await pool.query(
      "INSERT INTO tasks (description, deadline, priority, is_completed) VALUES ($1, $2, $3,$4)",
      [desc, deadline, priority, is_completed]
    );

    res.status(201).json({ status: true, message: "Added Data Successfully", data: task.rowCount });
  } catch (error) {
    next(error);
  }
});

router.get("/tasks", async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let keyword = req.query.keyword;

    let psqlQuery = "SELECT * FROM tasks";

    if (keyword) {
      psqlQuery += ` WHERE description LIKE '%${keyword}%' OR deadline LIKE '%${keyword}%'`;
    }

    psqlQuery += ` LIMIT $1 OFFSET $2`;

    let task = await pool.query(psqlQuery, [limit, offset]);

    const totalCount = await pool.query("SELECT COUNT(*) FROM tasks");
    const totalPages = Math.ceil(totalCount.rows[0].count / limit);

    const pagination = {
      page,
      limit,
      totalCount: totalCount.rows[0].count,
      totalPages,
    };

    res.status(200).json({
      status: true,
      message: null,
      data: task.rows,
      pagination,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/tasks/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    let task = await pool.query("SELECT * FROM tasks WHERE id = $1 ", [id]);

    if (task.rows.length === 0) {
      res.status(404).json({
        status: false,
        message: `can't find tasks with id ${id}`,
      });
    }

    res.status(200).json({
      status: true,
      message: "OK",
      data: task.rows.length ? task.rows[0] : {},
    });
  } catch (error) {
    next(error);
  }
});

router.put("/tasks/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    let { description, deadline, priority, is_completed } = req.body;

    let updateTask = await pool.query(
      "UPDATE tasks SET description = $1, deadline = $2, priority = $3, is_completed = $4 WHERE id = $5 RETURNING *",
      [description, deadline, priority, is_completed, id]
    );
    res.status(200).json({status: true, message:"Updated data successfully",data: updateTask.rows[0]});
  } catch (error) {
    next(error);
  }
});

router.delete("/tasks/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    let deleteTask = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.delete("/tasks-delete", async (req, res) => {
  let ids = req.body.ids;

  let idsStr = "";
  ids.forEach((id, idx) => {
    if (idx == 0) {
      idsStr += id;
    } else {
      idsStr += `,${id}`;
    }
  });

  let result = await pool.query(`DELETE FROM tasks WHERE id IN (${idsStr})`);
});

// internal server error
router.use((err, req, res, next) => {
  console.log(err);

  res.status(500).json({ err: err.message });
});

module.exports = router;

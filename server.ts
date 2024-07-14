import express from "express";
import mongoose, { Document, ConnectOptions } from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 4200;

app.use(cors());

app.use(bodyParser.json());

const mongooseOptions: ConnectOptions = {};

mongoose
  .connect("mongodb://localhost:27017/tododb", mongooseOptions)
  .then(() => {
    console.log("Успешно подключено к MongoDB");
  })
  .catch((error) => {
    console.error("Ошибка подключения к MongoDB:", error);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Ошибка подключения к MongoDB:"));

export interface ITodo {
  text: string;
  completed: boolean;
}

const todoSchema = new mongoose.Schema<ITodo & Document>({
  text: { type: String, required: true },
  completed: { type: Boolean, required: true },
});

const Todo = mongoose.model<ITodo & Document>("Todo", todoSchema);

app.get("/todo", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/todo", async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
      completed: false,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/todo/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        $set: { completed: req.body.completed },
      },
      { new: true }
    );
    res.json(todo);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/todo/:id", async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.delete("/todo", async (req, res) => {
  try {
    const result = await Todo.deleteMany({});
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

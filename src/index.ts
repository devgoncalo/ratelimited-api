import { Hono } from "hono";
import { todos } from "./data/data.json"

const app = new Hono();

app.get("/todos/:id", (c) => {
  const todoId = c.req.param("id");
  const todoIndex = Number(todoId);
  const todo = todos[todoIndex] || {};

  return c.json({todo})
})

export default app

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  next();
}

function hasTodoParameters(request, response, next) {
  // Complete aqui
  const { title, deadline } = request.body;

  if (!title || !deadline) {
    return response
      .status(400)
      .json({ error: "Missing required parameter(s)!" });
  }

  next();
}

function todoExists(request, response, next) {
  // Complete aqui
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(
    (currentTodo) => currentTodo.id === id
  );

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const { name, username } = request.body;
  const foundUser = users.find((user) => user.username === username);

  if (foundUser) {
    return response.status(400).json({ error: "Username already in use!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {
    user: { todos },
  } = request;

  response.status(200).json(todos);
});

app.post(
  "/todos",
  checksExistsUserAccount,
  hasTodoParameters,
  (request, response) => {
    // Complete aqui
    const { user } = request;
    const { title, deadline } = request.body;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    };

    const userIndex = users.findIndex(
      (currentUser) => currentUser.id === user.id
    );

    users[userIndex].todos.push(todo);

    return response.status(201).json(todo);
  }
);

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  todoExists,
  hasTodoParameters,
  (request, response) => {
    // Complete aqui
    const { user } = request;
    const { title, deadline } = request.body;
    const { id: todoId } = request.params;

    const userIndex = users.findIndex(
      (currentUser) => currentUser.id === user.id
    );

    const todoIndex = users[userIndex].todos.findIndex(
      (currentTodo) => currentTodo.id === todoId
    );

    const updatedTodo = {
      ...users[userIndex].todos[todoIndex],
      title,
      deadline: new Date(deadline),
    };

    users[userIndex].todos[todoIndex] = updatedTodo;

    return response.status(200).json(updatedTodo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  todoExists,
  (request, response) => {
    // Complete aqui
    const { user } = request;
    const { id } = request.params;

    const userIndex = users.findIndex(
      (currentUser) => currentUser.id === user.id
    );

    const todoIndex = user.todos.findIndex(
      (currentTodo) => currentTodo.id === id
    );

    users[userIndex].todos[todoIndex].done = true;

    return response.status(200).json(users[userIndex].todos[todoIndex]);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  todoExists,
  (request, response) => {
    // Complete aqui
    const { user } = request;
    const { id } = request.params;

    const userIndex = users.findIndex(
      (currentUser) => currentUser.id === user.id
    );

    const todoIndex = user.todos.findIndex(
      (currentTodo) => currentTodo.id === id
    );

    users[userIndex].todos.splice(todoIndex, 1);

    return response.status(204).json();
  }
);

module.exports = app;

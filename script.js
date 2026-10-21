
const list = document.getElementById("todo-list");
const addBtn = document.getElementById("add-btn");
const addForm = document.getElementById("add-form");
const todoInput = document.getElementById("todo-input");
const saveBtn = document.getElementById("save-btn");
const statusText = document.getElementById("status");

let todos = [];

function saveTodos() {
  localStorage.setItem("myTodos", JSON.stringify(todos));
}

async function sendRequest(url, method, body = null) {
  const options = { method };

  if (body !== null) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
}

function renderTodos() {
  list.innerHTML = "";

  todos.forEach(todo => {
    const item = document.createElement("p");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = todo.todo;

    if (todo.completed) {
      taskText.classList.add("completed");
    }

    checkbox.addEventListener("change", async () => {
      const previousValue = todo.completed;
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();

      try {
        await sendRequest(
          `https://dummyjson.com/todos/${todo.id}`,
          "PUT",
          { completed: todo.completed }
        );
      } catch (error) {
        console.log("Complete API error:", error);
      }
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    editBtn.addEventListener("click", () => {
      window.location.href =
        "edit.html?id=" + encodeURIComponent(todo.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", async () => {
      try {
        await sendRequest(
          `https://dummyjson.com/todos/${todo.id}`,
          "DELETE"
        );
      } catch (error) {
        console.log("Delete API error:", error);
      }

      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, taskText, editBtn, deleteBtn);
    list.appendChild(item);
  });
}

async function loadTodos() {
  const savedTodos = localStorage.getItem("myTodos");

  if (savedTodos) {
    todos = JSON.parse(savedTodos);
    renderTodos();
    return;
  }

  statusText.textContent = "Loading tasks...";

  try {
    const data = await sendRequest(
      "https://dummyjson.com/todos?limit=10",
      "GET"
    );

    todos = data.todos;
    saveTodos();
    renderTodos();
    statusText.textContent = "";
  } catch (error) {
    statusText.textContent = "Could not load tasks. Please refresh.";
    console.log(error);
  }
}

addBtn.addEventListener("click", () => {
  addForm.hidden = false;
  todoInput.focus();
});

saveBtn.addEventListener("click", async () => {
  const task = todoInput.value.trim();

  if (!task) {
    alert("Please enter a task!");
    return;
  }

  const newTodo = {
    id: Date.now(),
    todo: task,
    completed: false,
    userId: 1
  };

  try {
    await sendRequest(
      "https://dummyjson.com/todos/add",
      "POST",
      { todo: task, completed: false, userId: 1 }
    );
  } catch (error) {
    console.log("Add API error:", error);
  }

  todos.unshift(newTodo);
  saveTodos();
  renderTodos();

  todoInput.value = "";
  addForm.hidden = true;
});

loadTodos();


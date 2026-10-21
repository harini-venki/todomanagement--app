
const editForm = document.getElementById("edit-form");
const editInput = document.getElementById("edit-input");
const editStatus = document.getElementById("edit-status");

let todos = JSON.parse(localStorage.getItem("myTodos") || "[]");

const params = new URLSearchParams(window.location.search);
const todoId = params.get("id");

const todo = todos.find(item => String(item.id) === todoId);

if (!todo) {
  editStatus.textContent = "Task not found. Go back to Todo List.";
  editForm.hidden = true;
} else {
  editInput.value = todo.todo;
}

editForm.addEventListener("submit", async event => {
  event.preventDefault();

  const newTask = editInput.value.trim();

  if (!newTask) {
    editStatus.textContent = "Please enter a task name.";
    return;
  }

  const index = todos.findIndex(
    item => String(item.id) === todoId
  );

  if (index === -1) {
    editStatus.textContent = "Task not found.";
    return;
  }

  const currentTodo = todos[index];

  try {
    const response = await fetch(
      `https://dummyjson.com/todos/${currentTodo.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ todo: newTask })
      }
    );

    if (!response.ok) {
      throw new Error("Update request failed");
    }

    console.log("API update response:", await response.json());
  } catch (error) {
    console.log("Edit API error:", error);
  }

  todos[index].todo = newTask;

  localStorage.setItem("myTodos", JSON.stringify(todos));

  window.location.href = "index.html";
});


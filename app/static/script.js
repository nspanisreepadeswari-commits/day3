const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const completedCount = document.getElementById("completed-count");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const body = await response.text();
        let detail = body || `HTTP ${response.status}`;
        try {
            detail = JSON.parse(body).detail || detail;
        } catch {
            // Use the response text when the server did not return JSON.
        }
        throw new Error(detail);
    }

    if (response.status === 204) return null;
    return response.json();
}

async function loadTasks() {
    try {
        const tasks = await request("/api/tasks");
        taskList.replaceChildren();
        let completed = 0;

        tasks.forEach((task) => {
            if (task.completed) completed += 1;

            const item = document.createElement("li");
            item.className = `task${task.completed ? " done" : ""}`;

            const checkbox = document.createElement("input");
            checkbox.className = "task-checkbox";
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);
            checkbox.addEventListener("change", async () => {
                try {
                    await request(`/api/tasks/${task.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ completed: checkbox.checked })
                    });
                    await loadTasks();
                } catch (error) {
                    message.textContent = `Could not update task: ${error.message}`;
                    await loadTasks();
                }
            });

            const title = document.createElement("span");
            title.className = "task-title";
            title.textContent = task.title;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
            deleteButton.addEventListener("click", async () => {
                try {
                    await request(`/api/tasks/${task.id}`, { method: "DELETE" });
                    await loadTasks();
                } catch (error) {
                    message.textContent = `Could not delete task: ${error.message}`;
                }
            });

            item.append(checkbox, title, deleteButton);
            taskList.appendChild(item);
        });

        taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
        completedCount.textContent = `${completed} completed`;
        emptyState.hidden = tasks.length > 0;
        message.textContent = "";
    } catch (error) {
        message.textContent = `Could not load tasks: ${error.message}`;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    try {
        await request("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        input.value = "";
        await loadTasks();
        input.focus();
    } catch (error) {
        message.textContent = `Could not add task: ${error.message}`;
    }
});

loadTasks();

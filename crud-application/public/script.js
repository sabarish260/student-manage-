const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const studentId = document.getElementById("studentId");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const phoneInput = document.getElementById("phone");

const API_URL = "/api/students";

// Show a message to the user
function showMessage(text) {
  message.textContent = text;
}

// Send API request and handle errors
async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// READ: Load all students
async function loadStudents() {
  studentList.replaceChildren();

  try {
    const students = await apiRequest(API_URL);

    if (students.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 5;
      cell.textContent = "No student records found.";
      row.appendChild(cell);
      studentList.appendChild(row);
      return;
    }

    students.forEach((student) => {
      const row = document.createElement("tr");

      [student.name, student.email, student.department, student.phone]
        .forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });

      const actionCell = document.createElement("td");

      // EDIT button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "action-btn";

      editBtn.addEventListener("click", () => {
        studentId.value = student._id;
        nameInput.value = student.name;
        emailInput.value = student.email;
        departmentInput.value = student.department;
        phoneInput.value = student.phone;

        submitBtn.textContent = "Update Student";
        showMessage("Edit the details and click Update Student.");
        studentForm.scrollIntoView({ behavior: "smooth" });
      });

      // DELETE button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "action-btn delete-btn";

      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Do you want to delete this student?")) {
          return;
        }

        try {
          await apiRequest(`${API_URL}/${student._id}`, {
            method: "DELETE"
          });

          showMessage("Student deleted successfully!");
          await loadStudents();
        } catch (error) {
          showMessage(error.message);
        }
      });

      actionCell.append(editBtn, deleteBtn);
      row.appendChild(actionCell);
      studentList.appendChild(row);
    });
  } catch (error) {
    showMessage(`Could not load students: ${error.message}`);
  }
}

// CREATE and UPDATE using the same form
studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isEditing = Boolean(studentId.value);

  const student = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    department: departmentInput.value.trim(),
    phone: phoneInput.value.trim()
  };

  if (
    !student.name ||
    !student.email ||
    !student.department ||
    !student.phone
  ) {
    showMessage("Please fill in all fields.");
    return;
  }

  submitBtn.disabled = true;

  try {
    const url = isEditing
      ? `${API_URL}/${studentId.value}`
      : API_URL;

    await apiRequest(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(student)
    });

    showMessage(
      isEditing
        ? "Student updated successfully!"
        : "Student added successfully!"
    );

    studentForm.reset();
    studentId.value = "";
    submitBtn.textContent = "Add Student";

    await loadStudents();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitBtn.disabled = false;
  }
});

// Load saved records when the page opens
loadStudents();
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  List,
  ListItem,
  Container,
  CssBaseline,
  Box
} from "@mui/material";

const API = "http://localhost:8000/api/customers";

function App() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then(setCustomers);
  }, []);

  const handleDeleteCustomer = (customerId) => {
    fetch(`${API}/${customerId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setCustomers(customers.filter((c) => c.id !== customerId));
        if (selected && selected.id === customerId) setSelected(null);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      alert("Name should contain only alphabets and spaces.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      alert("Invalid email address.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      alert("Phone must be exactly 10 digits.");
      return;
    }
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((newCustomer) => {
        setCustomers([...customers, newCustomer]);
        setForm({
          name: "",
          email: "",
          phone: "",
          status: "",
          notes: "",
        });
      });
  };

  const selectCustomer = (id) => {
    fetch(API + "/" + id)
      .then((r) => r.json())
      .then(setSelected);
  };

  const handleTask = (id, task) => {
    fetch(`${API}/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: task }),
    }).then(() => selectCustomer(id));
  };

  const handleTaskComplete = (taskIdx) => {
    if (!selected) return;
    // Mark task at taskIdx as done=true locally first
    const updatedTasks = selected.tasks.map((task, idx) =>
      idx === taskIdx ? { ...task, done: true } : task
    );
    // Update selected object & refresh UI
    setSelected({ ...selected, tasks: updatedTasks });

    // Optionally, update on backend if there's a PATCH or PUT API endpoint for task update:
    // Since your backend doesn't have it, you may skip this or implement accordingly.
  };

  const handleDeleteTask = (customerId, taskIdx) => {
    fetch(`${API}/${customerId}/tasks/${taskIdx}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => selectCustomer(customerId));
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: "40px 0" }}>
        <Card
          sx={{ marginBottom: 4, padding: 3, boxShadow: "0 2px 12px #eee" }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Simple CRM System
          </Typography>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}
          >
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[a-zA-Z\s]*$/.test(val)) {
                  setForm({ ...form, name: val });
                }
              }}
              required
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              size="small"
            />
            <TextField
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,10}$/.test(val)) {
                  setForm({ ...form, phone: val });
                }
              }}
              inputProps={{ maxLength: 10 }}
              required
              size="small"
            />
            <TextField
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              size="small"
            />
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ height: 40 }}
            >
              Add Customer
            </Button>
          </form>
        </Card>
        <Card sx={{ marginBottom: 4, padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            Customer List
          </Typography>
          <List>
            {customers.map((c) => (
              <ListItem
                key={c.id}
                secondaryAction={
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => selectCustomer(c.id)}
                      sx={{ marginRight: "8px" }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteCustomer(c.id)}
                    >
                      Delete
                    </Button>
                  </>
                }
              >
                <Typography>
                  {c.name} - {c.email} ({c.status})
                </Typography>
              </ListItem>
            ))}
          </List>
        </Card>
        {selected && (
          <Card sx={{ marginBottom: 4, padding: 3 }}>
            <Typography variant="h5" gutterBottom>
              {selected.name}'s Details
            </Typography>
            <Typography>Email: {selected.email}</Typography>
            <Typography>Phone: {selected.phone}</Typography>
            <Typography>Status: {selected.status}</Typography>
            <Typography>Notes: {selected.notes}</Typography>
            <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
              Tasks
            </Typography>
            <List>
              {selected.tasks &&
                selected.tasks.map((task, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      textDecoration: task.done ? "line-through" : "none",
                      color: task.done ? "rgba(0, 0, 0, 0.6)" : "inherit",
                      transition: "color 0.3s ease",
                    }}
                    secondaryAction={
                      <>
                        {!task.done && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ marginRight: 1 }}
                            onClick={() => handleTaskComplete(idx)}
                          >
                            Task Completed
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleDeleteTask(selected.id, idx)}
                        >
                          Delete
                        </Button>
                      </>
                    }
                  >
                    <Typography>
                      {task.text} - {task.done ? "Completed" : "Pending"}
                    </Typography>
                  </ListItem>
                ))}
            </List>
            <TaskInput customerId={selected.id} onAdd={handleTask} />
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}

function TaskInput({ customerId, onAdd }) {
  const [task, setTask] = React.useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (task.trim()) {
          onAdd(customerId, task);
          setTask("");
        }
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <TextField
        label="Add Task"
        value={task}
        size="small"
        onChange={(e) => setTask(e.target.value)}
      />
      <Button type="submit" variant="contained" size="small">
        Add
      </Button>
    </form>
  );
}

export default App;

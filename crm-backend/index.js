const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

let customers = [];
let id = 1;

app.get("/api/customers", (req, res) => res.json(customers));
app.post("/api/customers", (req, res) => {
  const customer = { id: id++, ...req.body, tasks: [] };
  customers.push(customer);
  res.status(201).json(customer);
});
app.put("/api/customers/:id", (req, res) => {
  const idx = customers.findIndex(c => c.id == req.params.id);
  customers[idx] = { ...customers[idx], ...req.body };
  res.json(customers[idx]);
});
app.get("/api/customers/:id", (req, res) => {
  const customer = customers.find(c => c.id == req.params.id);
  res.json(customer);
});

app.post("/api/customers/:id/tasks", (req, res) => {
  const customer = customers.find(c => c.id == req.params.id);
  customer.tasks.push({ text: req.body.text, done: false });
  res.json(customer.tasks);
});

app.delete("/api/customers/:id/tasks/:taskIdx", (req, res) => {
  const customer = customers.find(c => c.id == req.params.id);
  if (customer) {
    customer.tasks.splice(req.params.taskIdx, 1);
    res.json(customer.tasks);
  } else {
    res.status(404).send('Customer not found');
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const idx = customers.findIndex(c => c.id == req.params.id);
  if (idx !== -1) {
    customers.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});



const PORT = 8000;
app.listen(PORT, () => console.log("Server started on port", PORT));

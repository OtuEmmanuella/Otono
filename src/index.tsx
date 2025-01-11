import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";

// Get the container element
const container = document.querySelector("#root");

if (container) {
  const root = createRoot(container); // Create a root
  root.render(<App />); // Render your app
} else {
  console.error("Root container not found");
}

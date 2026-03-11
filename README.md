# 📖 Narrative

A minimalist, high-performance writing workspace. **Narrative** is a single-file application designed for focused storytelling and structured content generation.

## ⚡ Quick Start

1. **Open:** Simply open `index.html` in any modern web browser.
2. **Draft:** Enter your story beats or raw notes into the editor.
3. **Process:** Use the action buttons to see your structured output.

---

## 🤖 Dual-Mode Processing

This application adapts based on your configuration:

### **1. Standard Mode (Default)**

* **No API Key Required.**
* The app acts as a **structured mirror**. It will output exactly what has been entered in the editor, ensuring your original intent and formatting are preserved perfectly.

### **2. Enhanced Mode (Anthropic AI)**

* **Requires an Anthropic API Key.**
* Once a key is configured, the app transitions into an **AI-powered storyteller**. It uses Claude to intelligently process, expand, and refine your inputs into a cohesive narrative.

---

## 🛠️ Configuration & Deployment

Because this is a pure HTML/JS project, it is incredibly lightweight and easy to manage.

### **Adding your API Key**

To enable AI features, locate the configuration section within the `<script>` tag of the HTML file:

```javascript
const ANTHROPIC_API_KEY = 'your_key_here';

```

> [!IMPORTANT]
> **Security Note:** Since this is a client-side HTML file, any key entered directly into the script will be visible in the "View Source" of the browser. For private use, keep the file local. For public use, consider using a UI-based input field that stores the key in `sessionStorage`.

### **Deployment**

This app is ready for instant deployment on:

* **Vercel:** Just drag and drop the folder.
* **GitHub Pages:** Push the file and enable Pages in settings.
* **Local:** Runs perfectly as a standalone file.

---

## 🛡️ Privacy

* **Local First:** Your writing stays in your browser.
* **Direct Connection:** When AI is enabled, your data is sent directly to Anthropic's API—no middle-man servers or external databases involved.


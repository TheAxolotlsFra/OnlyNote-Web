// ==========================
// ELEMENTS
// ==========================

const editor = document.getElementById("editor");

const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const underlineBtn = document.getElementById("underlineBtn");

const fontSizeSelect = document.getElementById("fontSize");
const textColorSelect = document.getElementById("textColor");

const themeToggle = document.getElementById("themeToggle");

const newFileBtn = document.getElementById("newFile");
const saveBtn = document.getElementById("saveFile");
const saveAsBtn = document.getElementById("saveAsFile");
const openBtn = document.getElementById("openFile");
const exportTxtBtn = document.getElementById("exportTxt");
const exportHtmlBtn = document.getElementById("exportHtml");

const saveStatus = document.getElementById("saveStatus");

let currentFileName = null;
let saveTimeout;


// ==========================
// FILE DROPDOWN (CLICK TOGGLE)
// ==========================

const dropdownContent = document.querySelector(".dropdown-content");
const menuBtn = document.querySelector(".menu-btn");

menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownContent.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
        dropdownContent.classList.remove("show");
    }
});


// ==========================
// TEXT FORMATTING
// ==========================

boldBtn.addEventListener("click", () => document.execCommand("bold"));
italicBtn.addEventListener("click", () => document.execCommand("italic"));
underlineBtn.addEventListener("click", () => document.execCommand("underline"));

fontSizeSelect.addEventListener("change", () => {
    document.execCommand("fontSize", false, "7");
    editor.querySelectorAll("font[size='7']").forEach(el => {
        el.removeAttribute("size");
        el.style.fontSize = fontSizeSelect.value + "px";
    });
});

textColorSelect.addEventListener("change", () => {
    document.execCommand("foreColor", false, textColorSelect.value);
});


// ==========================
// DARK / LIGHT MODE
// ==========================

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light Mode";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "Dark Mode";
    }
});


// ==========================
// FILE SYSTEM
// ==========================

newFileBtn.addEventListener("click", () => {
    editor.innerHTML = "";
    currentFileName = null;
});

saveBtn.addEventListener("click", () => {
    if (!currentFileName) saveAs();
    else saveFile(currentFileName);
});

saveAsBtn.addEventListener("click", saveAs);

function saveAs() {
    let filename = prompt("Enter file name:", currentFileName || "document.on");
    if (!filename) return;

    if (!filename.endsWith(".on")) filename += ".on";

    currentFileName = filename;
    saveFile(filename);
}

function saveFile(filename) {
    const blob = new Blob([editor.innerHTML], { type: "text/plain" });
    downloadFile(blob, filename);
}

openBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".on,.txt,.html";

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            editor.innerHTML = event.target.result;
            currentFileName = file.name;
            autoSave();
        };
        reader.readAsText(file);
    };

    input.click();
});


// ==========================
// EXPORT SYSTEM
// ==========================

exportTxtBtn.addEventListener("click", () => {
    const text = editor.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    downloadFile(blob, "document.txt");
});

exportHtmlBtn.addEventListener("click", () => {
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Exported Document</title>
</head>
<body>
${editor.innerHTML}
</body>
</html>
`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    downloadFile(blob, "document.html");
});

function downloadFile(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}


// ==========================
// AUTO SAVE + INDICATOR
// ==========================

editor.addEventListener("input", () => {
    showSaving();
    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
        autoSave();
        showSaved();
    }, 500);
});

function autoSave() {
    localStorage.setItem("onlynote_content", editor.innerHTML);
    localStorage.setItem("onlynote_filename", currentFileName);
}

function showSaving() {
    saveStatus.textContent = "Saving...";
    saveStatus.className = "saving";
}

function showSaved() {
    saveStatus.textContent = "Saved ✔";
    saveStatus.className = "saved";
}


// Restore on load
window.addEventListener("load", () => {
    const savedContent = localStorage.getItem("onlynote_content");
    const savedFileName = localStorage.getItem("onlynote_filename");

    if (savedContent) editor.innerHTML = savedContent;
    if (savedFileName) currentFileName = savedFileName;

    showSaved();
});

// ELEMENTS
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
const exportPdfBtn = document.getElementById("exportPdf");

const saveStatus = document.getElementById("saveStatus");

let currentFileName = null;
let saveTimeout;

// FILE DROPDOWN
const dropdownContent = document.querySelector(".dropdown-content");
const menuBtn = document.querySelector(".menu-btn");

menuBtn.addEventListener("click", e => {
    e.stopPropagation();
    dropdownContent.classList.toggle("show");
});

document.addEventListener("click", e => {
    if (!e.target.closest(".dropdown")) dropdownContent.classList.remove("show");
});

// TEXT FORMATTING
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

// UPDATE ACTIVE BUTTONS
function updateFormattingButtons() {
    boldBtn.classList.toggle("active", document.queryCommandState("bold"));
    italicBtn.classList.toggle("active", document.queryCommandState("italic"));
    underlineBtn.classList.toggle("active", document.queryCommandState("underline"));
}

editor.addEventListener("keyup", updateFormattingButtons);
editor.addEventListener("mouseup", updateFormattingButtons);
editor.addEventListener("focus", updateFormattingButtons);
editor.addEventListener("blur", updateFormattingButtons);

// DARK/LIGHT MODE
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

// FILE OPERATIONS
newFileBtn.addEventListener("click", () => { editor.innerHTML = ""; currentFileName = null; });

saveBtn.addEventListener("click", () => { if (!currentFileName) saveAs(); else saveFile(currentFileName); });
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
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => { editor.innerHTML = event.target.result; currentFileName = file.name; autoSave(); };
        reader.readAsText(file);
    };
    input.click();
});

// EXPORT
exportTxtBtn.addEventListener("click", () => { downloadFile(new Blob([editor.innerText], { type: "text/plain" }), "document.txt"); });
exportHtmlBtn.addEventListener("click", () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Exported Document</title></head><body>${editor.innerHTML}</body></html>`;
    downloadFile(new Blob([html], { type: "text/html" }), "document.html");
});
exportPdfBtn.addEventListener("click", exportToPDF);

function exportToPDF() {
    const win = window.open("", "_blank");
    const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${currentFileName||'Document'}</title>
<style>body{font-family:"Segoe UI",Arial,sans-serif;padding:40px;line-height:1.6;color:#000;}@media print{body{margin:0;}}</style>
</head><body>${editor.innerHTML}
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script></body></html>`;
    win.document.open(); win.document.write(content); win.document.close();
}

// HELPER
function downloadFile(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// AUTO SAVE
editor.addEventListener("input", () => {
    showSaving();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => { autoSave(); showSaved(); }, 500);
});

function autoSave() {
    localStorage.setItem("onlynote_content", editor.innerHTML);
    localStorage.setItem("onlynote_filename", currentFileName);
}

function showSaving() { saveStatus.textContent = "Saving..."; saveStatus.className = "saving"; }
function showSaved() { saveStatus.textContent = "Saved ✔"; saveStatus.className = "saved"; }

window.addEventListener("load", () => {
    const savedContent = localStorage.getItem("onlynote_content");
    const savedFileName = localStorage.getItem("onlynote_filename");
    if (savedContent) editor.innerHTML = savedContent;
    if (savedFileName) currentFileName = savedFileName;
    showSaved();
});

// KEYBOARD SHORTCUTS
window.addEventListener("keydown", e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;
    switch (e.key.toLowerCase()) {
        case "b": e.preventDefault(); document.execCommand("bold"); break;
        case "i": e.preventDefault(); document.execCommand("italic"); break;
        case "u": e.preventDefault(); document.execCommand("underline"); break;
        case "s": e.preventDefault(); if(!currentFileName) saveAs(); else saveFile(currentFileName); break;
        case "o": e.preventDefault(); openBtn.click(); break;
        case "n": e.preventDefault(); newFileBtn.click(); break;
        case "p": e.preventDefault(); exportToPDF(); break;
    }
});

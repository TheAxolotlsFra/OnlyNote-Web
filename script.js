// ==========================
// ELEMENTS
// ==========================
const editor = document.getElementById("editor");

const boldBtn = document.getElementById("bold");
const italicBtn = document.getElementById("italic");
const underlineBtn = document.getElementById("underline");

const fontSizeSelect = document.getElementById("fontSize");
const textColorSelect = document.getElementById("textColor");

const modeBtn = document.getElementById("mode");

const saveBtn = document.getElementById("save");
const saveAsBtn = document.getElementById("saveAs");
const openBtn = document.getElementById("open");
const openFileInput = document.getElementById("openFile");

let currentFileName = null;


// ==========================
// TEXT FORMATTING
// ==========================

boldBtn.addEventListener("click", () => {
    document.execCommand("bold");
});

italicBtn.addEventListener("click", () => {
    document.execCommand("italic");
});

underlineBtn.addEventListener("click", () => {
    document.execCommand("underline");
});

// Font Size
fontSizeSelect.addEventListener("change", () => {
    const size = fontSizeSelect.value;

    document.execCommand("fontSize", false, "7");

    editor.querySelectorAll("font[size='7']").forEach(el => {
        el.removeAttribute("size");
        el.style.fontSize = size + "px";
    });
});

// Text Color
textColorSelect.addEventListener("change", () => {
    document.execCommand("foreColor", false, textColorSelect.value);
});


// ==========================
// DARK / LIGHT MODE
// ==========================

modeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    modeBtn.textContent =
        document.body.classList.contains("dark-mode")
        ? "Light Mode"
        : "Dark Mode";
});


// ==========================
// FILE SYSTEM
// ==========================

// Save
saveBtn.addEventListener("click", () => {
    if (!currentFileName) {
        saveAs();
    } else {
        saveFile(currentFileName);
    }
});

// Save As
saveAsBtn.addEventListener("click", saveAs);

function saveAs() {
    let filename = prompt("Enter file name:", currentFileName || "document.on");
    if (!filename) return;

    if (!filename.endsWith(".on")) {
        filename += ".on";
    }

    currentFileName = filename;
    saveFile(filename);
}

// Save File
function saveFile(filename) {
    const content = editor.innerHTML;
    const blob = new Blob([content], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Open
openBtn.addEventListener("click", () => openFileInput.click());

openFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file && file.name.endsWith(".on")) {
        const reader = new FileReader();

        reader.onload = (event) => {
            editor.innerHTML = event.target.result;
            currentFileName = file.name;
            autoSave(); // save opened file into local storage
        };

        reader.readAsText(file);
    } else {
        alert("Please select a valid .on file.");
    }
});


// ==========================
// AUTO SAVE SYSTEM
// ==========================

// Save automatically every 1 second
setInterval(autoSave, 1000);

function autoSave() {
    localStorage.setItem("onlynote_content", editor.innerHTML);
    localStorage.setItem("onlynote_filename", currentFileName);
}

// Restore when page loads
window.addEventListener("load", () => {
    const savedContent = localStorage.getItem("onlynote_content");
    const savedFileName = localStorage.getItem("onlynote_filename");

    if (savedContent) {
        editor.innerHTML = savedContent;
    }

    if (savedFileName) {
        currentFileName = savedFileName;
    }
});

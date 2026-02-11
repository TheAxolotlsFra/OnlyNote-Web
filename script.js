const editor = document.getElementById("editor");
const tailleSelect = document.getElementById("taille");
const grasBtn = document.getElementById("gras");
const italiqueBtn = document.getElementById("italique");
const couleurSelect = document.getElementById("couleur");
const modeBtn = document.getElementById("mode");

let currentFileName = null; // nom du fichier ouvert

// ===== Taille =====
tailleSelect.addEventListener("change", () => {
    const taille = tailleSelect.value;
    document.execCommand("fontSize", false, "7"); // workaround execCommand
    editor.querySelectorAll("font[size='7']").forEach(el => {
        el.removeAttribute('size');
        el.style.fontSize = taille + "px";
    });
});

// ===== Gras / Italique =====
grasBtn.addEventListener("click", () => {
    document.execCommand("bold", false, null);
    grasBtn.classList.toggle("active");
});

italiqueBtn.addEventListener("click", () => {
    document.execCommand("italic", false, null);
    italiqueBtn.classList.toggle("active");
});

// ===== Couleur =====
couleurSelect.addEventListener("change", () => {
    const couleur = couleurSelect.value;
    document.execCommand("foreColor", false, couleur);
});

// ===== Mode sombre / clair =====
modeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    modeBtn.textContent = document.body.classList.contains("dark-mode") ? "Mode clair" : "Mode sombre";
});

// ===== Mise à jour boutons selon curseur =====
editor.addEventListener("keyup", updateButtons);
editor.addEventListener("mouseup", updateButtons);

function updateButtons() {
    document.queryCommandState('bold') ? grasBtn.classList.add('active') : grasBtn.classList.remove('active');
    document.queryCommandState('italic') ? italiqueBtn.classList.add('active') : italiqueBtn.classList.remove('active');
}

// ===== Save / Save As / Open =====
const saveBtn = document.getElementById("save");
const saveAsBtn = document.getElementById("saveAs");
const openBtn = document.getElementById("open");
const openFileInput = document.getElementById("openFile");

// --- Save ---
saveBtn.addEventListener("click", () => {
    if (!currentFileName) {
        saveAs();
    } else {
        saveFile(currentFileName);
    }
});

// --- Save As ---
saveAsBtn.addEventListener("click", saveAs);

function saveAs() {
    let filename = prompt("Entrez le nom du fichier :", currentFileName || "document.on");
    if (!filename) return; // annuler
    if (!filename.endsWith(".on")) filename += ".on";
    currentFileName = filename;
    saveFile(filename);
}

function saveFile(filename) {
    const content = editor.innerHTML;
    const blob = new Blob([content], {type: "text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// --- Open ---
openBtn.addEventListener("click", () => openFileInput.click());

openFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(file && file.name.endsWith(".on")){
        const reader = new FileReader();
        reader.onload = (ev) => {
            editor.innerHTML = ev.target.result;
            currentFileName = file.name;
        }
        reader.readAsText(file);
    } else {
        alert("Veuillez sélectionner un fichier .on valide !");
    }
});

const editor = document.getElementById("editor");
const tailleSelect = document.getElementById("taille");
const grasBtn = document.getElementById("gras");
const italiqueBtn = document.getElementById("italique");
const couleurSelect = document.getElementById("couleur");
const modeBtn = document.getElementById("mode");
const saveBtn = document.getElementById("save");
const openBtn = document.getElementById("open");
const openFileInput = document.getElementById("openFile");
const body = document.body;

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
    body.classList.toggle("dark-mode");
    modeBtn.textContent = body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
});

// ===== Mise à jour boutons selon curseur =====
editor.addEventListener("keyup", updateButtons);
editor.addEventListener("mouseup", updateButtons);

function updateButtons() {
    document.queryCommandState('bold') ? grasBtn.classList.add('active') : grasBtn.classList.remove('active');
    document.queryCommandState('italic') ? italiqueBtn.classList.add('active') : italiqueBtn.classList.remove('active');
}

// ===== Sauvegarder fichier .on =====
saveBtn.addEventListener("click", () => {
    const content = editor.innerHTML;
    const blob = new Blob([content], {type: "text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.on";
    link.click();
});

// ===== Ouvrir fichier .on =====
openBtn.addEventListener("click", () => openFileInput.click());
openFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(file && file.name.endsWith(".on")){
        const reader = new FileReader();
        reader.onload = (ev) => {
            editor.innerHTML = ev.target.result;
        }
        reader.readAsText(file);
    } else {
        alert("Veuillez sélectionner un fichier .on valide !");
    }
});

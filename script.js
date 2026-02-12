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
const exportPdfBtn = document.getElementById("exportPdf");

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
// UPDATE ACTIVE BUTTONS
// ==========================
function updateFormattingButtons() {
    boldBtn.classList.toggle("active", document.queryCommandState("bold"));
    italicBtn.classList.toggle("active", document.queryCommandState("italic"));
    underlineBtn.classList.toggle("active", document.queryCommandState("underline"));
}

editor.addEventListener("keyup", updateFormattingButtons);
editor.addEventListener("mouseup", updateFormattingButtons);
editor.addEventListener("focus", updateFormattingButtons);
editor.addEventListener("blur", updateFormattingButtons);

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
// FILE OPERATIONS
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

exportPdfBtn.addEventListener("click", exportToPDF);

function exportToPDF() {
    const printWindow = window.open("", "_blank");
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${currentFileName || "Document"}</title>
<style>
    body { font-family: "Segoe UI", Arial, sans-serif; padding: 40px; line-height: 1.6; color: #000; }
    @media print { body { margin: 0; } }
</style>
</head>
<body>
${editor.innerHTML}
<script>
    window.onload = function() {
        window.print();
        window.onafterprint = function() { window.close(); }
    }
<\/script>
</body>
</html>
`;
    printWindow.document.open();
    printWindow.document.write(pdfContent);
    printWindow.document.close();
}

function exportODT() {
    const content = document.getElementById("editor").innerHTML;
    
    // Convertir HTML en texte ODT formaté
    const { textContent, styles } = htmlToODTText(content);

    const zip = new JSZip();

    // 1. mimetype (doit être non compressé et en premier)
    zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });

    // 2. manifest.xml
    zip.file("META-INF/manifest.xml", `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
 <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
 <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
 <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
 <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`);

    // 3. content.xml (contenu principal)
    zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
 office:version="1.2">
 <office:automatic-styles>
  <style:style style:name="Bold" style:family="text">
   <style:text-properties fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Italic" style:family="text">
   <style:text-properties fo:font-style="italic"/>
  </style:style>
  <style:style style:name="Underline" style:family="text">
   <style:text-properties style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/>
  </style:style>
${styles}
 </office:automatic-styles>
 <office:body>
  <office:text>
${textContent}
  </office:text>
 </office:body>
</office:document-content>`);

    // 4. styles.xml
    zip.file("styles.xml", `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
 office:version="1.2">
 <office:styles>
  <style:default-style style:family="paragraph">
   <style:paragraph-properties fo:line-height="115%"/>
   <style:text-properties style:font-name="Liberation Sans" fo:font-size="12pt"/>
  </style:default-style>
 </office:styles>
</office:document-styles>`);

    // 5. meta.xml
    zip.file("meta.xml", `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
 xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
 office:version="1.2">
 <office:meta>
  <meta:generator>OnlyNote Web Editor</meta:generator>
  <meta:creation-date>${new Date().toISOString()}</meta:creation-date>
 </office:meta>
</office:document-meta>`);

    // Générer et télécharger
    zip.generateAsync({ 
        type: "blob",
        mimeType: "application/vnd.oasis.opendocument.text",
        compression: "DEFLATE"
    }).then(function(blob) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = (currentFileName ? currentFileName.replace(/\.[^.]+$/, '') : 'document') + ".odt";
        a.click();
    });
}

// Fonction pour convertir HTML en format ODT
function htmlToODTText(html) {
    // Créer un élément temporaire pour parser le HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let result = '';
    let styleCounter = 0;
    const generatedStyles = new Map();
    let stylesXML = '';
    
    // Fonction pour générer un nom de style unique
    function getStyleName(properties) {
        const key = JSON.stringify(properties);
        if (generatedStyles.has(key)) {
            return generatedStyles.get(key);
        }
        
        const styleName = `Style${styleCounter++}`;
        generatedStyles.set(key, styleName);
        
        // Générer le XML du style
        let styleProps = [];
        
        if (properties.fontSize) {
            styleProps.push(`fo:font-size="${properties.fontSize}pt"`);
        }
        if (properties.color) {
            styleProps.push(`fo:color="${properties.color}"`);
        }
        if (properties.bold) {
            styleProps.push(`fo:font-weight="bold"`);
        }
        if (properties.italic) {
            styleProps.push(`fo:font-style="italic"`);
        }
        if (properties.underline) {
            styleProps.push(`style:text-underline-style="solid"`);
            styleProps.push(`style:text-underline-width="auto"`);
            styleProps.push(`style:text-underline-color="font-color"`);
        }
        
        if (styleProps.length > 0) {
            stylesXML += `  <style:style style:name="${styleName}" style:family="text">
   <style:text-properties ${styleProps.join(' ')}/>
  </style:style>
`;
        }
        
        return styleName;
    }
    
    // Convertir une couleur RGB/nom en format hex
    function colorToHex(color) {
        if (!color || color === 'inherit') return null;
        
        // Si déjà en hex
        if (color.startsWith('#')) return color;
        
        // Couleurs nommées
        const namedColors = {
            'black': '#000000',
            'blue': '#0000ff',
            'red': '#ff0000',
            'green': '#008000',
            'white': '#ffffff',
            'yellow': '#ffff00',
            'purple': '#800080',
            'orange': '#ffa500'
        };
        
        if (namedColors[color.toLowerCase()]) {
            return namedColors[color.toLowerCase()];
        }
        
        // Si c'est rgb()
        if (color.startsWith('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const r = parseInt(matches[0]).toString(16).padStart(2, '0');
                const g = parseInt(matches[1]).toString(16).padStart(2, '0');
                const b = parseInt(matches[2]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        }
        
        return null;
    }
    
    // Extraire les propriétés de style d'un noeud
    function getNodeProperties(node) {
        const properties = {};
        
        if (node.nodeType !== Node.ELEMENT_NODE) return properties;
        
        const tagName = node.tagName.toLowerCase();
        const computedStyle = window.getComputedStyle ? window.getComputedStyle(node) : null;
        
        // Gras
        if (tagName === 'b' || tagName === 'strong' || 
            node.style.fontWeight === 'bold' || node.style.fontWeight >= 600 ||
            (computedStyle && (computedStyle.fontWeight === 'bold' || computedStyle.fontWeight >= 600))) {
            properties.bold = true;
        }
        
        // Italique
        if (tagName === 'i' || tagName === 'em' || 
            node.style.fontStyle === 'italic' ||
            (computedStyle && computedStyle.fontStyle === 'italic')) {
            properties.italic = true;
        }
        
        // Souligné
        if (tagName === 'u' || 
            node.style.textDecoration?.includes('underline') ||
            (computedStyle && computedStyle.textDecoration?.includes('underline'))) {
            properties.underline = true;
        }
        
        // Taille de police
        let fontSize = node.style.fontSize;
        if (fontSize && fontSize.includes('px')) {
            // Convertir px en pt (1px ≈ 0.75pt)
            const pxValue = parseFloat(fontSize);
            properties.fontSize = Math.round(pxValue * 0.75);
        } else if (computedStyle && computedStyle.fontSize && computedStyle.fontSize.includes('px')) {
            const pxValue = parseFloat(computedStyle.fontSize);
            // Ne garder que si différent de la taille par défaut (16px)
            if (Math.abs(pxValue - 16) > 1) {
                properties.fontSize = Math.round(pxValue * 0.75);
            }
        }
        
        // Couleur
        let color = node.style.color || (computedStyle ? computedStyle.color : null);
        if (color) {
            const hexColor = colorToHex(color);
            if (hexColor && hexColor !== '#000000') { // Ignorer noir par défaut
                properties.color = hexColor;
            }
        }
        
        // Gérer les balises font avec attribut color
        if (tagName === 'font' && node.getAttribute('color')) {
            const hexColor = colorToHex(node.getAttribute('color'));
            if (hexColor) {
                properties.color = hexColor;
            }
        }
        
        return properties;
    }
    
    // Parcourir les noeuds
    function processNode(node, inheritedProps = {}) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Échapper les caractères XML spéciaux
            const text = node.textContent
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            // Si on a des propriétés héritées, appliquer le style
            if (Object.keys(inheritedProps).length > 0) {
                const styleName = getStyleName(inheritedProps);
                return `<text:span text:style-name="${styleName}">${text}</text:span>`;
            }
            
            return text;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            // Gérer les retours à la ligne
            if (tagName === 'br') {
                return '<text:line-break/>';
            }
            
            // Récupérer les propriétés de ce noeud
            const nodeProps = getNodeProperties(node);
            
            // Fusionner avec les propriétés héritées
            const combinedProps = { ...inheritedProps, ...nodeProps };
            
            // Traiter les enfants
            let content = '';
            for (let child of node.childNodes) {
                content += processNode(child, combinedProps);
            }
            
            // Gérer les paragraphes et divs
            if (tagName === 'div' || tagName === 'p') {
                return `   <text:p>${content}</text:p>\n`;
            }
            
            return content;
        }
        
        return '';
    }
    
    // Si le contenu est vide, retourner un paragraphe vide
    if (!temp.textContent.trim()) {
        return { textContent: '   <text:p></text:p>', styles: '' };
    }
    
    // Traiter tout le contenu
    result = processNode(temp);
    
    // Si pas de paragraphes créés, envelopper dans un paragraphe
    if (!result.includes('<text:p>')) {
        result = `   <text:p>${result}</text:p>`;
    }
    
    return { textContent: result, styles: stylesXML };
}


// ==========================
// HELPER: DOWNLOAD
// ==========================
function downloadFile(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// ==========================
// AUTO SAVE + LIVE INDICATOR
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

// Restore saved content
window.addEventListener("load", () => {
    const savedContent = localStorage.getItem("onlynote_content");
    const savedFileName = localStorage.getItem("onlynote_filename");

    if (savedContent) editor.innerHTML = savedContent;
    if (savedFileName) currentFileName = savedFileName;

    showSaved();
});

// ==========================
// KEYBOARD SHORTCUTS
// ==========================
window.addEventListener("keydown", (e) => {
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

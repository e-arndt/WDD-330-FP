function updateCopyrightYear() {
    const yearElement = document.querySelector("#copyright-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


export function renderWithTemplate(template, parentElement, callback) {
    parentElement.innerHTML = template;
    if (callback) {
        callback(); // Ensure the callback runs after the footer loads
    }
}



export async function loadTemplate(path) {
    const res = await fetch(path);
    const template = await res.text();
    return template;
  }


export async function loadHeaderFooter() {
    const headerTemplate = await loadTemplate("./header.html");
    const headerElement = document.querySelector("#main-header");
    renderWithTemplate(headerTemplate, headerElement);

    const footerTemplate = await loadTemplate("./footer.html");
    const footerElement = document.querySelector("#footer");
    renderWithTemplate(footerTemplate, footerElement, updateCopyrightYear);
}



(() => {
  let savedTheme = null;
  try {
    savedTheme = JSON.parse(localStorage.getItem("ontology-showcase.theme"));
  } catch {
    // Storage is optional; the system preference remains the fallback.
  }

  const preferredTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  document.documentElement.dataset.theme =
    savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme;
})();

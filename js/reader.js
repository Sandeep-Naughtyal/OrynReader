let book, rendition;
let fontSize = 100; // percent

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file && file.name.endsWith('.epub')) {
    const reader = new FileReader();

    reader.onload = function () {
      const arrayBuffer = reader.result;

      try {
        book = ePub(arrayBuffer);
        rendition = book.renderTo("viewer", {
          width: "100%",
          height: "100%",
        });

        rendition.display();

        // Register themes
        rendition.themes.register('light', {
          body: { background: "#ffffff", color: "#000000" }
        });
        rendition.themes.register('dark', {
          body: { background: "#1e1e1e", color: "#ffffff" }
        });
        rendition.themes.register('sepia', {
          body: { background: "#f4ecd8", color: "#5b4636" }
        });

        // Apply theme based on body class
        const isDark = document.body.classList.contains('dark');
        const theme = isDark ? 'dark' : 'light';
        rendition.themes.select(theme);
        document.getElementById('reading-theme-select').value = theme;

        // Apply initial font size
        rendition.themes.fontSize(`${fontSize}%`);

        // Navigation buttons
        document.getElementById('prev').onclick = () => rendition.prev();
        document.getElementById('next').onclick = () => rendition.next();

        // Theme dropdown change
        document.getElementById('reading-theme-select').addEventListener('change', (e) => {
          rendition.themes.select(e.target.value);
        });

        // Font size buttons
        document.getElementById('increase-font').addEventListener('click', () => {
          fontSize += 10;
          rendition.themes.fontSize(`${fontSize}%`);
        });

        document.getElementById('decrease-font').addEventListener('click', () => {
          if (fontSize > 50) {
            fontSize -= 10;
            rendition.themes.fontSize(`${fontSize}%`);
          }
        });

        // Load TOC and build sidebar
        book.loaded.navigation.then(function (toc) {
          const sidebarList = document.querySelector("#sidebar ul");
          sidebarList.innerHTML = "";

          toc.forEach(function (chapter) {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.textContent = chapter.label;
            link.href = "#";
            link.addEventListener("click", (e) => {
              e.preventDefault();
              rendition.display(chapter.href); // Simple direct use
            });
            item.appendChild(link);
            sidebarList.appendChild(item);
          });
        });

      } catch (err) {
        console.error("Error rendering EPUB:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  } else {
    alert("Please upload a valid .epub file");
  }
});

// 🌙/☀️ Theme Toggle Sync
const toggleBtn = document.getElementById('theme-toggle');
toggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  toggleBtn.textContent = isDark ? '☀️' : '🌙';

  if (rendition) {
    const theme = isDark ? 'dark' : 'light';
    rendition.themes.select(theme);
    document.getElementById('reading-theme-select').value = theme;
  }
});

// 🍔 Hamburger toggle
document.getElementById('menu-toggle').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('visible');
});

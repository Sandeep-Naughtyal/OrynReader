// mybooks.js

// Function to handle EPUB file upload
function handleEPUBUpload(file) {
    const reader = new FileReader();
  
    reader.onload = function (e) {
      const book = ePub(e.target.result);
  
      book.ready.then(() => {
        // Extract metadata
        book.getMetadata().then((metadata) => {
          const title = metadata.title || "Unknown Title";
          const author = metadata.creator || "Unknown Author";
  
          // Estimate reading time (assuming average reading speed of 250 words per minute)
          book.loaded.spine.then((spine) => {
            let totalWords = 0;
            const promises = spine.items.map((item) =>
              item.load(book.load.bind(book)).then((contents) => {
                const text = contents.text();
                const wordCount = text.split(/\s+/).length;
                totalWords += wordCount;
              })
            );
  
            Promise.all(promises).then(() => {
              const readingTime = Math.ceil(totalWords / 250); // in minutes
  
              // Display book information
              displayBook({
                title,
                author,
                readingTime,
                cover: null, // We'll handle cover separately
              });
  
              // Store book data locally
              const books = JSON.parse(localStorage.getItem("books")) || [];
              books.push({ title, author, readingTime });
              localStorage.setItem("books", JSON.stringify(books));
            });
          });
        });
  
        // Extract cover image
        book.coverUrl().then((url) => {
          if (url) {
            fetch(url)
              .then((res) => res.blob())
              .then((blob) => {
                const coverReader = new FileReader();
                coverReader.onload = function () {
                  // Update the last added book with cover image
                  const books = JSON.parse(localStorage.getItem("books")) || [];
                  if (books.length > 0) {
                    books[books.length - 1].cover = coverReader.result;
                    localStorage.setItem("books", JSON.stringify(books));
                    // Update UI with cover image
                    updateBookCover(books.length - 1, coverReader.result);
                  }
                };
                coverReader.readAsDataURL(blob);
              });
          }
        });
      });
    };
  
    reader.readAsArrayBuffer(file);
  }
  
  // Function to display book in the UI
  function displayBook(book) {
    const bookList = document.getElementById("book-list");
  
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
  
    const title = document.createElement("h3");
    title.textContent = book.title;
  
    const author = document.createElement("p");
    author.textContent = `Author: ${book.author}`;
  
    const readingTime = document.createElement("p");
    readingTime.textContent = `Estimated Read Time: ${book.readingTime} mins`;
  
    const cover = document.createElement("img");
    cover.className = "book-cover";
    cover.alt = `${book.title} cover`;
  
    bookCard.appendChild(cover);
    bookCard.appendChild(title);
    bookCard.appendChild(author);
    bookCard.appendChild(readingTime);
  
    bookList.appendChild(bookCard);
  }
  
  // Function to update cover image in the UI
  function updateBookCover(index, coverDataURL) {
    const bookList = document.getElementById("book-list");
    const bookCards = bookList.getElementsByClassName("book-card");
    if (bookCards[index]) {
      const img = bookCards[index].getElementsByClassName("book-cover")[0];
      img.src = coverDataURL;
    }
  }
  
  // Load books from localStorage on page load
  window.addEventListener("DOMContentLoaded", () => {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    books.forEach((book) => {
      displayBook(book);
      if (book.cover) {
        updateBookCover(books.indexOf(book), book.cover);
      }
    });
  
    // Handle file upload
    const fileInput = document.getElementById("epub-upload");
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.name.endsWith(".epub")) {
        handleEPUBUpload(file);
      } else {
        alert("Please upload a valid EPUB file.");
      }
    });
  });
  
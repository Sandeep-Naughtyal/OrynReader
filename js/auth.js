function handleSignup(email, password) {
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
  
    const users = JSON.parse(localStorage.getItem("users")) || {};
  
    if (users[email]) {
      alert("User already exists. Please log in.");
      return;
    }
  
    users[email] = { password };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! You can now log in.");
    // Redirect to login page or dashboard
  }
  
  // Function to handle user login
  function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem("users")) || {};
  
    if (!users[email]) {
      alert("User not found. Please sign up.");
      return;
    }
  
    if (users[email].password !== password) {
      alert("Incorrect password.");
      return;
    }
  
    alert("Login successful!");
    // Redirect to dashboard or mybooks.html
  }
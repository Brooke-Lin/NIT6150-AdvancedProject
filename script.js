// Users data stored in JS (like JSON)
const users = [
  { username: "John_Doe", password: "123456" },
  { username: "Jane_Smith", password: "abcdef" }
];

// Login function
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Hide login page and show home page
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("homePage").style.display = "block";
    // Show dynamic username
    document.getElementById("welcomeMsg").textContent = "Welcome, " + user.username;
  } else {
    errorMsg.textContent = "Invalid username or password.";
  }
}





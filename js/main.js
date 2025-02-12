document.addEventListener("DOMContentLoaded", function() {
  // === SET UP MATRIX RAIN BACKGROUND ===
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const letters = "01".split("");
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = [];
  for (let x = 0; x < columns; x++) {
    drops[x] = 1;
  }
  const chainLength = 10;
  
  function drawMatrix() {
    // Create a trailing effect
    ctx.fillStyle = "rgba(17, 17, 17, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + "px monospace";
    
    for (let i = 0; i < drops.length; i++) {
      for (let j = 0; j < chainLength; j++) {
        let y = Math.floor(drops[i]) - j;
        if (y < 0) continue;
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillStyle = (j === 0)
          ? "#0f0"
          : "rgba(0, 255, 0," + (1 - j / chainLength) + ")";
        ctx.fillText(text, i * fontSize, y * fontSize);
      }
      
      // Reset drop to the top randomly when it goes off-screen
      if (Math.floor(drops[i]) * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.3;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
  
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }
  });
  
  // === TOGGLE PLAGUE DOCTOR OVERLAY PERIODICALLY ===
  function togglePlagueDoctor() {
    const overlay = document.getElementById("plagueOverlay");
    overlay.style.opacity = "0.5";
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(togglePlagueDoctor, 5000);
    }, 5000);
  }
  setTimeout(togglePlagueDoctor, 5000);
  
  // === CLICK EVENT FOR THE WELCOME BUTTON AND API CALLS ===
  const welcomeButton = document.getElementById("welcomeButton");
  const content = document.querySelector(".content");
  const terminal = document.querySelector(".terminal");
  
  welcomeButton.addEventListener("click", function() {
    console.log("Welcome button clicked!"); // Debug log
    // Add a click animation (e.g., shrink/fade) by adding a CSS class
    content.classList.add("clicked");
    // After 0.5 seconds, display the terminal box and update its content with API data
    setTimeout(() => {
      terminal.classList.add("active");
      updateMemeCoins();
    }, 500);
  });
  
  // === API CALL FUNCTIONS ===
  
  /**
   * Fetch meme coins for a given blockchain.
   * Replace the endpoint with your actual API URL.
   *
   * @param {string} blockchain - The blockchain identifier (e.g., "solana", "ethereum", "base")
   * @returns {Promise<Array>} - An array of coin objects
   */
  async function fetchMemeCoins(blockchain) {
    const endpoint = `https://api.example.com/meme-coins?chain=${blockchain}`; // Replace with your API
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`API error for ${blockchain}: ${response.status}`);
        return [];
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching meme coins for ${blockchain}:`, error);
      return [];
    }
  }
  
  /**
   * Typewriter effect: types out the provided text into the given element.
   *
   * @param {HTMLElement} element - The DOM element where the text is to be typed.
   * @param {string} text - The text to type.
   * @param {number} delay - The delay in milliseconds between each character.
   */
  function typeText(element, text, delay = 50) {
    element.innerHTML = ""; // Clear any existing text
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, delay);
      }
    }
    type();
  }
  
  /**
   * Fetch and update the terminal box with new top meme coins
   * for Solana, Ethereum, and Base blockchains using a typewriter effect.
   * Each line is prefixed with ">> " to simulate a terminal prompt.
   */
  async function updateMemeCoins() {
    const chains = ["solana", "ethereum", "base"];
    let resultsHTML = ">> Terminal Ready...\n";
    for (const chain of chains) {
      resultsHTML += `\n>> ${chain.toUpperCase()} Meme Coins:\n`;
      const coins = await fetchMemeCoins(chain);
      if (coins && coins.length > 0) {
        coins.forEach(coin => {
          resultsHTML += `>> ${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price}\n`;
        });
      } else {
        resultsHTML += `>> No meme coins found for ${chain}.\n`;
      }
    }
    typeText(terminal, resultsHTML, 40);
  }
});

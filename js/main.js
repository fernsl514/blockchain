document.addEventListener("DOMContentLoaded", () => {
  // === SET UP MATRIX RAIN BACKGROUND ===
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d");

  // Set canvas size based on window dimensions
  const setCanvasSize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  setCanvasSize();

  const letters = "01".split("");
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array.from({ length: columns }, () => 1);
  const chainLength = 10;

  function drawMatrix() {
    // Create a trailing effect
    ctx.fillStyle = "rgba(17, 17, 17, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const dropY = Math.floor(drops[i]); // Cache drop's Y position
      for (let j = 0; j < chainLength; j++) {
        const y = dropY - j;
        if (y < 0) continue;
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillStyle = j === 0
          ? "#0f0"
          : `rgba(0, 255, 0, ${1 - j / chainLength})`;
        ctx.fillText(text, i * fontSize, y * fontSize);
      }
      
      // Reset drop to the top randomly when it goes off-screen
      if (dropY * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.3;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  // Debounced window resize event
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setCanvasSize();
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => 1);
    }, 200);
  });

  // === TOGGLE PLAGUE DOCTOR OVERLAY PERIODICALLY ===
  const overlay = document.getElementById("plagueOverlay");
  setInterval(() => {
    overlay.style.opacity = "0.5";
    setTimeout(() => {
      overlay.style.opacity = "0";
    }, 5000);
  }, 10000);

  // === CLICK EVENT FOR THE WELCOME BUTTON, HAMBURGER ICON, AND API CALLS ===
  const welcomeButton = document.getElementById("welcomeButton");
  const content = document.querySelector(".content");
  const terminal = document.querySelector(".terminal");
  const sideMenu = document.getElementById("sideMenu");
  const sideMenuClose = document.getElementById("sideMenuClose");
  const hamburgerButton = document.getElementById("hamburgerButton");

  welcomeButton.addEventListener("click", () => {
    console.log("Welcome button clicked!");
    // Trigger click animation on welcome content
    content.classList.add("clicked");
    // After 0.5 seconds, display the terminal and show the hamburger icon, then update API data
    setTimeout(() => {
      terminal.classList.add("active");
      // Show the hamburger icon by removing the "hidden" class
      hamburgerButton.classList.remove("hidden");
      updateMemeCoins();
    }, 500);
  });

  // Toggle side menu when hamburger icon is clicked
  hamburgerButton.addEventListener("click", () => {
    sideMenu.classList.add("active");
  });

  // Close side menu when the close button is clicked
  sideMenuClose.addEventListener("click", () => {
    sideMenu.classList.remove("active");
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
      return await response.json();
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
   * @param {number} delay - Delay in milliseconds between each character.
   * @param {function} [callback] - Optional callback to execute after typing completes.
   */
  function typeText(element, text, delay = 50, callback) {
    element.innerHTML = "";
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, delay);
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  /**
   * Fetch and update the terminal box with the latest meme coins for
   * Solana, Ethereum, and Base blockchains using a typewriter effect.
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

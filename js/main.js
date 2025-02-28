document.addEventListener("DOMContentLoaded", () => {
  // === BASE URL FOR API CALLS ===
  const API_BASE_URL = "https://plaguedoc-bc-backend.onrender.com";

  // === SET UP MATRIX RAIN BACKGROUND ===
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d");
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
    ctx.fillStyle = "rgba(17, 17, 17, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const dropY = Math.floor(drops[i]);
      for (let j = 0; j < chainLength; j++) {
        const y = dropY - j;
        if (y < 0) continue;
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillStyle = j === 0 ? "#0f0" : `rgba(0, 255, 0, ${1 - j / chainLength})`;
        ctx.fillText(text, i * fontSize, y * fontSize);
      }
      if (dropY * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.3;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
  
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
  
  // === UI ELEMENTS & BUTTON INTERACTIONS ===
  const welcomeButton = document.getElementById("welcomeButton");
  const content = document.querySelector(".content");
  const terminal = document.querySelector(".terminal");
  const sideMenu = document.getElementById("sideMenu");
  const sideMenuClose = document.getElementById("sideMenuClose");
  const hamburgerButton = document.getElementById("hamburgerButton");
  
  welcomeButton.addEventListener("click", () => {
    welcomeButton.disabled = true;
    welcomeButton.style.opacity = "0.5";
    welcomeButton.style.cursor = "not-allowed";
    content.classList.add("clicked");
    setTimeout(() => {
      terminal.classList.add("active");
      hamburgerButton.classList.remove("hidden");
      updateTerminalData();
    }, 500);
  });
  
  hamburgerButton.addEventListener("click", () => {
    sideMenu.classList.add("active");
  });
  
  sideMenuClose.addEventListener("click", () => {
    sideMenu.classList.remove("active");
  });
  
  // === TYPEWRITER EFFECT FUNCTION ===
  function typeText(element, text, delay = 50, callback) {
    element.innerHTML = ""; // Start with a clean slate
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
  
  // === GENERIC FUNCTION TO DISPLAY DATA SECTIONS (MODIFIED TO PREVENT DUPLICATION) ===
  function displayDataInSection(data, title, isError = false) {
    const container = document.createElement("div");
    const header = document.createElement("h2");
    header.textContent = title;
    container.appendChild(header);
    
    if (isError || (!Array.isArray(data) || data.length === 0)) {
      const message = document.createElement("p");
      message.textContent = isError ? `Error: ${data.message}` : "No data available.";
      container.appendChild(message);
    } else {
      const table = document.createElement("table");
      table.classList.add("captured-data-table");
  
      const headers = [
        "#",
        "Pair",
        "Price USD",
        "1H",
        "24H",
        "24H Txns",
        "24H Volume",
        "Liquidity",
      ];
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      const tbody = document.createElement("tbody");
      data.forEach(item => {
        const tr = document.createElement("tr");
        const rowData = [
          item.id,
          item.pair,
          item.price_usd || item.price,
          item.change_1h,
          item.change_24h,
          item.txns_24h,
          item.volume_24h || item.volume,
          item.liquidity,
        ];
        rowData.forEach(cellData => {
          const td = document.createElement("td");
          td.textContent = cellData !== undefined && cellData !== null ? cellData : "";
          td.style.overflowWrap = "break-word";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.appendChild(table);
    }
    
    // Append the container directly, without delay, but only after "Terminal Ready" is complete
    terminal.appendChild(container);
  }
  
  // === FETCH FUNCTION FOR SOLANA DATA (MODIFIED TO PREVENT DUPLICATION) ===
  async function fetchScrapedData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/robot-task?robotId=solana`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        displayDataInSection({ message: "No Solana data available." }, "Solana Top Trending", true);
        return;
      }
      displayDataInSection(data, "Solana Top Trending");
    } catch (error) {
      displayDataInSection({ message: error.message }, "Solana Top Trending", true);
    }
  }
  
  // === FETCH FUNCTION FOR ETHEREUM DATA (MODIFIED TO PREVENT DUPLICATION) ===
  async function fetchEthereumData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/robot-task?robotId=ethereum`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        displayDataInSection({ message: "No Ethereum data available." }, "Ethereum Top Trending", true);
        return;
      }
      displayDataInSection(data, "Ethereum Top Trending");
    } catch (error) {
      displayDataInSection({ message: error.message }, "Ethereum Top Trending", true);
    }
  }
  
  // === FETCH FUNCTION FOR BASE DATA (Base_Top_Dex) (MODIFIED TO PREVENT DUPLICATION) ===
  async function fetchBaseData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/robot-task?robotId=base`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        displayDataInSection({ message: "No Base data available." }, "Base Top Trending", true);
        return;
      }
      displayDataInSection(data, "Base Top Trending");
    } catch (error) {
      displayDataInSection({ message: error.message }, "Base Top Trending", true);
    }
  }
  
  // === UPDATE TERMINAL DATA: ENSURE "TERMINAL READY" LOADS BEFORE DATA WITHOUT FLICKERING OR DUPLICATION ===
  async function updateTerminalData() {
    // Clear the terminal completely before starting to prevent any existing content
    terminal.innerHTML = "";
    
    const headerContent = ">> Terminal Ready...\n\n";
    typeText(terminal, headerContent, 50, async () => {
      // After the typewriter effect, keep only "Terminal Ready" and prepare for data
      terminal.innerHTML = headerContent;
      
      // Fetch and display data sequentially to ensure "Terminal Ready" is fully visible first
      await fetchScrapedData();
      await fetchEthereumData();
      await fetchBaseData();
      
      // After all data is loaded, remove "Terminal Ready" to prevent duplication
      terminal.innerHTML = terminal.innerHTML.replace(headerContent, "").trim();
    });
  }
  
  updateTerminalData();
});
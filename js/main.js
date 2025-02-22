document.addEventListener("DOMContentLoaded", () => {
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

  // === API CALL FUNCTION TO FETCH SCRAPED DATA ===
  async function fetchScrapedData() {
    try {
      const response = await fetch("http://localhost:3000/api/robot-task?robotId=80ca1285-6583-4bf9-bffc-5689a90b6a6c&taskId=6f225354-6a77-4872-a717-737d84c3eb2f");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        terminal.innerHTML = "<p>No data available.</p>";
        return;
      }
      displayDataInTable(data);
    } catch (error) {
      terminal.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
    }
  }

  // === DISPLAY DATA IN A TABLE (10 Columns) ===
  function displayDataInTable(data) {
    terminal.innerHTML = "";
  
    // Create and append the heading
    const header = document.createElement("h2");
    header.textContent = "Solana Top Trending";
    terminal.appendChild(header);
  
    // Create the table element
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
        item.change_1h, // make sure this matches your data property name
        item.change_24h, // or update accordingly if you choose to use h1 and h24
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
    terminal.appendChild(table);
  }
  

  // === FORMATTER FUNCTIONS ===
  function formatCurrency(value) {
    if (value == null) return "$0.000000";
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    return `$${!isNaN(num) ? num.toFixed(6) : "0.000000"}`;
  }

  function formatLargeNumber(value) {
    if (value == null) return "";
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return String(value);
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toString();
  }

  // === UPDATE TERMINAL DATA: Type header then fetch data ===
  async function updateTerminalData() {
    const headerContent = ">> Terminal Ready...\n\n>> SOLANA Captured Data:\n";
    typeText(terminal, headerContent, 40, async () => {
      await fetchScrapedData();
      terminal.innerHTML += "\n\n>> ETHEREUM: No captured data available.";
      terminal.innerHTML += "\n\n>> BASE: No captured data available.";
    });
  }
});

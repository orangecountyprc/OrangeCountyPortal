// =========================
// ADMIN AUTH
// =========================

const OC_ADMIN_PASSWORD = "ORANGEFLGOV";
const OC_ADMIN_KEY = "oc_admin_auth";

function ocInitAdminLogin() {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const passwordInput = document.getElementById("admin-password");
    const errorMsg = document.getElementById("admin-login-error");
    const password = passwordInput.value.trim();

    if (password === OC_ADMIN_PASSWORD) {
      localStorage.setItem(OC_ADMIN_KEY, "true");
      window.location.href = "admin-dashboard.html";
    } else {
      if (errorMsg) errorMsg.style.display = "block";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
}

function ocCheckAdminAuth() {
  const isAuthed = localStorage.getItem(OC_ADMIN_KEY) === "true";
  if (!isAuthed) {
    window.location.href = "admin-login.html";
  }
}

function ocAdminLogout() {
  localStorage.removeItem(OC_ADMIN_KEY);
  window.location.href = "admin-login.html";
}

// =========================
// ANNOUNCEMENT BAR
// =========================

function initAnnouncementBar() {
  const bar = document.getElementById("countyAnnouncement");
  const text = document.getElementById("announcementText");
  const closeBtn = document.getElementById("announcementClose");

  if (!bar || !text || !closeBtn) return;

  fetch("data/announcement.json")
    .then(res => res.json())
    .then(data => {
      if (!data.active) return;

      text.textContent = data.message;

      if (data.severity === "warning") {
        bar.style.background = "#ff8f26";
      } else if (data.severity === "emergency") {
        bar.style.background = "#ff4d4d";
      } else {
        bar.style.background = "#ffb04d";
      }

      bar.style.display = "flex";

      closeBtn.addEventListener("click", () => {
        bar.style.display = "none";
      });
    })
    .catch(err => {
      console.error("Announcement load failed:", err);
    });
}

// =========================
// NEWS PAGE – LOAD news.json
// =========================

function initNewsPage() {
  const container = document.getElementById("newsList");
  if (!container) return;

  fetch("data/news.json")
    .then(res => res.json())
    .then(items => {
      container.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>No news releases available at this time.</p>";
        return;
      }

      items.forEach(item => {
        const div = document.createElement("div");
        div.className = "news-item";

        const titleEl = document.createElement("h3");
        titleEl.className = "news-item-title";
        titleEl.textContent = item.title;

        const metaEl = document.createElement("div");
        metaEl.className = "news-item-meta";
        metaEl.textContent = `${item.date} · ${item.department}`;

        const linkEl = document.createElement("a");
        linkEl.className = "news-item-link";
        linkEl.href = `press/${item.file}`;
        linkEl.textContent = "View full release";

        div.appendChild(titleEl);
        div.appendChild(metaEl);
        div.appendChild(linkEl);

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Failed to load news.json", err);
      container.innerHTML = "<p>Unable to load news at this time.</p>";
    });
}

// =========================
// WEATHER ALERTS PAGE
// =========================

function initWeatherPage() {
  const container = document.getElementById("weatherAlertsList");
  if (!container) return;

  fetch("data/weather.json")
    .then(res => res.json())
    .then(items => {
      container.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = "<p>No active weather alerts for Orange County at this time.</p>";
        return;
      }

      items.forEach(item => {
        const div = document.createElement("div");
        div.className = `alert-item alert-severity-${item.severity || "advisory"}`;

        const title = document.createElement("h3");
        title.className = "alert-title";
        title.textContent = item.title;

        const meta = document.createElement("div");
        meta.className = "alert-meta";
        meta.textContent = `${item.issued} · ${item.source || "NWS / Emergency Management"}`;

        const body = document.createElement("div");
        body.className = "alert-body";
        body.textContent = item.body;

        div.appendChild(title);
        div.appendChild(meta);
        div.appendChild(body);
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Failed to load weather.json", err);
      container.innerHTML = "<p>Unable to load weather alerts at this time.</p>";
    });
}

// =========================
// PRESS RELEASE GENERATOR (ADMIN)
// =========================

function ocInitPressReleaseGenerator() {
  const btn = document.getElementById("pr-generate-btn");
  if (!btn) return;

  btn.addEventListener("click", ocGeneratePressRelease);
}

function ocGeneratePressRelease() {
  const titleEl = document.getElementById("pr-title");
  const dateEl = document.getElementById("pr-date");
  const deptEl = document.getElementById("pr-department");
  const locEl = document.getElementById("pr-location");
  const bodyEl = document.getElementById("pr-body");
  const contactEl = document.getElementById("pr-contact");
  const outputSection = document.getElementById("pr-output-section");
  const outputArea = document.getElementById("pr-output");

  const title = titleEl.value.trim();
  const date = dateEl.value;
  const department = deptEl.value;
  const location = (locEl.value.trim() || "Orange County, Florida");
  const body = bodyEl.value.trim();
  const contact = contactEl.value.trim();

  if (!title || !date || !department || !body) {
    alert("Please complete all required fields before generating the press release.");
    return;
  }

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} · Orange County, Florida</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../style.css">
</head>
<body class="gov-bg">
  <header class="press-header">
    <div class="press-header-inner">
      <img src="../images/orange-county-seal.png" alt="Orange County Seal" class="press-seal">
      <div>
        <h1 class="press-title-main">Orange County, Florida</h1>
        <p class="press-subtitle-main">Office of Public Information</p>
      </div>
    </div>
  </header>

  <main class="press-main">
    <article class="press-article">
      <header class="press-meta">
        <p class="press-meta-date">${formattedDate}</p>
        <p class="press-meta-dept">${escapeHtml(department)}</p>
        <p class="press-meta-location">${escapeHtml(location)}</p>
      </header>

      <h2 class="press-article-title">${escapeHtml(title)}</h2>

      <section class="press-body">
${formatBodyToParagraphs(body)}
      </section>

      ${contact ? `<section class="press-contact">
        <h3>Media Contact</h3>
        <p>${escapeHtml(contact)}</p>
      </section>` : ""}
    </article>
  </main>

  <footer class="press-footer">
    <p>© Orange County Government, Florida · Public Information Office</p>
  </footer>
</body>
</html>`;

  if (outputArea && outputSection) {
    outputArea.value = html;
    outputSection.style.display = "block";
  }

  alert("HTML generated. Copy this into a new file under /press/ and update data/news.json.");
}

// =========================
// HELPERS
// =========================

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBodyToParagraphs(text) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return "";
  return lines.map(l => `        <p>${escapeHtml(l)}</p>`).join("\n");
}

// =========================
// GLOBAL INIT
// =========================

document.addEventListener("DOMContentLoaded", function () {
  ocInitAdminLogin();
  initAnnouncementBar();
  initNewsPage();
  initWeatherPage();
  ocInitPressReleaseGenerator();
});

(() => {
  const posts = Array.isArray(window.SITE_POSTS) ? window.SITE_POSTS : [];
  const byId = (id) => posts.find((post) => post.id === id);
  const htbRoot = document.querySelector("#htbPosts");
  const researchRoot = document.querySelector("#researchPosts");
  const notesRoot = document.querySelector("#notePosts");
  const searchInput = document.querySelector("#searchInput");
  const searchCount = document.querySelector("#searchCount");
  const noteTags = document.querySelector("#noteTags");
  const dialog = document.querySelector("#postDialog");
  const dialogContent = document.querySelector("#dialogContent");
  let difficulty = "all";
  let activeTag = "all";
  let searchTerm = "";

  const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));

  function card(post) {
    return `<article class="post-card" role="button" tabindex="0" data-open-post="${escapeHTML(post.id)}" aria-label="Read ${escapeHTML(post.title)}">
      <div class="post-meta"><span class="post-type">${escapeHTML(post.section === "htb" ? "HTB WRITE-UP" : post.section === "research" ? "BUG BOUNTY" : "TECHNICAL NOTE")}</span><span>${escapeHTML(post.date || "Draft")}</span></div>
      <h3>${escapeHTML(post.title)}</h3><p>${escapeHTML(post.excerpt || "")}</p>
      <div class="post-bottom"><div class="tags">${(post.tags || []).slice(0,3).map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}</div><span class="read-more">Read ↗</span></div>
    </article>`;
  }

  function renderList(root, list, emptyText = "No articles match your search yet.") {
    root.innerHTML = list.length ? list.map(card).join("") : `<div class="empty-state">${escapeHTML(emptyText)}</div>`;
  }

  function matches(post) {
    const haystack = [post.title, post.excerpt, ...(post.tags || []), post.difficulty, post.section].join(" ").toLowerCase();
    return haystack.includes(searchTerm);
  }

  function render() {
    const allMatches = posts.filter(matches);
    const htb = allMatches.filter(p => p.section === "htb" && (difficulty === "all" || (p.difficulty || "").toLowerCase() === difficulty));
    renderList(htbRoot, htb);
    renderList(researchRoot, allMatches.filter(p => p.section === "research"));
    const notes = allMatches.filter(p => p.section === "notes" && (activeTag === "all" || (p.tags || []).includes(activeTag)));
    renderList(notesRoot, notes);
    if (searchCount) searchCount.textContent = `${allMatches.length} matching article${allMatches.length === 1 ? "" : "s"}`;
  }

  function renderTags() {
    const tags = [...new Set(posts.filter(p => p.section === "notes").flatMap(p => p.tags || []))].sort();
    noteTags.innerHTML = [`<button class="tag-button ${activeTag === "all" ? "active" : ""}" data-tag="all">All topics</button>`, ...tags.map(tag => `<button class="tag-button ${activeTag === tag ? "active" : ""}" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`)].join("");
  }

  function renderArticle(post) {
    if (!post) return;
    const body = (post.body || []).map(block => {
      if (block.type === "h3") return `<h3>${escapeHTML(block.text)}</h3>`;
      if (block.type === "code") return `<pre><code>${escapeHTML(block.text)}</code></pre>`;
      if (block.type === "ul") return `<ul>${(block.items || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
      return `<p>${escapeHTML(block.text || "")}</p>`;
    }).join("");
    dialogContent.innerHTML = `<div class="article-category">${escapeHTML(post.section === "htb" ? "HTB Write-up" : post.section === "research" ? "Bug Bounty Research" : "Notes & Cheatsheets")}</div>
      <h2>${escapeHTML(post.title)}</h2><div class="article-meta">${escapeHTML(post.date || "Draft")} · ${escapeHTML(post.readTime || "Reading notes")} · ${(post.tags || []).map(escapeHTML).join(" / ")}</div>
      <div class="article-body">${body}</div>
      <div class="article-warning">Authorized testing only. Confirm program scope and rules before testing real systems. Never publish credentials, session tokens, private user data, or undisclosed vulnerability details.</div>`;
    dialog.showModal();
  }

  document.addEventListener("click", (event) => {
    const postCard = event.target.closest("[data-open-post]");
    if (postCard) renderArticle(byId(postCard.dataset.openPost));
    const filter = event.target.closest("[data-category]");
    if (filter) {
      difficulty = filter.dataset.category;
      document.querySelectorAll(".filters .filter").forEach(btn => btn.classList.toggle("active", btn === filter));
      render();
    }
    const tag = event.target.closest("[data-tag]");
    if (tag) {
      activeTag = tag.dataset.tag;
      renderTags();
      render();
    }
  });

  document.addEventListener("keydown", (event) => {
    const cardElement = event.target.closest("[data-open-post]");
    if (cardElement && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      renderArticle(byId(cardElement.dataset.openPost));
    }
  });

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    render();
  });
  document.querySelector("#closeDialog")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  const menuToggle = document.querySelector("#menuToggle");
  const nav = document.querySelector("#nav");
  menuToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  renderTags();
  render();
})();
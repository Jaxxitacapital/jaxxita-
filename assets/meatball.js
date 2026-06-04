const BUSINESS_PHONE = "254701279476";
const BUSINESS_EMAIL = "jaxxitacapital@gmail.com";

function whatsappUrl(message) {
  return `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("campus-meatball-theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("campus-meatball-theme");
  const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved || preferred);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  });
}

function initNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("show");
    document.body.classList.toggle("nav-open", links.classList.contains("show"));
  });
  links.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      links.classList.remove("show");
      document.body.classList.remove("nav-open");
    }
  });
}

function initOrderButtons() {
  document.querySelectorAll("[data-order]").forEach((link) => {
    const item = link.getAttribute("data-order");
    link.setAttribute("href", whatsappUrl(`Hi Campus Meatball Co., I want to order: ${item}. My delivery location is: `));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

const meals = {
  snack: { title: "3 Meatballs + Paste — KSh 100", text: "Best starter pick for a quick campus bite. It keeps the budget tight and stays meatball-only." },
  meal: { title: "5 Meatball Chill Pack — KSh 160", text: "A stronger meatball-only pack with five juicy meatballs and signature paste." },
  study: { title: "6 Meatball Study Pack — KSh 190", text: "Six meatballs for revision, long campus days, or serious meatball hunger." },
  share: { title: "10 Meatballs Box — KSh 300", text: "Best for friends, classmates, roommates, or group study. Ten meatballs make sharing simple and affordable." }
};

function initRecommendation() {
  const form = document.getElementById("recommendationForm");
  const result = document.getElementById("recommendationResult");
  if (!form || !result) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const budget = Number(document.getElementById("budget").value);
    const hunger = document.getElementById("hunger").value;
    const sauce = document.getElementById("sauce").value;
    let pick = meals[hunger];
    if (budget <= 100 && hunger !== "share") pick = meals.snack;
    if (budget >= 190 || hunger === "study") pick = meals.study;
    if (budget >= 300 || hunger === "share") pick = meals.share;
    const pasteNote = sauce === "extra" ? " Add extra paste for KSh 10 to make it saucier." : "";
    result.innerHTML = `<p class="section-kicker">Recommended</p><h3>${pick.title}</h3><p>${pick.text}${pasteNote}</p><a class="btn btn-primary" href="${whatsappUrl(`Hi Campus Meatball Co., I want to order: ${pick.title}${pasteNote ? " with extra paste" : ""}. My delivery location is: `)}" target="_blank" rel="noopener noreferrer">Order this on WhatsApp</a>`;
  });
}

function starsFromRating(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function createReviewElement(review) {
  const article = document.createElement("article");
  article.className = "review";
  article.innerHTML = `<div class="review-head"><strong>${escapeHtml(review.name)}</strong><span class="stars">${starsFromRating(review.rating)}</span></div><p>${escapeHtml(review.text)}</p>`;
  return article;
}

function initReviews() {
  const form = document.getElementById("reviewForm");
  const list = document.getElementById("reviewList");
  const status = document.getElementById("reviewStatus");
  if (!form || !list) return;
  const saved = JSON.parse(localStorage.getItem("campus-meatball-reviews") || "[]");
  saved.forEach((review) => list.prepend(createReviewElement(review)));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const review = {
      name: document.getElementById("reviewName").value.trim(),
      rating: Number(new FormData(form).get("rating") || 5),
      text: document.getElementById("reviewText").value.trim()
    };
    if (!review.name || !review.text) return;
    list.prepend(createReviewElement(review));
    saved.unshift(review);
    localStorage.setItem("campus-meatball-reviews", JSON.stringify(saved.slice(0, 20)));
    const message = `New Campus Meatball Co. review\nName: ${review.name}\nRating: ${review.rating}/5\nReview: ${review.text}`;
    if (status) status.textContent = "Review posted here and opened in WhatsApp so it can be sent to the business.";
    form.reset();
    const fiveStar = form.querySelector('input[name="rating"][value="5"]');
    if (fiveStar) fiveStar.checked = true;
    openWhatsApp(message);
  });
}

function botReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("price") || lower.includes("menu") || lower.includes("cost")) return "Prices start at KSh 40. Popular meatball-only picks: 3 meatballs + paste at KSh 100, 5 meatballs at KSh 160, 6 meatballs at KSh 190, and 10 meatballs box at KSh 300.";
  if (lower.includes("deliver") || lower.includes("location") || lower.includes("rafiki")) return "Delivery is free around Kabarak University campus. Send your exact location on WhatsApp to coordinate.";
  if (lower.includes("discount") || lower.includes("student")) return "Student ID holders get 10% off selected orders during the launch promo.";
  if (lower.includes("paste") || lower.includes("sauce")) return "Signature paste comes free with selected orders. Extra paste is KSh 10.";
  if (lower.includes("night") || lower.includes("study")) return "Try the 6 Meatball Study Pack at KSh 190. It is meatballs only and built for serious hunger.";
  return "I can help with meatball orders, meatball delivery, meatball prices, paste, discounts, and meatball boxes. Tap Send to WhatsApp to send this message directly.";
}

function addBubble(container, message, type) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.textContent = message;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function initChat() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendChatToWhatsapp");
  if (!form || !input || !messages) return;
  let lastMessage = "";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    lastMessage = message;
    addBubble(messages, message, "user");
    input.value = "";
    window.setTimeout(() => addBubble(messages, botReply(message), "bot"), 350);
    if (sendButton) sendButton.href = whatsappUrl(`Hi Campus Meatball Co., ${message}`);
  });
  if (sendButton) {
    sendButton.addEventListener("click", (event) => {
      if (!lastMessage) {
        event.preventDefault();
        input.focus();
      }
    });
  }
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    const location = document.getElementById("contactLocation") ? document.getElementById("contactLocation").value.trim() : "";
    const text = `Hi Campus Meatball Co., my name is ${name || "a customer"}. ${message}${location ? ` Location: ${location}` : ""}`;
    if (status) status.textContent = "Opening WhatsApp so your message can be sent.";
    openWhatsApp(text);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initOrderButtons();
  initRecommendation();
  initReviews();
  initChat();
  initContactForm();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});

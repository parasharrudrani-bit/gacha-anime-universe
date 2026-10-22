
const characters = [
  { name: "Eren Yeager", series: "Attack on Titan", image: "eren.jpg" },
  { name: "Mikasa Ackerman", series: "Attack on Titan", image: "mikasa.jpg" },
  { name: "Levi Ackerman", series: "Attack on Titan", image: "levi.jpg" },
  { name: "Anya Forger", series: "Spy × Family", image: "anya.jpg" },
  { name: "Loid Forger", series: "Spy × Family", image: "loid.jpg" },
  { name: "Yor Forger", series: "Spy × Family", image: "yor.jpg" },
  { name: "Satoru Gojo", series: "Jujutsu Kaisen", image: "gojo.jpg" },
  { name: "Yuji Itadori", series: "Jujutsu Kaisen", image: "yuji.jpg" },
  { name: "Nezuko Kamado", series: "Demon Slayer", image: "nezuko.jpg" },
  { name: "Tanjiro Kamado", series: "Demon Slayer", image: "tanjiro.jpg" }
];

const COST = 20;
const SAVE_KEY = "gachaUniverseSave";
const $ = id => document.getElementById(id);

let saved = {};

try {
  saved = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
} catch {
  saved = {};
}

let coins = Number.isFinite(saved.coins) ? saved.coins : 100;

let collected = Array.isArray(saved.collected)
  ? saved.collected.filter(name => characters.some(c => c.name === name))
  : [];

let lastCafeDate = saved.lastCafeDate || "";
let busy = false;
let toastTimer;

/* SAVE GAME */

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      coins,
      collected,
      lastCafeDate
    }));
  } catch {
    showToast("Progress could not be saved.");
  }

  updateWallet();
}

function updateWallet() {
  $("coinCount").textContent = coins;

  $("collectionProgress").textContent =
    `${collected.length} / ${characters.length} characters collected`;
}

/* NOTIFICATION */

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* HOME AND STREET NAVIGATION */

function showScreen(id) {
  $("home").classList.toggle("hidden", id !== "home");
  $("street").classList.toggle("hidden", id !== "street");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("enterStreet").addEventListener("click", () => {
  showScreen("street");
});

$("homeLink").addEventListener("click", event => {
  event.preventDefault();
  showScreen("home");
});

$("footerHome").addEventListener("click", () => {
  showScreen("home");
});

/* MODAL */

function openModal(eyebrow, title, content) {
  $("modalEyebrow").textContent = eyebrow;
  $("modalTitle").textContent = title;
  $("modalContent").replaceChildren(content);
  $("modal").classList.remove("hidden");
}

function closeModal() {
  if (busy) return;
  $("modal").classList.add("hidden");
}

$("closeModal").addEventListener("click", closeModal);

$("modal").addEventListener("click", event => {
  if (event.target === $("modal")) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !busy) closeModal();
});

/* BUTTON CREATOR */

function makeButton(label, action, secondary = false) {
  const button = document.createElement("button");

  button.className = "game-btn" + (secondary ? " secondary" : "");
  button.textContent = label;
  button.type = "button";
  button.addEventListener("click", action);

  return button;
}

/* COINS */

function addCoins(amount, message) {
  coins += amount;
  saveGame();

  showToast(message || `🪙 +${amount} Sakura Coins!`);
}

/* CHARACTER RARITY */

function getRarity() {
  const roll = Math.random();

  if (roll < 0.05) {
    return { name: "LEGENDARY ⭐⭐⭐⭐", className: "legendary" };
  }

  if (roll < 0.20) {
    return { name: "EPIC ⭐⭐⭐", className: "epic" };
  }

  if (roll < 0.50) {
    return { name: "RARE ⭐⭐", className: "rare" };
  }

  return { name: "COMMON ⭐", className: "common" };
}

/* GACHA SUMMON MACHINE */

function openGacha() {
  const content = document.createElement("div");

  const description = document.createElement("p");
  description.textContent =
    `Each summon costs ${COST} Sakura Coins. Who will appear?`;

  const capsule = document.createElement("div");
  capsule.className = "capsule";
  capsule.textContent = "❔";

  const summonButton = makeButton(
    `🎰 SUMMON · ${COST} COINS`,
    summon
  );

  const closeButton = makeButton(
    "Maybe later",
    closeModal,
    true
  );

  content.append(description, capsule, summonButton, closeButton);

  openModal("MYSTERY CAPSULE", "Who will you summon?", content);

  function summon() {
    if (busy) return;

    if (coins < COST) {
      showToast("Not enough coins! Visit the Ramen House 🍜");
      return;
    }

    coins -= COST;
    saveGame();

    busy = true;
    summonButton.disabled = true;

    capsule.classList.add("spinning");
    capsule.textContent = "🌸";

    $("modalTitle").textContent = "Summoning your character...";
    $("modalEyebrow").textContent = "✨ GOOD LUCK ✨";

    setTimeout(() => {
      const character =
        characters[Math.floor(Math.random() * characters.length)];

      const rarity = getRarity();
      const isNew = !collected.includes(character.name);

      if (isNew) {
        collected.push(character.name);
      }

      const reveal = document.createElement("div");

      const image = document.createElement("img");
      image.className = "reveal-img";
      image.src = "images/" + character.image;
      image.alt = character.name;

      image.onerror = () => {
        image.style.display = "none";
      };

      const name = document.createElement("h3");
      name.textContent = character.name;

      const series = document.createElement("p");
      series.textContent = character.series;

      const rarityText = document.createElement("p");
      rarityText.className = "rarity " + rarity.className;
      rarityText.textContent = rarity.name;

      const result = document.createElement("p");
      result.textContent = isNew
        ? "🎉 New character added to your collection!"
        : "💗 You already have this character!";

      const again = makeButton("✨ SUMMON AGAIN", () => {
        busy = false;
        openGacha();
      });

      const done = makeButton("Back to street", () => {
        busy = false;
        closeModal();
      }, true);

      reveal.append(
        image,
        name,
        series,
        rarityText,
        result,
        again,
        done
      );

      $("modalContent").replaceChildren(reveal);
      $("modalTitle").textContent = "✨ It's a reveal!";
      $("modalEyebrow").textContent = "YOUR CHARACTER HAS ARRIVED";

      capsule.classList.remove("spinning");

      saveGame();
      renderCollection();

      if (isNew) {
        showToast(`🎉 ${character.name} collected!`);
      }

      busy = false;
    }, 1600);
  }
}

/* SHOP ACTIVITY PANEL */

function showActivity(icon, title, description, buttons = []) {
  const panel = $("activity");
  panel.replaceChildren();

  const emoji = document.createElement("div");
  emoji.className = "activity-icon";
  emoji.textContent = icon;

  const heading = document.createElement("h3");
  heading.textContent = title;

  const detail = document.createElement("p");
  detail.textContent = description;

  panel.append(emoji, heading, detail);

  buttons.forEach(button => panel.append(button));

  panel.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

/* FOUR INTERACTIVE SHOPS */

function visitShop(shop) {
  if (shop === "gacha") {
    openGacha();
    return;
  }

  if (shop === "ramen") {
    showActivity(
      "🍜",
      "Ramen House",
      "Enjoy a warm bowl of ramen and earn 15 Sakura Coins!",
      [
        makeButton("Eat ramen · Get 15 coins", () => {
          addCoins(15, "🍜 Delicious! +15 coins!");

          showActivity(
            "🍜",
            "Yum!",
            "Your wallet has been updated. Come back anytime!"
          );
        })
      ]
    );
  }

  if (shop === "cafe") {
    showActivity(
      "☕",
      "Anime Café",
      "Your daily Sakura Latte gift is waiting!",
      [
        makeButton("Claim daily gift · 25 coins", () => {
          const now = new Date();
          const today = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
          ].join("-");

          if (lastCafeDate === today) {
            showToast("Your daily café gift is already claimed ☕");
            return;
          }

          lastCafeDate = today;
          addCoins(25, "☕ Daily café gift: +25 coins!");

          showActivity(
            "💗",
            "Gift claimed!",
            "Come back tomorrow for another daily gift."
          );
        })
      ]
    );
  }

  if (shop === "shrine") {
    showActivity(
      "⛩️",
      "Mystery Shrine",
      "Offer 10 Sakura Coins to try your luck!",
      [
        makeButton("Make an offering · 10 coins", () => {
          if (coins < 10) {
            showToast("You need 10 coins for an offering!");
            return;
          }

          coins -= 10;

          const reward = Math.random();

          if (reward < 0.25) {
            addCoins(40, "✨ Fortune! You won 40 coins!");
          } else if (reward < 0.70) {
            addCoins(15, "🌸 A small blessing! +15 coins!");
          } else {
            saveGame();
            showToast("🌙 No reward this time. Try again!");
          }
        })
      ]
    );
  }
}

document.querySelectorAll("[data-shop]").forEach(shop => {
  shop.addEventListener("click", () => {
    visitShop(shop.dataset.shop);
  });
});

/* CHARACTER COLLECTION */

function renderCollection() {
  const grid = $("collectionGrid");
  grid.replaceChildren();

  characters.forEach(character => {
    const hasCharacter = collected.includes(character.name);

    const card = document.createElement("article");
    card.className =
      "character-card" + (hasCharacter ? " collected" : "");

    const image = document.createElement("img");
    image.src = "images/" + character.image;
    image.alt = hasCharacter ? character.name : "Mystery character";
    image.loading = "lazy";

    image.onerror = () => {
      image.alt = "Image missing: " + character.image;
    };

    const name = document.createElement("h3");
    name.textContent = hasCharacter ? character.name : "???";

    const series = document.createElement("p");
    series.textContent = hasCharacter
      ? character.series
      : "Mystery character";

    const status = document.createElement("p");
    status.className = "rarity";
    status.textContent = hasCharacter
      ? "💖 COLLECTED"
      : "🔒 LOCKED";

    card.append(image, name, series, status);
    grid.append(card);
  });

  updateWallet();
}

/* INITIALIZE GAME */

updateWallet();
renderCollection();



/* REALISTIC FALLING CHERRY BLOSSOM PETALS 🌸 */

function createCherryBlossomPetals() {
  const container = document.getElementById("petalContainer");
  if (!container) return;

  const petalCount = 30;

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";

    // Create a petal shape using CSS, not an emoji
    petal.style.left = Math.random() * 100 + "%";
    petal.style.animationDuration = 8 + Math.random() * 9 + "s";
    petal.style.animationDelay = -Math.random() * 15 + "s";
    petal.style.setProperty("--sway", 30 + Math.random() * 70 + "px");
    petal.style.setProperty("--spin", Math.random() * 720 + "deg");
    petal.style.setProperty("--size", 9 + Math.random() * 9 + "px");

    container.appendChild(petal);
  }
}

createCherryBlossomPetals();





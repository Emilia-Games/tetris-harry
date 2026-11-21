"use strict";

const PROFILES_KEY = "thp_profiles_v2";

/** Estado interno — no usar el nombre ProfileStore (choca con window.ProfileStore). */
const profileState = {
  data: { profiles: {}, activeId: null },
};

function uuid() {
  return "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function defaultStoryProgress() {
  return {
    heroId: null,
    nodeId: null,
    completedNodes: [],
    branches: {},
    spells: [],
    wins: 0,
    completed: false,
  };
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    profileState.data = raw
      ? JSON.parse(raw)
      : { profiles: {}, activeId: null };
    if (!profileState.data.profiles) profileState.data.profiles = {};
  } catch {
    profileState.data = { profiles: {}, activeId: null };
  }
  return profileState.data;
}

function saveProfiles() {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profileState.data));
}

function activeProfile() {
  const id = profileState.data.activeId;
  if (!id) return null;
  return profileState.data.profiles[id] || null;
}

function setActiveProfile(id) {
  profileState.data.activeId = id || null;
  saveProfiles();
}

function createProfile(name) {
  const trimmed = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 16);
  if (!trimmed) return null;
  const id = uuid();
  profileState.data.profiles[id] = {
    id,
    name: trimmed,
    created: Date.now(),
    story: defaultStoryProgress(),
  };
  profileState.data.activeId = id;
  saveProfiles();
  return profileState.data.profiles[id];
}

function deleteProfile(id) {
  if (!profileState.data.profiles[id]) return false;
  delete profileState.data.profiles[id];
  if (profileState.data.activeId === id) {
    const rest = Object.keys(profileState.data.profiles);
    profileState.data.activeId = rest[0] || null;
  }
  saveProfiles();
  return true;
}

function listProfiles() {
  return Object.values(profileState.data.profiles).sort(
    (a, b) => b.created - a.created
  );
}

function personalizeText(text, name) {
  const n = name || "mago";
  const cap = n.charAt(0).toUpperCase() + n.slice(1);
  return String(text)
    .replaceAll("{name}", n)
    .replaceAll("{Name}", cap);
}

function personalizePanels(panels, name) {
  return panels.map((p) => ({
    ...p,
    lines: p.lines.map((l) => personalizeText(l, name)),
  }));
}

function renderProfileScreen() {
  const list = document.getElementById("profileList");
  const input = document.getElementById("profileNameInput");
  if (!list) return;
  loadProfiles();
  const profiles = listProfiles();
  list.innerHTML = "";
  profiles.forEach((p) => {
    const row = document.createElement("div");
    row.className = "profile-row";
    const canContinue =
      p.story?.heroId &&
      (p.story.completedNodes?.length || p.story.nodeId) &&
      !p.story.completed;
    row.innerHTML = `
      <button type="button" class="profile-pick btn big glass" data-id="${p.id}">
        <span class="profile-name">${p.name}</span>
        <span class="profile-hint">${canContinue ? "▶️ Continuar" : "▶️ Jugar"}</span>
      </button>
      <button type="button" class="profile-del" data-del="${p.id}" aria-label="Borrar">🗑️</button>`;
    list.appendChild(row);
  });
  if (input) input.value = "";
}

function wireProfileUI() {
  if (wireProfileUI._done) return;
  wireProfileUI._done = true;
  const onCreate = () => {
    const input = document.getElementById("profileNameInput");
    const p = createProfile(input?.value);
    if (!p) {
      input?.focus();
      return;
    }
    if (typeof SFX !== "undefined") SFX.select();
    window.StoryMode?.onProfilePicked?.(p);
  };
  document.getElementById("profileCreateBtn")?.addEventListener("click", onCreate);
  document.getElementById("profileNameInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCreate();
    }
  });
  document.getElementById("profileBack")?.addEventListener("click", () => {
    if (typeof show === "function") show("modeScreen");
    if (typeof SFX !== "undefined") SFX.select();
  });
  document.getElementById("profileList")?.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      const id = del.getAttribute("data-del");
      const p = profileState.data.profiles[id];
      if (
        p &&
        confirm(`¿Borrar a ${p.name} y toda su historia guardada?`)
      ) {
        deleteProfile(id);
        renderProfileScreen();
      }
      return;
    }
    const pick = e.target.closest("[data-id]");
    if (!pick) return;
    const id = pick.getAttribute("data-id");
    setActiveProfile(id);
    const prof = activeProfile();
    if (prof) {
      const cont = !!(prof.story?.heroId && !prof.story.completed);
      window.StoryMode?.enterStoryWithProfile?.(prof, cont);
    }
  });
}

window.ProfileStore = {
  loadProfiles,
  saveProfiles,
  activeProfile,
  setActiveProfile,
  createProfile,
  deleteProfile,
  listProfiles,
  personalizeText,
  personalizePanels,
  renderProfileScreen,
  wireProfileUI,
  defaultStoryProgress,
  getProgress: () => activeProfile()?.story,
  setProgress: (story) => {
    const p = activeProfile();
    if (!p) return;
    p.story = story;
    saveProfiles();
  },
};
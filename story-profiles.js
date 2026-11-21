"use strict";

const PROFILES_KEY = "thp_profiles_v2";

const ProfileStore = {
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
    ProfileStore.data = raw
      ? JSON.parse(raw)
      : { profiles: {}, activeId: null };
    if (!ProfileStore.data.profiles) ProfileStore.data.profiles = {};
  } catch {
    ProfileStore.data = { profiles: {}, activeId: null };
  }
  return ProfileStore.data;
}

function saveProfiles() {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(ProfileStore.data));
}

function activeProfile() {
  const id = ProfileStore.data.activeId;
  if (!id) return null;
  return ProfileStore.data.profiles[id] || null;
}

function setActiveProfile(id) {
  ProfileStore.data.activeId = id || null;
  saveProfiles();
}

function createProfile(name) {
  const trimmed = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 16);
  if (!trimmed) return null;
  const id = uuid();
  ProfileStore.data.profiles[id] = {
    id,
    name: trimmed,
    created: Date.now(),
    story: defaultStoryProgress(),
  };
  ProfileStore.data.activeId = id;
  saveProfiles();
  return ProfileStore.data.profiles[id];
}

function deleteProfile(id) {
  if (!ProfileStore.data.profiles[id]) return false;
  delete ProfileStore.data.profiles[id];
  if (ProfileStore.data.activeId === id) {
    const rest = Object.keys(ProfileStore.data.profiles);
    ProfileStore.data.activeId = rest[0] || null;
  }
  saveProfiles();
  return true;
}

function listProfiles() {
  return Object.values(ProfileStore.data.profiles).sort(
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
  document.getElementById("profileCreateBtn")?.addEventListener("click", () => {
    const input = document.getElementById("profileNameInput");
    const p = createProfile(input?.value);
    if (!p) {
      input?.focus();
      return;
    }
    if (typeof SFX !== "undefined") SFX.select();
    window.StoryMode?.onProfilePicked?.(p);
  });
  document.getElementById("profileBack")?.addEventListener("click", () => {
    if (typeof show === "function") show("modeScreen");
    if (typeof SFX !== "undefined") SFX.select();
  });
  document.getElementById("profileList")?.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      const id = del.getAttribute("data-del");
      const p = ProfileStore.data.profiles[id];
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
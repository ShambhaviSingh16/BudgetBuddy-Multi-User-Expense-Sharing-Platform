// src/components/groupsStorage.js
// LocalStorage-backed group utilities for BudgetBuddy

const STORAGE_KEY = "bb_groups_all_v1";

function _readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("groupsStorage read error", e);
    return [];
  }
}

function _writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
  } catch (e) {
    console.error("groupsStorage write error", e);
  }
}

function genId() {
  return "grp_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * createGroupObject
 * - invited: array of addresses (strings)
 * - totalAmount: number (ETH)
 * - createdBy: wallet address
 */
export function createGroupObject({ name, description = "", category = "General", createdBy = "", totalAmount = 0, invited = [] }) {
  const id = genId();
  const createdAt = Date.now();

  // normalize invited: trim + unique + remove empty + don't include owner
  const ownerLower = (createdBy || "").toLowerCase();
  const normalized = Array.from(new Set((Array.isArray(invited) ? invited : []).map(a => (a || "").trim())))
    .filter(a => a && a.toLowerCase() !== ownerLower);

  const expectedCount = 1 + normalized.length; // owner + invited
  const perPersonExpected = totalAmount && expectedCount > 0 ? Number((totalAmount / expectedCount).toFixed(6)) : 0;

  const ownerMember = {
    address: createdBy,
    name: (createdBy || "").slice(0, 8) || "owner",
    joinedAt: createdAt,
    paid: 0,
  };

  const group = {
    id,
    name,
    description,
    category,
    createdBy,
    createdAt,
    totalAmount: Number(totalAmount) || 0,
    expectedCount,
    perPersonExpected,
    invited: normalized,
    members: [ownerMember], // owner is member initially
    settled: false,
    metadata: {},
  };

  return group;
}

// read/write helpers
export function loadAllGroups() {
  return _readAll();
}
export function saveAllGroups(groups) {
  return _writeAll(groups);
}
export function getGroupById(id) {
  return _readAll().find(g => g.id === id) || null;
}
export function persistNewGroup(groupObj) {
  const all = _readAll();
  all.unshift(groupObj);
  _writeAll(all);
  return groupObj;
}
export function replaceGroup(obj) {
  const all = _readAll();
  const idx = all.findIndex(g => g.id === obj.id);
  if (idx === -1) all.unshift(obj);
  else all[idx] = obj;
  _writeAll(all);
  return obj;
}
export function updateGroup(id, patch) {
  const all = _readAll();
  const idx = all.findIndex(g => g.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  _writeAll(all);
  return all[idx];
}

/**
 * joinGroupById:
 * - allows join if invited OR if createdBy === address
 * - adds member, removes them from invited list
 */
export function joinGroupById(groupId, address) {
  if (!address) return null;
  const all = _readAll();
  const idx = all.findIndex(g => g.id === groupId);
  if (idx === -1) return null;
  const g = all[idx];

  const aLower = address.toLowerCase();
  const already = (g.members || []).find(m => (m.address || "").toLowerCase() === aLower);
  if (already) return g; // already member

  // check invite or owner
  const invitedIndex = (g.invited || []).findIndex(i => (i || "").toLowerCase() === aLower);
  const isOwner = (g.createdBy || "").toLowerCase() === aLower;
  if (invitedIndex === -1 && !isOwner) {
    return null; // not allowed
  }

  // add member
  const member = { address, name: (address || "").slice(0, 8), joinedAt: Date.now(), paid: 0 };
  g.members = [...(g.members || []), member];

  // remove from invited (if present)
  if (invitedIndex !== -1) {
    g.invited = (g.invited || []).filter((_, i) => i !== invitedIndex);
  }

  // update stored per-person expected (we keep perPersonExpected from creation; expectedCount stays as created)
  replaceGroup(g);
  return g;
}

/**
 * leaveGroupById:
 * - removes only member entry, NOT the invited list (so if user was invited previously they still remain invited unless the owner removed invite)
 * - owner cannot leave
 * - when a non-owner leaves, add them back into invited so the group remains visible and they can re-join later
 */
export function leaveGroupById(groupId, address) {
  if (!address) return null;
  const all = _readAll();
  const idx = all.findIndex(g => g.id === groupId);
  if (idx === -1) return null;
  const g = all[idx];

  const aLower = address.toLowerCase();
  // owner cannot leave — return group unchanged to indicate failure/blocked
  if ((g.createdBy || "").toLowerCase() === aLower) return null;

  // remove member if present
  const wasMember = (g.members || []).some(m => (m.address || "").toLowerCase() === aLower);
  g.members = (g.members || []).filter(m => (m.address || "").toLowerCase() !== aLower);

  // If the leaving user was a member (not owner), ensure they are present in invited list
  // so they can see & re-join the group later. Don't duplicate invites.
  if (wasMember) {
    g.invited = g.invited || [];
    const alreadyInvited = g.invited.some(i => (i || "").toLowerCase() === aLower);
    if (!alreadyInvited) {
      g.invited.push(address);
    }
  }

  // persist update
  replaceGroup(g);
  return g;
}

/**
 * computePerPersonShare (based on stored values)
 */
export function computePerPersonShare(group) {
  const total = Number(group?.totalAmount || 0);
  const expected = Number(group?.expectedCount || (1 + (group?.invited?.length || 0)));
  if (!total || expected <= 0) return 0;
  return Number((total / expected).toFixed(6));
}

/**
 * listGroupsVisibleTo(address)
 * - visible if createdBy === address OR invited includes address OR members includes address
 * - if address is falsy, return all groups (fallback)
 */
export function listGroupsVisibleTo(address) {
  const all = _readAll();
  const a = (address || "").toLowerCase();
  if (!a) return all;
  return all.filter(g => {
    if ((g.createdBy || "").toLowerCase() === a) return true;
    if ((g.invited || []).some(i => (i || "").toLowerCase() === a)) return true;
    if ((g.members || []).some(m => (m.address || "").toLowerCase() === a)) return true;
    return false;
  });
}

/**
 * markPaid: simple helper to mark a member's paid amount (simulate settlement)
 * - sets member.paid to amount (accumulating)
 * - if all members paid >= perPersonExpected (approx), mark settled = true
 */
export function markMemberPaid(groupId, address, amountPaid) {
  const all = _readAll();
  const idx = all.findIndex(g => g.id === groupId);
  if (idx === -1) return null;
  const g = all[idx];

  const aLower = (address || "").toLowerCase();
  g.members = (g.members || []).map(m => {
    if ((m.address || "").toLowerCase() !== aLower) return m;
    const newPaid = Number((Number(m.paid || 0) + Number(amountPaid || 0)).toFixed(6));
    return { ...m, paid: newPaid };
  });

  // check settlement
  const per = Number(g.perPersonExpected || computePerPersonShare(g));
  const everyonePaid = (g.members || []).every(m => Number(m.paid || 0) >= per - 1e-9);
  g.settled = everyonePaid;

  replaceGroup(g);
  return g;
}

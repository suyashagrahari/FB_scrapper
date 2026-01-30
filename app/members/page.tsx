/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Globe, Users, Loader2, RefreshCcw, Clock, MapPin, ExternalLink, Download, Mail, Phone, Zap, User, Layers } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://easysource-dev.hirequotient.com/fb-scrapper";

export default function MembersPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupUrl, setSelectedGroupUrl] = useState<string | null>(null);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);


  useEffect(() => {
    void loadGroups();
  }, []);

  const loadGroups = async () => {
    setGroupsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/groups`);
      const data = await res.json();
      const list = Array.isArray(data.groups) ? data.groups : [];
      setGroups(list);
      // Only auto-select if nothing is selected yet
      if (!selectedGroupUrl && list[0]) {
        setSelectedGroupUrl(list[0].url);
        setSelectedGroupTitle(list[0].title || list[0].url);
        void fetchMembersFor(list[0].url);
      }
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchMembersFor = async (url: string) => {
    setMembersLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/members/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url] }),
      });
      const data = await res.json();
      setMembers(Array.isArray(data.members) ? data.members : []);
      setSelectedGroupUrl(url);
      const found = groups.find((g) => g.url === url);
      setSelectedGroupTitle(found?.title ?? null);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const exportMembers = () => {
    const data = members || [];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(selectedGroupTitle || "members").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans app-root overflow-hidden">
      {/* Icon sidebar */}
      <div className="w-20 flex flex-col items-center py-6 bg-white border-r border-slate-200 space-y-8 z-30 shadow-xl">
        <div className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/25">
          <Zap className="text-white" size={24} />
        </div>
        <div className="space-y-6 flex flex-col flex-1 w-full px-4">
          <a
            href="/"
            className="w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 text-slate-400 hover:bg-slate-100"
          >
            <Globe size={24} strokeWidth={2} />
          </a>
          <a
            href="/"
            className="w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 text-slate-400 hover:bg-slate-100"
          >
            <User size={24} strokeWidth={2} />
          </a>
          <div
            className="w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 bg-indigo-500/10 text-indigo-500"
          >
            <Users size={24} strokeWidth={2.5} />
          </div>
          <a
            href="/"
            className="w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 text-slate-400 hover:bg-slate-100"
          >
            <Layers size={24} strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        <div className="text-3xl font-extrabold leading-tight mb-4">Members</div>
        <div className="flex gap-6 flex-1 min-h-0">
          <aside className="w-96 bg-white rounded-2xl border p-4 overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-lg flex items-center gap-2">
                <Users size={18} /> Groups
              </div>
              <button
                onClick={() => void loadGroups()}
                className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-sm flex items-center gap-2"
              >
                <RefreshCcw size={14} /> Refresh
              </button>
            </div>
            {groupsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((g) => (
                  <div
                    key={g.url}
                    role="button"
                    onClick={() => void fetchMembersFor(g.url)}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors cursor-pointer flex items-center gap-3 ${
                      selectedGroupUrl === g.url
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${selectedGroupUrl === g.url ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {String(g.title || g.url).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate text-slate-800">{g.title || g.url}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span className="truncate max-w-[160px]">{(g.url || "").replace("https://www.", "")}</span>
                        <span className="text-indigo-500 font-bold">{g.memberCount ?? 0} members</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Group name + buttons outside the card area */}
            <div className="flex items-start justify-between gap-6 mb-5 px-1">
              <div className="min-w-0">
                {selectedGroupUrl ? (
                  <>
                    <a href={selectedGroupUrl} target="_blank" rel="noreferrer" className="text-xl font-black text-slate-900 hover:text-indigo-600 transition-colors">
                      {selectedGroupTitle || selectedGroupUrl}
                      <ExternalLink size={14} className="text-indigo-500 inline ml-1.5 -translate-y-0.5" />
                    </a>
                    <div className="text-sm text-slate-400 mt-0.5">Showing extracted profiles for the selected group</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-black text-slate-900">Select a group</div>
                    <div className="text-sm text-slate-400 mt-0.5">Choose a group from the sidebar to view members</div>
                  </>
                )}
              </div>
              {selectedGroupUrl && (
                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                  <button onClick={() => void fetchMembersFor(selectedGroupUrl)} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors">
                    <RefreshCcw size={14} /> Reload
                  </button>
                  <button onClick={() => exportMembers()} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <Download size={14} /> Export Data
                  </button>
                </div>
              )}
            </div>

            {/* Member cards */}
            <div className="flex-1 overflow-y-auto">
              {!selectedGroupUrl ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <Users size={48} className="mx-auto mb-3 text-slate-300" />
                    <div className="text-lg font-semibold">No group selected</div>
                    <div className="text-sm mt-1">Select a group from the sidebar to view its members</div>
                  </div>
                </div>
              ) : membersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-slate-100/70 animate-pulse" />
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="p-8 text-center text-slate-400 rounded-2xl bg-white">No members found for this group.</div>
              ) : (
                <div className="space-y-3">
                  {members.map((m: any, i: number) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all flex items-center gap-6">
                      <div className="relative">
                        {m.member?.profilePicture && !m.member.profilePicture.includes("graph.facebook.com") ? (
                          <img src={m.member.profilePicture} alt={m.member?.name || "Member"} className="w-20 h-20 rounded-[1rem] object-cover ring-4 ring-indigo-50" />
                        ) : (
                          <div className="w-20 h-20 rounded-[1rem] ring-4 ring-indigo-50 bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">
                            {(m.member?.name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-900">{m.member?.name}</h3>
                            {m.member?.company && (
                              <div className="text-sm text-slate-500 font-medium">{m.member.company}</div>
                            )}
                            {(() => {
                              const profileUrl = m.member?.id
                                ? `https://www.facebook.com/profile.php?id=${m.member.id}`
                                : m.member?.profileUrl && !m.member.profileUrl.includes("/groups/")
                                  ? m.member.profileUrl
                                  : null;
                              return profileUrl ? (
                                <a href={profileUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                                  <ExternalLink size={12} /> View Facebook Profile
                                </a>
                              ) : null;
                            })()}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                            <Clock size={12} /> {new Date(m.scrapedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          {m.member?.bio?.text && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin size={14} className="text-rose-400" />
                              {m.member.bio.text}
                            </div>
                          )}
                          {m.member?.occupation && (
                            <div className="text-sm italic text-slate-500">{m.member.occupation}</div>
                          )}
                        </div>
                        {(m.member?.contactEmail || m.member?.contactPhone) && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                            {m.member?.contactEmail && (
                              <a href={`mailto:${m.member.contactEmail}`} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                                <Mail size={14} /> {m.member.contactEmail}
                              </a>
                            )}
                            {m.member?.contactPhone && (
                              <a href={`tel:${m.member.contactPhone}`} className="flex items-center gap-1.5 text-sm text-emerald-600 hover:underline">
                                <Phone size={14} /> {m.member.contactPhone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


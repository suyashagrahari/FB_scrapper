/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Globe, Users, Loader2, RefreshCcw, Clock, MapPin, Linkedin, ChevronRight, Download } from "lucide-react";

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
      if (list[0]) {
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans app-root">
      <div className="max-w-full mx-auto p-6">
        <div className="text-3xl font-extrabold mb-4 leading-tight">Members</div>
        <div className="flex gap-6 h-[calc(100vh-160px)]">
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
                      <div className="font-semibold text-sm truncate text-slate-900">{g.title || g.url}</div>
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

          <main className="flex-1 bg-white rounded-2xl border p-6 overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xl font-black">{selectedGroupTitle || "Select a group"}</div>
                <div className="text-sm text-slate-500">Showing extracted profiles for the selected group</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => selectedGroupUrl && void fetchMembersFor(selectedGroupUrl)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white flex items-center gap-2 shadow-sm hover:bg-indigo-700">
                  <RefreshCcw size={14} /> Reload
                </button>
                <button onClick={() => exportMembers()} className="px-4 py-2 rounded-xl bg-white border text-slate-700 flex items-center gap-2 hover:shadow-sm">
                  <Download size={14} /> Export Data
                </button>
              </div>
            </div>

            {membersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-slate-400 rounded-xl border">No members found for this group.</div>
            ) : (
              <div className="space-y-6">
                {members.map((m: any, i: number) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all flex items-center gap-6">
                    <div className="relative">
                      <img src={m.member?.profilePicture || ""} alt={m.member?.name || "Member"} className="w-20 h-20 rounded-[1rem] object-cover ring-4 ring-indigo-50" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">{m.member?.name}</h3>
                          <a href={m.member?.profileUrl} className="text-sm text-indigo-600 font-semibold block truncate">{m.member?.profileUrl}</a>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                          <Clock size={12} /> {new Date(m.scrapedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={14} className="text-rose-400" />
                          {m.member?.bio?.text || "—"}
                        </div>
                        <div className="text-sm italic text-slate-500">{m.member?.occupation || ""}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <a href={m.member?.profileUrl} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
                        <Linkedin size={18} />
                      </a>
                      <button className="p-3 bg-indigo-600 text-white rounded-2xl">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


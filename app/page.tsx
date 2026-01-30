/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  Zap,
  ShieldCheck,
  Filter,
  Layers,
  Phone,
  Mail,
  ExternalLink,
  Target,
  Sun,
  Moon,
  Activity,
  Flame,
  CheckCircle2,
  Cpu,
  TrendingUp,
  Info,
  Plus,
  Trash2,
  Facebook,
  Loader2,
  ArrowRight,
  Globe,
  Settings,
  Sparkles,
  Heart,
  Share2,
  Users,
} from "lucide-react";

type JobAttachment = {
  thumbnail?: string;
  url?: string;
  type?: string;
  photoUrl?: string;
  ocrText?: string;
  id?: string;
};

type StructuredJob = {
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  description: string;
  requirements: string[];
  contactInfo: string;
  contactEmail: string;
  contactPhone: string;
  postedDate: string;
  sourceUrl: string;
  rawText?: string;
  groupUrl?: string;
  groupTitle?: string;
  category?: string;
  ocrTexts?: string[];
  attachments?: JobAttachment[];
  commentsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  userName?: string;
  facebookUrl?: string;
  facebookId?: string;
};

type Lead = {
  id: string;
  role: string;
  group: string;
  groupTitle?: string;
  author: string;
  posterName?: string;
  timestamp: string;
  text: string;
  ocrText: string;
  yearsRequired: string;
  location: { city: string };
  pay: number;
  payUnit: string;
  salaryText?: string;
  contract: { length: string; shift: string };
  category?: string;
  jobType?: string;
  commentsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  attachments?: JobAttachment[];
  facebookUrl?: string;
  requirements?: string[];
  calculatedHotness: number;
  candidates: Array<{ name: string; comment: string; status: string }>;
  contact: { email: string | null; sms: string | null };
  hasEmail: boolean;
  isHotIntent: boolean;
};

type JobsListResponse = {
  jobs: StructuredJob[];
};

function GroupCard({ group, isSelected, onToggle }: { group: any; isSelected: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`group relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? "border-indigo-500 bg-indigo-50/10 shadow-xl"
          : "border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:scale-[1.01]"
      }`}
    >
      <div
        className={`absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 opacity-80"
        }`}
      >
        <CheckCircle2 size={14} />
      </div>

      <div className="flex gap-6 items-start">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 transition-colors ${
            isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
          }`}
        >
          {group.title?.charAt(0) ?? "G"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <a href={group.url} target="_blank" rel="noreferrer" className="text-xl font-extrabold text-slate-900 hover:underline truncate block">
                {group.title}
              </a>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-indigo-500" />
                  <span className="max-w-[180px] truncate">{group.url.replace("https://www.", "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-rose-400" />
                  <span>Public Community</span>
                </div>
              </div>
            </div>

            {/* <div className="flex-shrink-0 ml-4">
              <input type="checkbox" checked={isSelected} onChange={onToggle} className="w-5 h-5" />
            </div> */}
          </div>

          {group.snippet && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 text-slate-600">
              {group.snippet}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Prefer explicit NEXT_PUBLIC_BACKEND_URL, otherwise default to localhost for dev
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://easysource-dev.hirequotient.com/fb-scrapper";

const getRelativeTime = (timestamp: string): string => {
  if (!timestamp || timestamp === "Unknown") return "Unknown";
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  } catch {
    return timestamp;
  }
};

const mapStructuredToLead = (job: StructuredJob): Lead => {
  const payMatch = job.salary.match(/([\d,]+)/);
  const payNumber = payMatch ? Number(payMatch[1].replace(/,/g, "")) || 0 : 0;

  // Scoring engine based on available fields
  let score = 0;
  if (job.jobTitle) score += 15;
  if (job.company) score += 10;
  if (job.salary) score += 20;
  if (job.location) score += 15;
  if (job.contactEmail) score += 15;
  if (job.contactPhone) score += 10;
  if (job.description) score += 10;
  if (job.requirements?.length) score += 5;

  // Clamp to 0–100
  const calculatedHotness = Math.max(0, Math.min(100, score));
  const isHot = calculatedHotness >= 70;

  const ocrText =
    (job.ocrTexts && job.ocrTexts[0]) ||
    job.rawText ||
    job.description ||
    "";

  let group = job.groupTitle || "Unknown";
  try {
    const u = new URL(job.sourceUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("groups");
    const slug = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : u.hostname;
    if (!group || group === "Unknown") {
      group = slug;
    }
  } catch {
    // ignore URL parse errors
  }

  return {
    id: job.sourceUrl,
    role: job.jobTitle || "Unknown Role",
    group,
    groupTitle: job.groupTitle,
    author: job.company || "Unknown",
    posterName: job.userName || job.company || undefined,
    timestamp: job.postedDate || "Unknown",
    text: job.description || job.rawText || "",
    ocrText,
    yearsRequired: job.requirements?.length
      ? `${job.requirements.length}+ Years`
      : "Unknown",
    location: { city: job.location || "Unknown" },
    pay: payNumber,
    payUnit: "week",
    salaryText: job.salary || undefined,
    contract: { length: "N/A", shift: "Unknown" },
    category: job.category || undefined,
    jobType: job.jobType || undefined,
    commentsCount: job.commentsCount,
    likesCount: job.likesCount,
    sharesCount: job.sharesCount,
    attachments: job.attachments,
    facebookUrl: job.facebookUrl,
    requirements: job.requirements || [],
    calculatedHotness,
    candidates: [],
    contact: { email: job.contactEmail || null, sms: job.contactPhone || null },
    hasEmail: !!job.contactEmail,
    isHotIntent: isHot,
  };
};

const RecruitmentOS: React.FC = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "source" | "leads" | "groups" | "members"
  >("source");

  const [urls, setUrls] = useState<string[]>([
    "https://facebook.com/groups/travelnursingjobs",
    "https://facebook.com/groups/constructionjobsusa",
  ]);
  const [urlInput, setUrlInput] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [minPay, setMinPay] = useState(0);
  const [onlyHighIntent, setOnlyHighIntent] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // --- Groups search UI state
  type FacebookGroup = {
    title: string;
    url: string;
    snippet?: string;
  };
  const [groupQuery, setGroupQuery] = useState("");
  const [groups, setGroups] = useState<FacebookGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupUrls, setSelectedGroupUrls] = useState<Record<string, boolean>>(
    {}
  );
  const [extractedMembers, setExtractedMembers] = useState<any[]>([]);
  // Members page state
  const [groupsList, setGroupsList] = useState<Array<any>>([]);
  const [groupsLoadingList, setGroupsLoadingList] = useState(false);
  const [selectedGroupUrl, setSelectedGroupUrl] = useState<string | null>(null);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [extractingMembers, setExtractingMembers] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [extractResult, setExtractResult] = useState<{ totalPostsScraped: number; totalJobsExtracted: number; membersCreated: number } | null>(null);
  const SEARCH_API_BASE =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://easysource-dev.hirequotient.com/fb-scrapper";

  const theme = {
    bg: darkMode ? "bg-slate-950" : "bg-slate-50",
    panel: darkMode ? "bg-slate-900" : "bg-white",
    panelSubtle: darkMode ? "bg-slate-900/60" : "bg-slate-100/80",
    border: darkMode ? "border-slate-800" : "border-slate-200",
    text: darkMode ? "text-slate-200" : "text-slate-800",
    textMuted: darkMode ? "text-slate-400" : "text-slate-500",
    heading: darkMode ? "text-white" : "text-slate-900",
    input: darkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900",
    accent:
      darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600",
    card: darkMode ? "bg-slate-900/60" : "bg-white",
    cardHover: darkMode ? "hover:bg-slate-800" : "hover:bg-slate-50",
    buttonPrimary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20",
    sliderTrack: darkMode ? "bg-slate-800" : "bg-slate-300",
    tooltip: darkMode
      ? "bg-slate-800 text-slate-200 border-slate-700 shadow-2xl"
      : "bg-white text-slate-700 border-slate-200 shadow-xl",
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !urls.includes(trimmed)) {
      setUrls((prev) => [...prev, trimmed]);
      setUrlInput("");
    }
  };

  const handleRemoveUrl = (url: string) =>
    setUrls((prev) => prev.filter((u) => u !== url));

  const handleStartScrape = async () => {
    if (!urls.length || isScraping) return;
    setIsScraping(true);
    setScrapingProgress(0);

    const interval = window.setInterval(() => {
      setScrapingProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const collected: Lead[] = [];

      for (const url of urls) {
        const res = await fetch(`${BACKEND_BASE_URL}/api/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, perGroup: 2 }),
        });

        if (!res.ok) continue;
        const data = await res.json();
        const jobs: StructuredJob[] = Array.isArray(data.jobs)
          ? data.jobs
          : Array.isArray(data)
          ? data
          : [];

        collected.push(...jobs.map(mapStructuredToLead));
      }

      // Automatically redirect to leads tab and load all data from DB
      setActiveTab("leads");
      await loadFromDb();
    } finally {
      setIsScraping(false);
    }
  };

  const handleSearchGroups = async () => {
    const q = groupQuery.trim();
    if (!q) return;
    setGroupsLoading(true);
    try {
      const keywords =
        q.includes(",") ? q.split(",").map((s) => s.trim()).filter(Boolean) : [q];
      const res = await fetch(`${SEARCH_API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Search failed: ${res.status} ${body}`);
      }
      const data = await res.json();
      const incoming: FacebookGroup[] = Array.isArray(data.groups)
        ? data.groups
        : [];
      setGroups(incoming);
      setSelectedGroupUrls({});
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Group search error:", message);
      alert(`Group search failed: ${message}`);
    } finally {
      setGroupsLoading(false);
    }
  };

  const toggleGroupSelection = async (url: string, title?: string) => {
    // optimistic update
    setSelectedGroupUrls((prev) => ({ ...prev, [url]: !prev[url] }));

    try {
      const res = await fetch(`${SEARCH_API_BASE}/api/selected-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title }),
      });
      const data = await res.json().catch(() => ({}));
      console.log("Selected-group response:", data);
      console.log("Sent selected group URL to backend:", url);
    } catch (err) {
      console.error("Failed to send selected group to backend:", err);
    }
  };

  const selectAllGroups = () => {
    if (groups.length === 0) return;
    const allSelected = groups.every((g) => selectedGroupUrls[g.url]);
    if (allSelected) {
      setSelectedGroupUrls({});
    } else {
      const next: Record<string, boolean> = {};
      groups.forEach((g) => (next[g.url] = true));
      setSelectedGroupUrls(next);
    }
  };

  // Members page helpers
  const loadGroups = async () => {
    setGroupsLoadingList(true);
    try {
      const res = await fetch(`${SEARCH_API_BASE}/api/groups`);
      const data = await res.json();
      setGroupsList(Array.isArray(data.groups) ? data.groups : []);
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setGroupsLoadingList(false);
    }
  };

  const handleSelectGroup = (url: string, title?: string) => {
    setSelectedGroupUrl(url);
    setSelectedGroupTitle(title ?? null);
    void fetchMembersForSelected(url);
  };

  const fetchMembersForSelected = async (url?: string) => {
    const groupUrl = url ?? selectedGroupUrl;
    if (!groupUrl) return;
    setMembersLoading(true);
    try {
      const res = await fetch(`${SEARCH_API_BASE}/api/members/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [groupUrl] }),
      });
      const data = await res.json();
      setSelectedMembers(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      console.error("Failed to fetch members for selected group:", err);
    } finally {
      setMembersLoading(false);
    }
  };


  const handleExtractMembersUI = async () => {
    const selected = Object.entries(selectedGroupUrls).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0 || extractingMembers) return;

    setExtractingMembers(true);
    setExtractResult(null);
    setExtractionStep(1);

    // Cycle through visual steps while the backend processes
    const stepTimer = setInterval(() => {
      setExtractionStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 6000);

    try {
      const res = await fetch(`${SEARCH_API_BASE}/api/scrape/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selected }),
      });
      const data = await res.json();
      clearInterval(stepTimer);

      if (!res.ok) {
        console.error("Extract members failed:", data?.error || `${res.status} ${res.statusText}`);
        setExtractionStep(0);
        return;
      }

      // Show completion step briefly
      setExtractionStep(5);

      if (data.summary) {
        setExtractResult({
          totalPostsScraped: data.summary.totalPostsScraped || 0,
          totalJobsExtracted: data.summary.totalJobsExtracted || 0,
          membersCreated: data.summary.membersCreated || 0,
        });
      }

      // Brief pause on "Done" step, then navigate
      await new Promise((r) => setTimeout(r, 1500));
      router.push("/members");
    } catch (err) {
      clearInterval(stepTimer);
      console.error("Failed to extract members:", err);
    } finally {
      setExtractingMembers(false);
      setExtractionStep(0);
    }
  };

  const loadFromDb = async () => {
    if (loadingDb) return;
    setLoadingDb(true);
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/jobs?limit=50&filter=newest`
      );
      if (!res.ok) return;
      const data: JobsListResponse = await res.json();
      const jobs = data.jobs || [];
      const mapped = jobs.map(mapStructuredToLead);
      setLeads(mapped);
      if (mapped[0]) setSelectedLeadId(mapped[0].id);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leads" && !leads.length) {
      void loadFromDb();
    }
  }, [activeTab]);

  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set(
          leads
            .map((l) => l.category)
            .filter((c): c is string => !!c && c.trim().length > 0)
        )
      ),
    [leads]
  );

  const availableJobTypes = useMemo(
    () =>
      Array.from(
        new Set(
          leads
            .map((l) => l.jobType)
            .filter((t): t is string => !!t && t.trim().length > 0)
        )
      ),
    [leads]
  );

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesSearch =
          lead.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.group.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPay = lead.pay >= minPay;
        const matchesIntent = onlyHighIntent ? lead.isHotIntent : true;
        const matchesCategory =
          categoryFilter === "all" ||
          (lead.category &&
            lead.category.toLowerCase() === categoryFilter.toLowerCase());
        const matchesJobType =
          jobTypeFilter === "all" ||
          (lead.jobType &&
            lead.jobType.toLowerCase() === jobTypeFilter.toLowerCase());

  return (
          matchesSearch &&
          matchesPay &&
          matchesIntent &&
          matchesCategory &&
          matchesJobType
        );
      }),
    [leads, searchTerm, minPay, onlyHighIntent, categoryFilter, jobTypeFilter]
  );

  const selectedLead =
    leads.find((lead) => lead.id === selectedLeadId) || null;

  const InfoPopover: React.FC<{
    title: string;
    items: { label: string; value: string; color?: string }[];
    footer?: string;
  }> = ({ title, items, footer }) => (
    <div
      className={`absolute z-50 p-4 rounded-2xl border w-72 animate-in fade-in slide-in-from-bottom-2 ${theme.tooltip}`}
    >
      <h5 className="text-[11px] font-black uppercase mb-3 border-b border-slate-200 dark:border-slate-700 pb-2 tracking-tighter flex items-center gap-2">
        <Target size={12} className="text-indigo-500" /> {title}
      </h5>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center text-[10px]"
          >
            <span className="font-bold text-slate-500">{item.label}</span>
            <span
              className={`font-mono font-bold ${item.color || "text-indigo-500"}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {footer && (
        <p className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[9px] italic text-slate-400 leading-tight">
          {footer}
        </p>
      )}
    </div>
  );

  return (
    <div
      className={`app-root flex h-screen ${theme.bg} font-sans overflow-hidden transition-colors duration-300`}
    >
      <div
        className={`w-20 flex flex-col items-center py-6 ${theme.panel} border-r ${theme.border} space-y-8 z-30 transition-colors shadow-xl`}
      >
        <div className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/25">
          <Zap className="text-white" size={24} />
        </div>
        <div className="space-y-6 flex flex-col flex-1 w-full px-4">
          <button
            onClick={() => setActiveTab("source")}
            className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 ${
              activeTab === "source"
                ? "bg-indigo-500/10 text-indigo-500"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Globe size={24} strokeWidth={activeTab === "source" ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 ${
              activeTab === "groups"
                ? "bg-violet-500/10 text-violet-500"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <User
              size={24}
              strokeWidth={activeTab === "groups" ? 2.5 : 2}
            />
          </button>
          <a
            href="/members"
            className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 ${
              activeTab === "members"
                ? "bg-indigo-500/10 text-indigo-500"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users size={24} strokeWidth={activeTab === "members" ? 2.5 : 2} />
          </a>
          <button
            onClick={() => setActiveTab("leads")}
            className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 ${
              activeTab === "leads"
                ? "bg-emerald-500/10 text-emerald-500"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="relative">
              <Layers
                size={24}
                strokeWidth={activeTab === "leads" ? 2.5 : 2}
              />
              {leads.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>
          </button>
          {/* <button className="w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Settings size={24} />
          </button> */}
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-2xl transition-all ${
            darkMode
              ? "text-amber-400 bg-amber-400/10"
              : "text-slate-400 hover:bg-slate-100"
          }`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === "source" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest mb-4">
                  <Sparkles size={14} /> AI Recruitment OS
                </div>
                <h1
                  className={`text-4xl font-black ${theme.heading} tracking-tight mb-4`}
                >
                  Source New Opportunities
          </h1>
                <p
                  className={`${theme.textMuted} text-lg max-w-lg mx-auto leading-relaxed`}
                >
                  Configure your target sources. Our AI agent will scan, extract,
                  and score leads automatically.
                </p>
              </div>

              <div
                className={`${theme.panel} border ${theme.border} rounded-[2rem] shadow-2xl overflow-hidden relative`}
              >
                {isScraping && (
                  <div
                    className={`absolute inset-0 z-50 ${theme.panel} flex flex-col items-center justify-center p-12`}
                  >
                    <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                          strokeWidth="8"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-indigo-500 fill-none transition-all duration-300"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset={
                            251.2 - (251.2 * scrapingProgress) / 100
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                      <Zap
                        className="absolute text-indigo-500 animate-pulse"
                        size={32}
                      />
                    </div>
                    <h3
                      className={`text-xl font-bold ${theme.heading} mb-2`}
                    >
                      Extracting Intelligence...
                    </h3>
                    <p className={theme.textMuted}>
                      Parsing {urls.length} sources for high-intent candidates
                    </p>
                  </div>
                )}

                <div
                  className={`p-8 border-b ${theme.border} ${theme.panelSubtle} flex justify-between items-center`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                      <Facebook size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm uppercase tracking-wider">
                        Facebook Groups
                      </div>
                      <div className={`text-[10px] ${theme.textMuted}`}>
                        Integration Active
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg ${theme.bg} border ${theme.border} text-xs font-bold ${theme.textMuted}`}
                  >
                    {urls.length} Sources Ready
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-4 custom-scrollbar space-y-2">
                  {urls.map((url, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl group ${theme.cardHover} border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all`}
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span
                          className={`text-sm font-medium truncate ${theme.textMuted}`}
                        >
                          {url}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveUrl(url)}
                        className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {urls.length === 0 && (
                    <div className="p-12 text-center text-slate-500 text-sm italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No groups added yet. Paste a URL below.
                    </div>
                  )}
                </div>

                <div
                  className={`p-6 ${theme.panelSubtle} border-t ${theme.border}`}
                >
                  <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-3.5 text-slate-400">
                        <ExternalLink size={18} />
                      </div>
                      <input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddUrl()
                        }
                        placeholder="https://facebook.com/groups/..."
                        className={`w-full ${theme.input} ${theme.border} border rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                      />
                    </div>
                    <button
                      onClick={handleAddUrl}
                      className={`px-6 rounded-xl font-bold transition-colors ${theme.panel} border ${theme.border} hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <button
                    onClick={handleStartScrape}
                    disabled={!urls.length || isScraping}
                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                      !urls.length || isScraping
                        ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed text-slate-400"
                        : theme.buttonPrimary
                    }`}
                  >
                    Find Jobs <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="flex-1 flex flex-col items-center justify-start p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="max-w-6xl w-full">
              <header className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
                  <ShieldCheck size={14} /> AI-Verified Extractions
                </div>
                <h1 className={`text-4xl font-black ${theme.heading} tracking-tight mb-2`}>
                  Group Intelligence Hub
                </h1>
                <p className={`text-lg ${theme.textMuted} max-w-2xl mx-auto`}>
                  Discover communities and extract potential leads with real-time AI.
                </p>
              </header>

              <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-6 border border-slate-100 mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                    <input
                      value={groupQuery}
                      onChange={(e) => setGroupQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchGroups()}
                      placeholder="travelling nurses in usa"
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-4 text-slate-800 font-semibold text-lg focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                    />
                  </div>
                  <button
                    onClick={() => void handleSearchGroups()}
                    disabled={groupsLoading}
                    className={`ml-4 px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2 whitespace-nowrap ${groupsLoading ? "bg-slate-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  >
                    {groupsLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    <span className="ml-2">Run Search</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  Communities Found
                  <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-sm">{groups.length}</span>
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={selectAllGroups} className="text-sm font-bold text-slate-500 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 transition-all">
                    {groups.length > 0 && Object.values(selectedGroupUrls).filter(Boolean).length === groups.length ? "Deselect All" : "Select All"}
                  </button>
                  <button onClick={handleExtractMembersUI} disabled={extractingMembers || !Object.values(selectedGroupUrls).some(Boolean)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${Object.values(selectedGroupUrls).some(Boolean) && !extractingMembers ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-500 border border-slate-200 opacity-60 cursor-not-allowed'}`}>
                    {extractingMembers ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />} {extractingMembers ? "Extracting..." : `Extract Members (${Object.values(selectedGroupUrls).filter(Boolean).length})`}
                  </button>
                </div>
              </div>

              {extractResult && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 flex items-center justify-between">
                  <span>
                    Scraped <strong>{extractResult.totalPostsScraped}</strong> posts, extracted <strong>{extractResult.totalJobsExtracted}</strong> jobs, created <strong>{extractResult.membersCreated}</strong> members
                  </span>
                  <button onClick={() => setExtractResult(null)} className="text-green-600 hover:text-green-800 font-bold text-xs ml-4">Dismiss</button>
                </div>
              )}

              <div className="flex-1 w-full overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 300px)" }}>
                {groups.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic bg-white rounded-2xl border border-slate-100">
                    No groups yet. Run a search to populate results.
                  </div>
                ) : (
                  <div className="space-y-6 pb-8">
                    {groups.map((g) => {
                      const selected = !!selectedGroupUrls[g.url];
                      return (
                        <GroupCard
                          key={g.url}
                          group={g}
                          isSelected={selected}
                          onToggle={() => toggleGroupSelection(g.url, g.title)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Extraction progress overlay */}
              {extractingMembers && extractionStep > 0 && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full mx-4">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-100 flex items-center justify-center">
                        <Loader2 size={32} className="text-indigo-600 animate-spin" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Extracting Members</h2>
                      <p className="text-slate-500 mt-1 text-sm">Processing {Object.values(selectedGroupUrls).filter(Boolean).length} group(s)</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { step: 1, icon: <Globe size={18} />, label: "Connecting to Facebook groups" },
                        { step: 2, icon: <Layers size={18} />, label: "Analyzing group activity" },
                        { step: 3, icon: <Sparkles size={18} />, label: "Using AI to identify members & contacts" },
                        { step: 4, icon: <Users size={18} />, label: "Building member profiles" },
                        { step: 5, icon: <CheckCircle2 size={18} />, label: "Done! Redirecting to members..." },
                      ].map(({ step, icon, label }) => (
                        <div key={step} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                          extractionStep === step
                            ? "bg-indigo-50 border border-indigo-200 text-indigo-700"
                            : extractionStep > step
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-slate-50 border border-slate-100 text-slate-400"
                        }`}>
                          <div className={`flex-shrink-0 ${extractionStep === step ? "animate-pulse" : ""}`}>
                            {extractionStep > step ? <CheckCircle2 size={18} className="text-green-500" /> : icon}
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                          {extractionStep === step && step < 5 && (
                            <Loader2 size={14} className="ml-auto animate-spin text-indigo-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="flex-1 p-6 overflow-hidden">
            <div className="flex h-full gap-6">
              <div className="w-96 bg-white rounded-2xl border p-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Groups</h3>
                  <button
                    onClick={() => void loadGroups()}
                    className="text-sm px-3 py-1 rounded-xl bg-indigo-600 text-white"
                  >
                    Refresh
                  </button>
                </div>
                {groupsLoadingList ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : groupsList.length === 0 ? (
                  <div className="text-sm text-slate-400">No groups yet. Run extraction first.</div>
                ) : (
                  <div className="space-y-3">
                    {groupsList.map((g) => (
                      <button
                        key={g.url}
                        onClick={() => handleSelectGroup(g.url, g.title)}
                        className={`w-full text-left p-3 rounded-xl border ${selectedGroupUrl === g.url ? "border-indigo-500 bg-indigo-50" : "border-slate-100"} flex items-center justify-between`}
                      >
                        <div>
                          <div className="font-bold">{g.title || g.url}</div>
                          <div className="text-xs text-slate-500">{g.memberCount} members</div>
                        </div>
                        <div className="text-xs text-slate-400">{g.lastScrapedAt ? new Date(g.lastScrapedAt).toLocaleDateString() : ""}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white rounded-2xl border p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black">{selectedGroupTitle || "Members"}</h2>
                    <p className={`text-sm ${theme.textMuted}`}>Showing members for selected group</p>
                  </div>
                  <button
                    onClick={() => void fetchMembersForSelected()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                  >
                    Reload
                  </button>
                </div>
                {membersLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : selectedMembers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 rounded-2xl border">No members for this group yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedMembers.map((m, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-4 border shadow-sm">
                        <div className="flex items-start gap-3">
                          {m.member?.profilePicture && !m.member.profilePicture.includes("graph.facebook.com") ? (
                            <img src={m.member.profilePicture} alt={m.member?.name || "Member"} className="w-14 h-14 rounded-lg object-cover" />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                              {(m.member?.name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold">{m.member?.name}</div>
                                {m.member?.id ? (
                                  <a href={`https://www.facebook.com/profile.php?id=${m.member.id}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">View Facebook Profile</a>
                                ) : m.member?.profileUrl && !m.member.profileUrl.includes("/groups/") ? (
                                  <a href={m.member.profileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">View Profile</a>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-slate-400">{m.groupUrl?.replace("https://www.", "")}</div>
                            </div>
                            <div className="mt-3 text-sm text-slate-600">
                              {m.member?.bio?.text || m.member?.occupation || ""}
                            </div>
                            {(m.member?.contactEmail || m.member?.contactPhone) && (
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                {m.member?.contactEmail && (
                                  <a href={`mailto:${m.member.contactEmail}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                                    <Mail size={12} /> {m.member.contactEmail}
                                  </a>
                                )}
                                {m.member?.contactPhone && (
                                  <a href={`tel:${m.member.contactPhone}`} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                                    <Phone size={12} /> {m.member.contactPhone}
                                  </a>
                                )}
                              </div>
                            )}
                            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-2">
                              <div>Scraped: {new Date(m.scrapedAt).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="flex h-full animate-in fade-in slide-in-from-right-8 duration-500">
            <div
              className={`w-[420px] flex flex-col border-r ${theme.border} ${theme.bg}`}
            >
              <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-xl font-bold ${theme.heading} flex items-center gap-2`}
                  >
                    Lead Intelligence{" "}
                    <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {filteredLeads.length}
                    </span>
                  </h2>
                  <button
                    onClick={loadFromDb}
                    disabled={loadingDb}
                    className="text-[11px] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                  >
                    {loadingDb ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    DB
                  </button>
                </div>
                <div className="relative mb-6">
                  <Search
                    className={`absolute left-3 top-3 ${theme.textMuted}`}
                    size={16}
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${theme.input} border ${theme.border} rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 shadow-sm transition-colors`}
                    placeholder="Search roles, keywords..."
                  />
                </div>

                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Min Pay:{" "}
                      <span className="text-emerald-500 font-bold">
                        ${minPay}
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4000}
                    step={100}
                    value={minPay}
                    onChange={(e) => setMinPay(Number(e.target.value))}
                    className={`w-full h-1.5 ${theme.sliderTrack} rounded-lg appearance-none cursor-pointer accent-indigo-500`}
                  />

                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${theme.panelSubtle} border ${theme.border} transition-all`}
                  >
                    <label
                      htmlFor="intent"
                      className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer"
                    >
                      <Flame
                        size={14}
                        className={
                          onlyHighIntent ? "text-orange-500" : "text-slate-400"
                        }
                      />
                      High Intent Only
                    </label>
                    <input
                      id="intent"
                      type="checkbox"
                      checked={onlyHighIntent}
                      onChange={(e) => setOnlyHighIntent(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {availableCategories.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">
                          Category
                        </label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className={`w-full ${theme.input} border ${theme.border} rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-indigo-500`}
                        >
                          <option value="all">All</option>
                          {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {availableJobTypes.length > 0 && (
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">
                            Job Type
                          </label>
                          <select
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                            className={`w-full ${theme.input} border ${theme.border} rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-indigo-500`}
                          >
                            <option value="all">All</option>
                            {availableJobTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-20 px-8">
                    <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-900 mb-4 text-slate-400">
                      <Filter size={24} />
                    </div>
                    <p className="text-sm text-slate-500">
                      No leads match your filters. Try adjusting the sliders or
                      search term.
                    </p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group relative overflow-hidden ${
                        selectedLeadId === lead.id
                          ? "bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10"
                          : `${theme.panel} ${theme.border} hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md`
                      }`}
                    >
                      {selectedLeadId === lead.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                      )}
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <span
                          className={`text-[10px] font-bold uppercase ${theme.textMuted}`}
                        >
                          {getRelativeTime(lead.timestamp)}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            size={12}
                            className={
                              lead.calculatedHotness > 70
                                ? "text-orange-500"
                                : "text-slate-400"
                            }
                          />
                          <span
                            className={`text-xs font-black ${
                              lead.calculatedHotness > 70
                                ? "text-orange-500"
                                : "text-slate-500"
                            }`}
                          >
                            {lead.calculatedHotness}%
                          </span>
                        </div>
                      </div>
                      <h3
                        className={`text-sm font-bold ${theme.heading} pl-2 mb-0.5 group-hover:text-indigo-500 transition-colors`}
                      >
                        {lead.role}
                      </h3>
                      {lead.posterName && (
                        <p className={`pl-2 text-[11px] ${theme.textMuted}`}>
                          {lead.posterName}
                        </p>
                      )}
                      <div className="pl-2 flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-bold text-xs">
                          <DollarSign size={12} />{" "}
                          {lead.pay > 0
                            ? lead.pay.toLocaleString()
                            : lead.salaryText || "—"}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                          <MessageSquare size={12} />{" "}
                          {lead.commentsCount ?? lead.candidates.length}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className={`flex-1 overflow-y-auto ${theme.panel} transition-colors custom-scrollbar`}
            >
              {/* If we have extracted members show Members view, otherwise show selected lead details */}
              {extractedMembers && extractedMembers.length > 0 ? (
                <div className="animate-in fade-in zoom-in-95 duration-300 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-black ${theme.heading}`}>Extracted Members</h2>
                    <div className="text-sm text-slate-500">{extractedMembers.length} members</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {extractedMembers.map((m: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          {m.member?.profilePicture && !m.member.profilePicture.includes("graph.facebook.com") ? (
                            <img src={m.member.profilePicture} alt={m.member?.name || "Member"} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                              {(m.member?.name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold">{m.member?.name}</div>
                            {m.member?.id ? (
                              <a href={`https://www.facebook.com/profile.php?id=${m.member.id}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">View Facebook Profile</a>
                            ) : m.member?.profileUrl && !m.member.profileUrl.includes("/groups/") ? (
                              <a href={m.member.profileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">View Profile</a>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 mb-2">{m.member?.bio?.text}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <div className="px-2 py-1 rounded bg-slate-50 border">{m.groupUrl?.replace("https://www.", "")}</div>
                          <div className="px-2 py-1 rounded bg-slate-50 border">Scraped: {new Date(m.scrapedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedLead ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div
                    className={`p-8 border-b ${theme.border} sticky top-0 ${theme.panel} z-10 backdrop-blur-xl bg-opacity-95`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${theme.border} ${theme.textMuted}`}
                          >
                            {selectedLead.groupTitle || selectedLead.group}
                          </span>
                          {selectedLead.posterName && (
                            <span className="text-[10px] font-semibold text-slate-500">
                              {selectedLead.posterName}
                            </span>
                          )}
                          {selectedLead.hasEmail && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Verified Contact
                            </span>
                          )}
                        </div>
                        <h1 className={`text-3xl font-black ${theme.heading}`}>
                          {selectedLead.role}
                        </h1>
                        <p className={`mt-1 text-xs ${theme.textMuted}`}>
                          Posted {getRelativeTime(selectedLead.timestamp)}
          </p>
        </div>

                      <div className="text-right group relative">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-end gap-1 cursor-help">
                          AI Score <Info size={12} />
                        </div>
                        <div className="text-4xl font-black text-orange-500 tracking-tighter shadow-orange-500/50 drop-shadow-sm">
                          {selectedLead.calculatedHotness}
                        </div>
                        <div className="hidden group-hover:block absolute right-0 top-14 w-48 z-50">
                          <InfoPopover
                            title="Scoring Breakdown"
                            items={[
                              { label: "Keyword Match", value: "High" },
                              { label: "Urgency", value: "+15%" },
                              { label: "Competition", value: "Low" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {[
                        selectedLead.pay || selectedLead.salaryText
                          ? {
                              label: "Rate",
                              val:
                                selectedLead.pay > 0
                                  ? `$${selectedLead.pay}/${selectedLead.payUnit}`
                                  : selectedLead.salaryText ?? "",
                              icon: DollarSign,
                              color: "text-emerald-500",
                            }
                          : null,
                        selectedLead.location.city &&
                        selectedLead.location.city !== "Unknown"
                          ? {
                              label: "Location",
                              val: selectedLead.location.city,
                              icon: MapPin,
                              color: "text-blue-500",
                            }
                          : null,
                        selectedLead.yearsRequired &&
                        selectedLead.yearsRequired !== "Unknown"
                          ? {
                              label: "Experience",
                              val: selectedLead.yearsRequired,
                              icon: User,
                              color: "text-indigo-500",
                            }
                          : null,
                        selectedLead.contract.shift &&
                        selectedLead.contract.shift !== "Unknown"
                          ? {
                              label: "Shift",
                              val: selectedLead.contract.shift,
                              icon: Clock,
                              color: "text-amber-500",
                            }
                          : null,
                      ]
                        .filter(Boolean)
                        .map((stat, i) => {
                          const s = stat as {
                            label: string;
                            val: string | number;
                            icon: typeof DollarSign;
                            color: string;
                          };
                          return (
                            <div
                              key={i}
                              className={`p-4 rounded-2xl border ${theme.border} ${theme.bg}`}
                            >
                              <div className="flex items-center gap-2 mb-1 opacity-70">
                                <s.icon size={14} className={s.color} />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                  {s.label}
                                </span>
                              </div>
                              <div
                                className={`text-sm font-bold ${theme.heading}`}
                              >
                                {s.val}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="p-8 grid grid-cols-3 gap-8">
                    <div className="col-span-2 space-y-8">
                      {selectedLead.requirements &&
                        selectedLead.requirements.length > 0 && (
                          <div>
                            <h3
                              className={`text-xs font-black uppercase ${theme.textMuted} mb-4 tracking-widest flex items-center gap-2`}
                            >
                              <Target size={14} className="text-indigo-500" />
                              Requirements
                            </h3>
                            <div className="space-y-2.5">
                              {selectedLead.requirements.map((req, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-start gap-3 p-4 rounded-xl border ${theme.border} ${theme.panelSubtle} hover:border-indigo-300 transition-all group`}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <CheckCircle2
                                      size={16}
                                      className="text-indigo-500 group-hover:text-indigo-600 transition-colors"
                                    />
                                  </div>
                                  <span
                                    className={`text-sm ${theme.text} leading-relaxed flex-1`}
                                  >
                                    {req}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      <div
                        className={`p-6 rounded-3xl border ${theme.border} relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5`}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Cpu size={100} />
                        </div>
                        <h3 className="text-xs font-black uppercase text-indigo-500 mb-4 flex items-center gap-2 tracking-widest">
                          <Sparkles size={14} /> Intelligence Layer
                        </h3>

                        <div className="space-y-4 relative z-10">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                              OCR Extraction
                            </div>
                            <div
                              className={`font-mono text-sm p-3 rounded-lg border ${theme.border} ${theme.panel} ${theme.text}`}
                            >
                              {selectedLead.ocrText || "No OCR text detected."}
                            </div>
                          </div>
                          {selectedLead.attachments &&
                            selectedLead.attachments.length > 0 && (
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                                  Attached Media
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  {selectedLead.attachments
                                    .slice(0, 6)
                                    .map((att, idx) => {
                                      const thumb =
                                        att.thumbnail ||
                                        att.photoUrl ||
                                        undefined;
                                      return (
                                        <div
                                          key={att.id || idx}
                                          className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 cursor-zoom-in"
                                          onMouseEnter={() =>
                                            thumb && setPreviewImage(thumb)
                                          }
                                          onMouseLeave={() =>
                                            setPreviewImage(null)
                                          }
                                        >
                                          {thumb ? (
                                            <img
                                              src={thumb}
                                              alt={att.type || "Attachment"}
                                              className="w-full h-20 object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-20 flex items-center justify-center text-[10px] text-slate-400">
                                              Attachment
                                            </div>
                                          )}
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition-opacity pointer-events-none">
                                            View
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          <div className="flex gap-2 flex-wrap">
                            {["URGENT", "HIGH_PAY", "IMMEDIATE_START"].map(
                              (tag) => (
                                <span
                                  key={tag}
                                  className={`text-[9px] font-bold px-2 py-1 rounded border ${
                                    darkMode
                                      ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                                      : "border-indigo-200 bg-indigo-50 text-indigo-700"
                                  }`}
                                >
                                  {tag}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3
                          className={`text-xs font-black uppercase ${theme.textMuted} mb-3 tracking-widest flex items-center gap-2`}
                        >
                          <Facebook size={14} className="text-blue-500" />
                          Original Post
                        </h3>
                        <div
                          className={`p-6 rounded-2xl border ${theme.border} ${theme.bg} text-sm leading-relaxed ${theme.text} whitespace-pre-wrap break-words`}
                        >
                          {selectedLead.text || "No post content available."}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div
                        className={`p-6 rounded-3xl border ${theme.border} ${theme.panel} shadow-lg shadow-slate-200/50 dark:shadow-none`}
                      >
                        <div className="flex items-center gap-2 mb-6 text-emerald-500">
                          <ShieldCheck size={18} />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Contact Intel
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
                              Primary Email
                            </label>
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${theme.bg} text-slate-400 flex-shrink-0`}
                              >
                                <Mail size={16} />
                              </div>
                              {selectedLead.contact.email ? (
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                  {selectedLead.contact.email}
                                </span>
                              ) : (
                                <span className="text-sm italic text-slate-400">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </div>

                          {(selectedLead.contact.email || selectedLead.contact.sms) && (
                            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
                          )}

                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
                              Direct SMS
                            </label>
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${theme.bg} text-slate-400 flex-shrink-0`}
                              >
                                <Phone size={16} />
                              </div>
                              {selectedLead.contact.sms ? (
                                <span className={`text-sm font-bold ${theme.heading}`}>
                                  {selectedLead.contact.sms}
                                </span>
                              ) : (
                                <span className="text-sm italic text-slate-400">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          className={`w-full mt-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${theme.buttonPrimary}`}
                        >
                          Start Outreach <ArrowRight size={14} />
                        </button>
                      </div>

                      <div
                        className={`p-5 rounded-2xl border ${theme.border} ${theme.bg}`}
                      >
                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                          Job Metadata
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className={theme.textMuted}>Posted</span>
                            <span className={`font-bold ${theme.heading}`}>
                              {getRelativeTime(selectedLead.timestamp)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className={theme.textMuted}>Source ID</span>
                            <span className={`font-mono ${theme.textMuted}`}>
                              #{selectedLead.id.toString().slice(-6)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(typeof selectedLead.likesCount === "number" ||
                        typeof selectedLead.commentsCount === "number" ||
                        typeof selectedLead.sharesCount === "number") && (
                        <div
                          className={`p-5 rounded-2xl border ${theme.border} ${theme.bg}`}
                        >
                          <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">
                            Engagement
                          </h4>
                          <div className="grid grid-cols-3 gap-2.5">
                            <div
                              className={`flex flex-col items-center justify-center rounded-xl ${theme.panelSubtle} border ${theme.border} px-3 py-3.5 transition-all hover:border-rose-300 dark:hover:border-rose-500/30 hover:shadow-sm group`}
                            >
                              <div className="mb-2 p-1.5 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 group-hover:bg-rose-500/20 dark:group-hover:bg-rose-500/30 transition-colors">
                                <Heart
                                  size={18}
                                  className="text-rose-500 fill-rose-500/30 dark:fill-rose-500/20"
                                />
                              </div>
                              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                                Likes
                              </span>
                              <span
                                className={`text-base font-black ${theme.heading}`}
                              >
                                {selectedLead.likesCount ?? 0}
                              </span>
                            </div>
                            <div
                              className={`flex flex-col items-center justify-center rounded-xl ${theme.panelSubtle} border ${theme.border} px-3 py-3.5 transition-all hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:shadow-sm group`}
                            >
                              <div className="mb-2 p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-colors">
                                <MessageSquare
                                  size={18}
                                  className="text-emerald-500"
                                />
                              </div>
                              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                                Comments
                              </span>
                              <span
                                className={`text-base font-black ${theme.heading}`}
                              >
                                {selectedLead.commentsCount ?? 0}
                              </span>
                            </div>
                            <div
                              className={`flex flex-col items-center justify-center rounded-xl ${theme.panelSubtle} border ${theme.border} px-3 py-3.5 transition-all hover:border-sky-300 dark:hover:border-sky-500/30 hover:shadow-sm group`}
                            >
                              <div className="mb-2 p-1.5 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 group-hover:bg-sky-500/20 dark:group-hover:bg-sky-500/30 transition-colors">
                                <Share2
                                  size={18}
                                  className="text-sky-500"
                                />
                              </div>
                              <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">
                                Shares
                              </span>
                              <span
                                className={`text-base font-black ${theme.heading}`}
                              >
                                {selectedLead.sharesCount ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className={`p-6 rounded-full ${theme.bg} mb-4`}>
                    <Activity size={32} />
                  </div>
                  <p className="font-medium">
                    Select a lead to view intelligence
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      

      {previewImage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="max-w-4xl max-h-[80vh] p-4 pointer-events-none">
            <img
              src={previewImage}
              alt="Attachment preview"
              className="w-full h-full object-contain rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#334155" : "#cbd5e1"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#475569" : "#94a3b8"};
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid ${darkMode ? "#0f172a" : "#ffffff"};
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
        /* Improve base typography and contrast */
        .app-root { color: #0f172a; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .app-root h1, .app-root h2, .app-root h3 { color: #0f172a; font-weight: 800; }
        .app-root .text-slate-500 { color: #6b7280; } /* ensure visible muted text */
        .app-root a { color: #4f46e5; font-weight: 600; }
        .app-root .rounded-2xl { /* subtle uplift for cards */ box-shadow: 0 6px 20px rgba(15,23,42,0.04); }
      `}</style>
    </div>
  );
};

export default RecruitmentOS;

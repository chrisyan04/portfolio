"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import { getPortfolioPhotos, PortfolioData } from "@/lib/portfolio";

type Experience = PortfolioData["experience"][number];
type Project = PortfolioData["projects"][number];
const emptyExperience: Experience = { period: "", title: "", company: "", description: "", tags: [] };
const emptyProject: Project = { title: "", description: "", tags: [], url: "" };

export default function AdminPage() {
  const { data, setData, contentReady, storageConfigured } = usePortfolio();
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<PortfolioData>(data);
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => { if (!dirty) setDraft(data); }, [data, dirty]);
  useEffect(() => {
    let active = true;
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then(({ authenticated: valid }) => { if (active) setAuthenticated(Boolean(valid)); })
      .catch(() => { if (active) setError("Could not check access. Please refresh."); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error("Access denied — try again.");
      setAuthenticated(true); setPassword(""); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not sign in."); }
  }

  function updateField<K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) {
    setDraft((previous) => ({ ...previous, [key]: value })); setDirty(true); setSaved(false);
  }
  function updateItem<K extends "experience" | "projects">(key: K, index: number, item: PortfolioData[K][number]) {
    setDraft((previous) => ({ ...previous, [key]: previous[key].map((entry, position) => position === index ? item : entry) })); setDirty(true); setSaved(false);
  }
  function removeItem(key: "experience" | "projects", index: number) {
    setDraft((previous) => ({ ...previous, [key]: previous[key].filter((_, position) => position !== index) })); setDirty(true); setSaved(false);
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const response = await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not publish changes.");
      setData(result.data); setDirty(false); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not publish changes."); }
    finally { setSaving(false); }
  }

  async function uploadPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setPhotoBusy(true); setError(""); setPhotoMessage("");
    let completed = 0;
    try {
      for (const file of files) {
        const prepareResponse = await fetch("/api/admin/photos/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
        });
        const prepared = await prepareResponse.json();
        if (!prepareResponse.ok) throw new Error(prepared.error || "Could not prepare photo upload.");
        const storageResponse = await fetch(prepared.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": prepared.contentType },
          body: file,
        });
        if (!storageResponse.ok) throw new Error("Photo transfer failed. Please try again.");
        const response = await fetch("/api/admin/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: prepared.path }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not upload photo.");
        setData(result.data);
        setDraft((previous) => ({ ...previous, photos: result.data.photos }));
        completed++;
      }
      setPhotoMessage(`${completed} photo${completed === 1 ? "" : "s"} published.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not upload photo."); }
    finally { event.target.value = ""; setPhotoBusy(false); }
  }

  async function removePhoto(index: number) {
    setPhotoBusy(true); setError(""); setPhotoMessage("");
    try {
      const response = await fetch("/api/admin/photos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ index }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove photo.");
      setData(result.data);
      setDraft((previous) => ({ ...previous, photos: result.data.photos }));
      setPhotoMessage("Photo removed for all visitors.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not remove photo."); }
    finally { setPhotoBusy(false); }
  }

  if (checking || (authenticated && !contentReady)) return <section className="admin-wrap"><p className="eyebrow">private route / admin</p><p>Loading editor…</p></section>;
  if (!authenticated) return <section className="admin-wrap"><p className="eyebrow">private route / admin</p><form className="admin-login glass-card" onSubmit={login}><div className="brand-mark" style={{ margin: "0 auto 16px" }}>CY</div><h2>Enter the studio.</h2><p>This door is for the person behind the portfolio.</p><input type="password" aria-label="Access key" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Access key" autoFocus required /><button className="button primary" type="submit">Unlock admin</button>{error && <p className="error" role="alert">{error}</p>}</form></section>;

  return <section className="admin-wrap"><p className="eyebrow">private route / admin</p><h1>Admin <span className="gradient-text">studio.</span></h1><p className="admin-help">Edit the entries below, then publish them for everyone visiting the site.</p>{!storageConfigured && <p className="error" role="alert">Shared storage is unavailable. Check the Supabase settings in .env.local and restart the server.</p>}
    <div className="admin-form">
      <section className="admin-section glass-card"><h2>Profile</h2>
        {(["name", "role", "location", "email"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input type={key === "email" ? "email" : "text"} value={draft[key]} onChange={(event) => updateField(key, event.target.value)} /></label>)}
        <label className="field"><span>bio</span><textarea value={draft.bio} onChange={(event) => updateField("bio", event.target.value)} /></label>
      </section>
      <section className="admin-section glass-card">
        <div className="admin-section-heading"><div><h2>What I’ve been up to</h2><p>Upload photos up to 10 MB or remove them. Changes go live immediately.</p></div>
          <label className="button admin-photo-upload"><Upload size={16} />{photoBusy ? "Working…" : "Add photos"}<input type="file" accept=".heic,.heif,.jpg,.jpeg,.png,.webp,image/heic,image/heif,image/jpeg,image/png,image/webp" multiple disabled={photoBusy || saving || !storageConfigured} onChange={uploadPhotos} /></label>
        </div>
        <div className="admin-photo-grid">
          {getPortfolioPhotos(draft).map((src, index) => <div className="admin-photo-item" key={`${src}-${index}`}>
            <div className="admin-photo-preview"><Image src={src} alt={`Carousel photo ${index + 1}`} fill sizes="(max-width: 600px) 40vw, 150px" /></div>
            <div className="admin-photo-item-footer"><span>{String(index + 1).padStart(2, "0")}</span><button type="button" disabled={photoBusy || saving || !storageConfigured} onClick={() => removePhoto(index)} aria-label={`Remove photo ${index + 1}`}><Trash2 size={16} /></button></div>
          </div>)}
        </div>
        {getPortfolioPhotos(draft).length === 0 && <p className="admin-help">No photos yet. Add one to fill the carousel.</p>}
        {photoMessage && <p className="admin-photo-message" role="status">{photoMessage}</p>}
      </section>
      <section className="admin-section glass-card"><div className="admin-section-heading"><h2>Highlights</h2><button className="button" type="button" onClick={() => updateField("stats", [...draft.stats, { value: "", label: "" }])}><Plus size={16} /> Add highlight</button></div>
        {draft.stats.map((stat, index) => <div className="admin-entry" key={index}><div className="admin-entry-heading"><strong>Highlight {index + 1}</strong><button className="icon-button" type="button" aria-label={`Remove highlight ${index + 1}`} onClick={() => updateField("stats", draft.stats.filter((_, position) => position !== index))}><Trash2 size={17} /></button></div><label className="field"><span>value</span><input value={stat.value} onChange={(event) => updateField("stats", draft.stats.map((entry, position) => position === index ? { ...entry, value: event.target.value } : entry))} /></label><label className="field"><span>label</span><input value={stat.label} onChange={(event) => updateField("stats", draft.stats.map((entry, position) => position === index ? { ...entry, label: event.target.value } : entry))} /></label></div>)}
      </section>
      <section className="admin-section glass-card"><div className="admin-section-heading"><div><h2>Experience</h2><p>Use “2024 — now” or “2021 — 2023”. The timeline sorts entries automatically.</p></div><button className="button" type="button" onClick={() => updateField("experience", [...draft.experience, { ...emptyExperience }])}><Plus size={16} /> Add entry</button></div>
        {draft.experience.map((item, index) => <div className="admin-entry" key={index}><div className="admin-entry-heading"><strong>{item.title || `Experience ${index + 1}`}</strong><button className="icon-button" type="button" aria-label={`Remove experience ${index + 1}`} onClick={() => removeItem("experience", index)}><Trash2 size={17} /></button></div>
          {(["period", "title", "company"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input value={item[key]} onChange={(event) => updateItem("experience", index, { ...item, [key]: event.target.value })} /></label>)}
          <label className="field"><span>description</span><textarea value={item.description} onChange={(event) => updateItem("experience", index, { ...item, description: event.target.value })} /></label>
          <label className="field"><span>tags (comma separated)</span><input value={item.tags.join(", ")} onChange={(event) => updateItem("experience", index, { ...item, tags: event.target.value.split(",").map((tag) => tag.trim()) })} /></label>
        </div>)}
      </section>
      <section className="admin-section glass-card"><div className="admin-section-heading"><div><h2>Projects</h2><p>Leave the URL blank to hide the external link.</p></div><button className="button" type="button" onClick={() => updateField("projects", [...draft.projects, { ...emptyProject }])}><Plus size={16} /> Add project</button></div>
        {draft.projects.map((item, index) => <div className="admin-entry" key={index}><div className="admin-entry-heading"><strong>{item.title || `Project ${index + 1}`}</strong><button className="icon-button" type="button" aria-label={`Remove project ${index + 1}`} onClick={() => removeItem("projects", index)}><Trash2 size={17} /></button></div>
          <label className="field"><span>title</span><input value={item.title} onChange={(event) => updateItem("projects", index, { ...item, title: event.target.value })} /></label>
          <label className="field"><span>description</span><textarea value={item.description} onChange={(event) => updateItem("projects", index, { ...item, description: event.target.value })} /></label>
          <label className="field"><span>tags (comma separated)</span><input value={item.tags.join(", ")} onChange={(event) => updateItem("projects", index, { ...item, tags: event.target.value.split(",").map((tag) => tag.trim()) })} /></label>
          <label className="field"><span>URL</span><input type="url" value={item.url === "#" ? "" : item.url} onChange={(event) => updateItem("projects", index, { ...item, url: event.target.value })} placeholder="https://" /></label>
        </div>)}
      </section>
      <div className="admin-actions"><button className="button primary" type="button" onClick={save} disabled={saving || photoBusy || !storageConfigured}>{saving ? "Publishing…" : "Publish changes"}</button><button className="button" type="button" onClick={() => { setDraft(data); setDirty(false); setSaved(false); }}>Reset draft</button><button className="button" type="button" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthenticated(false); }}>Lock</button>{saved && <span role="status">Published for all visitors</span>}{error && <span className="error" role="alert">{error}</span>}</div>
    </div>
  </section>;
}

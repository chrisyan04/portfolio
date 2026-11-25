"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import { ContentLanguage, getPortfolioPhotos, getPortfolioPlaces, Language, localizePortfolio, Place, PortfolioData } from "@/lib/portfolio";
import { mapCoordinates, mapPosition } from "@/lib/world-map";

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
  const [editingLanguage, setEditingLanguage] = useState<Language>("en");
  const [pinPickerIndex, setPinPickerIndex] = useState<number | null>(null);
  const preview = localizePortfolio(draft, editingLanguage);

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
  function updateTranslatedProfile(language: ContentLanguage, field: "name" | "role" | "location" | "bio", value: string) {
    setDraft((previous) => ({ ...previous, translations: { ...previous.translations, [language]: { ...previous.translations?.[language], [field]: value } } }));
    setDirty(true); setSaved(false);
  }
  function updateTranslatedEntry(section: "stats" | "experience" | "projects" | "places", index: number, language: ContentLanguage, field: string, value: string | string[]) {
    setDraft((previous) => {
      const next = structuredClone(previous);
      if (section === "places") next.places = structuredClone(getPortfolioPlaces(next));
      const entry = (section === "places" ? next.places?.[index] : next[section][index]) as { translations?: Partial<Record<ContentLanguage, Record<string, unknown>>> };
      entry.translations = { ...entry.translations, [language]: { ...entry.translations?.[language], [field]: value } };
      return next;
    });
    setDirty(true); setSaved(false);
  }
  function updatePlace(index: number, patch: Partial<Place>) {
    setDraft((previous) => ({ ...previous, places: getPortfolioPlaces(previous).map((place, position) => position === index ? { ...place, ...patch } : place) }));
    setDirty(true); setSaved(false);
  }
  function addPlace() {
    const places = getPortfolioPlaces(draft);
    updateField("places", [...places, { id: crypto.randomUUID(), name: "", country: "", latitude: 43.6532, longitude: -79.3832, note: "", year: "" }]);
    setPinPickerIndex(places.length);
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
    <div className="admin-language-picker" role="group" aria-label="Content language">{(["en", "fr", "zh"] as Language[]).map((item) => <button className={editingLanguage === item ? "selected" : ""} type="button" key={item} onClick={() => setEditingLanguage(item)} lang={item === "zh" ? "zh-CN" : item}>{item === "en" ? "English" : item === "fr" ? "Français" : "中文"}</button>)}</div>
    <p className="admin-help">{editingLanguage === "en" ? "English is the source text. Dates, URLs, and email are shared across languages." : "Edit translations here. Blank fields use the existing translation when available, then English. Dates, URLs, and email are shared."}</p>
    <div className="admin-form">
      <section className="admin-section glass-card"><h2>Profile</h2>
        {editingLanguage === "en" ? <>{(["name", "role", "location", "email"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input type={key === "email" ? "email" : "text"} value={draft[key]} onChange={(event) => updateField(key, event.target.value)} /></label>)}<label className="field"><span>bio</span><textarea value={draft.bio} onChange={(event) => updateField("bio", event.target.value)} /></label></> : <>{(["name", "role", "location"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input value={draft.translations?.[editingLanguage]?.[key] ?? ""} placeholder={preview[key]} onChange={(event) => updateTranslatedProfile(editingLanguage, key, event.target.value)} /></label>)}<label className="field"><span>bio</span><textarea value={draft.translations?.[editingLanguage]?.bio ?? ""} placeholder={preview.bio} onChange={(event) => updateTranslatedProfile(editingLanguage, "bio", event.target.value)} /></label></>}
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
      <section className="admin-section glass-card"><div className="admin-section-heading"><h2>Highlights</h2>{editingLanguage === "en" && <button className="button" type="button" onClick={() => updateField("stats", [...draft.stats, { value: "", label: "" }])}><Plus size={16} /> Add highlight</button>}</div>
        {draft.stats.map((stat, index) => <div className="admin-entry" key={index}><div className="admin-entry-heading"><strong>Highlight {index + 1}</strong>{editingLanguage === "en" && <button className="icon-button" type="button" aria-label={`Remove highlight ${index + 1}`} onClick={() => updateField("stats", draft.stats.filter((_, position) => position !== index))}><Trash2 size={17} /></button>}</div>{editingLanguage === "en" ? <><label className="field"><span>value</span><input value={stat.value} onChange={(event) => updateField("stats", draft.stats.map((entry, position) => position === index ? { ...entry, value: event.target.value } : entry))} /></label><label className="field"><span>label</span><input value={stat.label} onChange={(event) => updateField("stats", draft.stats.map((entry, position) => position === index ? { ...entry, label: event.target.value } : entry))} /></label></> : <label className="field"><span>label</span><input value={stat.translations?.[editingLanguage]?.label ?? ""} placeholder={preview.stats[index]?.label} onChange={(event) => updateTranslatedEntry("stats", index, editingLanguage, "label", event.target.value)} /></label>}</div>)}
      </section>
      <section className="admin-section glass-card"><div className="admin-section-heading"><div><h2>Experience</h2><p>Use “2024 — now” or “2021 — 2023”. The timeline sorts entries automatically.</p></div>{editingLanguage === "en" && <button className="button" type="button" onClick={() => updateField("experience", [...draft.experience, { ...emptyExperience }])}><Plus size={16} /> Add entry</button>}</div>
        {draft.experience.map((item, index) => <div className="admin-entry" key={index}><div className="admin-entry-heading"><strong>{item.title || `Experience ${index + 1}`}</strong>{editingLanguage === "en" && <button className="icon-button" type="button" aria-label={`Remove experience ${index + 1}`} onClick={() => removeItem("experience", index)}><Trash2 size={17} /></button>}</div>
          {editingLanguage === "en" ? <>{(["period", "title", "company"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input value={item[key]} onChange={(event) => updateItem("experience", index, { ...item, [key]: event.target.value })} /></label>)}<label className="field"><span>description</span><textarea value={item.description} onChange={(event) => updateItem("experience", index, { ...item, description: event.target.value })} /></label><label className="field"><span>tags (comma separated)</span><input value={item.tags.join(", ")} onChange={(event) => updateItem("experience", index, { ...item, tags: event.target.value.split(",").map((tag) => tag.trim()) })} /></label></> : <>{(["title", "company"] as const).map((key) => <label className="field" key={key}><span>{key}</span><input value={item.translations?.[editingLanguage]?.[key] ?? ""} placeholder={preview.experience[index]?.[key]} onChange={(event) => updateTranslatedEntry("experience", index, editingLanguage, key, event.target.value)} /></label>)}<label className="field"><span>description</span><textarea value={item.translations?.[editingLanguage]?.description ?? ""} placeholder={preview.experience[index]?.description} onChange={(event) => updateTranslatedEntry("experience", index, editingLanguage, "description", event.target.value)} /></label><label className="field"><span>tags (comma separated)</span><input value={item.translations?.[editingLanguage]?.tags?.join(", ") ?? ""} placeholder={preview.experience[index]?.tags.join(", ")} onChange={(event) => updateTranslatedEntry("experience", index, editingLanguage, "tags", event.target.value.split(",").map((tag) => tag.trim()))} /></label></>}
        </div>)}
      </section>
      <section className="admin-section glass-card"><div className="admin-section-heading"><div><h2>Projects</h2><p>Leave the URL blank to hide the external link.</p></div>{editingLanguage === "en" && <button className="button" type="button" onClick={() => updateField("projects", [...draft.projects, { ...emptyProject }])}><Plus size={16} /> Add project</button>}</div>
        {draft.projects.map((item, index) => <div className="admin-entry" key={index}><div className="admin-entry-heading"><strong>{item.title || `Project ${index + 1}`}</strong>{editingLanguage === "en" && <button className="icon-button" type="button" aria-label={`Remove project ${index + 1}`} onClick={() => removeItem("projects", index)}><Trash2 size={17} /></button>}</div>
          {editingLanguage === "en" ? <><label className="field"><span>title</span><input value={item.title} onChange={(event) => updateItem("projects", index, { ...item, title: event.target.value })} /></label><label className="field"><span>description</span><textarea value={item.description} onChange={(event) => updateItem("projects", index, { ...item, description: event.target.value })} /></label><label className="field"><span>tags (comma separated)</span><input value={item.tags.join(", ")} onChange={(event) => updateItem("projects", index, { ...item, tags: event.target.value.split(",").map((tag) => tag.trim()) })} /></label><label className="field"><span>URL</span><input type="url" value={item.url === "#" ? "" : item.url} onChange={(event) => updateItem("projects", index, { ...item, url: event.target.value })} placeholder="https://" /></label></> : <><label className="field"><span>title</span><input value={item.translations?.[editingLanguage]?.title ?? ""} placeholder={preview.projects[index]?.title} onChange={(event) => updateTranslatedEntry("projects", index, editingLanguage, "title", event.target.value)} /></label><label className="field"><span>description</span><textarea value={item.translations?.[editingLanguage]?.description ?? ""} placeholder={preview.projects[index]?.description} onChange={(event) => updateTranslatedEntry("projects", index, editingLanguage, "description", event.target.value)} /></label><label className="field"><span>tags (comma separated)</span><input value={item.translations?.[editingLanguage]?.tags?.join(", ") ?? ""} placeholder={preview.projects[index]?.tags.join(", ")} onChange={(event) => updateTranslatedEntry("projects", index, editingLanguage, "tags", event.target.value.split(",").map((tag) => tag.trim()))} /></label></>}
        </div>)}
      </section>
      <section className="admin-section glass-card">
        <div className="admin-section-heading"><div><h2>Places</h2><p>Add a place, then click the map to position its pin. Places appear on the public map after publishing.</p></div>{editingLanguage === "en" && <button className="button" type="button" onClick={addPlace}><Plus size={16} /> Add place</button>}</div>
        {getPortfolioPlaces(draft).map((place, index) => <div className="admin-entry" key={place.id}>
          <div className="admin-entry-heading"><strong>{place.name || `Place ${index + 1}`}</strong>{editingLanguage === "en" && <button className="icon-button" type="button" aria-label={`Remove ${place.name || `place ${index + 1}`}`} onClick={() => { updateField("places", getPortfolioPlaces(draft).filter((_, position) => position !== index)); setPinPickerIndex(null); }}><Trash2 size={17} /></button>}</div>
          {editingLanguage === "en" ? <>
            <label className="field"><span>place or city</span><input value={place.name} onChange={(event) => updatePlace(index, { name: event.target.value })} /></label>
            <label className="field"><span>country</span><input value={place.country} onChange={(event) => updatePlace(index, { country: event.target.value })} /></label>
            <label className="field"><span>short note</span><textarea value={place.note} onChange={(event) => updatePlace(index, { note: event.target.value })} /></label>
            <label className="field"><span>year or trip date (optional)</span><input value={place.year} onChange={(event) => updatePlace(index, { year: event.target.value })} /></label>
            <div className="admin-place-coordinates">
              <label className="field"><span>latitude</span><input type="number" min="-60" max="85" step="0.0001" value={place.latitude} onChange={(event) => updatePlace(index, { latitude: Number(event.target.value) })} /></label>
              <label className="field"><span>longitude</span><input type="number" min="-180" max="180" step="0.0001" value={place.longitude} onChange={(event) => updatePlace(index, { longitude: Number(event.target.value) })} /></label>
            </div>
            <button className="button admin-place-pick-trigger" type="button" aria-expanded={pinPickerIndex === index} onClick={() => setPinPickerIndex(pinPickerIndex === index ? null : index)}>{pinPickerIndex === index ? "Hide map" : "Choose pin on map"}</button>
            {pinPickerIndex === index && <button className="admin-place-picker" type="button" aria-label={`Position pin for ${place.name || `place ${index + 1}`}`} onClick={(event) => {
              if (event.detail === 0) return;
              const rect = event.currentTarget.getBoundingClientRect();
              updatePlace(index, mapCoordinates((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height));
            }}><Image src="/world-land.svg" alt="" fill sizes="(max-width: 760px) 90vw, 680px" draggable={false} /><span className="admin-place-marker" style={mapPosition(place.latitude, place.longitude)} /></button>}
          </> : <>
            {(["name", "country"] as const).map((field) => <label className="field" key={field}><span>{field}</span><input value={place.translations?.[editingLanguage]?.[field] ?? ""} placeholder={getPortfolioPlaces(preview)[index]?.[field]} onChange={(event) => updateTranslatedEntry("places", index, editingLanguage, field, event.target.value)} /></label>)}
            <label className="field"><span>short note</span><textarea value={place.translations?.[editingLanguage]?.note ?? ""} placeholder={getPortfolioPlaces(preview)[index]?.note} onChange={(event) => updateTranslatedEntry("places", index, editingLanguage, "note", event.target.value)} /></label>
          </>}
        </div>)}
      </section>
      <div className="admin-actions"><button className="button primary" type="button" onClick={save} disabled={saving || photoBusy || !storageConfigured}>{saving ? "Publishing…" : "Publish changes"}</button><button className="button" type="button" onClick={() => { setDraft(data); setDirty(false); setSaved(false); }}>Reset draft</button><button className="button" type="button" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthenticated(false); }}>Lock</button>{saved && <span role="status">Published for all visitors</span>}{error && <span className="error" role="alert">{error}</span>}</div>
    </div>
  </section>;
}

import { PortfolioData } from "@/lib/portfolio";
import { managedPhotoPath } from "@/lib/portfolio-photo-urls";
import { bundledPhotos, GALLERY_VERSION, MAX_GALLERY_PHOTOS } from "@/lib/gallery-photos";
import { countryShapes } from "@/lib/world-countries";
import { selectablePlaces } from "@/lib/place-shapes";

const isText = (value: unknown): value is string => typeof value === "string" && value.length <= 10000;
const isShortText = (value: unknown): value is string => isText(value) && value.length <= 500;
const isTags = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 20 && value.every(isShortText);
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const profileFields = { name: isShortText, role: isShortText, location: isShortText, bio: isText, availability: isShortText };
const statFields = { value: isShortText, label: isShortText };
const experienceFields = { title: isShortText, company: isShortText, description: isText, tags: isTags };
const projectFields = { title: isShortText, description: isText, tags: isTags };
const countryCodes = new Set(countryShapes.map(([code]) => code));
const placeCodes = new Set(selectablePlaces.map(([code]) => code));

function isTranslations(value: unknown, fields: Record<string, (value: unknown) => boolean>) {
  if (value === undefined) return true;
  if (!isRecord(value) || Object.keys(value).some((key) => key !== "fr" && key !== "zh")) return false;
  return Object.values(value).every((entry) => isRecord(entry) && Object.entries(entry).every(([key, field]) => key in fields && fields[key](field)));
}

export function isPortfolioData(value: unknown): value is PortfolioData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  if (!["name", "role", "location", "email", "availability"].every((key) => isShortText(data[key])) || !isText(data.bio)) return false;
  if (!isTranslations(data.translations, profileFields)) return false;
  if (!Array.isArray(data.stats) || data.stats.length > 30 || !data.stats.every((item) => item && isShortText(item.value) && isShortText(item.label) && isTranslations(item.translations, statFields))) return false;
  if (!Array.isArray(data.experience) || data.experience.length > 100 || !data.experience.every((item) => item && isShortText(item.period) && isShortText(item.title) && isShortText(item.company) && isText(item.description) && isTags(item.tags) && isTranslations(item.translations, experienceFields))) return false;
  if (!Array.isArray(data.projects) || data.projects.length > 100 || !data.projects.every((item) => item && isShortText(item.title) && isText(item.description) && isTags(item.tags) && isShortText(item.url) && (!item.url || item.url === "#" || /^https?:\/\//i.test(item.url)) && isTranslations(item.translations, projectFields))) return false;
  if (data.countries !== undefined && (!Array.isArray(data.countries) || data.countries.length > countryCodes.size || !data.countries.every((code) => typeof code === "string" && countryCodes.has(code)) || new Set(data.countries).size !== data.countries.length)) return false;
  if (data.visitedPlaces !== undefined && (!Array.isArray(data.visitedPlaces) || data.visitedPlaces.length > placeCodes.size || !data.visitedPlaces.every((code) => typeof code === "string" && placeCodes.has(code)) || new Set(data.visitedPlaces).size !== data.visitedPlaces.length)) return false;
  if (data.galleryVersion !== undefined && data.galleryVersion !== GALLERY_VERSION) return false;
  if (data.photos !== undefined && (!Array.isArray(data.photos) || data.photos.length > MAX_GALLERY_PHOTOS || !data.photos.every((src) => src === "/me-professional.jpg" || bundledPhotos.some((photo) => photo === src) || (typeof src === "string" && Boolean(managedPhotoPath(src)))))) return false;
  return true;
}

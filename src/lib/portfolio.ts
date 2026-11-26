import { bundledPhotos, GALLERY_VERSION } from "@/lib/gallery-photos";
import { knownTranslations } from "@/lib/portfolio-locales";

export type Language = "en" | "fr" | "zh";
export type ContentLanguage = Exclude<Language, "en">;
export type Localized<T> = Partial<Record<ContentLanguage, Partial<T>>>;
type ProfileText = { name: string; role: string; location: string; bio: string; availability: string };
export type Stat = { value: string; label: string; translations?: Localized<{ value: string; label: string }> };
export type Experience = { period: string; title: string; company: string; description: string; tags: string[]; translations?: Localized<{ title: string; company: string; description: string; tags: string[] }> };
export type Project = { title: string; description: string; tags: string[]; url: string; translations?: Localized<{ title: string; description: string; tags: string[] }> };
export type PortfolioData = {
  name: string; role: string; location: string; bio: string; email: string; availability: string;
  stats: Stat[];
  experience: Experience[];
  projects: Project[];
  countries?: string[];
  visitedPlaces?: string[];
  translations?: Localized<ProfileText>;
  photos?: string[];
  galleryVersion?: number;
};

export function getPortfolioPhotos(data: PortfolioData) { return data.photos ?? [...bundledPhotos]; }
export const defaultVisitedPlaces = ["CAN", "USA", "CUB", "JAM", "FRA_EU", "ESP_EU", "MLT", "ITA", "CHN", "HKG", "TWN", "JPN", "BALI"];
export function getVisitedPlaces(data: PortfolioData) { return data.visitedPlaces ?? defaultVisitedPlaces; }

function localizedText(text: string, translation: string | undefined, language: ContentLanguage) {
  return translation?.trim() || knownTranslations[text]?.[language] || text;
}

function localizedTags(tags: string[], translations: string[] | undefined, language: ContentLanguage) {
  return tags.map((tag, index) => localizedText(tag, translations?.[index], language));
}

export function localizePortfolio(data: PortfolioData, language: Language): PortfolioData {
  if (language === "en") return data;
  const profile = data.translations?.[language];
  return {
    ...data,
    name: localizedText(data.name, profile?.name, language),
    role: localizedText(data.role, profile?.role, language),
    location: localizedText(data.location, profile?.location, language),
    bio: localizedText(data.bio, profile?.bio, language),
    availability: localizedText(data.availability, profile?.availability, language),
    stats: data.stats.map((item) => ({ ...item,
      value: localizedText(item.value, item.translations?.[language]?.value, language),
      label: localizedText(item.label, item.translations?.[language]?.label, language),
    })),
    experience: data.experience.map((item) => ({ ...item,
      title: localizedText(item.title, item.translations?.[language]?.title, language),
      company: localizedText(item.company, item.translations?.[language]?.company, language),
      description: localizedText(item.description, item.translations?.[language]?.description, language),
      tags: localizedTags(item.tags, item.translations?.[language]?.tags, language),
    })),
    projects: data.projects.map((item) => ({ ...item,
      title: localizedText(item.title, item.translations?.[language]?.title, language),
      description: localizedText(item.description, item.translations?.[language]?.description, language),
      tags: localizedTags(item.tags, item.translations?.[language]?.tags, language),
    })),
  };
}

export const defaultPortfolio: PortfolioData = {
  name: "Chris Yan", role: "Software engineer & data storyteller", location: "Toronto, Canada",
  bio: "I build thoughtful digital products where clean engineering, useful data, and a little bit of wonder meet.", email: "chenxi.yan@gmail.com", availability: "Open to interesting problems",
  stats: [{ value: "05+", label: "years building" }, { value: "24", label: "tools in the stack" }, { value: "∞", label: "curiosity" }],
  experience: [
    { period: "2024 — now", title: "Software Engineer", company: "Independent / Toronto", description: "Designing focused web products, data experiences, and systems that feel as good as they function.", tags: ["Next.js", "TypeScript", "Product"] },
    { period: "2023 — 2024", title: "Data & Automation Analyst", company: "Enterprise systems", description: "Turned noisy operational data into dashboards, automations, and decisions people could actually use.", tags: ["Python", "Power BI", "SQL"] },
    { period: "2021 — 2023", title: "Developer / Builder", company: "University of Toronto", description: "Learned by shipping: APIs, experiments, student projects, and a lot of late-night debugging.", tags: ["React", "Flask", "Firebase"] },
  ],
  projects: [
    { title: "Signal / dashboard", description: "A calm command centre for turning messy metrics into a clear next move.", tags: ["Data", "UX", "React"], url: "#" },
    { title: "Not LinkedIn", description: "A playful personal space for the things that do not belong on a resume.", tags: ["Creative", "Web", "Identity"], url: "" },
    { title: "Portfolio / 02", description: "This site — rebuilt as a living interface, not a static business card.", tags: ["Next.js", "Motion", "Systems"], url: "#" },
  ],
  photos: [...bundledPhotos],
  galleryVersion: GALLERY_VERSION,
};

export const translations = {
  en: { nav: ["home", "about", "experience", "projects", "places", "contact"], available: "currently working", greeting: "Hello, I’m Chris.", hero: "Welcome.", heroAccent: "Get to know me.", aboutLabel: "about", aboutTitle: "A bit about me.", currentWork: "Current work", aboutExtra: "Outside work, I love the outdoors, travel, and adventure. I’ve been a hockey fan my whole life.", currently: "currently", nowLabel: "now", nowTitle: "What I’ve been up to.", swipeLeft: "Swipe card left", swipeRight: "Swipe card right", swipeHint: "Swipe left or right", carouselPhotoAlt: "Photo from Chris’s gallery", nowEmpty: "Photos coming soon.", timelineButton: "follow the timeline", viewWork: "View experience", contact: "Contact me", experienceLabel: "experience", experienceTitle: "the long way around.", experienceDescription: "A look at where I’ve worked and what I’ve built.", projectsLabel: "projects", placesLabel: "places", placesTitle: "Places I’ve been.", placesDescription: "A map of places I’ve visited.", placesCount: "places", placesCountOne: "place", placesHint: "Select a highlighted place or choose one from the list.", placesEmpty: "More places to come.", placesYear: "Visited", featured: "What I’ve", experiments: "built.", projectsDescription: "Research papers, personal projects, hackathon wins.", selected: "project", openProject: "View project", contactLabel: "contact", connect: "Get in", noForms: "touch.", contactDescription: "Have a question or want to work together? Send me an email or shoot me a DM on Insta.", emailMe: "Email me", terminalWelcome: "welcome to chris://contact", terminalTitle: "chris / guest console v2.0", command: "type help to see commands", terminalPlaceholder: "try help", run: "run", terminalHelp: "commands: help · email · instagram · linkedin · github · clear", opening: "Opening", commandNotFound: "command not found", built: "built with intention", displayControls: "display controls", lightMode: "light mode", cursorTrail: "cursor trail", language: "language", comingSoon: "coming soon", notes: "notes", thinking: "thinking out loud.", firstDispatch: "the first dispatch is still loading.", notesDescription: "I’m shaping this into a living notebook rather than a content treadmill. In the meantime, the best way to reach me is through the terminal.", openTerminal: "open the terminal", loadingWelcome: "Welcome to", loadingAccent: "my corner of the web.", loadingHint: "Scroll or swipe up", menuOpen: "Open menu", menuClose: "Close menu", notFoundCode: "page not found", notFoundTitle: "A little lost", notFoundAccent: "in the universe?", notFoundDescription: "This page seems to have drifted away. Let’s get you back to familiar ground.", notFoundBack: "Back to the beginning" },
  fr: { nav: ["accueil", "à propos", "expérience", "projets", "lieux", "contact"], available: "actuellement en poste", greeting: "Bonjour, je suis Chris.", hero: "Bienvenue.", heroAccent: "Apprenez à me connaître.", aboutLabel: "à propos", aboutTitle: "Quelques mots sur moi.", currentWork: "En ce moment", aboutExtra: "En dehors du travail, j’aime le plein air, les voyages et l’aventure. Je suis aussi passionné de hockey depuis toujours.", currently: "actuellement", nowLabel: "maintenant", nowTitle: "Ce que je fais en ce moment.", swipeLeft: "Glisser la photo à gauche", swipeRight: "Glisser la photo à droite", swipeHint: "Glissez à gauche ou à droite", carouselPhotoAlt: "Photo de la galerie de Chris", nowEmpty: "Les photos arrivent bientôt.", timelineButton: "suivre la chronologie", viewWork: "Voir mon parcours", contact: "Me contacter", experienceLabel: "expérience", experienceTitle: "le chemin parcouru.", experienceDescription: "Un aperçu de mon parcours et des projets auxquels j’ai contribué.", projectsLabel: "projets", placesLabel: "lieux", placesTitle: "Les endroits où je suis allé.", placesDescription: "Une carte des endroits que j’ai visités.", placesCount: "lieux", placesCountOne: "lieu", placesHint: "Choisissez un lieu coloré ou un nom dans la liste.", placesEmpty: "D’autres lieux à venir.", placesYear: "Visité", featured: "Ce que j’ai", experiments: "créé.", projectsDescription: "Articles de recherche, projets personnels et victoires en hackathon.", selected: "projet", openProject: "Voir le projet", contactLabel: "contact", connect: "Restons", noForms: "en contact.", contactDescription: "Une question ou un projet en tête ? Envoyez-moi un courriel ou un message sur Instagram.", emailMe: "M’écrire", terminalWelcome: "bienvenue sur chris://contact", terminalTitle: "chris / console invitée v2.0", command: "écrivez help pour les commandes", terminalPlaceholder: "essayez help", run: "exécuter", terminalHelp: "commandes : help · email · instagram · linkedin · github · clear", opening: "Ouverture de", commandNotFound: "commande introuvable", built: "conçu avec intention", displayControls: "contrôles d’affichage", lightMode: "mode clair", cursorTrail: "traînée du curseur", language: "langue", comingSoon: "bientôt", notes: "notes", thinking: "réflexions à voix haute.", firstDispatch: "la première note se prépare encore.", notesDescription: "Je transforme cet espace en carnet vivant plutôt qu’en flux de contenu. En attendant, écrivez-moi depuis le terminal.", openTerminal: "ouvrir le terminal", loadingWelcome: "Bienvenue dans", loadingAccent: "mon coin du web.", loadingHint: "Défilez ou balayez vers le haut", menuOpen: "Ouvrir le menu", menuClose: "Fermer le menu", notFoundCode: "page introuvable", notFoundTitle: "Un peu perdu", notFoundAccent: "dans l’univers ?", notFoundDescription: "Cette page semble s’être égarée. Revenons à un endroit familier.", notFoundBack: "Retour à l’accueil" },
  zh: { nav: ["首页", "关于", "经历", "项目", "足迹", "联系"], available: "目前在职", greeting: "你好，我是 Chris。", hero: "欢迎。", heroAccent: "来了解一下我。", aboutLabel: "关于", aboutTitle: "关于我。", currentWork: "目前工作", aboutExtra: "工作之外，我热爱户外活动、旅行和冒险，也是个从小就喜欢冰球的球迷。", currently: "目前", nowLabel: "现在", nowTitle: "最近在忙什么。", swipeLeft: "向左滑动照片", swipeRight: "向右滑动照片", swipeHint: "左右滑动照片", carouselPhotoAlt: "Chris 的照片", nowEmpty: "照片即将更新。", timelineButton: "查看经历时间线", viewWork: "查看我的经历", contact: "联系我", experienceLabel: "经历", experienceTitle: "一路走来。", experienceDescription: "看看我在哪里工作过，以及参与过哪些项目。", projectsLabel: "项目", placesLabel: "足迹", placesTitle: "我去过的地方。", placesDescription: "在地图上看看我去过的地方。", placesCount: "个地方", placesCountOne: "个地方", placesHint: "选择已填色的地点或从列表中选择。", placesEmpty: "更多地方即将加入。", placesYear: "已到访", featured: "我的", experiments: "作品。", projectsDescription: "研究论文、个人项目和黑客松获奖作品。", selected: "项目", openProject: "查看项目", contactLabel: "联系", connect: "联系", noForms: "我。", contactDescription: "有问题或想一起合作？发邮件给我，或者在 Instagram 上私信我。", emailMe: "发邮件", terminalWelcome: "欢迎来到 chris://contact", terminalTitle: "chris / 访客控制台 v2.0", command: "输入 help 查看命令", terminalPlaceholder: "试试 help", run: "运行", terminalHelp: "命令：help · email · instagram · linkedin · github · clear", opening: "正在打开", commandNotFound: "未找到命令", built: "用心构建", displayControls: "显示设置", lightMode: "浅色模式", cursorTrail: "光标轨迹", language: "语言", comingSoon: "即将推出", notes: "笔记", thinking: "把想法说出来。", firstDispatch: "第一篇内容还在准备中。", notesDescription: "我想把这里做成一本持续更新的笔记，而不是内容流水线。在此之前，可以通过终端联系我。", openTerminal: "打开终端", loadingWelcome: "欢迎来到", loadingAccent: "我的个人网站。", loadingHint: "向上滚动或滑动", menuOpen: "打开菜单", menuClose: "关闭菜单", notFoundCode: "页面未找到", notFoundTitle: "好像迷路了", notFoundAccent: "在这片宇宙里？", notFoundDescription: "这个页面似乎不在这里。返回首页继续浏览吧。", notFoundBack: "返回首页" },
} as const;

export const storageKeys = { portfolio: "chris-portfolio-data", language: "chris-language", light: "chris-light", trail: "chris-trail" };

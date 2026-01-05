// Thème et charte graphique urstory.ch pour les pitch decks

export const urstoryTheme = {
  // Couleurs principales
  colors: {
    primary: "#f97316", // Orange Urstory
    primaryLight: "#fb923c",
    primaryDark: "#ea580c",
    secondary: "#1e293b", // Slate foncé
    accent: "#3b82f6", // Bleu
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    text: {
      primary: "#ffffff",
      secondary: "#94a3b8",
      muted: "#64748b",
    },
    background: {
      primary: "#0f172a",
      secondary: "#1e293b",
      tertiary: "#334155",
    },
  },

  // Gradients
  gradients: {
    primary: "from-[#f97316] to-[#ea580c]",
    background: "from-slate-950 via-slate-900 to-slate-950",
    card: "from-slate-800 to-slate-900",
  },

  // Typographie
  typography: {
    fontFamily: {
      heading: "font-bold",
      body: "font-normal",
    },
    sizes: {
      hero: "text-6xl md:text-7xl",
      h1: "text-5xl md:text-6xl",
      h2: "text-4xl md:text-5xl",
      h3: "text-3xl md:text-4xl",
      h4: "text-2xl md:text-3xl",
      body: "text-base md:text-lg",
      small: "text-sm",
    },
  },

  // Templates pré-configurés avec la charte urstory.ch
  templates: {
    "urstory-standard": {
      name: "Urstory Standard",
      description: "Présentation standard avec l'identité visuelle Urstory",
      slides: [
        {
          id: 1,
          title: "Page de garde",
          order: 1,
          content: {
            type: "cover",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Votre Titre Ici",
                level: "h1",
                color: "text-white",
                align: "center",
              },
              {
                id: 2,
                type: "separator",
                style: "solid",
                color: "border-brand-orange",
                thickness: "border-4",
              },
              {
                id: 3,
                type: "text",
                text: "Sous-titre ou description",
                fontSize: "text-xl",
                color: "text-slate-300",
                align: "center",
              },
              {
                id: 4,
                type: "badge",
                text: "Powered by Urstory",
                color: "bg-brand-orange",
                textColor: "text-white",
              },
            ],
          },
        },
        {
          id: 2,
          title: "Qui sommes-nous ?",
          order: 2,
          content: {
            type: "about",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Qui sommes-nous ?",
                level: "h2",
                color: "text-brand-orange",
                align: "left",
              },
              {
                id: 2,
                type: "columns",
                columnCount: 2,
                columns: [
                  {
                    content:
                      "Urstory est une agence digitale spécialisée dans la création de contenu et la stratégie social media.",
                  },
                  {
                    content:
                      "Notre mission : transformer vos idées en histoires captivantes qui engagent votre audience.",
                  },
                ],
              },
            ],
          },
        },
        {
          id: 3,
          title: "Nos services",
          order: 3,
          content: {
            type: "services",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Nos Services",
                level: "h2",
                color: "text-brand-orange",
                align: "center",
              },
              {
                id: 2,
                type: "list",
                items: [
                  "Stratégie Social Media",
                  "Création de Contenu",
                  "Community Management",
                  "Publicité Digitale",
                  "Analytics & Reporting",
                ],
                style: "bullet",
                color: "text-slate-300",
              },
            ],
          },
        },
        {
          id: 4,
          title: "Résultats",
          order: 4,
          content: {
            type: "results",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Nos Résultats",
                level: "h2",
                color: "text-brand-orange",
                align: "center",
              },
              {
                id: 2,
                type: "barChart",
                title: "Croissance moyenne de nos clients",
                data: [
                  { name: "Q1", value: 120 },
                  { name: "Q2", value: 180 },
                  { name: "Q3", value: 240 },
                  { name: "Q4", value: 320 },
                ],
                dataKey: "value",
                color: "#f97316",
              },
            ],
          },
        },
        {
          id: 5,
          title: "Contact",
          order: 5,
          content: {
            type: "contact",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Contactez-nous",
                level: "h2",
                color: "text-brand-orange",
                align: "center",
              },
              {
                id: 2,
                type: "callout",
                text: "Prêt à transformer votre présence digitale ? Parlons de votre projet !",
                calloutType: "info",
              },
              {
                id: 3,
                type: "text",
                text: "www.urstory.ch\ncontact@urstory.ch",
                fontSize: "text-lg",
                color: "text-slate-300",
                align: "center",
              },
            ],
          },
        },
      ],
    },
    "urstory-social-media": {
      name: "Stratégie Social Media Urstory",
      description: "Template pour présentation de stratégie social media",
      slides: [
        {
          id: 1,
          title: "Stratégie Social Media",
          order: 1,
          content: {
            type: "cover",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Stratégie Social Media 2024",
                level: "h1",
                color: "text-white",
                align: "center",
              },
              {
                id: 2,
                type: "separator",
                style: "solid",
                color: "border-brand-orange",
                thickness: "border-4",
              },
              {
                id: 3,
                type: "badge",
                text: "Par Urstory",
                color: "bg-brand-orange",
              },
            ],
          },
        },
        {
          id: 2,
          title: "Analyse de la situation",
          order: 2,
          content: {
            type: "analysis",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "État des lieux",
                level: "h2",
                color: "text-brand-orange",
                align: "left",
              },
              {
                id: 2,
                type: "columns",
                columnCount: 2,
                columns: [
                  { content: "Points forts actuels" },
                  { content: "Axes d'amélioration" },
                ],
              },
            ],
          },
        },
        {
          id: 3,
          title: "Objectifs & KPIs",
          order: 3,
          content: {
            type: "objectives",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Objectifs & KPIs",
                level: "h2",
                color: "text-brand-orange",
                align: "center",
              },
              {
                id: 2,
                type: "lineChart",
                title: "Objectifs de croissance",
                data: [
                  { name: "Jan", value: 1000 },
                  { name: "Mar", value: 1500 },
                  { name: "Jun", value: 2500 },
                  { name: "Sep", value: 3500 },
                  { name: "Dec", value: 5000 },
                ],
                dataKey: "value",
                color: "#f97316",
              },
            ],
          },
        },
        {
          id: 4,
          title: "Plan d'action",
          order: 4,
          content: {
            type: "action",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Plan d'Action",
                level: "h2",
                color: "text-brand-orange",
                align: "left",
              },
              {
                id: 2,
                type: "list",
                items: [
                  "Phase 1 : Audit & Stratégie (Mois 1)",
                  "Phase 2 : Création de contenu (Mois 2-3)",
                  "Phase 3 : Lancement campagnes (Mois 4)",
                  "Phase 4 : Optimisation continue",
                ],
                style: "numbered",
                color: "text-slate-300",
              },
            ],
          },
        },
        {
          id: 5,
          title: "Budget & Timeline",
          order: 5,
          content: {
            type: "budget",
            elements: [
              {
                id: 1,
                type: "heading",
                text: "Investissement",
                level: "h2",
                color: "text-brand-orange",
                align: "center",
              },
              {
                id: 2,
                type: "pieChart",
                title: "Répartition du budget",
                data: [
                  { name: "Création contenu", value: 40 },
                  { name: "Publicité", value: 35 },
                  { name: "Community Mgmt", value: 15 },
                  { name: "Analytics", value: 10 },
                ],
              },
            ],
          },
        },
      ],
    },
  },

  // Composants réutilisables
  components: {
    card: "bg-slate-800/50 rounded-xl border border-slate-700 p-6",
    button: {
      primary: "px-6 py-3 bg-brand-orange text-white rounded-xl hover:bg-brand-orange-light transition-colors font-semibold",
      secondary: "px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors",
      outline: "px-6 py-3 border-2 border-brand-orange text-brand-orange rounded-xl hover:bg-brand-orange hover:text-white transition-colors",
    },
  },
};

// Fonction helper pour appliquer le thème Urstory à un pitch deck
export function applyUrstoryTheme(slides: any[]) {
  return slides.map(slide => ({
    ...slide,
    content: {
      ...slide.content,
      theme: "urstory",
    },
  }));
}

// Export des templates prêts à l'emploi
export function getUrstoryTemplate(templateId: string) {
  return urstoryTheme.templates[templateId as keyof typeof urstoryTheme.templates];
}

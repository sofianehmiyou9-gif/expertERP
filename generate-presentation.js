#!/usr/bin/env node

const pptxgen = require("pptxgenjs");

// Initialize presentation
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "ExpertERPHub";
pres.title = "ExpertERPHub - Presentation Entreprises";

// Color palette - Midnight Executive
const colors = {
  primary: "1B2A4A",      // Navy
  secondary: "D4AF37",    // Gold
  accent: "FFFFFF",       // White
  darkBg: "0F1419",       // Very dark navy
  lightBg: "F5F7FA",      // Light blue-white
  text: "1B2A4A",         // Dark navy
  textLight: "FFFFFF",    // White
  textMuted: "64748B",    // Slate
  accentBlue: "3B82F6",   // Sky blue
};

// Helper function to create shadow
const createShadow = () => ({
  type: "outer",
  color: "000000",
  blur: 6,
  offset: 2,
  angle: 135,
  opacity: 0.15,
});

// Helper function for title slide style
function addTitleSlide(title, subtitle) {
  let slide = pres.addSlide();
  slide.background = { color: colors.darkBg };

  // Gold accent line at top
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.08,
    fill: { color: colors.secondary },
  });

  // Title
  slide.addText(title, {
    x: 0.5,
    y: 1.8,
    w: 9,
    h: 1.5,
    fontSize: 54,
    bold: true,
    color: colors.textLight,
    fontFace: "Arial",
    align: "center",
    valign: "middle",
  });

  // Subtitle
  slide.addText(subtitle, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    color: colors.secondary,
    fontFace: "Arial",
    align: "center",
    valign: "middle",
  });

  // Footer
  slide.addText("2026 - Confidential", {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.4,
    fontSize: 10,
    color: colors.textMuted,
    align: "center",
  });
}

// Helper function for content slide
function addContentSlide(title, items) {
  let slide = pres.addSlide();
  slide.background = { color: colors.lightBg };

  // Top navy bar with gold accent
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: colors.secondary },
  });

  // Title
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 40,
    bold: true,
    color: colors.primary,
    fontFace: "Arial",
    align: "left",
  });

  // Content area - items can be text, bullets, or mixed
  let yPos = 1.2;
  items.forEach((item) => {
    if (item.type === "bullet") {
      slide.addText(
        [
          {
            text: item.text,
            options: { bullet: true, breakLine: true },
          },
        ],
        {
          x: 0.8,
          y: yPos,
          w: 8.4,
          h: 0.5,
          fontSize: 16,
          color: colors.text,
          fontFace: "Arial",
        }
      );
      yPos += 0.6;
    } else if (item.type === "stat") {
      // Large stat display
      slide.addText(item.number, {
        x: item.x || 0.8,
        y: yPos,
        w: item.w || 2,
        h: 0.7,
        fontSize: 48,
        bold: true,
        color: colors.secondary,
        fontFace: "Arial",
        align: "center",
      });
      slide.addText(item.label, {
        x: item.x || 0.8,
        y: yPos + 0.75,
        w: item.w || 2,
        h: 0.4,
        fontSize: 12,
        color: colors.textMuted,
        fontFace: "Arial",
        align: "center",
      });
      yPos += 1.5;
    } else if (item.type === "box") {
      // Colored box with text
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.8,
        y: yPos,
        w: 8.4,
        h: item.height || 0.8,
        fill: { color: item.bgColor || colors.accentBlue },
        shadow: createShadow(),
      });
      slide.addText(item.text, {
        x: 0.9,
        y: yPos + 0.05,
        w: 8.2,
        h: item.height - 0.1 || 0.7,
        fontSize: item.fontSize || 14,
        color: colors.textLight,
        fontFace: "Arial",
        valign: "middle",
        margin: 0,
      });
      yPos += (item.height || 0.8) + 0.3;
    }
  });
}

// Helper for 2-column layout
function addTwoColumnSlide(title, leftTitle, leftItems, rightTitle, rightItems) {
  let slide = pres.addSlide();
  slide.background = { color: colors.lightBg };

  // Top bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: colors.secondary },
  });

  // Title
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.6,
    fontSize: 40,
    bold: true,
    color: colors.primary,
    fontFace: "Arial",
  });

  // Divider line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5,
    y: 1.1,
    w: 0.02,
    h: 4.3,
    fill: { color: colors.secondary },
  });

  // Left column
  slide.addText(leftTitle, {
    x: 0.6,
    y: 1.2,
    w: 4,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: colors.primary,
    fontFace: "Arial",
  });

  let yPos = 1.8;
  leftItems.forEach((item) => {
    if (typeof item === "string") {
      slide.addText(
        [{ text: item, options: { bullet: true, breakLine: true } }],
        {
          x: 0.8,
          y: yPos,
          w: 4,
          h: 0.5,
          fontSize: 13,
          color: colors.text,
          fontFace: "Arial",
        }
      );
      yPos += 0.55;
    }
  });

  // Right column
  slide.addText(rightTitle, {
    x: 5.4,
    y: 1.2,
    w: 4,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: colors.primary,
    fontFace: "Arial",
  });

  yPos = 1.8;
  rightItems.forEach((item) => {
    if (typeof item === "string") {
      slide.addText(
        [{ text: item, options: { bullet: true, breakLine: true } }],
        {
          x: 5.6,
          y: yPos,
          w: 4,
          h: 0.5,
          fontSize: 13,
          color: colors.text,
          fontFace: "Arial",
        }
      );
      yPos += 0.55;
    }
  });
}

// ============================================
// SLIDE 1: Title Slide
// ============================================
addTitleSlide("ExpertERPHub", "La plateforme premium de staffing ERP");

// ============================================
// SLIDE 2: Le Problème
// ============================================
addContentSlide("Le Problème", [
  { type: "bullet", text: "ESN et cabinets ERP manquent de consultants qualifiés" },
  { type: "bullet", text: "Processus de recrutement lent et fragmenté" },
  {
    type: "bullet",
    text: "Pas de pool centralisé de ressources vérifiées B2B",
  },
  { type: "bullet", text: "Difficulté à accéder aux talents en dehors de son réseau" },
  {
    type: "bullet",
    text: "Coûts élevés de sourcing et d'évaluation des candidats",
  },
]);

// ============================================
// SLIDE 3: Notre Solution
// ============================================
addContentSlide("Notre Solution", [
  {
    type: "box",
    text: "Plateforme B2B qui connecte entreprises partenaires avec consultants ERP vérifiés",
    bgColor: colors.secondary,
    height: 0.9,
  },
  {
    type: "bullet",
    text: "Pool de freelances ERP disponibles immédiatement",
  },
  {
    type: "bullet",
    text: "Accès aux ressources des firmes partenaires (B2B privé)",
  },
  {
    type: "bullet",
    text: "Profils vérifiés et filtrés par module ERP & certifications",
  },
  { type: "bullet", text: "Mise en relation directe et rapide via messagerie sécurisée" },
]);

// ============================================
// SLIDE 4: Comment Ça Marche
// ============================================
let slide4 = pres.addSlide();
slide4.background = { color: colors.lightBg };
slide4.addShape(pres.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: 10,
  h: 0.12,
  fill: { color: colors.secondary },
});
slide4.addText("Comment Ça Marche", {
  x: 0.5,
  y: 0.3,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: colors.primary,
  fontFace: "Arial",
});

const steps = [
  { num: "1", label: "Inscription", desc: "Créez un compte entreprise en 2 min" },
  { num: "2", label: "Recherche", desc: "Filtrez par compétences, modules, TJM" },
  { num: "3", label: "Contact", desc: "Messagerie directe & mise en relation" },
];

let xPos = 0.8;
steps.forEach((step) => {
  // Circle number
  slide4.addShape(pres.shapes.OVAL, {
    x: xPos + 0.8,
    y: 1.5,
    w: 0.6,
    h: 0.6,
    fill: { color: colors.secondary },
  });
  slide4.addText(step.num, {
    x: xPos + 0.8,
    y: 1.5,
    w: 0.6,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: colors.primary,
    align: "center",
    valign: "middle",
  });

  // Label
  slide4.addText(step.label, {
    x: xPos + 0.5,
    y: 2.3,
    w: 1.2,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: colors.primary,
    align: "center",
  });

  // Description
  slide4.addText(step.desc, {
    x: xPos + 0.3,
    y: 2.8,
    w: 1.6,
    h: 1,
    fontSize: 11,
    color: colors.textMuted,
    align: "center",
  });

  // Arrow
  if (step.num !== "3") {
    slide4.addShape(pres.shapes.LINE, {
      x: xPos + 1.8,
      y: 1.8,
      w: 0.8,
      h: 0,
      line: { color: colors.secondary, width: 2 },
    });
  }

  xPos += 3;
});

// ============================================
// SLIDE 5: Pour les Entreprises Partenaires
// ============================================
addTwoColumnSlide(
  "Pour les Entreprises Partenaires",
  "Avantages",
  [
    "Accès au pool B2B complet",
    "Import en lot de ressources (Excel)",
    "Visibilité contrôlée de vos consultants",
    "Gestion d'équipe & profils",
    "Support dédié",
  ],
  "Quoi de plus?",
  [
    "Pas de frais d'inscription",
    "Transparence tarifaire (TJM public)",
    "Vérification des profiles",
    "Historique des contacts",
    "Dashboard analytique",
  ]
);

// ============================================
// SLIDE 6: Pool de Compétences
// ============================================
let slide6 = pres.addSlide();
slide6.background = { color: colors.lightBg };
slide6.addShape(pres.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: 10,
  h: 0.12,
  fill: { color: colors.secondary },
});
slide6.addText("Pool de Compétences", {
  x: 0.5,
  y: 0.3,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: colors.primary,
  fontFace: "Arial",
});

const erpSystems = [
  "SAP S/4HANA",
  "Oracle Cloud",
  "Dynamics 365",
  "Workday",
  "Salesforce",
  "NetSuite",
  "Odoo",
  "Infor",
];

let colX = 0.8;
let rowY = 1.3;
let col = 0;

erpSystems.forEach((system) => {
  slide6.addShape(pres.shapes.RECTANGLE, {
    x: colX,
    y: rowY,
    w: 2,
    h: 0.5,
    fill: { color: colors.accentBlue },
    shadow: createShadow(),
  });
  slide6.addText(system, {
    x: colX,
    y: rowY,
    w: 2,
    h: 0.5,
    fontSize: 13,
    bold: true,
    color: colors.textLight,
    align: "center",
    valign: "middle",
  });

  col++;
  colX += 2.2;
  if (col === 4) {
    col = 0;
    colX = 0.8;
    rowY += 0.8;
  }
});

// Modules
slide6.addText("+ Modules : FI/CO, MM/SD, ABAP, HCM, F&O, Finance, RH...", {
  x: 0.8,
  y: 3.8,
  w: 8.4,
  h: 0.4,
  fontSize: 13,
  color: colors.textMuted,
  italic: true,
});

// Certifications
slide6.addText("+ Certifications : SAP S/4HANA, Oracle Cloud, Workday...", {
  x: 0.8,
  y: 4.3,
  w: 8.4,
  h: 0.4,
  fontSize: 13,
  color: colors.textMuted,
  italic: true,
});

// ============================================
// SLIDE 7: Fonctionnalités Clés
// ============================================
addContentSlide("Fonctionnalités Clés", [
  { type: "bullet", text: "Dashboard entreprise avec vue 360 des ressources" },
  { type: "bullet", text: "Filtres avancés : modules, compétences, TJM, lieu" },
  { type: "bullet", text: "Profils détaillés et vérifiés de chaque consultant" },
  { type: "bullet", text: "Messagerie sécurisée et directe (plan payant)" },
  { type: "bullet", text: "Import Excel en lot de vos ressources" },
  { type: "bullet", text: "Visibilité contrôlée : public ou private B2B" },
]);

// ============================================
// SLIDE 8: Sécurité & Conformité
// ============================================
addContentSlide("Sécurité & Conformité", [
  { type: "bullet", text: "Sessions signées avec token d'accès sécurisé" },
  { type: "bullet", text: "Row Level Security (RLS) Supabase par utilisateur" },
  { type: "bullet", text: "Données chiffrées en transit (HTTPS/TLS)" },
  {
    type: "bullet",
    text: "Respect RGPD : mentions légales, consentement cookies",
  },
  { type: "bullet", text: "Audit de sécurité complet réalisé (avril 2026)" },
  { type: "bullet", text: "Authentification multi-niveaux (email, mot de passe)" },
]);

// ============================================
// SLIDE 9: Modèle Tarifaire
// ============================================
let slide9 = pres.addSlide();
slide9.background = { color: colors.lightBg };
slide9.addShape(pres.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: 10,
  h: 0.12,
  fill: { color: colors.secondary },
});
slide9.addText("Modèle Tarifaire Simple & Transparent", {
  x: 0.5,
  y: 0.3,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: colors.primary,
  fontFace: "Arial",
});

// Free tier
slide9.addShape(pres.shapes.RECTANGLE, {
  x: 0.8,
  y: 1.2,
  w: 4.2,
  h: 3.2,
  fill: { color: colors.accent },
  shadow: createShadow(),
});
slide9.addText("Inscription Gratuite", {
  x: 0.8,
  y: 1.3,
  w: 4.2,
  h: 0.4,
  fontSize: 16,
  bold: true,
  color: colors.primary,
  align: "center",
});
slide9.addText("• Accès au pool freelances\n• Voir les profils\n• Filtres avancés", {
  x: 1,
  y: 1.9,
  w: 3.8,
  h: 1.4,
  fontSize: 12,
  color: colors.text,
});

// Premium tier
slide9.addShape(pres.shapes.RECTANGLE, {
  x: 5.2,
  y: 1.2,
  w: 4.2,
  h: 3.2,
  fill: { color: colors.secondary },
  shadow: createShadow(),
});
slide9.addText("Plan Messagerie", {
  x: 5.2,
  y: 1.3,
  w: 4.2,
  h: 0.4,
  fontSize: 16,
  bold: true,
  color: colors.primary,
  align: "center",
});
slide9.addText("+ Accès pool B2B\n+ Messagerie directe\n+ Billing Stripe intégré", {
  x: 5.4,
  y: 1.9,
  w: 3.8,
  h: 1.4,
  fontSize: 12,
  color: colors.primary,
});

// Tagline
slide9.addText("Gratuit jusqu'à 3 messages/mois. Abonnement mensuel après.", {
  x: 0.8,
  y: 4.7,
  w: 8.4,
  h: 0.5,
  fontSize: 12,
  color: colors.textMuted,
  align: "center",
  italic: true,
});

// ============================================
// SLIDE 10: État Actuel & Traction
// ============================================
let slide10 = pres.addSlide();
slide10.background = { color: colors.lightBg };
slide10.addShape(pres.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: 10,
  h: 0.12,
  fill: { color: colors.secondary },
});
slide10.addText("État Actuel & Traction", {
  x: 0.5,
  y: 0.3,
  w: 9,
  h: 0.6,
  fontSize: 40,
  bold: true,
  color: colors.primary,
  fontFace: "Arial",
});

// Stats grid
const stats = [
  { num: "2", label: "Entreprises pilotes" },
  { num: "10+", label: "Ressources B2B" },
  { num: "12+", label: "Freelances vérifiés" },
  { num: "100%", label: "Uptime (Vercel)" },
];

let statX = 0.8;
stats.forEach((stat) => {
  slide10.addText(stat.num, {
    x: statX,
    y: 1.5,
    w: 2,
    h: 0.7,
    fontSize: 48,
    bold: true,
    color: colors.secondary,
    align: "center",
  });
  slide10.addText(stat.label, {
    x: statX,
    y: 2.3,
    w: 2,
    h: 0.4,
    fontSize: 11,
    color: colors.textMuted,
    align: "center",
  });
  statX += 2.2;
});

// Infrastructure
slide10.addText("Infrastructure", {
  x: 0.8,
  y: 3.1,
  w: 8.4,
  h: 0.3,
  fontSize: 14,
  bold: true,
  color: colors.primary,
});

slide10.addText(
  "Frontend: Vercel | Backend: Supabase PostgreSQL | Auth: Sessions sécurisées",
  {
    x: 0.8,
    y: 3.5,
    w: 8.4,
    h: 1,
    fontSize: 12,
    color: colors.text,
  }
);

// ============================================
// SLIDE 11: Roadmap
// ============================================
addContentSlide("Roadmap 2026", [
  {
    type: "box",
    text: "Q2 2026 : Intégration Stripe complète, matching IA, analytics avancés",
    bgColor: colors.accentBlue,
  },
  {
    type: "box",
    text: "Q3 2026 : Mobile app responsive, notifications push",
    bgColor: colors.accentBlue,
  },
  {
    type: "box",
    text: "Q4 2026 : Partenariats stratégiques, expansion B2B Europe",
    bgColor: colors.accentBlue,
  },
]);

// ============================================
// SLIDE 12: Pourquoi Nous Rejoindre Maintenant
// ============================================
addContentSlide("Pourquoi Nous Rejoindre Maintenant", [
  {
    type: "bullet",
    text: "Avantage early adopter : façonnez la plateforme avec nous",
  },
  { type: "bullet", text: "Accès gratuit initial avant monétisation complète" },
  { type: "bullet", text: "Plateforme live & stable, infrastructure enterprise-grade" },
  { type: "bullet", text: "Support dédié pour intégration et déploiement" },
  {
    type: "bullet",
    text: "Potentiel d'évaluation avantageuse lors des futurs tours",
  },
]);

// ============================================
// SLIDE 13: Call to Action / Contact
// ============================================
let slide13 = pres.addSlide();
slide13.background = { color: colors.darkBg };

slide13.addShape(pres.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: 10,
  h: 0.08,
  fill: { color: colors.secondary },
});

slide13.addText("Prêt à Découvrir ExpertERPHub?", {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 1,
  fontSize: 44,
  bold: true,
  color: colors.textLight,
  align: "center",
});

slide13.addShape(pres.shapes.RECTANGLE, {
  x: 3,
  y: 2.8,
  w: 4,
  h: 0.7,
  fill: { color: colors.secondary },
  shadow: createShadow(),
});
slide13.addText("Planifiez une Démo", {
  x: 3,
  y: 2.8,
  w: 4,
  h: 0.7,
  fontSize: 18,
  bold: true,
  color: colors.primary,
  align: "center",
  valign: "middle",
});

slide13.addText("contact@experterpbub.com\n+1 514 XXX-XXXX", {
  x: 0.5,
  y: 4,
  w: 9,
  h: 0.8,
  fontSize: 14,
  color: colors.accentBlue,
  align: "center",
});

slide13.addText("ExpertERPHub - La plateforme de staffing ERP pour les professionnels", {
  x: 0.5,
  y: 5,
  w: 9,
  h: 0.4,
  fontSize: 11,
  color: colors.textMuted,
  align: "center",
});

// Save presentation
pres.writeFile({
  fileName:
    "/sessions/loving-happy-hopper/mnt/Projects--ExpertERPHUB/ExpertERPHub_Presentation_Entreprises_2026.pptx",
});

console.log(
  "Presentation created successfully at: ExpertERPHub_Presentation_Entreprises_2026.pptx"
);

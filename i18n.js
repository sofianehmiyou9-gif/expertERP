(function () {
  const DICT = {
    fr: {
      common: {
        home: "Accueil",
        consultants: "Consultants",
        companies: "Entreprises",
        findExpert: "Trouver un expert",
        logout: "Déconnexion",
        login: "Se connecter",
        emailRequired: "Email requis",
        emailNotFound: "Email non trouvé",
        accessDenied: "Accès non autorisé",
        update: "Mettre à jour",
        cancel: "Annuler",
        import: "Importer",
        loading: "Chargement..."
      },
      consultant: {
        profileTitle: "Profil Consultant",
        professionalSummary: "Résumé professionnel",
        erpSkills: "Compétences ERP",
        professionalExperience: "Expériences professionnelles",
        information: "Informations",
        availability: "Disponibilité",
        workMode: "Mode de travail",
        languages: "Langues",
        contactConsultant: "Contacter ce consultant",
        contactPlaceholder: "Décrivez votre projet et vos besoins...",
        sendMessage: "Envoyer le message",
        profileNotFound: "Consultant non trouvé.",
        profileLoadError: "Erreur lors du chargement du profil.",
        messageEmpty: "Veuillez entrer un message.",
        messageSent: "Message envoyé ! Le consultant recevra une notification.",
        yearsExp: "ans exp",
        perDay: "EUR/jour",
        immediate: "Immediate",
        verifiedBadge: "Expert validé ERP",
        contactBtn: "Contacter ce consultant",
        viewFullProfile: "Voir le profil complet",
        experience: "Expérience",
        location: "Localisation",
        rateOnRequest: "Tarif sur demande",
        dailyRate: "Taux journalier",
        available: "Disponible",
        flexibleMode: "Mode flexible",
        certifications: "Certifications",
        skillExperience: "Expérience par compétence",
        projectsMissions: "Projets & Missions",
        projectsSubtitle: "Sélection de missions et projets ERP menés avec succès.",
        contactSubtitle: "Prise de contact",
        sendRequest: "Envoyer ma demande →",
        yourCompany: "Votre entreprise",
        professionalEmail: "Email professionnel",
        phone: "Téléphone",
        memberSince: "Membre depuis"
      },
      dashboardConsultant: {
        dashboardAccess: "Accès au tableau de bord",
        consultantSpace: "Espace Consultant",
        emailPlaceholder: "Adresse email",
        passwordPlaceholder: "Mot de passe",
        forgotPassword: "Mot de passe oublié ?",
        backToHome: "Retour à l'accueil",
        dashboard: "Dashboard",
        profile: "Profil",
        requestsReceived: "Demandes reçues",
        masteredErp: "ERP(s) maîtrisé(s)",
        info: "Informations",
        role: "Rôle",
        yearsExperience: "Années d'expérience",
        tjm: "TJM",
        workMode: "Mode de travail",
        city: "Ville",
        languages: "Langues",
        editAvailability: "Modifier ma disponibilité",
        selectAvailability: "Sélectionner une disponibilité",
        updateAvailability: "Mettre à jour",
        notifications: "Notifications",
        noNotifications: "Aucune notification pour le moment",
        pendingReview: "Profil en cours de révision",
        approved: "Profil approuvé et publié",
        rejected: "Profil non retenu"
      },
      dashboardCompany: {
        dashboardAccess: "Accès à votre espace entreprise",
        emailPlaceholder: "Adresse email",
        passwordPlaceholder: "Mot de passe",
        forgotPassword: "Mot de passe oublié ?",
        backToHome: "Retour à l'accueil",
        myResources: "Mes Ressources",
        myProfile: "Mon Profil",
        starterPlan: "Plan Starter",
        usedSlots: "Slots utilisés",
        importMore: "Importer plus de ressources",
        dragDrop: "Glissez et déposez un fichier CSV ou Excel",
        browse: "ou cliquez pour parcourir",
        submitted: "Date soumission",
        validationStatus: "Statut de validation",
        search: "Rechercher",
        searchTitle: "Rechercher des consultants",
        searchSubtitle: "Trouvez les experts ERP disponibles sur la plateforme.",
        searchBtn: "Rechercher",
        allErp: "Tous",
        allRoles: "Tous",
        allAvailability: "Toutes",
        tjmMax: "TJM Max ($)",
        city: "Ville",
        viewProfile: "Voir le profil",
        consultantsFound: "consultants trouvés",
        noResults: "Aucun consultant ne correspond à vos critères.",
        messages: "Messages",
        team: "Équipe",
        newResource: "Nouvelle Ressource",
        searchConsultant: "Rechercher un consultant",
        total: "Total",
        published: "Publiés",
        validated: "Validés",
        averageRate: "Taux moyen",
        slotsRemaining: "Restants",
        perDay: "$/jour",
        ofPlan: "sur {n} du plan"
      },
      index: {
        hero: {
          badge1: "Experts ERP validés",
          badge2: "Disponibilité temps réel",
          badge3: "Traçabilité ressource",
          title: "Accélérez votre projet ERP sans les marges des grandes firmes",
          subtitle: "Staff augmentation ERP depuis un tableau de bord unique. Disponibilité, traçabilité complète, décisions de staffing plus rapides.",
          ctaFind: "Trouver un expert ERP",
          ctaHire: "Recruter une ressource",
          ctaOffer: "Proposer mes ressources"
        },
        features: {
          speedTitle: "Vitesse inégalée",
          speedDesc: "De la demande à la mise en relation en moins de 48h.",
          qualityTitle: "Qualité souveraine",
          qualityDesc: "Chaque profil est validé manuellement par notre équipe.",
          specTitle: "100% spécialisé ERP",
          specDesc: "SAP, Oracle, Workday, Dynamics, Salesforce, ServiceNow — spécialisation totale."
        },
        stats: {
          consultants: "Consultants ERP",
          enterprises: "Entreprises partenaires",
          countries: "Pays couverts",
          response: "Première réponse sous 2h"
        },
        sections: {
          whyTitle: "Pourquoi ExpertERPHub ?",
          howTitle: "Comment ça marche ?",
          ctaTitle: "Prêt à transformer votre approche ERP ?",
          faqTitle: "Questions fréquentes"
        },
        footer: {
          about: "Plateforme B2B de Staff Augmentation ERP",
          links: "Liens rapides",
          legal: "Légal",
          privacy: "Confidentialité",
          terms: "Conditions",
          legalNotice: "Mentions légales",
          rights: "Tous droits réservés"
        }
      },
      contact: {
        title: "Contacter ce consultant",
        enterprise: "Entreprise",
        visiteurPro: "Visiteur Pro",
        accessEntreprise: "Accès Entreprise",
        accessDesc: "Contactez ce consultant, publiez des demandes et gérez vos ressources.",
        connectBtn: "Se connecter",
        createAccount: "Créer un compte entreprise",
        vpTitle: "Contactez les consultants directement",
        vpSubtitle: "Choisissez votre forfait et envoyez des messages aux freelances ERP.",
        vpLogin: "Connexion Visiteur Pro",
        vpCreate: "Créer mon compte Visiteur Pro",
        alreadyRegistered: "Déjà inscrit ?",
        noAccount: "Pas encore de compte ?",
        yourEmail: "Votre email",
        password: "Mot de passe",
        choosePassword: "Choisissez un mot de passe",
        yourName: "Votre nom ou entreprise",
        phone: "Téléphone",
        message: "Décrivez votre projet et vos besoins...",
        privacyAccept: "J'accepte la politique de confidentialité",
        send: "Envoyer ma demande",
        messagesRemaining: "messages restants ce mois-ci",
        plan: "forfait"
      },
      nav: {
        home: "Accueil",
        consultants: "Consultants",
        companies: "Entreprises",
        login: "Se connecter",
        findExpert: "Trouver un expert",
        dashboard: "Dashboard",
        logout: "Déconnexion"
      },
      rgpd: {
        exportData: "Télécharger mes données",
        deleteAccount: "Supprimer mon compte",
        deleteConfirm: "Êtes-vous sûr ? Cette action est irréversible.",
        deleteSuccess: "Compte supprimé. Redirection...",
        exportSuccess: "Données exportées avec succès."
      }
    },
    en: {
      common: {
        home: "Home",
        consultants: "Consultants",
        companies: "Companies",
        findExpert: "Find an expert",
        logout: "Logout",
        login: "Sign in",
        emailRequired: "Email required",
        emailNotFound: "Email not found",
        accessDenied: "Access denied",
        update: "Update",
        cancel: "Cancel",
        import: "Import",
        loading: "Loading..."
      },
      consultant: {
        profileTitle: "Consultant Profile",
        professionalSummary: "Professional summary",
        erpSkills: "ERP skills",
        professionalExperience: "Professional experience",
        information: "Information",
        availability: "Availability",
        workMode: "Work mode",
        languages: "Languages",
        contactConsultant: "Contact this consultant",
        contactPlaceholder: "Describe your project and your needs...",
        sendMessage: "Send message",
        profileNotFound: "Consultant not found.",
        profileLoadError: "Error while loading profile.",
        messageEmpty: "Please enter a message.",
        messageSent: "Message sent! The consultant received a notification.",
        yearsExp: "years exp",
        perDay: "EUR/day",
        immediate: "Immediate",
        verifiedBadge: "Verified ERP Expert",
        contactBtn: "Contact this consultant",
        viewFullProfile: "View full profile",
        experience: "Experience",
        location: "Location",
        rateOnRequest: "Rate on request",
        dailyRate: "Daily rate",
        available: "Available",
        flexibleMode: "Flexible mode",
        certifications: "Certifications",
        skillExperience: "Experience by skill",
        projectsMissions: "Projects & Missions",
        projectsSubtitle: "Selection of successful ERP missions and projects.",
        contactSubtitle: "Get in touch",
        sendRequest: "Send my request →",
        yourCompany: "Your company",
        professionalEmail: "Professional email",
        phone: "Phone",
        memberSince: "Member since"
      },
      dashboardConsultant: {
        dashboardAccess: "Dashboard access",
        consultantSpace: "Consultant Dashboard",
        emailPlaceholder: "Email address",
        passwordPlaceholder: "Password",
        forgotPassword: "Forgot password?",
        backToHome: "Back to home",
        dashboard: "Dashboard",
        profile: "Profile",
        requestsReceived: "Requests received",
        masteredErp: "ERP skills",
        info: "Information",
        role: "Role",
        yearsExperience: "Years of experience",
        tjm: "Daily rate",
        workMode: "Work mode",
        city: "City",
        languages: "Languages",
        editAvailability: "Update availability",
        selectAvailability: "Select availability",
        updateAvailability: "Update",
        notifications: "Notifications",
        noNotifications: "No notifications yet",
        pendingReview: "Profile under review",
        approved: "Profile approved and published",
        rejected: "Profile not approved"
      },
      dashboardCompany: {
        dashboardAccess: "Access your company dashboard",
        emailPlaceholder: "Email address",
        passwordPlaceholder: "Password",
        forgotPassword: "Forgot password?",
        backToHome: "Back to home",
        myResources: "My resources",
        myProfile: "My profile",
        starterPlan: "Starter Plan",
        usedSlots: "Used slots",
        importMore: "Import more resources",
        dragDrop: "Drag and drop a CSV or Excel file",
        browse: "or click to browse",
        submitted: "Submission date",
        validationStatus: "Validation status",
        search: "Search",
        searchTitle: "Search consultants",
        searchSubtitle: "Find available ERP experts on the platform.",
        searchBtn: "Search",
        allErp: "All",
        allRoles: "All",
        allAvailability: "All",
        tjmMax: "Max rate ($)",
        city: "City",
        viewProfile: "View profile",
        consultantsFound: "consultants found",
        noResults: "No consultants match your criteria.",
        messages: "Messages",
        team: "Team",
        newResource: "New Resource",
        searchConsultant: "Search a consultant",
        total: "Total",
        published: "Published",
        validated: "Validated",
        averageRate: "Average rate",
        slotsRemaining: "Remaining",
        perDay: "$/day",
        ofPlan: "of {n} in plan"
      },
      index: {
        hero: {
          badge1: "Verified ERP experts",
          badge2: "Real-time availability",
          badge3: "Resource traceability",
          title: "Accelerate your ERP project without big firm markups",
          subtitle: "ERP staff augmentation from one dashboard. Availability, full traceability, and faster staffing decisions.",
          ctaFind: "Find an ERP expert",
          ctaHire: "Hire a professional resource",
          ctaOffer: "Offer my resources"
        },
        features: {
          speedTitle: "Unmatched speed",
          speedDesc: "From request to connection in under 48h.",
          qualityTitle: "Sovereign quality",
          qualityDesc: "Each profile is manually validated by our team.",
          specTitle: "100% ERP specialized",
          specDesc: "SAP, Oracle, Workday, Dynamics, Salesforce, ServiceNow — total specialization."
        },
        stats: {
          consultants: "ERP Consultants",
          enterprises: "Partner enterprises",
          countries: "Countries covered",
          response: "First response under 2h"
        },
        sections: {
          whyTitle: "Why ExpertERPHub?",
          howTitle: "How does it work?",
          ctaTitle: "Ready to transform your ERP approach?",
          faqTitle: "FAQ"
        },
        footer: {
          about: "B2B ERP Staff Augmentation Platform",
          links: "Quick links",
          legal: "Legal",
          privacy: "Privacy",
          terms: "Terms",
          legalNotice: "Legal notice",
          rights: "All rights reserved"
        }
      },
      contact: {
        title: "Contact this consultant",
        enterprise: "Enterprise",
        visiteurPro: "Visitor Pro",
        accessEntreprise: "Enterprise Access",
        accessDesc: "Contact this consultant, post requests and manage your resources.",
        connectBtn: "Sign in",
        createAccount: "Create an enterprise account",
        vpTitle: "Contact consultants directly",
        vpSubtitle: "Choose your plan and send messages to ERP freelancers.",
        vpLogin: "Visitor Pro Login",
        vpCreate: "Create my Visitor Pro account",
        alreadyRegistered: "Already registered?",
        noAccount: "No account yet?",
        yourEmail: "Your email",
        password: "Password",
        choosePassword: "Choose a password",
        yourName: "Your name or company",
        phone: "Phone",
        message: "Describe your project and needs...",
        privacyAccept: "I accept the privacy policy",
        send: "Send my request",
        messagesRemaining: "messages remaining this month",
        plan: "plan"
      },
      nav: {
        home: "Home",
        consultants: "Consultants",
        companies: "Companies",
        login: "Sign in",
        findExpert: "Find an expert",
        dashboard: "Dashboard",
        logout: "Logout"
      },
      rgpd: {
        exportData: "Download my data",
        deleteAccount: "Delete my account",
        deleteConfirm: "Are you sure? This action is irreversible.",
        deleteSuccess: "Account deleted. Redirecting...",
        exportSuccess: "Data exported successfully."
      }
    }
  };

  function getLang() {
    return localStorage.getItem("experterpLang") || "fr";
  }

  function setLang(lang) {
    localStorage.setItem("experterpLang", lang);
    document.documentElement.lang = lang;
  }

  function t(path, lang) {
    const l = lang || getLang();
    const parts = path.split(".");
    let cur = DICT[l];
    for (let i = 0; i < parts.length; i++) {
      if (!cur) break;
      cur = cur[parts[i]];
    }
    if (typeof cur === "string") return cur;
    return path;
  }

  function applyByDataAttr() {
    const lang = getLang();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"), lang);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"), lang);
    });
  }

  window.ExpertI18n = { DICT: DICT, getLang: getLang, setLang: setLang, t: t, applyByDataAttr: applyByDataAttr };
})();

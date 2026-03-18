(function () {
  const DICT = {
    fr: {
      common: {
        home: "Accueil",
        consultants: "Consultants",
        companies: "Entreprises",
        findExpert: "Trouver un expert",
        logout: "Deconnexion",
        login: "Se connecter",
        emailRequired: "Email requis",
        emailNotFound: "Email non trouve",
        accessDenied: "Acces non autorise",
        update: "Mettre a jour",
        cancel: "Annuler",
        import: "Importer",
        loading: "Chargement..."
      },
      consultant: {
        profileTitle: "Profil Consultant",
        professionalSummary: "Resume professionnel",
        erpSkills: "Competences ERP",
        professionalExperience: "Experiences professionnelles",
        information: "Informations",
        availability: "Disponibilite",
        workMode: "Mode de travail",
        languages: "Langues",
        contactConsultant: "Contacter ce consultant",
        contactPlaceholder: "Decrivez votre projet et vos besoins...",
        sendMessage: "Envoyer le message",
        profileNotFound: "Consultant non trouve.",
        profileLoadError: "Erreur lors du chargement du profil.",
        messageEmpty: "Veuillez entrer un message.",
        messageSent: "Message envoye! Le consultant recevra une notification.",
        yearsExp: "ans exp",
        perDay: "EUR/jour",
        immediate: "Immediate"
      },
      dashboardConsultant: {
        dashboardAccess: "Acces au tableau de bord",
        masteredErp: "ERP(s) maitrise(s)",
        info: "Informations",
        role: "Role",
        yearsExperience: "Annees d'experience",
        tjm: "TJM",
        workMode: "Mode de travail",
        city: "Ville",
        languages: "Langues",
        editAvailability: "Modifier ma disponibilite",
        selectAvailability: "Selectionner une disponibilite",
        updateAvailability: "Mettre a jour",
        notifications: "Notifications",
        noNotifications: "Aucune notification pour le moment",
        pendingReview: "Profil en cours de revision",
        approved: "Profil approuve et publie",
        rejected: "Profil non retenu"
      },
      dashboardCompany: {
        dashboardAccess: "Acces au tableau de bord",
        myResources: "Mes Ressources",
        myProfile: "Mon Profil",
        starterPlan: "Plan Starter",
        usedSlots: "Slots utilises",
        importMore: "Importer plus de ressources",
        dragDrop: "Glissez et deposez un fichier CSV ou Excel",
        browse: "ou cliquez pour parcourir",
        submitted: "Date soumission",
        validationStatus: "Statut de validation"
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
        immediate: "Immediate"
      },
      dashboardConsultant: {
        dashboardAccess: "Dashboard access",
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
        dashboardAccess: "Dashboard access",
        myResources: "My resources",
        myProfile: "My profile",
        starterPlan: "Starter Plan",
        usedSlots: "Used slots",
        importMore: "Import more resources",
        dragDrop: "Drag and drop a CSV or Excel file",
        browse: "or click to browse",
        submitted: "Submission date",
        validationStatus: "Validation status"
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

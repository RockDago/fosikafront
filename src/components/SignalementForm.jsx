import React, { useState } from "react";
import {
  ChevronLeft,
  Upload,
  X,
  Check,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Traductions globales
const translations = {
  fr: {
    welcome: {
      title:
        'Bienvenue sur la Plateforme Nationale de Signalement des Fraudes et Faux Diplômes - "FOSIKA"',
      subtitle:
        "Sous l'égide du Ministère de l'Enseignement Supérieur et de la Recherche Scientifique (MESUPRES), en partenariat avec le BIANCO, la plateforme FOSIKA.mg s'inscrit dans la volonté nationale d'assainir le système d'enseignement supérieur et de restaurer la confiance du public.",
      initiative:
        "Cette initiative permet de signaler en toute confidentialité tout cas de :",
      cases: [
        "Faux diplômes utilisés lors des recrutements,",
        "Faux diplômes dans le but d'obtenir la validation d'une candidature ou une évolution dans la carrière professionnelle,",
        "Diplômes et attestations falsifiés.",
      ],
      contribute: "Par vos signalements, vous contribuez à :",
      benefits: [
        "renforcer l'intégrité académique,",
        "promouvoir la transparence institutionnelle,",
        "défendre la valeur du mérite et du savoir.",
      ],
      vigilance:
        "Votre vigilance est un acte citoyen. Ensemble, protégeons la crédibilité de nos universités et la dignité de notre système éducatif.",
      slogan: "OPERATION FOSIKA : Assainir, protéger, refonder.",
      submitBtn: "SOUMETTRE UN SIGNALEMENT",
      clickHere: "CLIQUEZ ICI",
    },
    choice: {
      title: "Choisissez",
      anonymous: "Anonyme",
      identified: "Je m'identifie",
      back: "Retour",
    },
    personal: {
      title: "MES INFORMATIONS",
      subtitle: "FAIRE LA DÉCLARATION",
      name: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      accept: "Je certifie que ces informations sont exactes",
      continue: "Continuer",
      back: "Retour",
    },
    category: {
      title: "SIGNALEMENT",
      selectLabel: "Catégorie de signalement :",
      selectPlaceholder: "Sélectionnez une catégorie...",
      detailsLabel: "Description détaillée de la situation :",
      detailsPlaceholder:
        "Décrivez en détail la situation que vous souhaitez signaler...",
      back: "Retour",
      continue: "Continuer",
    },
    upload: {
      title: "PIÈCES JUSTIFICATIVES",
      attachments: "Pièces jointes (Photos, Vidéos, Documents) - OBLIGATOIRE",
      attachmentsInfo:
        "Formats acceptés: JPG, JPEG, PNG, MP4, PDF • Taille max: 25 Mo par fichier • Au moins 1 fichier requis",
      uploadLabel: "Cliquez pour ajouter des fichiers",
      uploadSubtext: "ou glissez-déposez vos fichiers ici",
      filesAdded: "Fichiers ajoutés",
      acceptTruth:
        "Je certifie que les informations fournies sont véridiques et exemptes de tout mensonge",
      submit: "SOUMETTRE LE SIGNALEMENT",
      submitting: "Envoi en cours...",
      back: "Retour",
    },
    success: {
      title: "Signalement Reçu avec Succès",
      thanks: "Nous vous remercions pour votre contribution",
      reference: "Référence de votre dossier",
      tracking:
        "Vous pouvez suivre l'état de votre dossier (En cours, Finalisé, Doublon ou Refusé) via cette référence.",
      trackButton: "Suivre mon dossier",
      home: "Retour à l'accueil",
    },
    categories: {
      "faux-diplomes": "Faux diplômes",
      "fraudes-academique": "Fraudes Académiques",
      "recrutements-irreguliers": "Recrutements Irréguliers",
      harcelement: "Harcèlement",
      corruption: "Corruption",
      divers: "Divers",
    },
    errors: {
      required: "Ce champ est obligatoire",
      emailInvalid: "Email invalide",
      phoneInvalid: "Numéro de téléphone invalide",
      categoryRequired: "Veuillez sélectionner une catégorie",
      descriptionRequired: "Veuillez décrire la situation",
      termsRequired: "Veuillez accepter les conditions",
      truthRequired: "Veuillez certifier la véracité des informations",
      filesRequired: "Au moins une pièce jointe est obligatoire",
      submission: "Erreur lors de la soumission du signalement",
      network: "Erreur de connexion au serveur. Veuillez réessayer.",
      fillRequired: "Veuillez remplir tous les champs obligatoires",
    },
    required: "*",
  },
  mg: {
    welcome: {
      title:
        "Tongasoa eto amin'ny tambajotra nasionaly miady amin'ny trangana HOSOKA sy DIPLAOMA Sandoka - \"Hetsika FOSIKA\"",
      subtitle:
        "Eo ambany fiahian'ny Ministeran'ny Fampianarana Ambony sy Fikarohana Ara-tsiansa (MESUPRES), sy ny fiaraha-miasa amin'ny Birao Mahaleo-tena Miady amin'ny Kolikoly \"BIANCO\", dia tafiditra ao anatin'ny ezaka nasionaly hanadiovana ny rafi-pampianarana ambony sy hamerenana ny fitokisan'ny vahoaka ny Tambanjotra \"FOSIKA.mg\".",
      initiative:
        "Ity sehatra ity dia natao ahafahana manangom-baovao am-fitokisana momba ireto tranga manaraka ireto :",
      cases: [
        "Diplaoma sandoka ampiasaina amin'ny fandraisana mpiasa,",
        "Diplaoma sandoka ampiasaina mba hahazoana fanamarinana ny fangatahana na fankatoavana ho amin'ny fisondrotana ara-kasa,",
        "Taratasy fanamarinana sandoka.",
      ],
      contribute:
        "Amin'ny fanamarihana sy fanairana ataonao, dia mandray anjara amin'ireto manaraka ireto ianao :",
      benefits: [
        "fanamafisana ny fahamarinana sy fangaraharana akademika,",
        "fampiroboroboana ny fahadiovana ara-pitantanana,",
        "fiarovana ny hasin'ny fahaiza-manao sy ny fahalalana.",
      ],
      vigilance:
        "Ny fahamalinanao dia adidy amin'ny maha-olom-firenena. Isika miaraka no hiaro ny hasin'ny anjerimanontolo sy ny rafi-pampianarana.",
      slogan: "HETSIKA FOSIKA : manadio, miaro, manavao.",
      submitBtn: "HANDEFA FITARAINANA",
      clickHere: "ISINDRIO ETO",
    },
    choice: {
      title: "Safidio",
      anonymous: "Anonyme",
      identified: "Hilaza ny momba ahy",
      back: "Hiverina",
    },
    personal: {
      title: "MOMBA AHY",
      subtitle: "MANAO NY FANAMBARANA",
      name: "Anarana feno",
      email: "Mailaka",
      phone: "Téléphone",
      address: "Adiresy",
      accept: "Ekeko fa marina ireo momba ahy ireo",
      continue: "Tohiny",
      back: "Hiverina",
    },
    category: {
      title: "FITARAINANA",
      selectLabel: "Karazana fitarainana :",
      selectPlaceholder: "Safidio ny karazana...",
      detailsLabel: "Fanazavana ilay tranga :",
      detailsPlaceholder:
        "Ampidiro eto ny fanazavana manodidina ilay tranga...",
      back: "Hiverina",
      continue: "Tohiny",
    },
    upload: {
      title: "POROFO",
      attachments:
        "Pièces jointes (Sary, Horonantsary, Taratasy) - TSY MAINTSY",
      attachmentsInfo:
        "Karazana ekena: JPG, JPEG, PNG, MP4, PDF • Habe fara-tampony: 25 Mo • Tsy maintsy misy rakitra iray farafahakeliny",
      uploadLabel: "Tsindrio eto mba hampiditra rakitra",
      uploadSubtext: "na asio eto ny rakitrao",
      filesAdded: "Rakitra nampidirina",
      acceptTruth:
        "Izaho dia minia marina fa tsy misy fitaka na lainga izay voalaza",
      submit: "HALEFA NY FITARAINANA",
      submitting: "Mandefa...",
      back: "Hiverina",
    },
    success: {
      title: "Voaray ny Fitarainanao",
      thanks: "Ankasitrahanay feno ianao",
      reference: "Référence an'ilay dossier",
      tracking:
        "Afaka manaraka ny fivoaran'ny dosierao (Voaray, Vita, Mitovy na Nolavina) amin'ity référence ity.",
      trackButton: "Hanaraka ny dossier",
      home: "Hiverina any am-piandohana",
    },
    categories: {
      "faux-diplomes": "Diplaoma sandoka",
      "fraudes-academique": "Hosoka ara-pianarana",
      "recrutements-irreguliers": "Fampidirana mpiasa tsy ara-dalàna",
      harcelement: "Fanararaotana",
      corruption: "Kolikoly",
      divers: "Hafa",
    },
    errors: {
      required: "Tsy maintsy fenoina ity",
      emailInvalid: "Email tsy mety",
      phoneInvalid: "Laharana tsy mety",
      categoryRequired: "Safidio ny karazana",
      descriptionRequired: "Lazao ny momba ny tranga",
      termsRequired: "Ekeo ny fepetra",
      truthRequired: "Marina ve ny voalaza?",
      filesRequired: "Tsy maintsy misy rakitra iray farafahakeliny",
      submission: "Nisy olana tamin'ny fandefasana",
      network: "Tsy afaka mifandray. Andramo indray.",
      fillRequired: "Fenoy daholo ny saha ilaina",
    },
    required: "*",
  },
};

// Fonction pour générer une référence si l'API échoue
const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `FOS-${timestamp}-${random}`;
};

// Composant Page d'accueil isolé
const WelcomePage = ({ language, setLanguage, setStep, navigate }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="text-3xl font-bold text-blue-600">FOSIKA</div>
            <div className="text-sm text-gray-600 text-center">
              MESUPRES
              <br />
              REPOBLIKA
              <br />
              MADAGASIKARA
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setLanguage("fr")}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                language === "fr"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setLanguage("mg")}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                language === "mg"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Malagasy
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          {t.welcome.title}
        </h1>

        <div className="mb-8 space-y-4">
          <p className="text-gray-700 leading-relaxed text-justify">
            {t.welcome.subtitle}
          </p>

          <div>
            <p className="font-semibold text-gray-800 mb-2">
              {t.welcome.initiative}
            </p>
            <ul className="space-y-1 text-gray-700">
              {t.welcome.cases.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-800 mb-2">
              {t.welcome.contribute}
            </p>
            <ul className="space-y-1 text-gray-700">
              {t.welcome.benefits.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-700 leading-relaxed text-justify">
            {t.welcome.vigilance}
          </p>

          <p className="text-center font-bold text-blue-700 text-lg">
            {t.welcome.slogan}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setStep(1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors shadow-lg"
          >
            {t.welcome.submitBtn}
            <br />
            <span className="text-sm font-normal">{t.welcome.clickHere}</span>
          </button>

          <button
            onClick={() => navigate("/suivi")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            {language === "fr" ? "Suivre un dossier" : "Manaraka dossier"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Choix isolé
const ChoiceStep = ({ language, setStep, setIsAnonymous }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-blue-600 mb-2">FOSIKA</div>
          <div className="text-sm text-gray-600">MESUPRES</div>
        </div>

        <h2 className="text-xl font-semibold text-center mb-8 text-gray-800">
          {t.choice.title}
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => {
              setIsAnonymous(true);
              setStep(3);
            }}
            className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-6 transition-all"
          >
            <div className="text-lg font-semibold text-gray-800">
              {t.choice.anonymous}
            </div>
          </button>

          <button
            onClick={() => {
              setIsAnonymous(false);
              setStep(2);
            }}
            className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-6 transition-all"
          >
            <div className="text-lg font-semibold text-gray-800">
              {t.choice.identified}
            </div>
          </button>
        </div>

        <button
          onClick={() => setStep(0)}
          className="mt-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto"
        >
          <ChevronLeft size={20} />
          {t.choice.back}
        </button>
      </div>
    </div>
  );
};

// Composant Informations personnelles isolé
const PersonalInfoStep = ({
  language,
  formData,
  setFormData,
  errors,
  setErrors,
  setStep,
}) => {
  const t = translations[language];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.required;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.errors.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.errors.required;
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t.errors.phoneInvalid;
    }

    if (!formData.address.trim()) {
      newErrors.address = t.errors.required;
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t.errors.termsRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-blue-600 mb-2">FOSIKA</div>
          <div className="text-sm text-gray-600">MESUPRES</div>
        </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          {t.personal.title}
        </h2>
        <p className="text-sm text-gray-600 mb-6">{t.personal.subtitle}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.personal.name}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.personal.email}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.personal.phone}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.phone}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.personal.address}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.address}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="mt-1"
                id="terms"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                {t.personal.accept}
              </label>
            </div>
            {errors.acceptTerms && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.acceptTerms}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            if (validatePersonalInfo()) {
              setStep(3);
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6 transition-colors"
        >
          {t.personal.continue}
        </button>

        <button
          onClick={() => setStep(1)}
          className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto"
        >
          <ChevronLeft size={20} />
          {t.personal.back}
        </button>
      </div>
    </div>
  );
};

// Composant Catégorie isolé
const CategoryStep = ({
  language,
  isAnonymous,
  selectedCategory,
  setSelectedCategory,
  formData,
  setFormData,
  errors,
  setErrors,
  setStep,
}) => {
  const t = translations[language];

  const categories = [
    { id: "faux-diplomes", label: t.categories["faux-diplomes"] },
    { id: "fraudes-academique", label: t.categories["fraudes-academique"] },
    {
      id: "recrutements-irreguliers",
      label: t.categories["recrutements-irreguliers"],
    },
    { id: "harcelement", label: t.categories["harcelement"] },
    { id: "corruption", label: t.categories["corruption"] },
    { id: "divers", label: t.categories["divers"] },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateCategory = () => {
    const newErrors = {};

    if (!selectedCategory) {
      newErrors.category = t.errors.categoryRequired;
    }

    if (!formData.categoryDetails.trim()) {
      newErrors.categoryDetails = t.errors.descriptionRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-blue-600 mb-2">FOSIKA</div>
          <div className="text-sm text-gray-600">MESUPRES</div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {t.category.title}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.category.selectLabel}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">{t.category.selectPlaceholder}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>
            {errors.category && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.category}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.category.detailsLabel}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <textarea
              name="categoryDetails"
              value={formData.categoryDetails}
              onChange={handleInputChange}
              rows="8"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.categoryDetails ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t.category.detailsPlaceholder}
            />
            {errors.categoryDetails && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.categoryDetails}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setStep(isAnonymous ? 1 : 2)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={20} />
            {t.category.back}
          </button>
          <button
            onClick={() => {
              if (validateCategory()) {
                setStep(4);
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {t.category.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Upload isolé - CORRIGÉ
const UploadStep = ({
  language,
  formData,
  setFormData,
  errors,
  setErrors,
  fileErrors,
  setFileErrors,
  isSubmitting,
  setStep,
  handleSubmit,
}) => {
  const t = translations[language];

  const handleInputChange = (e) => {
    const { name, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : "",
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];
    const maxSize = 25 * 1024 * 1024;

    newFiles.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(
          `${file.name} ${
            language === "fr"
              ? "dépasse la taille maximale de 25 Mo"
              : "mihoatra ny habe fara-tampony 25 Mo"
          }`
        );
      } else {
        validFiles.push(file);
      }
    });

    setFileErrors(errors);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));

    // Effacer l'erreur fichiers si des fichiers valides sont ajoutés
    if (validFiles.length > 0 && errors.files) {
      setErrors((prev) => ({
        ...prev,
        files: "",
      }));
    }

    if (errors.length > 0) {
      setTimeout(() => setFileErrors([]), 5000);
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateUpload = () => {
    const newErrors = {};

    // Validation des fichiers - OBLIGATOIRE
    if (formData.files.length === 0) {
      newErrors.files = t.errors.filesRequired;
    }

    // Validation de la certification de véracité
    if (!formData.acceptTruth) {
      newErrors.acceptTruth = t.errors.truthRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (validateUpload()) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-blue-600 mb-2">FOSIKA</div>
          <div className="text-sm text-gray-600">MESUPRES</div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {t.upload.title}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.upload.attachments}{" "}
              <span className="text-red-500">{t.required}</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {t.upload.attachmentsInfo}
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-gray-50">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                multiple
                accept=".jpg,.jpeg,.png,.mp4,.pdf"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="text-gray-400 mb-3" size={48} />
                <span className="text-sm text-gray-700 font-medium mb-1">
                  {t.upload.uploadLabel}
                </span>
                <span className="text-xs text-gray-500">
                  {t.upload.uploadSubtext}
                </span>
              </label>
            </div>

            {/* Erreur fichiers obligatoires */}
            {errors.files && (
              <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.files}
              </div>
            )}

            {fileErrors.length > 0 && (
              <div className="mt-3 space-y-1">
                {fileErrors.map((error, index) => (
                  <div
                    key={index}
                    className="text-sm text-red-600 flex items-center gap-2"
                  >
                    <X size={16} />
                    {error}
                  </div>
                ))}
              </div>
            )}

            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t.upload.filesAdded} ({formData.files.length}):
                </p>
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Supprimer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
              <input
                type="checkbox"
                name="acceptTruth"
                checked={formData.acceptTruth}
                onChange={handleInputChange}
                className="mt-1"
                id="truth"
              />
              <label htmlFor="truth" className="text-sm text-gray-700">
                {t.upload.acceptTruth}
              </label>
            </div>
            {errors.acceptTruth && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                {errors.acceptTruth}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
          >
            <ChevronLeft size={20} />
            {t.upload.back}
          </button>
          <button
            onClick={handleSubmitClick}
            disabled={
              isSubmitting ||
              formData.files.length === 0 ||
              !formData.acceptTruth
            }
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t.upload.submitting}
              </>
            ) : (
              t.upload.submit
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Success isolé - CORRIGÉ
const SuccessPage = ({ language, referenceCode, navigate, resetForm }) => {
  const t = translations[language];

  // S'assurer que la référence est toujours affichée
  const displayReference = referenceCode || "Génération en cours...";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {t.success.title}
          </h2>
          <p className="text-lg text-gray-600">{t.success.thanks}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <p className="text-sm text-gray-600 mb-3 font-medium">
            {t.success.reference}
          </p>
          <p className="text-3xl font-bold text-blue-600 mb-4 tracking-wide font-mono">
            {displayReference}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t.success.tracking}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/suivi")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
          >
            {t.success.trackButton}
          </button>
          <button
            onClick={resetForm}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            {t.success.home}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal - CORRIGÉ
const SignalementForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [language, setLanguage] = useState("fr");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    categoryDetails: "",
    acceptTerms: false,
    acceptTruth: false,
    files: [],
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [fileErrors, setFileErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const t = translations[language];

    setIsSubmitting(true);

    try {
      // Préparer les données pour l'API Laravel
      const formDataToSend = {
        type: isAnonymous ? "anonyme" : "identifie",
        name: isAnonymous ? "Anonyme" : formData.name,
        email: isAnonymous ? null : formData.email,
        phone: isAnonymous ? null : formData.phone,
        address: isAnonymous ? null : formData.address,
        category: selectedCategory,
        description: formData.categoryDetails,
        files: formData.files.map((file) => file.name),
        accept_terms: true,
        accept_truth: formData.acceptTruth,
      };

      console.log("🔄 Envoi des données:", formDataToSend);

      const response = await fetch("http://localhost:8000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formDataToSend),
      });

      console.log("📡 Statut de la réponse:", response.status);

      const result = await response.json();
      console.log("📨 Réponse du serveur COMPLÈTE:", {
        status: response.status,
        statusText: response.statusText,
        result: result,
      });

      if (!response.ok) {
        console.error("❌ Erreur HTTP:", response.status);

        if (result.vpn_detected) {
          const message =
            language === "fr" ? result.message.fr : result.message.mg;
          alert(message);
          return;
        }

        let errorMessage = t.errors.submission;
        if (result.errors) {
          errorMessage = Object.values(result.errors).flat().join(", ");
        } else if (result.message) {
          errorMessage = result.message;
        }

        throw new Error(errorMessage);
      }

      // CORRECTION : Vérifier correctement la réponse avec plusieurs formats possibles
      if (result.success || result.reference || result.data?.reference) {
        console.log(
          "✅ Succès - Référence:",
          result.reference || result.data?.reference
        );

        // CORRECTION : Utiliser la référence de la réponse ou générer une référence de secours
        const reference =
          result.reference || result.data?.reference || generateReference();
        setReferenceCode(reference);
        setShowSuccess(true);
      } else {
        throw new Error(result.message || t.errors.submission);
      }
    } catch (error) {
      console.error("💥 Erreur complète:", error);

      let errorMessage = t.errors.submission;

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage =
          t.errors.network +
          "\n\nVérifiez que le serveur Laravel est démarré sur http://localhost:8000";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setStep(0);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      categoryDetails: "",
      acceptTerms: false,
      acceptTruth: false,
      files: [],
    });
    setSelectedCategory("");
    setIsAnonymous(null);
    setErrors({});
  };

  // Rendu conditionnel des étapes
  if (showSuccess) {
    return (
      <SuccessPage
        language={language}
        referenceCode={referenceCode}
        navigate={navigate}
        resetForm={resetForm}
      />
    );
  }

  if (step === 0) {
    return (
      <WelcomePage
        language={language}
        setLanguage={setLanguage}
        setStep={setStep}
        navigate={navigate}
      />
    );
  }

  if (step === 1) {
    return (
      <ChoiceStep
        language={language}
        setStep={setStep}
        setIsAnonymous={setIsAnonymous}
      />
    );
  }

  if (step === 2) {
    return (
      <PersonalInfoStep
        language={language}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        setStep={setStep}
      />
    );
  }

  if (step === 3) {
    return (
      <CategoryStep
        language={language}
        isAnonymous={isAnonymous}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        setStep={setStep}
      />
    );
  }

  if (step === 4) {
    return (
      <UploadStep
        language={language}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        fileErrors={fileErrors}
        setFileErrors={setFileErrors}
        isSubmitting={isSubmitting}
        setStep={setStep}
        handleSubmit={handleSubmit}
      />
    );
  }

  return null;
};

export default SignalementForm;

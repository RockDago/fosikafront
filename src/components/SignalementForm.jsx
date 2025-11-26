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

// ✅ Importez votre NOUVELLE instance Axios configurée
import API from "../config/axios";

// Import des images
import LogoRep from "../assets/images/logo rep.png";
import LogoMesupres from "../assets/images/logo mesupres.png";
import LogoFosika from "../assets/images/logo fosika.png";
import DrapeauFrancais from "../assets/images/Asset 4.png";
import DrapeauMalagasy from "../assets/images/Asset 5.png";
import Megaphone from "../assets/images/Asset 7.png";
import FondAsset from "../assets/images/Asset 8.png";

// Traductions globales
const translations = {
  fr: {
    welcome: {
      title:
        'Bienvenue sur la Plateforme nationale de signalement des fraudes et faux diplômes - "FOSIKA"',
      subtitle:
        "Sous l'égide du Ministère de l'Enseignement supérieur et de la Recherche scientifique (MESUPRES), en partenariat avec le BIANCO, la plateforme FOSIKA s'inscrit dans la volonté nationale d'assainir le système d'enseignement supérieur et de restaurer la confiance du public.",
      initiative:
        "Cette initiative permet de signaler en toute confidentialité tout cas de :",
      cases: [
        "Faux diplômes utilisés lors des recrutements,",
        "Faux diplômes dans le but d'obtenir la validation d'une candidature ou une évolution dans la carrière professionnelle,",
        "Diplômes et attestations falsifiés.",
      ],
      contribute: "Par vos signalements, vous contribuez à :",
      benefits: [
        "Renforcer l'intégrité académique,",
        "Promouvoir la transparence institutionnelle,",
        "Défendre la valeur du mérite et du savoir.",
      ],
      vigilance:
        "Votre vigilance est un acte citoyen. Ensemble, protégeons la crédibilité de nos universités et la dignité de notre système éducatif.",
      slogan: "Opération FOSIKA : assainir, protéger, refonder.",
      submitBtn: "Soumettre un signalement",
      clickHere: "Cliquez ici",
    },
    choice: {
      title: "Choisissez",
      anonymous: "Anonyme",
      identified: "Je m'identifie",
      back: "Retour",
    },
    personal: {
      title: "Mes informations",
      subtitle: "Faire la déclaration",
      name: "Nom complet",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      accept: "Je certifie que ces informations sont exactes",
      continue: "Continuer",
      back: "Retour",
    },
    category: {
      title: "Signalement",
      selectLabel: "Catégorie de signalement :",
      selectPlaceholder: "Sélectionnez une catégorie...",
      detailsLabel: "Description détaillée de la situation :",
      detailsPlaceholder:
        "Décrivez en détail la situation que vous souhaitez signaler...",
      back: "Retour",
      continue: "Continuer",
    },
    upload: {
      title: "Pièces justificatives",
      attachments: "Pièces jointes (photos, vidéos, documents) - Obligatoire",
      attachmentsInfo:
        "Formats acceptés: JPG, JPEG, PNG, MP4, PDF • Taille max: 25 Mo par fichier • Au moins 1 fichier requis",
      uploadLabel: "Cliquez pour ajouter des fichiers",
      uploadSubtext: "ou glissez-déposez vos fichiers ici",
      filesAdded: "Fichiers ajoutés",
      acceptTruth:
        "Je certifie que les informations fournies sont véridiques et exemptes de tout mensonge",
      submit: "Soumettre le signalement",
      submitting: "Envoi en cours...",
      back: "Retour",
    },
    success: {
      title: "Signalement reçu avec succès",
      thanks: "Nous vous remercions pour votre contribution",
      reference: "Référence de votre dossier",
      tracking:
        "Vous pouvez suivre l'état de votre dossier (en cours, finalisé, doublon ou refusé) via cette référence.",
      trackButton: "Suivre mon dossier",
      home: "Retour à l'accueil",
    },
    categories: {
      "Faux-diplomes": "Faux diplômes",
      "Fraudes-academique": "Fraudes académiques",
      "Fecrutements-irreguliers": "Recrutements irréguliers",
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
        "Tongasoa eto amin'ny tambajotra nasionaly miady amin'ny trangana HOSOKA sy DIPLAOMA Sandoka - \"FOSIKA\"",
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
        "Fanamafisana ny fahamarinana sy fangaraharana akademika,",
        "Fampiroboroboana ny fahadiovana ara-pitantanana,",
        "Fiarovana ny hasin'ny fahaiza-manao sy ny fahalalana.",
      ],
      vigilance:
        "Ny fahamalinanao dia adidy amin'ny maha-olom-firenena. Isika miaraka no hiaro ny hasin'ny anjerimanontolo sy ny rafi-pampianarana.",
      slogan: "HETSIKA FOSIKA : manadio, miaro, manavao.",
      submitBtn: "HANDEFA FITARAINANA",
      clickHere: "TSINDRIO ETO",
    },
    choice: {
      title: "Safidio",
      anonymous: "Tsy mitonona anarana",
      identified: "Hilaza ny momba ahy",
      back: "Hiverina",
    },
    personal: {
      title: "MOMBA AHY",
      subtitle: "MANAO NY FANAMBARANA",
      name: "Anarana feno",
      email: "Mailaka",
      phone: "Finday",
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
      reference: "Référence an'ilay antontataratasy",
      tracking:
        "Afaka manaraka ny fivoaran'ny dosierao (Voaray, Vita, Mitovy na Nolavina) amin'ity référence ity.",
      trackButton: "Hanaraka ny antontataratasy",
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

// Composant Page d'accueil avec alignement vertical corrigé
const WelcomePage = ({ language, setLanguage, setStep, navigate }) => {
  const t = translations[language];

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-4 font-inter overflow-x-hidden">
      {/* En-tête avec logos - ALIGNEMENT VERTICAL CORRIGÉ */}
      <div className="w-full max-w-3xl mx-auto mb-3">
        <div className="w-full flex items-center justify-center bg-white p-3 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            {/* Bloc logos : REP en haut, MESUPRES en bas */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <img
                src={LogoRep}
                alt="Logo République"
                className="h-16 w-16 object-contain"
              />
              <img
                src={LogoMesupres}
                alt="Logo MESUPRES"
                className="h-16 w-16 object-contain"
              />
            </div>

            <div className="w-[2px] bg-gray-400 h-36"></div>

            {/* Bloc texte avec alignement vertical corrigé */}
            <div className="flex flex-col justify-center space-y-1">
              {/* Texte 1 - Logo République - REMONTÉ */}
              <span className="font-semibold text-sm uppercase leading-tight  p-2">
                Repoblikan'i Madagasikara
              </span>

              {/* Texte 2 - Logo MESUPRES - DESCENDU */}
              <span className="font-semibold text-sm uppercase leading-tight p-2">
                Ministeran'ny Fampianarana Ambony
                <br />
                sy Fikarohana Ara-tsiansa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Le reste du code reste inchangé */}
      <div className="relative w-full max-w-6xl overflow-hidden">
        {/* Cadre vert principal sans arrondi */}
        <div className="absolute inset-0 border-4 border-[#b3d088] bg-[#f9faf7] z-0"></div>

        {/* Menu de langue - UNIQUEMENT SUR CETTE PAGE - Style ancien sans fond, taille réduite */}
        <div className="absolute top-4 right-4 z-50">
          <div>
            <div className="text-center font-semibold text-gray-800 mb-2 text-xs">
              {language === "fr" ? "Choisir la langue" : "Safidio ny fiteny"}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setLanguage("mg")}
                className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors ${
                  language === "mg" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <img
                  src={DrapeauMalagasy}
                  alt="Malagasy"
                  className="w-7 h-7 rounded-full border border-gray-300"
                />
                <span className="text-xs text-gray-700">Malagasy</span>
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors ${
                  language === "fr" ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <img
                  src={DrapeauFrancais}
                  alt="Français"
                  className="w-7 h-7 rounded-full border border-gray-300"
                />
                <span className="text-xs text-gray-700">Français</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 p-8 md:p-12 pt-12 md:pt-16">
          {/* Bonjour cher visiteur avec Logo Fosika centré */}
          <div className="relative mb-6 -mt-2 md:-mt-4">
            {/* Bonjour cher visiteur */}
            <div className="pl-2">
              <span className="text-4xl md:text-5xl font-bold text-[#5e8f3e] block">
                {language === "fr" ? "Bonjour" : "Miarahaba"}
              </span>
              <span className="text-4xl md:text-5xl font-bold text-[#b3d088] inline">
                {language === "fr" ? "cher visiteur" : "tompoko"}
              </span>
              <span className="text-4xl md:text-5xl font-bold text-[#223250] inline">
                ,
              </span>
            </div>

            {/* Logo Fosika - centré horizontalement dans le cadre vert, aligné verticalement avec le texte */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <img
                src={LogoFosika}
                alt="Logo Fosika"
                className="h-32 md:h-48 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="flex-1 pl-4 pr-2">
              <div className="mb-6 bg-[#223250] rounded-[20px] px-4 py-2 inline-block ml-2">
                <svg width="80" height="26">
                  <ellipse cx="16" cy="14" rx="8" ry="8" fill="#ffffff" />
                  <ellipse cx="40" cy="14" rx="8" ry="8" fill="#ffffff" />
                  <ellipse cx="64" cy="14" rx="8" ry="8" fill="#ffffff" />
                </svg>
              </div>
              <div className="clear-both"></div>

              <div className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-h-[180px] overflow-y-auto pr-3 pl-2 scrollable-text">
                <p className="mb-3">{t.welcome.title}</p>
                <p className="mb-3">{t.welcome.subtitle}</p>

                <div className="mb-3">
                  <p className="font-semibold text-gray-800 mb-2">
                    {t.welcome.initiative}
                  </p>
                  <ul className="space-y-1 text-gray-700">
                    {t.welcome.cases.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#b3d088] mr-2">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-3">
                  <p className="font-semibold text-gray-800 mb-2">
                    {t.welcome.contribute}
                  </p>
                  <ul className="space-y-1 text-gray-700">
                    {t.welcome.benefits.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#b3d088] mr-2">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mb-3">{t.welcome.vigilance}</p>

                <p className="text-center font-bold text-[#5e8f3e] text-lg">
                  {t.welcome.slogan}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full md:w-auto items-center">
              <button
                onClick={() => setStep(1)}
                className="bg-[#b3d088] text-white py-3 px-8 rounded-xl font-bold text-base transition-transform hover:scale-105 min-w-[220px] flex items-center justify-center shadow-[4px_8px_0_#e1e4e4] flex-col"
              >
                {t.welcome.submitBtn}
                <span className="text-sm font-normal mt-1">
                  {t.welcome.clickHere}
                </span>
              </button>

              <button
                onClick={() => navigate("/suivi")}
                className="border-2 border-[#b3d088] text-[#277335] py-3 px-8 rounded-xl font-bold text-base transition-colors hover:bg-green-50 min-w-[220px]"
              >
                {language === "fr" ? "Suivre un dossier" : "Hanaraka dossier"}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 z-10">
          <img
            src={Megaphone}
            alt="Megaphone"
            className="w-20 h-20 md:w-28 md:h-28"
          />
        </div>
      </div>

      <style jsx>{`
        .scrollable-text::-webkit-scrollbar {
          width: 6px;
        }
        .scrollable-text::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollable-text::-webkit-scrollbar-thumb {
          background: #b3d088;
          border-radius: 10px;
        }
        .scrollable-text::-webkit-scrollbar-thumb:hover {
          background: #5e8f3e;
        }
      `}</style>
    </div>
  );
};

// Composant Choix isolé - SANS BOUTON DE LANGUE
const ChoiceStep = ({ language, setStep, setIsAnonymous }) => {
  const t = translations[language];

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-4 font-inter">
      {/* En-tête avec logos - IDENTIQUE à la page d'accueil */}
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="w-full flex items-center justify-center bg-white p-3 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            {/* Bloc logos : REP en haut, MESUPRES en bas */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <img
                src={LogoRep}
                alt="Logo République"
                className="h-16 w-16 object-contain"
              />
              <img
                src={LogoMesupres}
                alt="Logo MESUPRES"
                className="h-16 w-16 object-contain"
              />
            </div>

            <div className="w-[2px] bg-gray-400 h-36"></div>

            {/* Bloc texte avec alignement vertical corrigé */}
            <div className="flex flex-col justify-center space-y-1">
              {/* Texte 1 - Logo République - REMONTÉ */}
              <span className="font-semibold text-sm uppercase leading-tight  p-2">
                Repoblikan'i Madagasikara
              </span>

              {/* Texte 2 - Logo MESUPRES - DESCENDU */}
              <span className="font-semibold text-sm uppercase leading-tight p-2">
                Ministeran'ny Fampianarana Ambony
                <br />
                sy Fikarohana Ara-tsiansa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec cadre vert - MÊMES DIMENSIONS QUE LA PAGE D'ACCUEIL */}
      <div className="relative w-full max-w-6xl flex-1">
        {/* Cadre vert principal - MÊME DIMENSION QUE LA PAGE BONJOUR */}
        <div className="absolute inset-0 border-4 border-[#b3d088] bg-[#f9faf7] z-0"></div>

        {/* Contenu */}
        <div className="relative z-10 p-8 md:p-12 pt-16 md:pt-20 h-full flex flex-col items-center justify-center">
          {/* Zone centrale avec fond transparent et Asset 8 en arrière-plan */}
          <div className="relative bg-transparent rounded-[80px] px-12 py-16 max-w-xl w-full">
            {/* Asset 8 en fond */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img
                src={FondAsset}
                alt="Fond"
                className="max-w-none w-[140%] h-[140%] object-contain scale-130 select-none opacity-100"
              />
            </div>

            {/* Contenu par-dessus - TOUT CENTRÉ ET ALIGNÉ */}
            <div className="relative z-20 flex flex-col items-center justify-center w-full text-center">
              {/* Titre centré */}
              <h1 className="text-4xl md:text-5xl font-bold text-[#5e8f3e] mb-12">
                {t.choice.title}
              </h1>

              {/* Options parfaitement centrées et alignées */}
              <div className="flex flex-col items-center justify-center space-y-8 w-full">
                {/* Anonyme - PARFAITEMENT CENTRÉ */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex items-center justify-center space-x-4 cursor-pointer text-gray-700 text-lg w-full max-w-[200px]">
                    <input
                      type="radio"
                      name="choix-anonymat"
                      value="anonyme"
                      className="w-6 h-6 border-2 border-gray-400 accent-blue-600"
                      onChange={() => {
                        setIsAnonymous(true);
                        setStep(3);
                      }}
                    />
                    <span className="flex-1 text-center">
                      {t.choice.anonymous}
                    </span>
                  </label>
                </div>

                {/* Je m'identifie - PARFAITEMENT CENTRÉ */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex items-center justify-center space-x-4 cursor-pointer text-gray-700 text-lg w-full max-w-[200px]">
                    <input
                      type="radio"
                      name="choix-anonymat"
                      value="non-anonyme"
                      className="w-6 h-6 border-2 border-red-500 accent-red-600"
                      onChange={() => {
                        setIsAnonymous(false);
                        setStep(2);
                      }}
                    />
                    <span className="flex-1 text-center">
                      {t.choice.identified}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton Retour - STYLE UNIFORMISÉ */}
          <button
            onClick={() => setStep(0)}
            className="mt-8 text-[#5e8f3e] hover:text-[#4a7b32] flex items-center gap-2 font-semibold text-lg"
          >
            <ChevronLeft size={24} />
            {t.choice.back}
          </button>
        </div>
      </div>
    </div>
  );
};
// Composant Informations personnelles isolé - SANS BOUTON DE LANGUE
const PersonalInfoStep = ({
  language,
  formData,
  setFormData,
  errors,
  setErrors,
  setStep,
}) => {
  const t = translations[language];

  const handleNext = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = t.errors.required;
    if (!formData.email?.trim()) newErrors.email = t.errors.required;
    if (!formData.phone?.trim()) newErrors.phone = t.errors.required;
    if (!formData.address?.trim()) newErrors.address = t.errors.required;
    if (!formData.acceptTerms) newErrors.acceptTerms = t.errors.termsRequired;

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(3); // Vers FITARAINANA
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-4 font-inter">
      {/* En-tête avec logos - IDENTIQUE à la page d'accueil */}
      <div className="w-full max-w-3xl mx-auto mb-4">
        <div className="w-full flex items-center justify-center bg-white p-3 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            {/* Bloc logos : REP en haut, MESUPRES en bas */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <img
                src={LogoRep}
                alt="Logo République"
                className="h-16 w-16 object-contain"
              />
              <img
                src={LogoMesupres}
                alt="Logo MESUPRES"
                className="h-16 w-16 object-contain"
              />
            </div>

            <div className="w-[2px] bg-gray-400 h-36"></div>

            {/* Bloc texte avec alignement vertical corrigé */}
            <div className="flex flex-col justify-center space-y-1">
              {/* Texte 1 - Logo République - REMONTÉ */}
              <span className="font-semibold text-sm uppercase leading-tight  p-2">
                Repoblikan'i Madagasikara
              </span>

              {/* Texte 2 - Logo MESUPRES - DESCENDU */}
              <span className="font-semibold text-sm uppercase leading-tight p-2">
                Ministeran'ny Fampianarana Ambony
                <br />
                sy Fikarohana Ara-tsiansa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec cadre vert - MÊMES DIMENSIONS QUE LA PAGE D'ACCUEIL */}
      <div className="relative w-full max-w-6xl flex-1">
        {/* Cadre vert principal - MÊME DIMENSION QUE LA PAGE BONJOUR */}
        <div className="absolute inset-0 border-4 border-[#b3d088] bg-[#f9faf7] z-0"></div>

        {/* Contenu */}
        <div className="relative z-10 p-4 md:p-6 pt-8 md:pt-12 h-full flex flex-col items-center justify-center">
          {/* Titre principal réduit */}
          <h1 className="text-center text-2xl md:text-3xl font-bold text-[#5e8f3e] mb-2">
            {t.personal.title}
          </h1>
          <p className="text-center text-xs font-semibold text-gray-700 mb-6">
            {t.personal.subtitle}
          </p>

          {/* Formulaire sans fond blanc */}
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="w-full"
            >
              {/* Nom complet */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  {t.personal.name} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b3d088] focus:border-[#b3d088] text-xs transition-all bg-white"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-rose-600 text-xs">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  {t.personal.email} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b3d088] focus:border-[#b3d088] text-xs transition-all bg-white"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-rose-600 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  {t.personal.phone} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b3d088] focus:border-[#b3d088] text-xs transition-all bg-white"
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-rose-600 text-xs">{errors.phone}</p>
                )}
              </div>

              {/* Adresse */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  {t.personal.address} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b3d088] focus:border-[#b3d088] text-xs transition-all bg-white"
                  required
                />
                {errors.address && (
                  <p className="mt-1 text-rose-600 text-xs">{errors.address}</p>
                )}
              </div>

              {/* Certification */}
              <div className="mb-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acceptTerms: e.target.checked,
                    })
                  }
                  className="mt-0.5 h-3 w-3 text-[#b3d088] rounded focus:ring-[#b3d088]"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-xs text-gray-700 leading-relaxed"
                >
                  {t.personal.accept}
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="mb-3 text-rose-600 text-xs flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.acceptTerms}
                </p>
              )}

              {/* Boutons */}
              <div className="flex justify-center gap-6 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#5e8f3e] hover:text-[#4a7b32] flex items-center gap-2 font-semibold text-lg"
                >
                  <ChevronLeft size={24} />
                  {t.personal.back}
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#b3d088] hover:bg-[#9ec97a] text-white font-bold rounded-lg text-sm transition-all shadow-md"
                >
                  {t.personal.continue}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Catégorie isolé - SANS BOUTON DE LANGUE
const CategoryStep = ({
  language,
  selectedCategory,
  setSelectedCategory,
  formData,
  setFormData,
  errors,
  setErrors,
  setStep,
  isAnonymous,
}) => {
  const t = translations[language];

  const categories = Object.entries(t.categories).map(([value, label]) => ({
    value,
    label,
  }));

  const handleNext = () => {
    const newErrors = {};
    if (!selectedCategory) newErrors.category = t.errors.categoryRequired;
    if (!formData.categoryDetails?.trim())
      newErrors.categoryDetails = t.errors.descriptionRequired;
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(4);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-4 font-inter">
      {/* En-tête avec logos - IDENTIQUE à la page d'accueil */}
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="w-full flex items-center justify-center bg-white p-3 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            {/* Bloc logos : REP en haut, MESUPRES en bas */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <img
                src={LogoRep}
                alt="Logo République"
                className="h-16 w-16 object-contain"
              />
              <img
                src={LogoMesupres}
                alt="Logo MESUPRES"
                className="h-16 w-16 object-contain"
              />
            </div>

            <div className="w-[2px] bg-gray-400 h-36"></div>

            {/* Bloc texte avec alignement vertical corrigé */}
            <div className="flex flex-col justify-center space-y-1">
              {/* Texte 1 - Logo République - REMONTÉ */}
              <span className="font-semibold text-sm uppercase leading-tight  p-2">
                Repoblikan'i Madagasikara
              </span>

              {/* Texte 2 - Logo MESUPRES - DESCENDU */}
              <span className="font-semibold text-sm uppercase leading-tight p-2">
                Ministeran'ny Fampianarana Ambony
                <br />
                sy Fikarohana Ara-tsiansa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec cadre vert - MÊMES DIMENSIONS QUE LA PAGE D'ACCUEIL */}
      <div className="relative w-full max-w-6xl flex-1">
        {/* Cadre vert principal - MÊME DIMENSION QUE LA PAGE BONJOUR */}
        <div className="absolute inset-0 border-4 border-[#b3d088] bg-[#f9faf7] z-0"></div>

        {/* Contenu */}
        <div className="relative z-10 p-6 md:p-8 pt-12 md:pt-16 h-full flex flex-col items-center justify-center">
          {/* Titre principal réduit */}
          <h1 className="text-center text-3xl md:text-4xl font-bold text-[#5e8f3e] mb-6">
            {t.category.title}
          </h1>

          {/* Formulaire sans fond blanc */}
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="w-full"
            >
              {/* Catégorie */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t.category.selectLabel}{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b3d088] focus:border-[#b3d088] text-sm transition-all bg-white"
                  required
                >
                  <option value="" disabled>
                    {t.category.selectPlaceholder}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-rose-600 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.category}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {t.category.detailsLabel}{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.categoryDetails || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryDetails: e.target.value,
                    })
                  }
                  placeholder={t.category.detailsPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b3d088] focus:border-[#b3d088] resize-none text-sm transition-all bg-white"
                  required
                />
                {errors.categoryDetails && (
                  <p className="mt-1 text-rose-600 text-xs flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.categoryDetails}
                  </p>
                )}
              </div>

              {/* Boutons */}
              <div className="flex justify-center gap-6 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(isAnonymous === false ? 2 : 1)}
                  className="text-[#5e8f3e] hover:text-[#4a7b32] flex items-center gap-2 font-semibold text-lg"
                >
                  <ChevronLeft size={24} />
                  {t.category.back}
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#b3d088] hover:bg-[#9ec97a] text-white font-bold rounded-lg text-sm transition-all shadow-md"
                >
                  {t.category.continue}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Upload isolé - SANS BOUTON DE LANGUE
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

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const errors = [];
    const validFiles = [];
    const maxSize = 25 * 1024 * 1024;

    newFiles.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(
          `${file.name} ${
            language === "fr" ? "dépasse 25 Mo" : "mihoatra ny 25 Mo"
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

    if (validFiles.length > 0 && errors.files) {
      setErrors((prev) => ({ ...prev, files: "" }));
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

  const validateAndSubmit = () => {
    const newErrors = {};
    if (formData.files.length === 0) newErrors.files = t.errors.filesRequired;
    if (!formData.acceptTruth) newErrors.acceptTruth = t.errors.truthRequired;

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center p-4 font-inter">
      {/* Header officiel */}
      <div className="w-full max-w-3xl mx-auto mb-3">
        <div className="w-full flex items-center justify-center bg-white p-2 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex flex-col items-center justify-center space-y-1">
              <img
                src={LogoRep}
                alt="Logo République"
                className="h-14 w-14 object-contain"
              />
              <img
                src={LogoMesupres}
                alt="Logo MESUPRES"
                className="h-14 w-14 object-contain"
              />
            </div>
            <div className="w-[2px] bg-gray-400 h-28"></div>
            <div className="flex flex-col justify-center space-y-1 text-left">
              <span className="font-semibold text-xs uppercase leading-tight">
                REPOBLIKAN'I MADAGASIKARA
              </span>
              <span className="font-semibold text-xs uppercase leading-tight">
                Ministère de l'Enseignement supérieur
                <br />
                et de la Recherche scientifique
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grand cadre vert officiel */}
      <div className="relative w-full max-w-6xl flex-1 mb-4">
        <div className="absolute inset-0 border-4 border-[#b3d088] bg-[#f9faf7] z-0"></div>

        <div className="relative z-10 px-6 pt-8 pb-6 md:px-8 md:pt-12 md:pb-8 h-full flex flex-col">
          {/* Titre principal réduit */}
          <h1 className="text-center text-3xl md:text-4xl font-bold text-[#5e8f3e] mb-6">
            {t.upload.title}
          </h1>

          {/* Formulaire sans fond blanc */}
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-xl mx-auto">
            {/* Titre secondaire */}
            <p className="text-center text-sm font-semibold text-gray-800 mb-4">
              {t.upload.attachments} <span className="text-rose-600">*</span>
            </p>
            <p className="text-center text-xs text-gray-600 mb-6 leading-relaxed">
              {t.upload.attachmentsInfo}
            </p>

            {/* Zone de dépôt */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#b3d088] transition-all bg-white mb-6 w-full">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.mp4,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {t.upload.uploadLabel}
                </p>
                <p className="text-xs text-gray-500">
                  {t.upload.uploadSubtext}
                </p>
              </label>
            </div>

            {/* Erreurs fichiers */}
            {errors.files && (
              <p className="text-rose-600 text-xs text-center mb-4 flex items-center justify-center gap-1">
                <AlertCircle size={12} /> {errors.files}
              </p>
            )}
            {fileErrors.length > 0 && (
              <div className="mb-4 space-y-1">
                {fileErrors.map((err, i) => (
                  <p
                    key={i}
                    className="text-rose-600 text-xs text-center flex items-center justify-center gap-1"
                  >
                    <X size={12} /> {err}
                  </p>
                ))}
              </div>
            )}

            {/* Liste des fichiers ajoutés */}
            {formData.files.length > 0 && (
              <div className="mb-6 w-full">
                <p className="text-center font-semibold text-gray-700 mb-3 text-sm">
                  {t.upload.filesAdded} ({formData.files.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-3 text-rose-600 hover:text-rose-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certification */}
            <div className="mb-6 flex items-start gap-2 w-full">
              <input
                type="checkbox"
                id="acceptTruth"
                checked={formData.acceptTruth || false}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTruth: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 text-[#b3d088] rounded focus:ring-[#b3d088]"
              />
              <label
                htmlFor="acceptTruth"
                className="text-xs text-gray-700 leading-relaxed"
              >
                {t.upload.acceptTruth}
              </label>
            </div>
            {errors.acceptTruth && (
              <p className="mb-4 text-rose-600 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.acceptTruth}
              </p>
            )}

            {/* Boutons */}
            <div className="flex justify-center gap-6 pt-4 w-full">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="text-[#5e8f3e] hover:text-[#4a7b32] flex items-center gap-2 font-semibold text-lg disabled:opacity-50"
              >
                <ChevronLeft size={24} />
                {t.upload.back}
              </button>
              <button
                onClick={validateAndSubmit}
                disabled={
                  isSubmitting ||
                  formData.files.length === 0 ||
                  !formData.acceptTruth
                }
                className="px-8 py-2 bg-[#b3d088] hover:bg-[#9ec97a] text-white font-bold rounded-lg text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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
      </div>
    </div>
  );
};

// Composant Success isolé - SANS BOUTON DE LANGUE
const SuccessPage = ({ language, referenceCode, resetForm, navigate }) => {
  const t = translations[language];
  const Asset8 = new URL("../assets/images/Asset 8.png", import.meta.url).href;
  const Asset9 = new URL("../assets/images/Asset 9.png", import.meta.url).href;

  // Génération de référence
  const generateRef = () => {
    const date = new Date().toISOString().slice(0, 10);
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "Pr";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${date}-${code}`;
  };

  const displayRef = referenceCode || generateRef();

  return (
    <div className="bg-[#f9faf7] min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative font-['Inter',sans-serif]">
      {/* Contenu centré avec Asset 8 en fond */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-2xl">
        {/* Asset 8 + bouton X */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {/* Image de fond */}
          <img
            src={Asset8}
            alt="Fond décoratif"
            className="w-full max-w-2xl h-auto object-contain opacity-40"
          />

          {/* Petit X proche de l'image */}
          <button
            onClick={resetForm}
            className="absolute -top-14 right-2 z-50 bg-white text-red-500 
           border-2 border-red-500 rounded-full w-10 h-10 
           flex items-center justify-center hover:bg-red-50 
           transition-all shadow-md text-2xl font-thin pointer-events-auto"
          >
            ×
          </button>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 text-center space-y-5 px-8">
          {/* Asset9 + texte */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <img
                src={Asset9}
                alt="Validation"
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>

            <div className="text-left space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[#5e8f3e] leading-tight">
                {t.success.title}
              </h1>
              <p className="text-gray-700 text-base md:text-lg font-medium">
                {t.success.thanks}
              </p>
            </div>
          </div>

          {/* Référence */}
          <div className="inline-block mt-4">
            <span className="text-gray-600 text-sm md:text-base">
              {t.success.reference}{" "}
            </span>
            <span className="font-bold text-base md:text-lg text-gray-900 tracking-wider">
              {displayRef}
            </span>
          </div>

          {/* Suivi dossier */}
          <div className="space-y-2 mt-4">
            <p className="text-gray-700 text-sm md:text-base">
              {t.success.tracking}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => navigate("/suivi")}
                className="text-[#5e8f3e] font-bold text-base md:text-lg underline hover:text-[#4a7230] transition"
              >
                {t.success.trackButton}
              </button>
              <svg
                className="w-5 h-5 text-[#5e8f3e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
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

      // ✅ UTILISATION DE LA NOUVELLE INSTANCE AXIOS
      const response = await API.post("/reports", formDataToSend);

      console.log("📡 Statut de la réponse:", response.status);

      const result = response.data;
      console.log("📨 Réponse du serveur COMPLÈTE:", {
        status: response.status,
        data: result,
      });

      if (result.vpn_detected) {
        const message =
          language === "fr" ? result.message.fr : result.message.mg;
        alert(message);
        return;
      }

      if (result.success || result.reference || result.data?.reference) {
        console.log(
          "✅ Succès - Référence:",
          result.reference || result.data?.reference
        );

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

      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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

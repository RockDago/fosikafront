import React, { useState, useEffect } from "react";
import { teamService } from "../../services/teamService";

const tabs = [
  { id: "agents", label: "Agents", icon: "👤" },
  { id: "investigateurs", label: "Investigateurs", icon: "🔍" },
  { id: "roles", label: "Rôles et Permissions", icon: "🔑" },
];

const departements = [
  "DRSE - Direction Régionale",
  "CAC - Cellule Anti-Corruption",
];

const departementsInvestigateur = [
  "BIANCO - Bureau d'Enquête et d'Investigation",
];

const roles = [
  { value: "Agent", label: "Agent" },
  { value: "Investigateur", label: "Investigateur" },
];

const specialisations = [
  "Vérification documents",
  "Investigation terrain",
  "Analyse preuves",
  "Entretiens citoyens",
];

// Fonction pour exporter en CSV
const exportToCSV = (users, filename) => {
  if (!users || users.length === 0) {
    alert("Aucune donnée à exporter");
    return;
  }

  const headers = [
    "ID",
    "Nom Complet", 
    "Email",
    "Téléphone",
    "Département",
    "Nom d'Utilisateur",
    "Rôle",
    "Statut",
    "Spécialisations",
    "Responsabilités"
  ];
  
  const csvContent = [
    headers.join(","),
    ...users.map(user => [
      user.id,
      `"${user.nom_complet || ''}"`,
      `"${user.email || ''}"`,
      `"${user.telephone || ''}"`,
      `"${user.departement || ''}"`,
      `"${user.username || ''}"`,
      `"${user.role || ''}"`,
      `"${user.statut ? 'Actif' : 'Inactif'}"`,
      `"${(user.specialisations || []).join(', ') || ''}"`,
      `"${user.responsabilites || ''}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Composant pour les indicateurs de force du mot de passe
function PasswordStrengthIndicator({ password }) {
  const criteria = [
    {
      label: "8 caractères minimum",
      met: password.length >= 8,
    },
    {
      label: "Première lettre en majuscule",
      met: /^[A-Z]/.test(password),
    },
    {
      label: "Au moins un chiffre",
      met: /\d/.test(password),
    },
    {
      label: "Au moins un caractère spécial",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const allMet = criteria.every(criterion => criterion.met);

  return (
    <div className="mt-2">
      <div className="text-xs font-medium mb-1">Critères du mot de passe:</div>
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                password.length === 0 
                  ? "bg-gray-400" 
                  : criterion.met 
                    ? "bg-green-500" 
                    : "bg-red-500"
              }`}
            />
            <span
              className={`text-xs ${
                password.length === 0 
                  ? "text-gray-500" 
                  : criterion.met 
                    ? "text-green-700" 
                    : "text-red-700"
              }`}
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
      {password.length > 0 && (
        <div className={`mt-2 text-xs font-medium ${
          allMet ? "text-green-700" : "text-red-700"
        }`}>
          {allMet ? "✓ Tous les critères sont respectés" : "✗ Certains critères ne sont pas respectés"}
        </div>
      )}
    </div>
  );
}

// Composant pour l'input mot de passe avec icône œil
function PasswordInput({ value, onChange, placeholder, required = false }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <input
        type={showPassword ? "text" : "password"}
        className="w-full border rounded px-3 py-2 mt-1 pl-10 pr-10"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Composant pour l'input téléphone
function PhoneInput({ value, onChange, required = false }) {
  const [error, setError] = useState("");

  const formatPhoneNumber = (input) => {
    // Supprimer tout sauf les chiffres
    const numbers = input.replace(/\D/g, "");
    
    // Si vide, retourner vide
    if (numbers.length === 0) {
      return "";
    }

    // Formater selon la longueur
    if (numbers.startsWith("261")) {
      // Format: 261 XX XX XXX XX
      const rest = numbers.substring(3);
      return formatWithSpaces(rest, "261");
    } else if (numbers.startsWith("0")) {
      // Format: 0XX XX XXX XX
      const rest = numbers.substring(1);
      return formatWithSpaces(rest, "0");
    } else {
      // Format: XX XX XXX XX (sans préfixe)
      return formatWithSpaces(numbers, "");
    }
  };

  const formatWithSpaces = (numbers, prefix) => {
    if (numbers.length <= 2) {
      return prefix ? `${prefix} ${numbers}` : numbers;
    } else if (numbers.length <= 4) {
      return prefix ? 
        `${prefix} ${numbers.substring(0, 2)} ${numbers.substring(2)}` :
        `${numbers.substring(0, 2)} ${numbers.substring(2)}`;
    } else if (numbers.length <= 7) {
      return prefix ?
        `${prefix} ${numbers.substring(0, 2)} ${numbers.substring(2, 4)} ${numbers.substring(4)}` :
        `${numbers.substring(0, 2)} ${numbers.substring(2, 4)} ${numbers.substring(4)}`;
    } else {
      return prefix ?
        `${prefix} ${numbers.substring(0, 2)} ${numbers.substring(2, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 9)}` :
        `${numbers.substring(0, 2)} ${numbers.substring(2, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 9)}`;
    }
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, "");
    
    // Validation: seulement des chiffres
    if (numbers.length > 0 && !/^\d+$/.test(numbers)) {
      setError("Le numéro de téléphone ne doit contenir que des chiffres");
    } else if (numbers.length > 0 && numbers.length < 10) {
      setError("Le numéro de téléphone doit contenir au moins 10 chiffres");
    } else if (numbers.length > 13) {
      setError("Le numéro de téléphone ne doit pas dépasser 13 chiffres");
    } else {
      setError("");
    }

    const formatted = formatPhoneNumber(input);
    onChange(formatted);
  };

  const handleBlur = () => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length > 0 && numbers.length < 10) {
      setError("Le numéro de téléphone doit contenir au moins 10 chiffres");
    } else if (numbers.length > 0 && numbers.length > 13) {
      setError("Le numéro de téléphone ne doit pas dépasser 13 chiffres");
    }
  };

  return (
    <div>
      <input
        type="tel"
        className="w-full border rounded px-3 py-2 mt-1"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="034 12 345 67 ou 261 34 12 345 67"
        required={required}
        maxLength={20}
      />
      {error && (
        <div className="text-red-600 text-xs mt-1">{error}</div>
      )}
      {!error && value.replace(/\D/g, "").length >= 10 && (
        <div className="text-green-600 text-xs mt-1">
          ✓ Format correct
        </div>
      )}
    </div>
  );
}

// Composant Input avec validation
function ValidatedInput({ 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required = false,
  label 
}) {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    if (type === "text") {
      // Validation pour texte: pas de chiffres
      if (/[0-9]/.test(inputValue)) {
        setError("Ce champ ne doit pas contenir de chiffres");
      } else {
        setError("");
      }
    } else if (type === "alphanumeric") {
      // Validation pour alphanumérique: lettres et chiffres autorisés
      if (!/^[a-zA-Z0-9\s\-_@.]*$/.test(inputValue)) {
        setError("Caractères spéciaux non autorisés (sauf - _ @ .)");
      } else {
        setError("");
      }
    }
    
    onChange(inputValue);
  };

  return (
    <div>
      <label className="font-medium text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type === "alphanumeric" ? "text" : type}
        className={`w-full border rounded px-3 py-2 mt-1 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
      {error && (
        <div className="text-red-600 text-xs mt-1">{error}</div>
      )}
    </div>
  );
}

// Modal création utilisateur
function ModalCreateUser({ open, onClose, selectedRole, onUserCreated }) {
  const [formData, setFormData] = useState({
    nom_complet: "",
    email: "",
    telephone: "",
    adresse: "",
    departement: "",
    username: "",
    password: "",
    password_confirmation: "",
    role: selectedRole || "Agent",
    responsabilites: "",
    specialisations: [],
    statut: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        role: selectedRole || "Agent",
        departement: "",
        specialisations: [],
        telephone: "",
      }));
      setError("");
    }
  }, [open, selectedRole]);

  // Départements disponibles selon le rôle
  const getAvailableDepartements = () => {
    return formData.role === "Agent" ? departements : departementsInvestigateur;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation des critères du mot de passe
    const passwordCriteria = [
      formData.password.length >= 8,
      /^[A-Z]/.test(formData.password),
      /\d/.test(formData.password),
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    ];

    if (!passwordCriteria.every(criterion => criterion)) {
      setError("Le mot de passe ne respecte pas tous les critères de sécurité");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    // Validation du téléphone
    const phoneNumbers = formData.telephone.replace(/\D/g, '');
    if (phoneNumbers.length > 0 && phoneNumbers.length < 10) {
      setError("Le numéro de téléphone doit contenir au moins 10 chiffres");
      setLoading(false);
      return;
    }

    try {
      const response = await teamService.createUser(formData);

      if (response.success) {
        onUserCreated(response.data);
        onClose();
        // Réinitialiser le formulaire
        setFormData({
          nom_complet: "",
          email: "",
          telephone: "",
          adresse: "",
          departement: "",
          username: "",
          password: "",
          password_confirmation: "",
          role: selectedRole || "Agent",
          responsabilites: "",
          specialisations: [],
          statut: true,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialisationChange = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specialisations: prev.specialisations.includes(spec)
        ? prev.specialisations.filter((s) => s !== spec)
        : [...prev.specialisations, spec],
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          disabled={loading}
        >
          &times;
        </button>

        <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span role="img" aria-label="lock">
            🔒
          </span>
          Créer un Utilisateur
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <ValidatedInput
            type="text"
            label="Nom complet"
            value={formData.nom_complet}
            onChange={(value) => setFormData(prev => ({ ...prev, nom_complet: value }))}
            required={true}
          />

          <div>
            <label className="font-medium text-sm">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="font-medium text-sm">Téléphone <span className="text-red-500">*</span></label>
            <PhoneInput
              value={formData.telephone}
              onChange={(value) => setFormData(prev => ({ ...prev, telephone: value }))}
              required={true}
            />
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Adresse"
            value={formData.adresse}
            onChange={(value) => setFormData(prev => ({ ...prev, adresse: value }))}
            placeholder="Ex: 123 Rue Principale, Antananarivo"
          />

          {/* ROLE EN PREMIER */}
          <div>
            <label className="font-medium text-sm">Rôle <span className="text-red-500">*</span></label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value,
                  departement: "", // Réinitialiser le département quand le rôle change
                }))
              }
              required
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* DÉPARTEMENT AVEC RESTRICTIONS */}
          <div>
            <label className="font-medium text-sm">Département <span className="text-red-500">*</span></label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.departement}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  departement: e.target.value,
                }))
              }
              required
            >
              <option value="">Sélectionner un département</option>
              {getAvailableDepartements().map((dep) => (
                <option value={dep} key={dep}>
                  {dep}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {formData.role === "Agent"
                ? "Départements disponibles pour les Agents"
                : "Département BIANCO pour les Investigateurs"}
            </div>
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Nom d'utilisateur"
            value={formData.username}
            onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
            placeholder="ex: prenom.nom"
            required={true}
          />

          <div>
            <label className="font-medium text-sm">Mot de passe <span className="text-red-500">*</span></label>
            <PasswordInput
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div>
            <label className="font-medium text-sm">
              Confirmer mot de passe <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password_confirmation: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="statut"
              className="mr-2"
              checked={formData.statut}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, statut: e.target.checked }))
              }
            />
            <label htmlFor="statut" className="text-sm font-medium">
              Statut Actif
            </label>
          </div>

          {/* Specifiques selon role */}
          {formData.role === "Agent" ? (
            <div>
              <label className="font-medium text-sm">Responsabilités</label>
              <textarea
                className="w-full border rounded px-3 py-2 mt-1"
                rows="2"
                value={formData.responsabilites}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    responsabilites: e.target.value,
                  }))
                }
                placeholder="Décrivez les responsabilités..."
              />
            </div>
          ) : (
            <>
              <div className="font-medium text-sm mb-1">Spécialisations</div>
              <div className="flex flex-col mb-2 gap-1">
                {specialisations.map((spec) => (
                  <label
                    key={spec}
                    className="flex items-center text-sm font-normal"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialisations?.includes(spec) || false}
                      onChange={() => handleSpecialisationChange(spec)}
                      className="mr-2"
                    />
                    {spec}
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 px-4 py-2 rounded text-gray-700"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 px-5 py-2 rounded text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Création..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal édition utilisateur
function ModalEditUser({ open, onClose, user, onUserUpdated }) {
  const [formData, setFormData] = useState({
    nom_complet: "",
    email: "",
    telephone: "",
    adresse: "",
    departement: "",
    username: "",
    role: "Agent",
    responsabilites: "",
    specialisations: [],
    statut: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      setFormData({
        nom_complet: user.nom_complet || "",
        email: user.email || "",
        telephone: user.telephone || "",
        adresse: user.adresse || "",
        departement: user.departement || "",
        username: user.username || "",
        role: user.role || "Agent",
        responsabilites: user.responsabilites || "",
        specialisations: user.specialisations || [],
        statut: user.statut ?? true,
      });
      setError("");
    }
  }, [open, user]);

  // Départements disponibles selon le rôle
  const getAvailableDepartements = () => {
    return formData.role === "Agent" ? departements : departementsInvestigateur;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation du téléphone
    const phoneNumbers = formData.telephone.replace(/\D/g, '');
    if (phoneNumbers.length > 0 && phoneNumbers.length < 10) {
      setError("Le numéro de téléphone doit contenir au moins 10 chiffres");
      setLoading(false);
      return;
    }

    try {
      const response = await teamService.updateUser(user.id, formData);

      if (response.success) {
        onUserUpdated(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialisationChange = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specialisations: prev.specialisations?.includes(spec)
        ? prev.specialisations.filter((s) => s !== spec)
        : [...(prev.specialisations || []), spec],
    }));
  };

  if (!open || !user) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          disabled={loading}
        >
          &times;
        </button>

        <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span role="img" aria-label="edit">
            ✏️
          </span>
          Modifier l'Utilisateur
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <ValidatedInput
            type="text"
            label="Nom complet"
            value={formData.nom_complet}
            onChange={(value) => setFormData(prev => ({ ...prev, nom_complet: value }))}
            required={true}
          />

          <div>
            <label className="font-medium text-sm">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="font-medium text-sm">Téléphone <span className="text-red-500">*</span></label>
            <PhoneInput
              value={formData.telephone}
              onChange={(value) => setFormData(prev => ({ ...prev, telephone: value }))}
              required={true}
            />
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Adresse"
            value={formData.adresse}
            onChange={(value) => setFormData(prev => ({ ...prev, adresse: value }))}
            placeholder="Ex: 123 Rue Principale, Antananarivo"
          />

          {/* ROLE EN PREMIER */}
          <div>
            <label className="font-medium text-sm">Rôle <span className="text-red-500">*</span></label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value,
                  departement: "", // Réinitialiser le département quand le rôle change
                }))
              }
              required
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* DÉPARTEMENT AVEC RESTRICTIONS */}
          <div>
            <label className="font-medium text-sm">Département <span className="text-red-500">*</span></label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.departement}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  departement: e.target.value,
                }))
              }
              required
            >
              <option value="">Sélectionner un département</option>
              {getAvailableDepartements().map((dep) => (
                <option value={dep} key={dep}>
                  {dep}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {formData.role === "Agent"
                ? "Départements disponibles pour les Agents"
                : "Département BIANCO pour les Investigateurs"}
            </div>
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Nom d'utilisateur"
            value={formData.username}
            onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
            required={true}
          />

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="statut"
              className="mr-2"
              checked={formData.statut}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, statut: e.target.checked }))
              }
            />
            <label htmlFor="statut" className="text-sm font-medium">
              Statut Actif
            </label>
          </div>

          {/* Specifiques selon role */}
          {formData.role === "Agent" ? (
            <div>
              <label className="font-medium text-sm">Responsabilités</label>
              <textarea
                className="w-full border rounded px-3 py-2 mt-1"
                rows="2"
                value={formData.responsabilites}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    responsabilites: e.target.value,
                  }))
                }
                placeholder="Décrivez les responsabilités..."
              />
            </div>
          ) : (
            <>
              <div className="font-medium text-sm mb-1">Spécialisations</div>
              <div className="flex flex-col mb-2 gap-1">
                {specialisations.map((spec) => (
                  <label
                    key={spec}
                    className="flex items-center text-sm font-normal"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialisations?.includes(spec) || false}
                      onChange={() => handleSpecialisationChange(spec)}
                      className="mr-2"
                    />
                    {spec}
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 px-4 py-2 rounded text-gray-700"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 px-5 py-2 rounded text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Modification..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal réinitialisation mot de passe
function ModalResetPassword({ open, onClose, user, onPasswordReset }) {
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData({ password: "", password_confirmation: "" });
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation des critères du mot de passe
    const passwordCriteria = [
      formData.password.length >= 8,
      /^[A-Z]/.test(formData.password),
      /\d/.test(formData.password),
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    ];

    if (!passwordCriteria.every(criterion => criterion)) {
      setError("Le mot de passe ne respecte pas tous les critères de sécurité");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await teamService.resetPassword(user.id, formData);

      if (response.success) {
        onPasswordReset();
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la réinitialisation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          disabled={loading}
        >
          &times;
        </button>

        <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span role="img" aria-label="key">
            🔑
          </span>
          Réinitialiser le mot de passe
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Réinitialiser le mot de passe pour <strong>{user.nom_complet}</strong>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-medium text-sm">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div>
            <label className="font-medium text-sm">
              Confirmer mot de passe <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password_confirmation: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 px-4 py-2 rounded text-gray-700"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 px-5 py-2 rounded text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal suppression
function ConfirmDeleteModal({ open, user, onCancel, onConfirm, loading }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative">
        <div className="font-semibold text-lg mb-2">
          Confirmer la Suppression
        </div>
        <div className="mb-3 text-gray-700">
          Êtes-vous sûr de vouloir supprimer
          <span className="font-bold"> {user.nom_complet} </span>?
        </div>
        <div className="mb-5 bg-red-100 border-l-4 border-red-400 px-4 py-2 flex items-center gap-2 rounded">
          <span className="text-xl text-red-500">⚠️</span>
          <span className="text-red-700 text-sm">
            Cette action est irréversible
          </span>
        </div>
        <div className="flex gap-4 justify-start mt-2">
          <button
            className="bg-gray-100 rounded px-6 py-2 text-gray-700 font-medium disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className="bg-red-600 rounded px-6 py-2 text-white font-medium hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Confirmer la Suppression"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast succès
function SuccessToast({ open, message, onClose }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-white border-l-4 border-teal-700 rounded-xl shadow p-4 min-w-[280px] flex flex-col">
        <div className="flex items-center gap-2 font-semibold text-teal-700 mb-1">
          <span className="text-xl">✓</span> Succès
        </div>
        <div className="text-gray-700 text-sm">{message}
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function EquipeView() {
  const [activeTab, setActiveTab] = useState("agents");
  const [agents, setAgents] = useState([]);
  const [investigateurs, setInvestigateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("Agent");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [successToastOpen, setSuccessToastOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Charger les données une seule fois au montage
  useEffect(() => {
    if (!dataLoaded) {
      loadAllData();
    }
  }, []);

  // Recharger les données quand l'onglet change (seulement si pas déjà chargé)
  useEffect(() => {
    if (dataLoaded) {
      // Pas de rechargement, utilisation des données déjà chargées
    }
  }, [activeTab, dataLoaded]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Charger agents et investigateurs en parallèle
      const [agentsResponse, investigateursResponse] = await Promise.all([
        teamService.getAgents(),
        teamService.getInvestigateurs(),
      ]);

      if (agentsResponse.success) {
        setAgents(agentsResponse.data);
      }
      if (investigateursResponse.success) {
        setInvestigateurs(investigateursResponse.data);
      }

      setDataLoaded(true);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      showSuccess("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setSuccessToastOpen(true);
  };

  // Handlers création
  const handleCreateUser = () => {
    setModalRole(activeTab === "investigateurs" ? "Investigateur" : "Agent");
    setModalOpen(true);
  };

  const handleUserCreated = (newUser) => {
    // Mise à jour optimiste des données locales
    if (newUser.role === "Agent") {
      setAgents((prev) => [...prev, newUser]);
    } else {
      setInvestigateurs((prev) => [...prev, newUser]);
    }
    showSuccess("Utilisateur créé avec succès");
  };

  // Handlers édition
  const handleEditClick = (user) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const handleUserUpdated = (updatedUser) => {
    // Mise à jour optimiste des données locales
    if (updatedUser.role === "Agent") {
      setAgents((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    } else {
      setInvestigateurs((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    }
    showSuccess("Utilisateur modifié avec succès");
  };

  // Handlers mot de passe
  const handleResetPasswordClick = (user) => {
    setUserToReset(user);
    setResetPasswordModalOpen(true);
  };

  const handlePasswordReset = () => {
    showSuccess("Mot de passe réinitialisé avec succès");
  };

  // Handlers suppression
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await teamService.deleteUser(userToDelete.id);
      if (response.success) {
        // Mise à jour optimiste des données locales
        if (userToDelete.role === "Agent") {
          setAgents((prev) => prev.filter((u) => u.id !== userToDelete.id));
        } else {
          setInvestigateurs((prev) =>
            prev.filter((u) => u.id !== userToDelete.id)
          );
        }
        showSuccess("Utilisateur supprimé avec succès");
      }
    } catch (error) {
      showSuccess("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
      setConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Handler statut
  const handleToggleStatus = async (user) => {
    try {
      const response = await teamService.toggleStatus(user.id);
      if (response.success) {
        // Mise à jour optimiste des données locales
        const updatedUser = { ...user, statut: response.data.statut };
        if (user.role === "Agent") {
          setAgents((prev) =>
            prev.map((u) => (u.id === user.id ? updatedUser : u))
          );
        } else {
          setInvestigateurs((prev) =>
            prev.map((u) => (u.id === user.id ? updatedUser : u))
          );
        }
        showSuccess(
          `Utilisateur ${
            response.data.statut ? "activé" : "désactivé"
          } avec succès`
        );
      }
    } catch (error) {
      showSuccess("Erreur lors du changement de statut");
    }
  };

  // Handler export CSV
  const handleExportCSV = () => {
    const users = activeTab === "agents" ? agents : investigateurs;
    const filename = activeTab === "agents" ? "agents" : "investigateurs";
    exportToCSV(users, filename);
    showSuccess(`Données ${filename} exportées avec succès`);
  };

  // Rendu des tables avec données de la base de données
  const renderUserTable = (users, role) => (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              ID
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              NOM COMPLET
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              EMAIL
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              TÉLÉPHONE
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              DÉPARTEMENT
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              USERNAME
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              RÔLE
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              STATUT
            </th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-600">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-blue-50 text-sm">
              <td className="px-3 py-2">{u.id}</td>
              <td className="px-3 py-2 font-medium">{u.nom_complet}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.telephone}</td>
              <td className="px-3 py-2">{u.departement}</td>
              <td className="px-3 py-2">{u.username}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    u.role === "Agent"
                      ? "bg-blue-50 text-blue-800"
                      : "bg-orange-50 text-orange-800"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="px-3 py-2">
                {u.statut ? (
                  <span className="px-3 py-1 text-xs bg-green-50 text-green-800 rounded-full flex items-center gap-1">
                    <span role="img" aria-label="active">
                      ✔️
                    </span>{" "}
                    Actif
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs bg-gray-200 text-gray-500 rounded-full">
                    Inactif
                  </span>
                )}
              </td>
              <td className="px-3 py-2 flex gap-2 items-center">
                <button
                  title="Éditer"
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleEditClick(u)}
                >
                  <span role="img" aria-label="edit">
                    ✏️
                  </span>
                </button>
                <button
                  title="Réinitialiser mot de passe"
                  className="text-orange-400 hover:text-orange-600"
                  onClick={() => handleResetPasswordClick(u)}
                >
                  <span role="img" aria-label="reset">
                    🔑
                  </span>
                </button>
                <button
                  title="Supprimer"
                  onClick={() => handleDeleteClick(u)}
                  className="text-red-500 hover:text-red-700"
                >
                  <span role="img" aria-label="delete">
                    🗑️
                  </span>
                </button>
                <button
                  title={u.statut ? "Désactiver" : "Activer"}
                  onClick={() => handleToggleStatus(u)}
                  className={
                    u.statut
                      ? "text-gray-400 hover:text-gray-700"
                      : "text-green-500 hover:text-green-700"
                  }
                >
                  <span role="img" aria-label="power-off">
                    ⏻
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Calcul des totaux
  const totalUsers = agents.length + investigateurs.length;
  const totalActiveUsers = agents.filter(a => a.statut).length + investigateurs.filter(i => i.statut).length;

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-1">
        Gestion de l'équipe de Suivi
      </h1>
      <div className="text-gray-600 mb-6 text-sm">
        Gestion complète de l'équipe : Agents, Investigateurs et Permissions
      </div>

      {/* Vue d'ensemble avec données réelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <span className="text-3xl">👥</span>
            <div>
              <div className="text-xs text-gray-500">Nombre total d'Utilisateurs</div>
              <div className="text-2xl font-bold text-gray-800 mt-1">
                {totalUsers}
              </div>
              <div className="text-xs text-gray-500">
                {totalActiveUsers} actifs
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <span className="text-3xl">👤</span>
            <div>
              <div className="text-xs text-gray-500">Nombre total d'Agents</div>
              <div className="text-2xl font-bold text-gray-800 mt-1">
                {agents.length}
              </div>
              <div className="text-xs text-gray-500">
                {agents.filter((a) => a.statut).length} actifs
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <span className="text-3xl">🔍</span>
            <div>
              <div className="text-xs text-gray-500">
                Nombre total d'Investigateurs
              </div>
              <div className="text-2xl font-bold text-gray-800 mt-1">
                {investigateurs.length}
              </div>
              <div className="text-xs text-gray-500">
                {investigateurs.filter((i) => i.statut).length} actifs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets + Actions */}
      <div className="flex flex-wrap items-center justify-between mb-1">
        <div className="flex gap-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center pb-2 text-sm border-b-2 px-3 font-semibold gap-1 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id !== "roles" && (
                <span className="ml-1 bg-gray-200 text-xs rounded-full px-2">
                  {tab.id === "agents" ? agents.length : investigateurs.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-2 md:mt-0">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded font-medium flex items-center gap-2 shadow hover:bg-blue-700 text-sm"
            onClick={handleCreateUser}
          >
            <span role="img" aria-label="plus">
              🔒
            </span>{" "}
            Créer un Utilisateur
          </button>
          <button 
            className="bg-gray-100 border border-gray-300 rounded px-5 py-2 text-gray-700 font-medium flex items-center gap-2 shadow hover:bg-gray-200 text-sm"
            onClick={handleExportCSV}
          >
            <span role="img" aria-label="download">
              📁
            </span>{" "}
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Tables Agents/Investigateurs avec données de la base de données */}
      <div className="mt-5">
        {loading && !dataLoaded ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === "agents" && (
              <>
                <div className="text-base font-semibold mb-2">
                  Agents (Suivi + Traitement)
                </div>
                {agents.length > 0 ? (
                  renderUserTable(agents, "Agent")
                ) : (
                  <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                    Aucun agent trouvé dans la base de données
                  </div>
                )}
              </>
            )}

            {activeTab === "investigateurs" && (
              <>
                <div className="text-base font-semibold mb-2">
                  Investigateurs
                </div>
                {investigateurs.length > 0 ? (
                  renderUserTable(investigateurs, "Investigateur")
                ) : (
                  <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                    Aucun investigateur trouvé dans la base de données
                  </div>
                )}
              </>
            )}

            {activeTab === "roles" && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">
                  Configuration des Rôles et Permissions
                </h2>
                <div className="text-gray-600 text-sm mb-6">
                  Gérer les permissions par rôle
                </div>
                <div className="space-y-8">
                  {/* Bloc AGENT */}
                  <div className="bg-blue-50 border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b bg-blue-50 font-semibold">
                      AGENT
                    </div>
                    <div className="p-6">
                      <div className="mb-4 text-gray-700 text-sm">
                        Agent responsable de la collecte, classification,
                        traitement et rapports
                      </div>
                      <div className="space-y-2 mb-6">
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent1"
                          />
                          <label htmlFor="agent1">Réceptionner doléances</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent2"
                          />
                          <label htmlFor="agent2">Classer signalements</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent3"
                          />
                          <label htmlFor="agent3">Créer tableau de bord</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent4"
                          />
                          <label htmlFor="agent4">Traiter dossiers</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent5"
                          />
                          <label htmlFor="agent5">Rédiger rapports</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent6"
                          />
                          <label htmlFor="agent6">
                            Transmettre aux autorités
                          </label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="agent7"
                          />
                          <label htmlFor="agent7">Voir statistiques</label>
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">
                        Enregistrer permissions
                      </button>
                    </div>
                  </div>

                  {/* Bloc INVESTIGATEUR */}
                  <div className="bg-blue-50 border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b bg-blue-50 font-semibold">
                      INVESTIGATEUR
                    </div>
                    <div className="p-6">
                      <div className="mb-4 text-gray-700 text-sm">
                        Investigateur responsable de l'investigation et
                        vérification
                      </div>
                      <div className="space-y-2 mb-6">
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="inv1"
                          />
                          <label htmlFor="inv1">Mener investigations</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="inv2"
                          />
                          <label htmlFor="inv2">Collecter preuves</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="inv3"
                          />
                          <label htmlFor="inv3">
                            Produire rapports investigation
                          </label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="inv4"
                          />
                          <label htmlFor="inv4">Contacter citoyens</label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="accent-blue-600 mr-2"
                            id="inv5"
                          />
                          <label htmlFor="inv5">Voir dossiers</label>
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold">
                        Enregistrer permissions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <ModalCreateUser
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedRole={modalRole}
        onUserCreated={handleUserCreated}
      />

      <ModalEditUser
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />

      <ModalResetPassword
        open={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        user={userToReset}
        onPasswordReset={handlePasswordReset}
      />

      <ConfirmDeleteModal
        open={confirmModalOpen}
        user={userToDelete}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      <SuccessToast
        open={successToastOpen}
        message={successMessage}
        onClose={() => setSuccessToastOpen(false)}
      />
    </div>
  );
}
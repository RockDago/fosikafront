import React, { useState, useEffect } from "react";
import { teamService } from "../../services/teamService";
import { Power, PowerOff } from "lucide-react";

const tabs = [
  { id: "agents", label: "Agents", icon: "👤" },
  { id: "investigateurs", label: "Investigateurs", icon: "🔍" },
  { id: "administrateurs", label: "Administrateurs", icon: "👑" },
  { id: "roles", label: "Rôles et Permissions", icon: "🔑" },
];

const departements = ["DAAQ", "DRSE"];
const departementsInvestigateur = ["CAC", "DAGI"];

// Helper: Rôles standards du backend
const STANDARD_ROLES = [
  { id: 1, name: "Admin", code: "Admin" },
  { id: 2, name: "Agent", code: "Agent" },
  { id: 3, name: "Investigateur", code: "Investigateur" },
];

// Helper: Obtenir l'objet rôle à partir d'une chaîne (ex. 'Agent' -> {id: 2, name: 'Agent', code: 'Agent'})
const getRoleByName = (roleName) => {
  if (!roleName) return null;
  return STANDARD_ROLES.find((r) => r.code === roleName || r.name === roleName);
};

// Helper: Obtenir le nom formaté du rôle
const formatRoleName = (role) => {
  if (!role) return "Non défini";
  if (typeof role === "string") {
    const foundRole = getRoleByName(role);
    return foundRole?.name || role;
  }
  return role?.name || "Non défini";
};

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
    "Responsabilités",
  ];

  const csvContent = [
    headers.join(","),
    ...users.map((user) =>
      [
        user.id,
        `"${user.nom_complet || ""}"`,
        `"${user.email || ""}"`,
        `"${user.telephone || ""}"`,
        `"${user.departement || ""}"`,
        `"${user.username || ""}"`,
        `"${user.role?.name || ""}"`,
        `"${user.statut ? "Actif" : "Inactif"}"`,
        `"${(user.specialisations || []).join(", ") || ""}"`,
        `"${user.responsabilites || ""}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
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

  const allMet = criteria.every((criterion) => criterion.met);

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
        <div
          className={`mt-2 text-xs font-medium ${
            allMet ? "text-green-700" : "text-red-700"
          }`}
        >
          {allMet
            ? "✓ Tous les critères sont respectés"
            : "✗ Certains critères ne sont pas respectés"}
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
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
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
    const numbers = input.replace(/\D/g, "");
    if (numbers.length === 0) return "";

    if (numbers.startsWith("261")) {
      const rest = numbers.substring(3);
      return formatWithSpaces(rest, "261");
    } else if (numbers.startsWith("0")) {
      const rest = numbers.substring(1);
      return formatWithSpaces(rest, "0");
    } else {
      return formatWithSpaces(numbers, "");
    }
  };

  const formatWithSpaces = (numbers, prefix) => {
    if (numbers.length <= 2) {
      return prefix ? `${prefix} ${numbers}` : numbers;
    } else if (numbers.length <= 4) {
      return prefix
        ? `${prefix} ${numbers.substring(0, 2)} ${numbers.substring(2)}`
        : `${numbers.substring(0, 2)} ${numbers.substring(2)}`;
    } else if (numbers.length <= 7) {
      return prefix
        ? `${prefix} ${numbers.substring(0, 2)} ${numbers.substring(
            2,
            4
          )} ${numbers.substring(4)}`
        : `${numbers.substring(0, 2)} ${numbers.substring(
            2,
            4
          )} ${numbers.substring(4)}`;
    } else {
      return prefix
        ? `${prefix} ${numbers.substring(0, 2)} ${numbers.substring(
            2,
            4
          )} ${numbers.substring(4, 7)} ${numbers.substring(7, 9)}`
        : `${numbers.substring(0, 2)} ${numbers.substring(
            2,
            4
          )} ${numbers.substring(4, 7)} ${numbers.substring(7, 9)}`;
    }
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, "");

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
        placeholder="03X XX XXX XX ou 261 3X XX XXX XX"
        required={required}
        maxLength={20}
      />
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
      {!error && value.replace(/\D/g, "").length >= 10 && (
        <div className="text-green-600 text-xs mt-1">✓ Format correct</div>
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
  label,
}) {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (type === "text") {
      if (/[0-9]/.test(inputValue)) {
        setError("Ce champ ne doit pas contenir de chiffres");
      } else {
        setError("");
      }
    } else if (type === "alphanumeric") {
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
      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
  );
}

// Modal création utilisateur
function CreateUserModal({ open, onClose, selectedRole, onUserCreated }) {
  const [formData, setFormData] = useState({
    nom_complet: "",
    email: "",
    telephone: "",
    adresse: "",
    departement: "",
    username: "",
    password: "",
    password_confirmation: "",
    role_id: "",
    responsabilites: "",
    specialisations: [],
    statut: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableRoles, setAvailableRoles] = useState(STANDARD_ROLES);

  useEffect(() => {
    if (open) {
      setAvailableRoles(STANDARD_ROLES);
      setFormData((prev) => ({
        ...prev,
        role_id: selectedRole || "",
        departement: "",
        specialisations: [],
        telephone: "",
      }));
      setError("");
    }
  }, [open, selectedRole]);

  const getAvailableDepartements = () => {
    console.log("🔍 DEBUG getAvailableDepartements:", {
      role_id: formData.role_id,
      availableRoles: availableRoles,
      type_role_id: typeof formData.role_id,
    });

    if (!formData.role_id) {
      console.log("❌ Pas de role_id");
      return [];
    }

    const currentRole = availableRoles.find((r) => r.id === formData.role_id);
    console.log("🎯 Rôle trouvé:", currentRole);

    if (!currentRole) return [];

    switch (currentRole.code) {
      case "Agent":
        return ["DAAQ", "DRSE"];
      case "Investigateur":
        return ["CAC", "DAGI"];
      case "Admin":
        return ["DAAQ", "DRSE", "CAC", "DAGI"];
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const passwordCriteria = [
      formData.password.length >= 8,
      /^[A-Z]/.test(formData.password),
      /\d/.test(formData.password),
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    ];

    if (!passwordCriteria.every((criterion) => criterion)) {
      setError("Le mot de passe ne respecte pas tous les critères de sécurité");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const phoneNumbers = formData.telephone.replace(/\D/g, "");
    if (phoneNumbers.length > 0 && phoneNumbers.length < 10) {
      setError("Le numéro de téléphone doit contenir au moins 10 chiffres");
      setLoading(false);
      return;
    }

    if (!formData.departement) {
      setError("Veuillez sélectionner un département");
      setLoading(false);
      return;
    }

    try {
      const response = await teamService.createUser(formData);
      if (response.success) {
        onUserCreated(response.data);
        onClose();
        setFormData({
          nom_complet: "",
          email: "",
          telephone: "",
          adresse: "",
          departement: "",
          username: "",
          password: "",
          password_confirmation: "",
          role_id: "",
          responsabilites: "",
          specialisations: [],
          statut: true,
        });
      }
    } catch (err) {
      // Meilleure gestion des erreurs de validation
      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        if (errors && typeof errors === "object") {
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return msg;
            })
            .join("\n");
          setError(errorMessages || "Erreur de validation");
        } else {
          setError(err.response?.data?.message || "Erreur de validation");
        }
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la création"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const availableDepartements = getAvailableDepartements();
  const currentRole = availableRoles.find((r) => r.id === formData.role_id);

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
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, nom_complet: value }))
            }
            required={true}
          />

          <div>
            <label className="font-medium text-sm">
              Email <span className="text-red-500">*</span>
            </label>
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
            <label className="font-medium text-sm">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              value={formData.telephone}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, telephone: value }))
              }
              required={true}
            />
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Adresse"
            value={formData.adresse}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, adresse: value }))
            }
            placeholder="Ex: 123 Rue Principale, Antananarivo"
          />

          <div>
            <label className="font-medium text-sm">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.role_id || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role_id: parseInt(e.target.value) || "",
                  departement: "",
                }))
              }
              required
            >
              <option value="">Sélectionner un rôle</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-sm">
              Département <span className="text-red-500">*</span>
            </label>
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
              disabled={!formData.role_id || availableDepartements.length === 0}
            >
              <option value="">Sélectionner un département</option>
              {availableDepartements.map((dep, index) => (
                <option key={index} value={dep}>
                  {dep}
                </option>
              ))}
            </select>

            <div className="text-xs mt-1">
              {!formData.role_id ? (
                <span className="text-gray-500">
                  Sélectionnez d'abord un rôle
                </span>
              ) : availableDepartements.length === 0 ? (
                <span className="text-red-500">
                  Aucun département disponible pour ce rôle
                </span>
              ) : currentRole?.code === "Agent" ? (
                <span className="text-blue-600">
                  Départements disponibles pour l'Équipe de Suivi
                </span>
              ) : currentRole?.code === "Investigateur" ? (
                <span className="text-orange-600">
                  Départements disponibles pour l'Équipe d'Investigation
                </span>
              ) : (
                <span className="text-purple-600">
                  Tous les départements disponibles
                </span>
              )}
            </div>

            {availableDepartements.length > 0 && (
              <div className="text-xs text-green-600 mt-1">
                {availableDepartements.length} département(s) disponible(s)
              </div>
            )}
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Nom d'utilisateur"
            value={formData.username}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, username: value }))
            }
            placeholder="ex: prenom.nom"
            required={true}
          />

          <div>
            <label className="font-medium text-sm">
              Mot de passe <span className="text-red-500">*</span>
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

          {formData.role_id &&
          availableRoles.find((r) => r.id === formData.role_id)?.code ===
            "Agent" ? (
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
          ) : null}

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
    role_id: "",
    responsabilites: "",
    specialisations: [],
    statut: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableRoles, setAvailableRoles] = useState(STANDARD_ROLES);

  useEffect(() => {
    if (open && user) {
      setAvailableRoles(STANDARD_ROLES);
      setFormData({
        nom_complet: user.nom_complet || "",
        email: user.email || "",
        telephone: user.telephone || "",
        adresse: user.adresse || "",
        departement: user.departement || "",
        username: user.username || "",
        role_id: user.role?.id || getRoleByName(user.role)?.id || "",
        responsabilites: user.responsabilites || "",
        specialisations: user.specialisations || [],
        statut: user.statut ?? true,
      });
      setError("");
    }
  }, [open, user]);

  const getAvailableDepartements = () => {
    const selectedRole = availableRoles.find((r) => r.id === formData.role_id);
    if (!selectedRole) return [];

    switch (selectedRole.code) {
      case "Agent":
        return departements;
      case "Investigateur":
        return departementsInvestigateur;
      case "Admin":
        return [...departements, ...departementsInvestigateur];
      default:
        return [];
    }
  };

  // Dans le composant ModalEditUser - amélioration de la gestion des erreurs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const phoneNumbers = formData.telephone.replace(/\D/g, "");
    if (phoneNumbers.length > 0 && phoneNumbers.length < 10) {
      setError("Le numéro de téléphone doit contenir au moins 10 chiffres");
      setLoading(false);
      return;
    }

    // CORRECTION : Validation du rôle
    if (!formData.role_id) {
      setError("Veuillez sélectionner un rôle");
      setLoading(false);
      return;
    }

    try {
      // Envoyer les données sans modification supplémentaire
      const response = await teamService.updateUser(user.id, formData);

      if (response.success) {
        onUserUpdated(response.data);
        onClose();
      }
    } catch (err) {
      // CORRECTION : Meilleure gestion des erreurs de validation
      if (err.errors) {
        const firstError = Object.values(err.errors)[0]?.[0];
        setError(firstError || err.message || "Erreur lors de la modification");
      } else {
        setError(err.message || "Erreur lors de la modification");
      }
    } finally {
      setLoading(false);
    }
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
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, nom_complet: value }))
            }
            required={true}
          />

          <div>
            <label className="font-medium text-sm">
              Email <span className="text-red-500">*</span>
            </label>
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
            <label className="font-medium text-sm">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              value={formData.telephone}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, telephone: value }))
              }
              required={true}
            />
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Adresse"
            value={formData.adresse}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, adresse: value }))
            }
            placeholder="Ex: 123 Rue Principale, Antananarivo"
          />

          <div>
            <label className="font-medium text-sm">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded px-3 py-2 mt-1"
              value={formData.role_id || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role_id: parseInt(e.target.value) || "",
                }))
              }
              required
            >
              <option value="">Sélectionner un rôle</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium text-sm">
              Département <span className="text-red-500">*</span>
            </label>
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
              {formData.role_id
                ? availableRoles.find((r) => r.id === formData.role_id)
                    ?.code === "Agent"
                  ? "Départements disponibles pour l'Équipe de Suivi"
                  : "Départements disponibles pour l'Équipe d'Investigation"
                : "Sélectionnez d'abord un rôle"}
            </div>
          </div>

          <ValidatedInput
            type="alphanumeric"
            label="Nom d'utilisateur"
            value={formData.username}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, username: value }))
            }
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

          {formData.role_id &&
          availableRoles.find((r) => r.id === formData.role_id)?.code ===
            "Agent" ? (
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
          ) : null}

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

    const passwordCriteria = [
      formData.password.length >= 8,
      /^[A-Z]/.test(formData.password),
      /\d/.test(formData.password),
      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    ];

    if (!passwordCriteria.every((criterion) => criterion)) {
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
        <div className="text-gray-700 text-sm">{message}</div>
      </div>
    </div>
  );
}

// Composant principal
export default function EquipeView() {
  const [activeTab, setActiveTab] = useState("agents");
  const [agents, setAgents] = useState([]);
  const [investigateurs, setInvestigateurs] = useState([]);
  const [administrateurs, setAdministrateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("");
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
      loadRoles();
    }
  }, [dataLoaded]);

  // Rafraîchir les données toutes les 30 secondes (au lieu de 1 seconde) pour éviter le rate limiting
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 30000); // Rafraîchir chaque 30 secondes (30000ms)

    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Chargement des données team...");
      // Charger d'abord les rôles pour disposer des codes / ids fiables
      const roleMap = {};
      try {
        const rolesResp = await teamService.getRoles();
        if (rolesResp?.success) {
          const rolesData = rolesResp.data || [];
          setAvailableRoles(rolesData);
          rolesData.forEach((r) => {
            if (r && r.id != null) {
              roleMap[r.id] = {
                code: (r.code || "").toString().toUpperCase(),
                name: (r.name || "").toString().toUpperCase(),
              };
            }
          });
        }
      } catch (rolesErr) {
        console.warn("Impossible de charger les rôles:", rolesErr);
      }

      // Essayer d'abord d'utiliser les endpoints dédiés fournis par le backend
      const extractUsers = (resp) => {
        if (!resp) return [];
        // resp peut être { success:true, data: [...] } ou directement { data: [...] } ou [...]
        if (Array.isArray(resp)) return resp;
        if (resp.success && Array.isArray(resp.data)) return resp.data;
        if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
        if (resp.data && Array.isArray(resp.data)) return resp.data;
        return [];
      };

      let adminsResp = null;
      let agentsResp = null;
      let investigResp = null;

      try {
        [adminsResp, agentsResp, investigResp] = await Promise.all([
          teamService.getAdministrateurs().catch((e) => {
            console.debug("getAdministrateurs failed", e);
            return null;
          }),
          teamService.getAgents().catch((e) => {
            console.debug("getAgents failed", e);
            return null;
          }),
          teamService.getInvestigateurs().catch((e) => {
            console.debug("getInvestigateurs failed", e);
            return null;
          }),
        ]);
      } catch (err) {
        console.debug("Erreur Promise.all endpoints dédiés:", err);
      }

      const adminsFromApi = extractUsers(adminsResp);
      const agentsFromApi = extractUsers(agentsResp);
      const investigFromApi = extractUsers(investigResp);

      let allUsers = [];
      // Si au moins un endpoint dédié a renvoyé des données, on les utilise
      if (
        adminsFromApi.length > 0 ||
        agentsFromApi.length > 0 ||
        investigFromApi.length > 0
      ) {
        console.log(
          "📡 Utilisation des endpoints dédiés pour la classification"
        );
        setAdministrateurs(adminsFromApi || []);
        setAgents(agentsFromApi || []);
        setInvestigateurs(investigFromApi || []);
        setDataLoaded(true);
        setLoading(false);
        return;
      }

      // Sinon récupérer l'ensemble des utilisateurs et retomber sur la classification locale
      try {
        const response = await teamService.getAllUsers();
        if (response && response.success && Array.isArray(response.data)) {
          allUsers = response.data;
        } else if (Array.isArray(response)) {
          allUsers = response;
        } else if (response && Array.isArray(response.data?.data)) {
          allUsers = response.data.data;
        } else if (response && Array.isArray(response.data)) {
          allUsers = response.data;
        }
      } catch (e) {
        try {
          const response = await teamService.getUsers();
          if (response && response.success && Array.isArray(response.data)) {
            allUsers = response.data;
          } else if (Array.isArray(response)) {
            allUsers = response;
          }
        } catch (e2) {
          console.log("Aucune méthode de récupération disponible");
        }
      }

      console.log("📊 Utilisateurs trouvés:", allUsers.length);

      // Normaliser certains champs et construire un rôle connu par utilisateur
      const normalizedUsers = allUsers.map((u) => ({
        ...u,
        role_id: u.role_id ?? u.role?.id,
        role: u.role ?? {},
        departement: u.departement ?? "",
      }));

      // DEBUG: afficher un échantillon des utilisateurs et la détection des rôles
      try {
        const sample = normalizedUsers.slice(0, 12).map((u) => ({
          id: u.id,
          role_raw: u.role,
          role_id: u.role_id,
          detected_code: detectRoleCode(u),
          detected_name: detectRoleName(u),
          departement: u.departement,
          statut: u.statut,
        }));
        console.log("🔬 Échantillon détection rôles:", sample);
      } catch (debugErr) {
        console.warn("Erreur debug échantillon:", debugErr);
      }

      // Détection robuste du rôle via role.code (si présent), puis via roleMap (récupéré), puis via role.name
      const detectRoleCode = (user) => {
        if (!user) return "";
        // Si `role` est une string (ex: "agent_suivi" ou "Agent de Suivi")
        if (typeof user.role === "string") return user.role.toUpperCase();

        // Si `role` est un objet avec `code`
        const rc = (user.role?.code || "").toString().toUpperCase();
        if (rc) return rc;

        // Essayer via mapping des rôles (chargés depuis l'API ou mocks)
        const mapped = roleMap[user.role_id];
        if (mapped && mapped.code) return mapped.code;

        // Enfin tomber sur le nom du rôle
        const rn = (user.role?.name || "").toString().toUpperCase();
        return rn;
      };

      const detectRoleName = (user) => {
        if (!user) return "";
        if (typeof user.role === "string") return user.role.toUpperCase();

        const rn = (user.role?.name || "").toString().toUpperCase();
        if (rn) return rn;

        const mapped = roleMap[user.role_id];
        if (mapped && mapped.name) return mapped.name;

        return (user.role?.code || "").toString().toUpperCase();
      };

      // Classifier en donnant la priorité aux administrateurs, puis aux agents, puis aux investigateurs
      const administrateurs = normalizedUsers.filter((user) => {
        const roleCode = detectRoleCode(user);
        const roleName = detectRoleName(user);
        return (
          roleCode.includes("ADMIN") ||
          roleName.includes("ADMIN") ||
          user.is_admin === true ||
          user.role_id === 1
        );
      });

      const agents = normalizedUsers.filter((user) => {
        const dept = (user.departement || "").toUpperCase();
        const roleCode = detectRoleCode(user);
        const roleName = detectRoleName(user);

        return (
          dept.includes("DAAQ") ||
          dept.includes("DRSE") ||
          roleCode.includes("AGENT") ||
          roleCode.includes("AGENT_SUIVI") ||
          roleName.includes("AGENT") ||
          roleName.includes("SUIVI") ||
          user.role_id === 2
        );
      });

      const investigateurs = normalizedUsers.filter((user) => {
        const dept = (user.departement || "").toUpperCase();
        const roleCode = detectRoleCode(user);
        const roleName = detectRoleName(user);

        return (
          dept.includes("CAC") ||
          dept.includes("DAGI") ||
          roleCode.includes("INVESTIGATEUR") ||
          roleName.includes("INVESTIGATEUR") ||
          user.role_id === 3
        );
      });

      // Exclusions pour éviter les doublons : priorité Admin > Agents > Investigateurs
      const adminIds = new Set(administrateurs.map((a) => a.id));
      const agentFiltered = agents.filter((a) => !adminIds.has(a.id));
      const investigateurFiltered = investigateurs.filter(
        (i) => !adminIds.has(i.id) && !agentFiltered.some((a) => a.id === i.id)
      );

      setAgents(agentFiltered);
      setInvestigateurs(investigateurFiltered);
      setAdministrateurs(administrateurs);

      console.log(
        `✅ Résultat: ${agentFiltered.length} agents, ${investigateurFiltered.length} investigateurs, ${administrateurs.length} admins`
      );

      setDataLoaded(true);
    } catch (error) {
      console.error("💥 ERREUR:", error);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await teamService.getRoles();
      if (response.success) {
        setAvailableRoles(response.data);
      }
    } catch (error) {
      console.error("Erreur chargement rôles:", error);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setSuccessToastOpen(true);
  };

  // Handlers création
  const handleCreateUser = () => {
    const defaultRole = availableRoles.find((role) =>
      activeTab === "investigateurs"
        ? role.code === "investigateur"
        : role.code === "agent_suivi"
    );
    setModalRole(defaultRole?.id || "");
    setModalOpen(true);
  };

  const handleUserCreated = (newUser) => {
    console.log("👤 Utilisateur créé - Rechargement des données...", newUser);
    // Recharger tous les utilisateurs après création
    loadAllData();
    showSuccess("Utilisateur créé avec succès");
  };

  // Handlers édition
  const handleEditClick = (user) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const handleUserUpdated = (updatedUser) => {
    console.log(
      "✏️ Utilisateur modifié - Rechargement des données...",
      updatedUser
    );
    // Recharger tous les utilisateurs après modification
    loadAllData();
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
        // Recharger les données après suppression
        loadAllData();
        showSuccess("Utilisateur supprimé avec succès");
      }
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
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
        // Recharger les données après changement de statut
        loadAllData();
        showSuccess(
          `Utilisateur ${
            response.data.statut ? "activé" : "désactivé"
          } avec succès`
        );
      }
    } catch (error) {
      console.error("❌ Erreur changement statut:", error);
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

  // Handler mise à jour permissions
  const handleUpdatePermissions = async (roleId, permissions) => {
    try {
      const response = await teamService.updateRolePermissions(roleId, {
        permissions,
      });
      if (response.success) {
        showSuccess("Permissions mises à jour avec succès");
        loadRoles();
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour permissions:", error);
      showSuccess("Erreur lors de la mise à jour des permissions");
    }
  };

  // Rendu des tables avec données de la base de données
  // Rendu des tables avec données de la base de données
  const renderUserTable = (users) => (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
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
              <td className="px-3 py-2 font-medium">{u.nom_complet}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.telephone}</td>
              <td className="px-3 py-2">{u.departement}</td>
              <td className="px-3 py-2">{u.username}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    u.role === "Agent" ||
                    u.departement?.includes("DAAQ") ||
                    u.departement?.includes("DRSE")
                      ? "bg-blue-50 text-blue-800"
                      : u.role === "Investigateur" ||
                        u.departement?.includes("CAC") ||
                        u.departement?.includes("DAGI")
                      ? "bg-orange-50 text-orange-800"
                      : u.role === "Admin"
                      ? "bg-purple-50 text-purple-800"
                      : "bg-gray-50 text-gray-800"
                  }`}
                >
                  {formatRoleName(u.role)}
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
                  {u.statut ? (
                    <Power
                      size={16}
                      className="text-gray-400 hover:text-gray-700"
                    />
                  ) : (
                    <PowerOff
                      size={16}
                      className="text-green-500 hover:text-green-700"
                    />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Calcul des totaux
  const totalUsers =
    agents.length + investigateurs.length + administrateurs.length;
  const totalActiveUsers =
    agents.filter((a) => a.statut).length +
    investigateurs.filter((i) => i.statut).length +
    administrateurs.filter((ad) => ad.statut).length;

  // Permissions par rôle
  const permissionsConfig = {
    agent_suivi: {
      name: "Équipe de Suivi (DAAQ/DRSE)",
      permissions: [
        "Voir les nouveaux dossiers",
        "Modifier les informations du visiteur",
        "Classer les dossiers",
        "Ajouter des pièces internes",
        "Mettre à jour les statuts (1 → 4)",
        "Assigner un dossier à CAC/DAGI",
        "Ajouter des commentaires internes",
        "Demander des informations supplémentaires",
      ],
      dashboard: [
        "Nouveaux dossiers",
        "En vérification",
        "En attente d'informations",
        "Prêts pour investigation",
        "Graphiques : types de fraude",
        "Actions rapides : traiter dossier, envoyer message au visiteur",
      ],
    },
    investigateur: {
      name: "Équipe d'Investigation (CAC/DAGI)",
      permissions: [
        "Voir les dossiers prêts pour investigation (statut 4)",
        "Ajouter un rapport d'investigation",
        "Ajouter / corriger les preuves",
        "Modifier ou compléter la classification",
        "Mettre à jour le statut (5 → 8)",
        "Réassigner un dossier à un autre agent de l'équipe",
      ],
    },
    admin: {
      name: "Administrateur",
      permissions: [
        "Gérer tous les utilisateurs et rôles",
        "Modifier tous les dossiers",
        "Réassigner n'importe quel dossier",
        "Modifier les statuts manuellement",
        "Accéder à tous les logs",
        "Exporter rapports PDF / Excel",
        "Configurer les types de fraude et statuts",
      ],
    },
  };

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-1">
        Gestion de l'équipe de Suivi
      </h1>
      <div className="text-gray-600 mb-6 text-sm">
        Gestion complète de l'équipe : Équipe de Suivi (DAAQ/DRSE), Équipe
        d'Investigation (CAC/DAGI) et Permissions
      </div>

      {/* Vue d'ensemble avec données réelles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow p-3 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <div className="min-w-0">
            <div className="text-xs text-gray-500 whitespace-nowrap">Total</div>
            <div className="text-xl font-bold text-gray-800">{totalUsers}</div>
            <div className="text-xs text-gray-500">
              {totalActiveUsers} actifs
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div className="min-w-0">
            <div className="text-xs text-gray-500 whitespace-nowrap">
              Administrateurs
            </div>
            <div className="text-xl font-bold text-gray-800">
              {administrateurs.length}
            </div>
            <div className="text-xs text-gray-500">
              {administrateurs.filter((a) => a.statut).length} actifs
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <div className="min-w-0">
            <div className="text-xs text-gray-500 whitespace-nowrap">
              Agents
            </div>
            <div className="text-xl font-bold text-gray-800">
              {agents.length}
            </div>
            <div className="text-xs text-gray-500">
              {agents.filter((a) => a.statut).length} actifs
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <div className="min-w-0">
            <div className="text-xs text-gray-500 whitespace-nowrap">
              Investigateurs
            </div>
            <div className="text-xl font-bold text-gray-800">
              {investigateurs.length}
            </div>
            <div className="text-xs text-gray-500">
              {investigateurs.filter((i) => i.statut).length} actifs
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
                  {tab.id === "agents"
                    ? agents.length
                    : tab.id === "investigateurs"
                    ? investigateurs.length
                    : administrateurs.length}
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
                  renderUserTable(agents)
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
                  renderUserTable(investigateurs)
                ) : (
                  <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                    Aucun investigateur trouvé dans la base de données
                  </div>
                )}
              </>
            )}

            {activeTab === "administrateurs" && (
              <>
                <div className="text-base font-semibold mb-2">
                  Administrateurs
                </div>
                {administrateurs.length > 0 ? (
                  renderUserTable(administrateurs)
                ) : (
                  <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                    Aucun administrateur trouvé dans la base de données
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
                  Gérer les permissions par rôle - Tableaux de bord disponibles
                  dans DashboardAgent.jsx et DashboardInvestigation.jsx
                </div>
                <div className="space-y-8">
                  {/* Équipe de Suivi (DAAQ / DRSE) */}
                  <div className="bg-blue-50 border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b bg-blue-100 font-semibold flex items-center gap-2">
                      <span>👥</span>
                      ÉQUIPE DE SUIVI (DAAQ / DRSE)
                    </div>
                    <div className="p-6">
                      <div className="mb-4 text-gray-700 text-sm">
                        Agents responsables du suivi et traitement initial des
                        dossiers
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-gray-800 mb-2">
                            Permissions Dossiers
                          </div>
                          {permissionsConfig.agent_suivi.permissions.map(
                            (permission, index) => (
                              <div key={index}>
                                <input
                                  type="checkbox"
                                  checked
                                  readOnly
                                  className="accent-blue-600 mr-2"
                                  id={`suivi${index}`}
                                />
                                <label
                                  htmlFor={`suivi${index}`}
                                  className="text-sm"
                                >
                                  {permission}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold text-sm"
                        onClick={() => {
                          const role = availableRoles.find(
                            (r) => r.code === "Agent"
                          );
                          if (role) {
                            handleUpdatePermissions(
                              role.id,
                              permissionsConfig.agent_suivi.permissions
                            );
                          }
                        }}
                      >
                        Enregistrer permissions
                      </button>
                    </div>
                  </div>

                  {/* Équipe d'Investigation (CAC / DAGI) */}
                  <div className="bg-orange-50 border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b bg-orange-100 font-semibold flex items-center gap-2">
                      <span>🔍</span>
                      ÉQUIPE D'INVESTIGATION (CAC / DAGI)
                    </div>
                    <div className="p-6">
                      <div className="mb-4 text-gray-700 text-sm">
                        Investigateurs responsables de l'investigation
                        approfondie des dossiers
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-gray-800 mb-2">
                            Permissions Investigation
                          </div>
                          {permissionsConfig.investigateur.permissions.map(
                            (permission, index) => (
                              <div key={index}>
                                <input
                                  type="checkbox"
                                  checked
                                  readOnly
                                  className="accent-orange-600 mr-2"
                                  id={`inv${index}`}
                                />
                                <label
                                  htmlFor={`inv${index}`}
                                  className="text-sm"
                                >
                                  {permission}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <button
                        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 font-semibold text-sm"
                        onClick={() => {
                          const role = availableRoles.find(
                            (r) => r.code === "investigateur"
                          );
                          if (role) {
                            handleUpdatePermissions(
                              role.id,
                              permissionsConfig.investigateur.permissions
                            );
                          }
                        }}
                      >
                        Enregistrer permissions
                      </button>
                    </div>
                  </div>

                  {/* Administrateur */}
                  <div className="bg-purple-50 border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b bg-purple-100 font-semibold flex items-center gap-2">
                      <span>⚙️</span>
                      ADMINISTRATEUR
                    </div>
                    <div className="p-6">
                      <div className="mb-4 text-gray-700 text-sm">
                        Accès complet à toutes les fonctionnalités du système
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-gray-800 mb-2">
                            Gestion Utilisateurs & Système
                          </div>
                          {permissionsConfig.admin.permissions
                            .slice(0, 3)
                            .map((permission, index) => (
                              <div key={index}>
                                <input
                                  type="checkbox"
                                  checked
                                  readOnly
                                  className="accent-purple-600 mr-2"
                                  id={`admin${index}`}
                                />
                                <label
                                  htmlFor={`admin${index}`}
                                  className="text-sm"
                                >
                                  {permission}
                                </label>
                              </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-gray-800 mb-2">
                            Permissions Dossiers Étendues
                          </div>
                          {permissionsConfig.admin.permissions
                            .slice(3)
                            .map((permission, index) => (
                              <div key={index}>
                                <input
                                  type="checkbox"
                                  checked
                                  readOnly
                                  className="accent-purple-600 mr-2"
                                  id={`admin${index + 3}`}
                                />
                                <label
                                  htmlFor={`admin${index + 3}`}
                                  className="text-sm"
                                >
                                  {permission}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border mb-4"></div>
                      <button
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold text-sm"
                        onClick={() => {
                          const role = availableRoles.find(
                            (r) => r.code === "admin"
                          );
                          if (role) {
                            handleUpdatePermissions(
                              role.id,
                              permissionsConfig.admin.permissions
                            );
                          }
                        }}
                      >
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
      <CreateUserModal
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

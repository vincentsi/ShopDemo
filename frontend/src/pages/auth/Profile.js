import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useAuthStore } from "../../store/authStore";

const Profile = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");

  const onSubmitProfile = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success("Profil mis à jour avec succès");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  const onSubmitPassword = async (data) => {
    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (result.success) {
        toast.success("Mot de passe modifié avec succès");
        resetPassword();
      } else {
        toast.error(
          result.error || "Erreur lors du changement de mot de passe"
        );
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profil", icon: "👤" },
    { id: "password", name: "Mot de passe", icon: "🔒" },
    { id: "addresses", name: "Adresses", icon: "📍" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Informations personnelles
                  </h2>

                  <form
                    onSubmit={handleSubmitProfile(onSubmitProfile)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <input
                          {...registerProfile("firstName", {
                            required: "Le prénom est requis",
                            minLength: {
                              value: 2,
                              message:
                                "Le prénom doit contenir au moins 2 caractères",
                            },
                          })}
                          type="text"
                          className={`input ${
                            profileErrors.firstName ? "input-error" : ""
                          }`}
                        />
                        {profileErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <input
                          {...registerProfile("lastName", {
                            required: "Le nom est requis",
                            minLength: {
                              value: 2,
                              message:
                                "Le nom doit contenir au moins 2 caractères",
                            },
                          })}
                          type="text"
                          className={`input ${
                            profileErrors.lastName ? "input-error" : ""
                          }`}
                        />
                        {profileErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        {...registerProfile("email", {
                          required: "L'email est requis",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Adresse email invalide",
                          },
                        })}
                        type="email"
                        className={`input ${
                          profileErrors.email ? "input-error" : ""
                        }`}
                      />
                      {profileErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        {...registerProfile("phone", {
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: "Numéro de téléphone invalide",
                          },
                        })}
                        type="tel"
                        className={`input ${
                          profileErrors.phone ? "input-error" : ""
                        }`}
                      />
                      {profileErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileErrors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            Mise à jour...
                          </div>
                        ) : (
                          "Mettre à jour"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Changer le mot de passe
                  </h2>

                  <form
                    onSubmit={handleSubmitPassword(onSubmitPassword)}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        {...registerPassword("currentPassword", {
                          required: "Le mot de passe actuel est requis",
                        })}
                        type="password"
                        className={`input ${
                          passwordErrors.currentPassword ? "input-error" : ""
                        }`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        {...registerPassword("newPassword", {
                          required: "Le nouveau mot de passe est requis",
                          minLength: {
                            value: 6,
                            message:
                              "Le mot de passe doit contenir au moins 6 caractères",
                          },
                        })}
                        type="password"
                        className={`input ${
                          passwordErrors.newPassword ? "input-error" : ""
                        }`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        {...registerPassword("confirmPassword", {
                          required: "La confirmation est requise",
                          validate: (value) =>
                            value === newPassword ||
                            "Les mots de passe ne correspondent pas",
                        })}
                        type="password"
                        className={`input ${
                          passwordErrors.confirmPassword ? "input-error" : ""
                        }`}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="btn-primary"
                      >
                        {isChangingPassword ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            Modification...
                          </div>
                        ) : (
                          "Changer le mot de passe"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Mes adresses
                    </h2>
                    <button className="btn-primary btn-sm">
                      Ajouter une adresse
                    </button>
                  </div>

                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      Aucune adresse enregistrée
                    </p>
                    <button className="btn-primary">
                      Ajouter ma première adresse
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

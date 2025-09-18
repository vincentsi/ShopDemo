import { HomeIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="text-sm text-gray-500">
            <p>Ou essayez de :</p>
            <div className="mt-2 space-x-4">
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-500"
              >
                Voir nos produits
              </Link>
              <Link
                to="/contact"
                className="text-primary-600 hover:text-primary-500"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

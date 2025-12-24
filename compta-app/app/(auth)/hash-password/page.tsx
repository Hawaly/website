"use client";

import { useState } from "react";
import { Key, Copy, Check, AlertCircle } from "lucide-react";

export default function HashPasswordPage() {
  const [password, setPassword] = useState("");
  const [hashedPassword, setHashedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleHash = async () => {
    if (!password) {
      setError("Veuillez entrer un mot de passe");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/hash-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors du hashage");
        return;
      }

      setHashedPassword(data.hash);
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(hashedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg animate-fade-in">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            Générateur de Hash
          </h1>
          <p className="text-slate-500 mt-2">
            Hashez votre mot de passe pour l&apos;insérer dans Supabase
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mot de passe à hasher
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <button
            onClick={handleHash}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
          >
            {isLoading ? "Hashage en cours..." : "Générer le hash"}
          </button>
        </div>

        {/* Result */}
        {hashedPassword && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Hash bcrypt :
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
            </div>
            <code className="block p-3 bg-slate-900 text-green-400 rounded-lg text-xs break-all font-mono">
              {hashedPassword}
            </code>

            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium mb-2">
                SQL pour Supabase :
              </p>
              <code className="block p-2 bg-white rounded text-xs text-slate-700 break-all">
                UPDATE app_user SET password_hash = &apos;{hashedPassword}&apos; WHERE username = &apos;admin&apos;;
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

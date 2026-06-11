"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (!error) {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-4">
          Neues Passwort
        </h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Neues Passwort"
          className="w-full p-3 rounded-xl bg-slate-800 text-white mb-4"
        />

        <button
          onClick={handleReset}
          className="w-full bg-emerald-600 text-white p-3 rounded-xl"
        >
          Passwort speichern
        </button>

        {success && (
          <p className="text-emerald-400 mt-3">
            Passwort erfolgreich geändert.
          </p>
        )}
      </div>
    </div>
  );
}
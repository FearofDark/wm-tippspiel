"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("User konnte nicht erstellt werden");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        username,
        email,
      });

    if (profileError) {
      console.error(profileError);
      alert(profileError.message);
      return;
    }

    alert("Registrierung erfolgreich");

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-2xl">

        <h1 className="text-3xl font-bold text-white mb-6">
          Registrieren
        </h1>

                <input
          className="w-full p-3 rounded bg-slate-800 text-white mb-3"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-800 text-white mb-3"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />


        <input
          type="password"
          className="w-full p-3 rounded bg-slate-800 text-white mb-4"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={register}
          className="w-full bg-emerald-600 p-3 rounded text-white font-bold"
        >
          Registrieren
        </button>

      </div>
    </div>
  );
}
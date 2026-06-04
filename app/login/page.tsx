"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("LOGIN SESSION:", session);

      if (session) {
        router.push("/matches");
      }
    };

    checkSession();
  }, [router]);

  const login = async () => {
    try {
      setLoading(true);

      const cleanUsername = username.trim();

      console.log("🔍 USERNAME:", cleanUsername);

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", cleanUsername);

      console.log("PROFILES:", profiles);
      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        console.error(profileError);
        alert("Fehler beim Laden des Profils");
        return;
      }

      if (!profiles || profiles.length === 0) {
        alert("Benutzer nicht gefunden");
        return;
      }

      const profile = profiles[0];

      console.log("FOUND PROFILE:", profile);

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (error) {
        console.error(error);
        alert("Falsches Passwort");
        return;
      }

      console.log("✅ LOGIN SUCCESS");

      router.replace("/matches");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl">

        <h1 className="text-3xl font-bold text-white mb-2">
          Login
        </h1>

        <p className="text-slate-400 mb-6">
          Mit Benutzername anmelden
        </p>

        <input
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-3"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white mb-5"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 p-3 rounded-lg text-white font-bold transition"
        >
          {loading ? "Einloggen..." : "Einloggen"}
        </button>

      </div>
    </div>
  );
}
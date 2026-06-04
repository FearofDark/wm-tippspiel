"use client";

import Link from "next/link";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        window.location.replace("/dashboard");
      }
    };

    checkUser();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="text-center">

        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          ⚽ WM 2026 Tippspiel
        </h1>

        <p className="text-slate-400 mb-8">
          Tippe alle Spiele der FIFA World Cup 2026
          und messe dich mit deinen Freunden.
        </p>

        <div className="flex gap-4 justify-center">

          <Link
            href="/register"
            className="
              px-6
              py-3
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
              transition
              font-semibold
            "
          >
            Registrieren
          </Link>

          <Link
            href="/login"
            className="
              px-6
              py-3
              rounded-xl
              bg-slate-800
              hover:bg-slate-700
              transition
              font-semibold
            "
          >
            Login
          </Link>

        </div>

      </div>
    </main>
  );
}
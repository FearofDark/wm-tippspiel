"use client";

type Props = {
  match: any;
  prediction: {
    home: string;
    away: string;
  };

  updatePrediction: (
    matchId: number,
    side: "home" | "away",
    value: string
  ) => void;

  savePrediction: (
    matchId: number
  ) => void;
};

export default function MatchCard({
  match,
  prediction,
  updatePrediction,
  savePrediction,
}: Props) {
  const locked =
    new Date() >= new Date(match.utcDate);

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-emerald-500 transition">

      <div className="flex flex-col xl:flex-row gap-8 justify-between">

        <div className="flex-1">

          <div className="flex items-center gap-4">

            <img
              src={match.homeTeam?.crest}
              alt=""
              className="w-12 h-12"
            />

            <h2 className="text-2xl font-bold">
              {match.homeTeam?.name}
            </h2>

          </div>

          <div className="text-center text-slate-500 py-4">
            VS
          </div>

          <div className="flex items-center gap-4">

            <img
              src={match.awayTeam?.crest}
              alt=""
              className="w-12 h-12"
            />

            <h2 className="text-2xl font-bold">
              {match.awayTeam?.name}
            </h2>

          </div>

        </div>

        <div className="flex flex-col justify-center items-center">

          <div className="bg-slate-800 rounded-2xl px-5 py-3">

            <div>
              {new Date(
                match.utcDate
              ).toLocaleDateString("de-DE")}
            </div>

            <div className="text-slate-400 text-center">

              {new Date(
                match.utcDate
              ).toLocaleTimeString(
                "de-DE",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}

            </div>

          </div>

          <div className="mt-3 text-sm text-slate-400">
            {match.group}
          </div>

        </div>

        <div className="flex flex-col items-center">

          <p className="text-slate-400 mb-3">
            Dein Tipp
          </p>

          <div className="flex gap-3 items-center">

            <input
              type="number"
              min="0"
              disabled={locked}
              value={prediction?.home || ""}
              onChange={(e) =>
                updatePrediction(
                  match.id,
                  "home",
                  e.target.value
                )
              }
              className="w-20 h-20 bg-slate-800 rounded-2xl text-center text-3xl"
            />

            <span className="text-4xl">
              :
            </span>

            <input
              type="number"
              min="0"
              disabled={locked}
              value={prediction?.away || ""}
              onChange={(e) =>
                updatePrediction(
                  match.id,
                  "away",
                  e.target.value
                )
              }
              className="w-20 h-20 bg-slate-800 rounded-2xl text-center text-3xl"
            />

          </div>

          {!locked ? (
            <button
              onClick={() =>
                savePrediction(match.id)
              }
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl font-semibold"
            >
              Tipp speichern
            </button>
          ) : (
            <div className="mt-4 text-red-400">
              🔒 Gesperrt
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
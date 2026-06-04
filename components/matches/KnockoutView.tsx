type Props = {
  matches: any[];
};

export default function KnockoutView({
  matches,
}: Props) {
  const last32 = matches.filter(
    (m) => m.stage === "LAST_32"
  );

  const last16 = matches.filter(
    (m) => m.stage === "LAST_16"
  );

  const quarterFinals = matches.filter(
    (m) => m.stage === "QUARTER_FINALS"
  );

  const semiFinals = matches.filter(
    (m) => m.stage === "SEMI_FINALS"
  );

  const final = matches.filter(
    (m) => m.stage === "FINAL"
  );

  return (
    <div className="space-y-10">

      <Round
        title="🏆 Sechzehntelfinale"
        matches={last32}
      />

      <Round
        title="🏆 Achtelfinale"
        matches={last16}
      />

      <Round
        title="🏆 Viertelfinale"
        matches={quarterFinals}
      />

      <Round
        title="🏆 Halbfinale"
        matches={semiFinals}
      />

      <Round
        title="👑 Finale"
        matches={final}
      />

    </div>
  );
}

function Round({
  title,
  matches,
}: {
  title: string;
  matches: any[];
}) {
  return (
    <div>

      <h2 className="text-3xl font-bold mb-5">
        {title}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800"
          >
            <div className="font-semibold">
              {match.homeTeam?.name}
            </div>

            <div className="text-slate-500 py-1">
              VS
            </div>

            <div className="font-semibold">
              {match.awayTeam?.name}
            </div>

            <div className="mt-4 text-sm text-slate-400">

              {new Date(
                match.utcDate
              ).toLocaleDateString("de-DE")}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
type Props = {
  group: any;
  matches: any[];

  predictions: Record<
    number,
    {
      home: string;
      away: string;
    }
  >;
};

export default function MyGroupTable({
  group,
  matches,
  predictions,
}: Props) {
  if (!group) return null;

  const groupCode = group.group.replace("Group ", "GROUP_").toUpperCase();

  const groupMatches = matches.filter((match) => match.group === groupCode);

  const table: Record<
    string,
    {
      team: any;
      points: number;
      gf: number;
      ga: number;
      gd: number;
    }
  > = {};

  group.table.forEach((entry: any) => {
    const teamKey = String(entry.team.id || entry.team.name);

    table[teamKey] = {
      team: entry.team,
      points: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    };
  });

  groupMatches.forEach((match) => {
    const prediction = predictions?.[match.id];

    if (!prediction) return;

    const homeGoals = Number(prediction.home);
    const awayGoals = Number(prediction.away);

    if (isNaN(homeGoals) || isNaN(awayGoals)) return;

    const homeName = match.home_team || match.homeTeam?.name;
    const awayName = match.away_team || match.awayTeam?.name;

    const homeId = match.home_team_id || match.homeTeam?.id;
    const awayId = match.away_team_id || match.awayTeam?.id;

    const homeKey =
      Object.keys(table).find((key) => {
        const team = table[key].team;

        return (
          String(team.id) === String(homeId) ||
          team.name === homeName ||
          team.shortName === homeName ||
          team.tla === homeName
        );
      }) || "";

    const awayKey =
      Object.keys(table).find((key) => {
        const team = table[key].team;

        return (
          String(team.id) === String(awayId) ||
          team.name === awayName ||
          team.shortName === awayName ||
          team.tla === awayName
        );
      }) || "";

    const home = table[homeKey];
    const away = table[awayKey];

    if (!home || !away) return;

    home.gf += homeGoals;
    home.ga += awayGoals;

    away.gf += awayGoals;
    away.ga += homeGoals;

    if (homeGoals > awayGoals) {
      home.points += 3;
    } else if (awayGoals > homeGoals) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  });

  const sorted = Object.values(table)
    .map((team) => ({
      ...team,
      gd: team.gf - team.ga,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

  return (
    <div className="bg-slate-900 rounded-2xl p-4 md:p-6 mb-6 border border-slate-800">
      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-bold">
          Meine Tabelle
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="pb-3 text-left">#</th>
              <th className="pb-3 text-left">Team</th>
              <th className="pb-3 text-center">Pkt</th>
              <th className="pb-3 text-center">TD</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((team, index) => (
              <tr
                key={team.team.id || team.team.name}
                className={`border-b border-slate-800 ${
                  index <= 1 ? "bg-emerald-500/10" : ""
                }`}
              >
                <td className="py-2 md:py-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= 1 ? "bg-emerald-600" : "bg-slate-800"
                    }`}
                  >
                    {index + 1}
                  </div>
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    {team.team.crest && (
                      <img
                        src={team.team.crest}
                        alt=""
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />
                    )}

                    <div>
                      <div className="font-medium text-sm md:text-base">
                        {team.team.name}
                      </div>

                      <div className="text-xs text-slate-500">
                        {team.team.tla}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-center font-bold">{team.points}</td>

                <td className="text-center">{team.gd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
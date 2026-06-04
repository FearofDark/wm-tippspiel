type Props = {
  group: any;
};

export default function GroupTable({
  group,
}: Props) {
  if (!group) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 md:p-6 mb-6 border border-slate-800">

      <div className="mb-5">

        <h2 className="text-2xl md:text-3xl font-bold">
        {group.group}
        </h2>



      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">

              <th className="pb-3 text-left">
                #
              </th>

              <th className="pb-3 text-left">
                Team
              </th>

              <th className="pb-3 text-center hidden md:table-cell">
                Sp
              </th>

              <th className="pb-3 text-center hidden md:table-cell">
                S
              </th>

              <th className="pb-3 text-center hidden md:table-cell">
                U
              </th>

              <th className="pb-3 text-center hidden md:table-cell">
                N
              </th>

              <th className="pb-3 text-center hidden md:table-cell">
                TD
              </th>

              <th className="pb-3 text-center">
                Pkt
              </th>

            </tr>
          </thead>

          <tbody>

            {group.table.map(
              (team: any) => (
                <tr
                  key={team.team.id}
                  className={`border-b border-slate-800 ${
                    team.position <= 2
                      ? "bg-emerald-500/10"
                      : ""
                  }`}
                >
                  <td className="py-2 md:py-3">

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        team.position <= 2
                          ? "bg-emerald-600"
                          : "bg-slate-800"
                      }`}
                    >
                      {team.position}
                    </div>

                  </td>

                  <td>

                    <div className="flex items-center gap-2">

                      <img
                        src={team.team.crest}
                        alt={team.team.name}
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />

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

                  <td className="hidden md:table-cell text-center">
                    {team.playedGames}
                  </td>

                  <td className="hidden md:table-cell text-center">
                    {team.won}
                  </td>

                  <td className="hidden md:table-cell text-center">
                    {team.draw}
                  </td>

                  <td className="hidden md:table-cell text-center">
                    {team.lost}
                  </td>

                  <td className="hidden md:table-cell text-center">
                    {team.goalDifference}
                  </td>

                  <td className="text-center font-bold">
                    {team.points}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      <div className="mt-4 text-xs text-slate-400">
        🟢 Platz 1-2 qualifizieren sich
      </div>

    </div>
  );
}
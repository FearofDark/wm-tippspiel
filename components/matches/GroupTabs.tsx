"use client";

type Props = {
  groups: {
    label: string;
    value: string;
  }[];

  selectedGroup: string;

  setSelectedGroup: (
    value: string
  ) => void;
};

export default function GroupTabs({
  groups,
  selectedGroup,
  setSelectedGroup,
}: Props) {
  return (
    <div className="mb-6">

      <div className="flex items-center justify-between mb-3">

        <h2 className="text-xl md:text-2xl font-bold">
          Gruppen
        </h2>

        <span className="text-xs md:text-sm text-slate-400">
          {groups.length} Gruppen
        </span>

      </div>

      <div
        className="
          flex
          gap-2
          overflow-x-auto
          pb-2
          scrollbar-hide
        "
      >
        {groups.map((group) => {
          const letter =
            group.label.replace(
              "Group ",
              ""
            );

          return (
            <button
              key={group.value}
              onClick={() =>
                setSelectedGroup(
                  group.value
                )
              }
              className={`
                flex-shrink-0
                w-12
                h-12
                md:w-14
                md:h-14
                rounded-xl
                font-bold
                transition-all
                ${
                  selectedGroup ===
                  group.value
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

    </div>
  );
}
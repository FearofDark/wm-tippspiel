"use client";

type Props = {
  groups: {
    label: string;
    value: string;
  }[];

  selectedGroup: string;

  setSelectedGroup: (value: string) => void;
};

export default function GroupTabs({
  groups,
  selectedGroup,
  setSelectedGroup,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base sm:text-xl font-bold">
          Gruppen
        </h2>

        <span className="text-[10px] sm:text-xs text-slate-400">
          {groups.length} Gruppen
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {groups.map((group) => {
          const letter = group.label.replace("Group ", "");

          return (
            <button
              key={group.value}
              onClick={() => setSelectedGroup(group.value)}
              className={`
                flex-shrink-0
                w-9
                h-9
                sm:w-11
                sm:h-11
                rounded-lg
                text-xs
                sm:text-sm
                font-bold
                transition-all
                ${
                  selectedGroup === group.value
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
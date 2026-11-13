const PODIUM_EMOJI = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
} as const;

const PODIUM_BORDER = {
  1: "border-[#E8C547]",
  2: "border-[#C0C0C0]",
  3: "border-[#CD7F32]",
} as const;

const PODIUM_LABEL = {
  1: "1st place",
  2: "2nd place",
  3: "3rd place",
} as const;

export type PodiumRank = keyof typeof PODIUM_EMOJI;

export function isPodiumRank(rank: number): rank is PodiumRank {
  return rank === 1 || rank === 2 || rank === 3;
}

type RankMedalProps = {
  rank: PodiumRank;
};

export function RankMedal({ rank }: RankMedalProps) {
  return (
    <span
      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-candy-purple/50 shadow-sm ${PODIUM_BORDER[rank]}`}
      aria-label={PODIUM_LABEL[rank]}
      title={PODIUM_LABEL[rank]}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        {PODIUM_EMOJI[rank]}
      </span>
    </span>
  );
}

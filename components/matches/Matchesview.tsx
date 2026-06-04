import MatchCard from "./MatchCard";

type Props = {
  matches: any[];
  predictions: any;
  updatePrediction: any;
  savePrediction: any;
};

export default function MatchesView({
  matches,
  predictions,
  updatePrediction,
  savePrediction,
}: Props) {
  return (
    <div className="grid gap-5">

      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          prediction={
            predictions[match.id]
          }
          updatePrediction={
            updatePrediction
          }
          savePrediction={
            savePrediction
          }
        />
      ))}

    </div>
  );
}
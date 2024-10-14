import GameStatistics from "@blocks/game/statistics";

export default function() {
  return (
    <div class="flex flex-col p-3 lg:p-6 w-full items-center">
      <GameStatistics inGame />
    </div>
  );
}

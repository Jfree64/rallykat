export default {
  name: "heat",
  title: "Heat",
  type: "document",
  fields: [
    {
      name: "level",
      title: "Level",
      type: "number",
    },
    {
      name: "round",
      title: "Round",
      type: "number",
    },
    {
      name: "players",
      title: "Players",
      type: "array",
      of: [{ type: "reference", to: [{ type: "player" }] }],
    },
    {
      name: "winner",
      title: "Winner",
      type: "reference",
      to: [{ type: "player" }],
      validation: (Rule: any) => Rule.custom((winner: { _ref: string } | null, context: { document: { players: { _ref: string }[] } }) => {
        const players = context.document.players
        if (!winner) return true // Allow no winner (TBD)
        if (!players) return true // Allow if no players yet
        return players.some((player: { _ref: string }) => player._ref === winner._ref) || 'Winner must be one of the players in the heat'
      })
    },
    {
      name: "redemption",
      title: "Redemption",
      type: "boolean",
      initialValue: false,
    },
  ],

  preview: {
    select: {
      round: "round",
      level: "level",
      player1: "players.0.name",
      player2: "players.1.name",
      winner: "winner.name",
      redemption: "redemption",
    },
    prepare(selection: { level: number; round: number; player1: string; player2: string; winner: string; redemption: boolean; }) {
      const { level, round, player1, player2, winner, redemption } = selection
      return {
        title: `${level} - ${round} - ${winner ? winner : "TBD"}`,
        subtitle: `${player1} vs ${player2} ${redemption ? "Redemption" : ""}`
      }
    }
  },
};

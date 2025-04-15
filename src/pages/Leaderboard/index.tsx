import { useState, useEffect } from 'react';
import leaderboardData from '../../data/leaderboard.json';

interface LeaderboardEntry {
  id: number;
  name: string;
  ranking: number;
  category: string;
  points: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(leaderboardData.leaderboard);
  }, []);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Category</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.ranking}</td>
              <td>{entry.name}</td>
              <td>{entry.category}</td>
              <td>{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
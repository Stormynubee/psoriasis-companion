import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export const useInsights = () => {
  return useLiveQuery(async () => {
    const logs = await db.logs.toArray();
    if (logs.length < 3) return "Log a few more days to see patterns.";
    
    // Simple logic: Find days with sleep > 7h vs severity
    const goodSleepLogs = logs.filter(l => l.lifestyle.sleepHours > 7);
    if (goodSleepLogs.length === 0 || logs.length === 0) return "Keep logging your sleep and flare-ups to get insights.";

    const avgSeverity = logs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / logs.length;
    const goodSleepSeverity = goodSleepLogs.reduce((acc, l) => acc + (l.flareUps[0]?.severity || 0), 0) / goodSleepLogs.length;

    if (avgSeverity > 0 && goodSleepSeverity < avgSeverity) {
        return `Flares are typically ${Math.round((1 - goodSleepSeverity/avgSeverity)*100)}% lower when you sleep >7h.`;
    }
    return "No clear patterns yet. Keep logging!";
  });
};

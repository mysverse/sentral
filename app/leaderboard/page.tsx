"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";

interface Event {
  eventId: string;
  eventName: string;
  participantCount: number;
  lastUpdate: string;
}

export default function LeaderboardIndex() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll show some sample events
    // In a real implementation, you'd fetch this from an API
    setTimeout(() => {
      setEvents([
        {
          eventId: "demo-race-2024",
          eventName: "Demo Racing Event 2024",
          participantCount: 0,
          lastUpdate: new Date().toISOString()
        },
        {
          eventId: "speed-trial-1",
          eventName: "Speed Trial Challenge",
          participantCount: 0,
          lastUpdate: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
            🏁 Live Leaderboards
          </h1>
          <p className="text-xl text-blue-200">
            Choose an event to view its live racing leaderboard
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg"
        >
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
              <p className="mt-4 text-white">Loading events...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Available Events
              </h2>

              {events.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mb-4 text-6xl">🏎️</div>
                  <p className="text-lg text-white/60">
                    No active events right now
                  </p>
                  <p className="mt-2 text-sm text-white/40">
                    Events will appear here when races are active
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.eventId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/leaderboard/${event.eventId}`}
                      className="block rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-semibold text-white">
                            {event.eventName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-blue-200">
                            <span>
                              👥 {event.participantCount} participants
                            </span>
                            <span>
                              🕒 Last update:{" "}
                              {new Date(event.lastUpdate).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-3xl">🏁</div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}

              <div className="mt-8 rounded-xl border border-blue-400/30 bg-blue-900/20 p-6">
                <h3 className="mb-2 text-lg font-semibold text-blue-200">
                  🎮 For Game Developers
                </h3>
                <p className="mb-3 text-sm text-blue-100">
                  Integrate your racing game with our leaderboard API:
                </p>
                <div className="rounded-lg bg-black/30 p-3 font-mono text-xs text-green-300">
                  <div>POST /api/leaderboard/[eventId]</div>
                  <div className="mt-1 text-white/60">
                    {'{ "playerName": "Player1", "lapTime": 125.456 }'}
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/leaderboard/admin"
                    className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-500"
                  >
                    🛠️ Admin Panel & Testing
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-white/60"
        >
          <p>🏎️ Real-time racing leaderboards powered by MYSverse</p>
          <p className="mt-1 text-sm">
            Create your own event by sending data to our API
          </p>
        </motion.div>
      </div>
    </div>
  );
}

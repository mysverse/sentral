"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import DefaultTransitionLayout from "components/transition";
import clsx from "clsx";
import Image from "next/image";

interface LeaderboardEntry {
  id: string;
  playerName: string;
  lapTime: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface SSEMessage {
  type: "connected" | "leaderboard_update" | "error" | "ping";
  data?: LeaderboardEntry[];
  eventId?: string;
  message?: string;
}

interface EventDetails {
  name: string;
  logo?: string;
  description?: string;
  startTime?: string;
  status: "upcoming" | "live" | "finished";
}

export default function LeaderboardPage({
  params
}: {
  params: Promise<{ eventId: string }>;
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: "Live Racing Event",
    status: "live"
  });
  const eventSourceRef = useRef<EventSource | null>(null);
  const previousPositionsRef = useRef<Map<string, number>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.eventId);
    };
    resolveParams();
  }, [params]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = (timeInSeconds % 60).toFixed(3);
    return `${minutes}:${seconds.padStart(6, "0")}`;
  };

  const getPositionChange = (playerId: string, currentPosition: number) => {
    const previousPosition = previousPositionsRef.current.get(playerId);
    if (previousPosition === undefined) return "new";
    if (currentPosition < previousPosition) return "up";
    if (currentPosition > previousPosition) return "down";
    return "same";
  };

  const getPositionChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return <span className="text-xl text-green-400 md:text-2xl">↗️</span>;
      case "down":
        return <span className="text-xl text-red-400 md:text-2xl">↘️</span>;
      case "new":
        return <span className="text-xl text-blue-400 md:text-2xl">✨</span>;
      default:
        return null;
    }
  };

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return (
          <span className="text-2xl font-bold text-gray-700 md:text-3xl lg:text-4xl">
            #{position.toString().padStart(2, "0")}
          </span>
        );
    }
  };

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.eventId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    // Don't connect if eventId is not yet resolved
    if (!eventId) return;

    // If already connected, don't create another connection
    if (eventSourceRef.current) return;

    console.log(`Connecting to SSE for event: ${eventId}`);
    const eventSource = new EventSource(`/api/leaderboard/${eventId}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log("Connected to leaderboard updates");
    };

    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);

        switch (message.type) {
          case "connected":
            toast.success("Connected to live updates!");
            break;

          case "ping":
            // Keep-alive ping, just maintain connection
            break;

          case "leaderboard_update":
            if (message.data) {
              // Use functional update to get current leaderboard
              setLeaderboard((currentLeaderboard) => {
                // Update previous positions before setting new data
                currentLeaderboard.forEach((entry) => {
                  previousPositionsRef.current.set(entry.id, entry.position);
                });

                // Check for new entries
                const newEntries = message.data!.filter(
                  (entry) =>
                    !currentLeaderboard.find(
                      (existing) => existing.id === entry.id
                    )
                );

                newEntries.forEach((entry) => {
                  toast.success(
                    `${entry.playerName} joined the race! Time: ${formatTime(entry.lapTime)}`
                  );
                });

                // Check for improved times
                message.data!.forEach((entry) => {
                  const existing = currentLeaderboard.find(
                    (e) => e.id === entry.id
                  );
                  if (existing && entry.lapTime < existing.lapTime) {
                    toast.success(
                      `${entry.playerName} improved their time! ${formatTime(entry.lapTime)}`
                    );
                  }
                });

                return message.data!;
              });

              // Update event name if we have data
              if (message.data.length > 0) {
                setEventDetails((prev) => ({
                  ...prev,
                  name: `Racing Event ${eventId}`
                }));
              }
            }
            break;

          case "error":
            toast.error(message.message || "Error receiving updates");
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      // Only attempt reconnection if we haven't exceeded max attempts
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000
        ); // Exponential backoff
        toast.error(
          `Connection lost. Reconnecting in ${timeout / 1000} seconds...`
        );

        reconnectAttemptsRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          // Force re-render to trigger reconnection
          setEventId((current) => current);
        }, timeout);
      } else {
        toast.error("Connection failed. Please refresh the page.");
      }
    };

    // Cleanup on unmount or eventId change
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [eventId]);

  return (
    <DefaultTransitionLayout show={true} appear={true}>
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* TV Optimized Layout */}
        <div className="flex h-screen flex-col p-4 lg:p-8">
          {/* Header Section - Event Info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex-shrink-0 lg:mb-8"
          >
            <div className="flex items-center justify-between">
              {/* Event Logo and Name */}
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg lg:h-24 lg:w-24">
                  {eventDetails.logo ? (
                    <Image
                      src={eventDetails.logo}
                      alt="Event Logo"
                      width={96}
                      height={96}
                      className="h-full w-full rounded-2xl object-contain"
                    />
                  ) : (
                    <span className="text-2xl lg:text-4xl">🏁</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white lg:text-2xl xl:text-3xl">
                    {eventDetails.name}
                  </h2>
                  <p className="mt-1 text-sm text-blue-200 lg:text-lg">
                    Live Racing Leaderboard
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-lg lg:gap-4 lg:px-6 lg:py-3">
                <div
                  className={`h-3 w-3 rounded-full lg:h-4 lg:w-4 ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}
                />
                <span className="text-sm font-medium text-white lg:text-lg">
                  {isConnected ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main Leaderboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 overflow-hidden"
          >
            <div className="h-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg">
              <div className="flex h-full flex-col">
                {/* Table Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 lg:px-8 lg:py-6">
                  <div className="grid grid-cols-12 gap-4 font-bold text-white">
                    <div className="col-span-2 text-center text-lg lg:text-xl xl:text-2xl">
                      Position
                    </div>
                    <div className="col-span-5 text-lg lg:text-xl xl:text-2xl">
                      Player Name
                    </div>
                    <div className="col-span-3 text-lg lg:text-xl xl:text-2xl">
                      Best Time
                    </div>
                    <div className="col-span-2 text-center text-lg lg:text-xl xl:text-2xl">
                      Change
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto bg-white/95 backdrop-blur-sm">
                  <AnimatePresence mode="wait">
                    {leaderboard.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-12 text-center lg:py-20"
                        >
                          <div className="mb-6 text-8xl lg:text-9xl">⏱️</div>
                          <p className="mb-4 text-2xl font-bold text-gray-600 lg:text-4xl xl:text-5xl">
                            Waiting for racers...
                          </p>
                          <p className="text-lg text-gray-500 lg:text-2xl">
                            Times will appear here in real-time!
                          </p>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-1 p-2 lg:p-4">
                        {leaderboard.slice(0, 10).map((entry) => {
                          const positionChange = getPositionChange(
                            entry.id,
                            entry.position
                          );
                          const isTopThree = entry.position <= 3;

                          return (
                            <motion.div
                              key={entry.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={clsx(
                                "grid grid-cols-12 items-center gap-4 rounded-xl border p-4 transition-all duration-300 lg:p-6",
                                isTopThree
                                  ? "border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100"
                                  : "border-gray-200 bg-white/80 hover:bg-white/90"
                              )}
                            >
                              {/* Position */}
                              <div className="col-span-2 text-center">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-3xl lg:text-5xl xl:text-6xl"
                                >
                                  {getPositionEmoji(entry.position)}
                                </motion.div>
                              </div>

                              {/* Player Name */}
                              <div className="col-span-5">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xl font-bold text-gray-800 lg:text-3xl xl:text-4xl"
                                >
                                  {entry.playerName}
                                </motion.div>
                                <div className="mt-1 text-sm text-gray-500 lg:text-lg">
                                  Lap Time #{entry.position}
                                </div>
                              </div>

                              {/* Time */}
                              <div className="col-span-3">
                                <motion.div
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  className="inline-block"
                                >
                                  <div
                                    className={clsx(
                                      "rounded-xl px-4 py-2 font-mono text-xl font-bold lg:px-6 lg:py-3 lg:text-2xl xl:text-3xl",
                                      isTopThree
                                        ? "border-2 border-yellow-400 bg-yellow-200 text-yellow-800"
                                        : "border-2 border-blue-300 bg-blue-100 text-blue-800"
                                    )}
                                  >
                                    {formatTime(entry.lapTime)}
                                  </div>
                                </motion.div>
                              </div>

                              {/* Change Indicator */}
                              <div className="col-span-2 text-center">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-3xl lg:text-4xl xl:text-5xl"
                                >
                                  {getPositionChangeIcon(positionChange)}
                                </motion.div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex-shrink-0 text-center lg:mt-6"
          >
            <div className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-lg lg:px-8 lg:py-4">
              <p className="text-lg font-medium text-white/90 lg:text-xl">
                🏎️ Real-time racing leaderboard powered by MYSverse
              </p>
              <p className="mt-1 text-sm text-white/70 lg:text-lg">
                Updates automatically • Showing top 10 racers
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DefaultTransitionLayout>
  );
}

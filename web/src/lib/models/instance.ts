import type { DateTime } from "luxon";

export type Instance = {
  state: "Pending" | "Running" | "Succeeded" | "Failed" | "Unknown";
  name: string;
  traffic: string;
  ports: number[];
  renew_count: number;
  created_at: DateTime;
  user_id: number;
  user_name?: string;
  team_id: number;
  team_name?: string;
  challenge_id: number;
  challenge_name?: string;
  game_id: number;
  game_name?: string;
  exposed_ports:
    | {
        name: string;
        address: string;
      }[]
    | null;
};

export type Traffic = {
  remote: string;
  local: string;
};

import type { OfflineUser, OnlineUser, User } from "@backend/types";

import { getUserById, token, userData } from "@backend/user";
import { listenAlongWith } from "@backend/gateway";

import emitter from "@backend/events";
import { targetRoute } from "@backend/user";
import { console } from "@app/utils";

import TrackPlayer from "react-native-track-player";

export let listeningWith: User | null = null; // The ID of the user you are currently listening with.

/**
 * Checks if the user is listening with someone.
 */
export function isListeningWith(): boolean {
    return listeningWith != null;
}

/**
 * Listens along with the specified user.
 * @param user The user to listen along with.
 */
export async function listenWith(user: string | null = null): Promise<void> {
    // Reset the track player.
    await TrackPlayer.reset();
    // Set the listening with user.
    listeningWith = user ? await getUserById(user) : null;
    // Inform the gateway to sync with the specified user.
    listenAlongWith(user);
    // Emit the listening event.
    emitter.emit("listen", listeningWith);
}

/**
 * Gets all online users which are listening on Laudiolin.
 * @param active Should only active users be returned?
 */
export async function getAvailableUsers(active: boolean = true): Promise<OnlineUser[]> {
    const route = `${targetRoute}/social/available?active=${active}`;
    const response = await fetch(route, {
        headers: {
            Authorization: userData ? await token() : ""
        }
    });

    // Check the response.
    if (response.status != 200) {
        console.error(`Failed to get available users: ${response.status} ${response.statusText}`);
        return [];
    }

    // Return the users.
    return (await response.json()).onlineUsers;
}

/**
 * Gets all offline users which are listening on Laudiolin.
 */
export async function getRecentUsers(): Promise<OfflineUser[]> {
    const route = `${targetRoute}/social/recent`;
    const response = await fetch(route, {
        headers: {
            Authorization: userData ? await token() : ""
        }
    });

    // Check the response.
    if (response.status != 200) {
        console.error(`Failed to get recent users: ${response.status} ${response.statusText}`);
        return [];
    }

    // Return the users.
    return (await response.json()).recentUsers;
}

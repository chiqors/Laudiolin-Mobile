import { logger } from "react-native-logs";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import Backend from "@backend/backend";
import { useFavorites, useGlobal, usePlaylists, useRecents, useUser } from "@backend/stores";
import { BasicUser, OwnedPlaylist, RemoteInfo, User } from "@backend/types";
import { EmitterSubscription } from "react-native";

const log = logger.createLogger();

export let lastToken: string | undefined = undefined;
let linkRegister: EmitterSubscription | null = null;

/**
 * Sets up the deep link listener for logging in.
 */
function setup() {
    linkRegister = Linking.addEventListener("url", async ({ url }) => {
        if (url.includes("login") && url.includes("token")) {
            const token = url.split("token=")[1];
            await logIn(token);
        }
    });
}

/**
 * Removes the event listener for the login deep link.
 */
function disableLink() {
    if (linkRegister) {
        linkRegister.remove();
        linkRegister = null;
    }
}

/**
 * Stores a user's token in the secure store.
 *
 * @param token The token to store.
 */
async function storeToken(token: string) {
    lastToken = token;
    await SecureStore.setItemAsync("userToken", token);
}

/**
 * Fetches a user's token from the secure store.
 */
async function getToken(): Promise<string> {
    return lastToken ?? (await SecureStore.getItemAsync("userToken")) ?? "";
}

/**
 * Fetches user data from the backend using a user's token.
 *
 * @param token The user's authentication token.
 */
async function logIn(token: string): Promise<boolean> {
    if (token == "") return false;

    const response = await fetch(`${Backend.getBaseUrl()}/user`, {
        headers: { authorization: token }, cache: "no-cache"
    });

    if (response.status != 301) {
        log.error("Failed to login", response.status);
        return false;
    }

    // Store the user's token.
    await storeToken(token);

    // Load the user data.
    useUser.setState(await response.json());
    log.info("Loaded user data!");

    loadRecents();
    loadFavorites();
    loadPlaylists()
        .catch(error => log.error("Failed to load playlists", error));

    // Check if the login page is shown.
    if (useGlobal.getState().showLoginPage) {
        useGlobal.setState({ showLoginPage: false });
    }

    return true;
}

/**
 * Checks if the user has to re-authenticate.
 */
async function authenticate(): Promise<void> {
    const token = await getToken();
    if (token == "" || !await logIn(token)) {
        useGlobal.setState({ showLoginPage: true });
    }
}

/**
 * Logs the user out of the app.
 *
 * @param toLogin Should the user be shown the login page after logging out?
 */
async function logOut(toLogin: boolean = true): Promise<void> {
    await SecureStore.deleteItemAsync("userToken");
    useUser.setState(null, true);
    useRecents.setState([], true);
    useFavorites.setState([], true);
    usePlaylists.setState([], true);

    if (toLogin) {
        useGlobal.setState({ showLoginPage: true });
    }

    log.info("Removed user data.");
}

/**
 * Loads the user's recently played tracks into the store.
 * This method can also be used to replace the recents with a new list of tracks.
 *
 * @param tracks The list of tracks to replace the recents with.
 */
function loadRecents(tracks: RemoteInfo[] | null = null): void {
    if (tracks) {
        useRecents.setState(tracks);
    } else {
        const user = useUser.getState() as User;
        if (!user) {
            log.warn("Unable to load recent tracks; user is not logged in.");
            return;
        }

        if (!user.recentlyPlayed) {
            log.warn("Unable to load recent tracks; user has no recents.");
            return;
        }

        const recents = user.recentlyPlayed.map(track => {
            track.type = "remote";
            return track;
        });

        useRecents.setState(recents);
        log.info(`Loaded ${user.recentlyPlayed.length} recent tracks!`);
    }
}

/**
 * Resolves the user's playlists and loads them into the store.
 */
async function loadPlaylists(): Promise<void> {
    const user = useUser.getState() as User;
    if (!user) {
        log.warn("Unable to load playlists; user is not logged in.");
        return;
    }

    if (!user.playlists) {
        log.warn("Unable to load playlists; user has no playlists.");
        return;
    }

    let playlists: OwnedPlaylist[] = [];
    const route = `${Backend.getBaseUrl()}/playlist`;
    for (const id of user.playlists) {
        const response = await fetch(`${route}/${id}`, {
            headers: { authorization: await getToken() }, cache: "no-cache"
        });

        if (response.status != 301) {
            log.error("Failed to load playlist", id, response.status);
            continue;
        }

        try {
            const data = await response.json();
            playlists.push(data);
        } catch (error) {
            log.error("Failed to load playlists", error);
        }
    }

    // LEGACY: Remove duplicate playlists.
    playlists = playlists
        .filter((playlist, index, self) => index == self.findIndex(p => p.id == playlist.id))
        .map(playlist => {
            playlist.tracks = playlist.tracks
                .map(track => {
                    track.type = "remote";
                    return track;
                });
            return playlist;
        });

    usePlaylists.setState(playlists);
    log.info(`Loaded ${playlists.length} playlists!`);
}

/**
 * Loads the user's favorite tracks into the store.
 */
function loadFavorites(): void {
    const user = useUser.getState() as User;
    if (!user) {
        log.warn("Unable to load favorites; user is not logged in.");
        return;
    }

    if (!user.likedSongs) {
        log.warn("Unable to load favorites; user has no favorites.");
        return;
    }

    const favorites = user.likedSongs.map(track => {
        track.type = "remote";
        return track;
    });

    useFavorites.setState(favorites);
    log.info(`Loaded ${user.likedSongs.length} favorite tracks!`);
}

/**
 * Adds or removes a track from a user's favorites.
 *
 * @param track The track to favorite.
 * @param add Should the track be added to the user's favorites?
 */
async function favoriteTrack(
    track: RemoteInfo, add: boolean = true
): Promise<boolean> {
    const response = await fetch(`${Backend.getBaseUrl()}/user/favorite`, {
        method: "POST",
        headers: {
            Operation: add ? "add" : "remove",
            authorization: await getToken(),
            "content-type": "application/json"
        },
        body: JSON.stringify(track),
    });

    if (response.status != 200) {
        log.error("Failed to favorite track", track.id, response.status);
        return false;
    }

    useFavorites.setState(await response.json());

    return true;
}

/**
 * Fetches a user by their ID.
 *
 * @param userId The ID of the user to fetch.
 */
async function getUserById(userId: string): Promise<BasicUser | null> {
    const response = await fetch(`${Backend.getBaseUrl()}/user/${userId}`, {
        headers: { authorization: await getToken() }, cache: "no-cache"
    });

    if (response.status != 301) {
        log.error("Failed to load user", userId, response.status);
        return null;
    }

    return await response.json();
}

export default {
    login: logIn,
    logOut,
    authenticate,
    setup,
    disableLink,
    getToken,
    getUserById,
    loadRecents,
    loadPlaylists,
    favoriteTrack
};

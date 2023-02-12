import { DocumentDirectoryPath } from "react-native-fs";
import { mkdir, readDir, unlink } from "react-native-fs";

import * as fs from "@backend/fs";
import * as audio from "@backend/audio";
import { system } from "@backend/settings";

import { userData, playlists, favorites } from "@backend/user";
import { dismiss, notify, notifyEmitter } from "@backend/notifications";
import type { OfflineUserData, Playlist, TrackData, User } from "@backend/types";

import { console } from "@app/utils";

const userDataPath = `${DocumentDirectoryPath}/userData.json`;
const playlistsPath = `${DocumentDirectoryPath}/playlists`;

let downloadedObjects = 0; // The number of objects downloaded.
export let isOffline = false; // Whether the app is in offline mode.

const getDownloadedObjects = () => downloadedObjects; // Get the number of downloaded objects.

/**
 * Loads the user data from the file system.
 */
export async function loadState(
    userData: (data: User) => void,
    playlists: (data: Playlist[]) => void,
    favorites: (data: TrackData[]) => void
): Promise<void> {
    isOffline = system().offline; // Update the offline status.
    if (!isOffline) return; // Return if offline support is disabled.

    // Load the offline data from the filesystem.
    const data = await fs.readData(userDataPath);
    if (!data) {
        console.error("Unable to load offline user data."); return;
    }

    // Read the user data.
    const offlineData = data as OfflineUserData;
    console.info("Loaded offline user data.");
    // Read the playlists from the file system.
    const playlistFiles = (await readDir(playlistsPath))
        .map(file => file.name);
    console.info("Loaded offline playlists.");
    const playlistData = await Promise.all(playlistFiles.map(async file =>
        await fs.readData(`${playlistsPath}/${file}`)
    ));
    console.info("Loaded offline playlist data.");
    // Read the favorites from the file system.
    const favoriteData = await Promise.all(offlineData.favorites.map(async id =>
        await fs.readData(fs.getDataPath({ id }))
    ));
    console.info("Loaded offline favorites.");

    // Invoke the callbacks.
    userData(offlineData.user);
    playlists(playlistData as Playlist[]);
    favorites(favoriteData as TrackData[]);
}

/**
 * Saves all tracks to the file system.
 * @param tracks An array of track data objects.
 */
function saveTracks(tracks: TrackData[]): void {
    tracks.forEach(track => {
        audio.downloadTrack(track, false)
            .then(() => downloadedObjects++)
            .catch(err => console.error(err));
    });
}

/**
 * Toggles the offline support for the app.
 * Performs actions to clean up or save data.
 * @param enabled Whether to enable or disable offline support.
 */
export async function offlineSupport(enabled: boolean): Promise<void> {
    if (enabled) {
        // Save user data to the file system.
        const data: OfflineUserData = {
            user: userData!,
            playlists: [],
            favorites: favorites.map(track => track.id),
        };

        // Calculate the objects to save.
        let objects = 1 + playlists.length + favorites.length +
            playlists.map(playlist => playlist.tracks.length)
                .reduce((a, b) => a + b, 0);
        console.info(`Started downloading offline data. (${objects} objects)`);

        // Check if the user has downloaded any tracks.
        let interval = setInterval(() => {
            if (downloadedObjects == objects) {
                clearInterval(interval);
                notify({
                    type: "info",
                    message: "Offline data downloaded.",
                    date: new Date(),
                    icon: "file-download",
                    onPress: dismiss
                });

                notifyEmitter.removeAllListeners("offlineDownload");
            }

            notifyEmitter.emit("offlineDownload");
        }, 1e3);

        // Send a notification for the download progress.
        await notify({
            type: "progress",
            message: "Downloading offline data...",
            date: new Date(),
            icon: "file-download",
            event: "offlineDownload",
            progress: getDownloadedObjects(),
            totalProgress: objects,
            onPress: index => {
                getDownloadedObjects() == objects && dismiss(index);
            },
            update: data => {
                data.progress = getDownloadedObjects();
                if (getDownloadedObjects() == objects) {
                    dismiss(data.index ?? 0); // Dismiss the notification.
                    downloadedObjects = 0; // Reset the downloaded objects.
                }
            }
        });

        // Save the playlists to the file system.
        playlists.forEach(playlist => {
            // Save the playlist ID to the user data.
            playlist.id && data.playlists.push(playlist.id);
            // Save the playlist to the file system.
            fs.saveData(playlist, `${playlistsPath}/${playlist.id}.json`)
                .then(() => downloadedObjects++);
            // Download the tracks in the playlist.
            saveTracks(playlist.tracks);
        });

        saveTracks(favorites); // Download every favorite track.
        fs.saveData(data, userDataPath)
            .then(() => downloadedObjects++); // Save the user data.
    } else {
        await unlink(userDataPath); // Delete the saved user data.
        await unlink(playlistsPath); // Delete the saved playlists.
        await mkdir(playlistsPath); // Create the playlists directory.
    }
}

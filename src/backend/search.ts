import { Track } from "react-native-track-player";
import { logger } from "react-native-logs";

import Backend from "@backend/backend";
import { useSettings } from "@backend/stores";
import { SearchResult, TrackInfo, blank_SearchResult, RemoteInfo } from "@backend/types";

const log = logger.createLogger();

/**
 * Performs a track search on the backend.
 *
 * @param query The song to search for.
 */
export async function search(query: string): Promise<SearchResult> {
    const engine = useSettings.getState().search.engine;
    const response = await fetch(
        `${Backend.getBaseUrl()}/search/${query}?engine=${engine}`,
        { cache: "default" }
    );

    if (response.status == 404)
        return blank_SearchResult;

    try {
        return (await response.json()) as SearchResult;
    } catch (error) {
        log.error("Failed to parse search result.", response.status, error);
        return {
            top: null,
            results: []
        };
    }
}

/**
 * Parses the tracks from a search result.
 *
 * @param result The search result to parse.
 */
export function tracks({ results, top }: SearchResult): RemoteInfo[] {
    if (!top) return [];

    const tracks: { [key: string]: RemoteInfo } = {};

    top.type = "remote";
    tracks[top.id] = top;

    for (const track of results) {
        if (!tracks[track.id]) {
            track.type = "remote";
            tracks[track.id] = track;
        }
    }

    return Object.values(tracks);
}

/**
 * Parses the author of a track.
 *
 * @param track The track to parse.
 */
export function artist(track: TrackInfo | Track | string | undefined): string {
    if (!track) return "Unknown";

    let artist = typeof track == "string" ? track : track.artist ?? "";
    return artist.length == 0 ? "Unknown" : artist;
}

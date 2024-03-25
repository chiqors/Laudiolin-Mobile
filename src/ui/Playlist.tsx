import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import FaIcon from "react-native-vector-icons/FontAwesome";
import Fa6Icon from "react-native-vector-icons/FontAwesome6";
import EnIcon from "react-native-vector-icons/Entypo";

import FastImage from "react-native-fast-image";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { NavigationProp, RouteProp } from "@react-navigation/native";

import EditPlaylist from "@modals/EditPlaylist";
import Track from "@widgets/Track";
import BackButton from "@widgets/BackButton";

import StyledMenu from "@components/StyledMenu";
import StyledButton from "@components/StyledButton";
import StyledText, { Size } from "@components/StyledText";

import Player from "@backend/player";
import Playlists from "@backend/playlist";
import { useColor } from "@backend/stores";
import { toIconUrl } from "@backend/utils";
import { OwnedPlaylist, TrackInfo } from "@backend/types";

import { value } from "@style/Laudiolin";

interface RouteParams {
    playlist: OwnedPlaylist;
    playlistId?: string;
}

interface IProps {
    route: RouteProp<any>;
    navigation: NavigationProp<any>;
}

function Playlist(props: IProps) {
    const { route, navigation } = props;
    const { playlist: data, playlistId } = route.params as RouteParams;

    const colors = useColor();

    const [playlist, setPlaylist] = useState<OwnedPlaylist | null | undefined>(data);

    const [tracks, setTracks] = useState<TrackInfo[]>(data?.tracks ?? []);
    const [author, setAuthor] = useState("Unknown");

    const [showEdit, setShowEdit] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDesc, setShowDescription] = useState(false);

    useEffect(() => {
        if (playlistId && !playlist) {
            Playlists.fetchPlaylist(playlistId).then(setPlaylist);
        }
    }, [playlistId]);

    useEffect(() => {
        if (playlist != null) {
            Playlists.getAuthor(playlist.owner)
                .then(author => setAuthor(author ?? "Unknown"));

            setTracks(playlist.tracks);
        }
    }, [playlist]);

    const renderItem = ({ item, drag, isActive }: RenderItemParams<TrackInfo>) => (
        <ScaleDecorator>
            <Track
                style={{ marginBottom: 10 }}
                disabled={isActive} onHold={drag}
                data={item} playlist={playlist!}
            />
        </ScaleDecorator>
    );

    return playlist ? (
        <View style={style.Playlist}>
            <View style={style.Playlist_Header}>
                <BackButton navigation={navigation} />

                <TouchableOpacity onPress={() => setShowMenu(true)}>
                    <EnIcon name={"dots-three-vertical"} size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                activeOpacity={0.7}
                style={style.Playlist_Info}
                onPress={() => setShowDescription(!showDesc)}
                onLongPress={() => setShowMenu(true)}
            >
                <FastImage
                    source={{
                        uri: toIconUrl(playlist.icon),
                        cache: FastImage.cacheControl.web
                    }}
                    style={style.Playlist_Cover}
                />

                <View style={{ width: "50%", flexDirection: "column" }}>
                    { showDesc ? (
                        <StyledText text={playlist.description} lines={4} />
                    ) : <>
                        <StyledText text={playlist.name} bold lines={2} size={Size.Subheader} />
                        <StyledText text={author} lines={1} size={Size.Text} />
                    </> }
                </View>
            </TouchableOpacity>

            <View style={style.Playlist_Actions}>
                <View style={style.Playlist_ActionBar}>
                    { playlist.id != "favorites" && (
                        <StyledButton
                            text={"Edit"}
                            style={style.Playlist_Button}
                            icon={<FaIcon
                                name={"edit"} size={20} color={colors.text}
                                style={{ marginRight: 5 }}
                            />}
                            buttonStyle={{ backgroundColor: colors.secondary }}
                            onPress={() => setShowEdit(true)}
                        />
                    ) }
                </View>

                <View style={style.Playlist_ActionBar}>
                    <StyledButton
                        text={"Play"}
                        style={style.Playlist_Button}
                        icon={<EnIcon
                            name={"controller-play"} size={20} color={colors.text}
                            style={{ marginRight: 5 }}
                        />}
                        buttonStyle={{ backgroundColor: colors.contrast }}
                        onPress={() => Player.play(playlist?.tracks, {
                            playlist, clear: true, reset: true
                        })}
                    />

                    <StyledButton
                        text={"Shuffle"}
                        style={style.Playlist_Button}
                        icon={<Fa6Icon
                            name={"shuffle"} size={20} color={colors.text}
                            style={{ marginRight: 5 }}
                        />}
                        buttonStyle={{ backgroundColor: colors.accent }}
                        onPress={() => Player.play(playlist?.tracks, {
                            playlist, clear: true, shuffle: true, reset: true
                        })}
                    />
                </View>
            </View>

            {
                playlist.tracks.length > 0 ?
                    <DraggableFlatList
                        activationDistance={30}
                        data={tracks}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        style={{ marginBottom: 230 }}
                        showsVerticalScrollIndicator={false}
                        onDragEnd={async ({ data }) => {
                            const oldTracks = [...playlist.tracks];

                            setTracks(data); // Update locally so there is no delay.
                            if (playlist.id != "favorites" &&
                                !await Playlists.editPlaylist(
                                    { ...playlist, tracks: data })) {
                                setTracks(oldTracks); // Revert the changes.
                            }
                        }}
                    />
                    :
                    <View>
                        <StyledText text={"Add some tracks to see them here!"}
                                    lines={2} bold size={Size.Text}
                                    style={style.Playlist_NoTracks}
                        />
                    </View>
            }

            <EditPlaylist
                playlist={playlist}
                visible={showEdit}
                hide={() => setShowEdit(false)}
            />

            <StyledMenu
                closeOnPress
                opened={showMenu}
                close={() => setShowMenu(false)}
                options={[
                    playlist.tracks.length > 0 ? {
                        text: "Add Songs to Queue",
                        icon: <FaIcon name={"plus"} size={20} color={colors.text} />,
                        onPress: () => Player.play(playlist.tracks, { playlist })
                    } : undefined,
                    {
                        text: `${showDesc ? "Hide" : "Show"} Description`,
                        icon: <EnIcon name={"info"} size={20} color={colors.text} />,
                        onPress: () => setShowDescription(!showDesc)
                    }
                ]}
                optionsStyle={{ width: 210 }}
            />
        </View>
    ) : undefined;
}

export default Playlist;

const style = StyleSheet.create({
    Playlist: {
        width: "100%",
        height: "100%",
        padding: value.padding,
        gap: 15
    },
    Playlist_Header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    Playlist_Cover: {
        width: 120, height: 128,
        borderRadius: 20
    },
    Playlist_Info: {
        width: "100%",
        flexDirection: "row",
        gap: 15,
        alignItems: "center"
    },
    Playlist_Actions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    Playlist_ActionBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    Playlist_Button: {
        borderRadius: 10
    },
    Playlist_NoTracks: {
        alignSelf: "center"
    }
});

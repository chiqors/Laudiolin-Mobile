import { Dimensions, StyleSheet } from "react-native";

export const LoginPageStyle = StyleSheet.create({
    top: {
        backgroundColor: "#0c0f17",
        width: "100%",

        alignItems: "center",
        justifyContent: "flex-end",

        flex: 4
    },
    bottom: {
        backgroundColor: "#0c0f17",
        width: "100%",

        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 20,

        flex: 4
    },
    image: {
        bottom: 0,
        width: 448, height: 448,
        position: "absolute",
        alignSelf: "center",
        opacity: 0.3
    }
});

export const HomePageStyle = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingTop: 40,
        width: Dimensions.get("window").width,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        paddingBottom: 20
    },
    moreDownloads: {
        textDecorationLine: "underline",
        textAlign: "right",
        paddingRight: 20,
        paddingLeft: "50%"
    },
    morePlays: {
        textDecorationLine: "underline",
        textAlign: "right",
        paddingRight: 20,
        paddingLeft: "44%"
    },
    playlists: {
        flexDirection: "row"
    },
    playlist: {
        paddingRight: 20,
    },
    playlistImage: {
        width: 136, height: 136,
        borderRadius: 20
    }
});

export const SettingsPageStyle = StyleSheet.create({
    container: {
        paddingLeft: 20,
        width: Dimensions.get("window").width,
    },
    title: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",

        paddingTop: 40,
        paddingBottom: 20
    },
    userContainer: {
        flexDirection: "row",
    },
    userImage: {
        width: 48, height: 48,
        borderRadius: 24
    },
    userText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    logOut: {
        fontSize: 13,
        textDecorationLine: "underline",
        textAlign: "right",
        paddingLeft: "48%"
    },
    settingsContainer: {
        paddingTop: 30
    },
    category: {
        fontSize: 20,
        fontWeight: "bold",

        paddingBottom: 30
    },
    configure: {
        paddingBottom: 30
    },
    setting: {
        fontSize: 18,
        fontWeight: "400"
    },
    value: {
        color: "#64676b"
    }
});

export const SearchPageStyle = StyleSheet.create({
    container: {
        paddingTop: 40,
        width: Dimensions.get("window").width,
    },
    searchText: {
        color: "white",
    },
    searchContainer: {
        width: "90%",
        height: 45,
        borderColor: "white",
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 10
    },
    results: {
        paddingTop: 30,
        paddingLeft: 20,
        flexDirection: "row"
    }
});

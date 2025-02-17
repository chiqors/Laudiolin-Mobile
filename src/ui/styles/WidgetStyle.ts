import { Dimensions, StyleSheet } from "react-native";

const dimensions = Dimensions.get("window");
const screenWidth = dimensions.width;

export const TrackStyle = StyleSheet.create({
    container: {

    },
    image: {
        width: 64, height: 64,
        borderRadius: 12
    },
    text: {
        paddingLeft: 15,
        justifyContent: "center"
    },
    title: {
        color: "white",
        fontFamily: "Poppins",
        fontSize: 16,
        width: screenWidth - 160
    },
    artist: {
        fontSize: 12,
    },
    more: {
        zIndex: 1,
        width: 40, height: 40,
        justifyContent: "center",
        alignItems: "center",
    }
});

export const UserStyle = StyleSheet.create({
    container: {
        width: screenWidth - 20,
        backgroundColor: "#0f1c3a",
        padding: 10,
        borderRadius: 20,
        overflow: "hidden",
    },
    userIcon: {
        width: 48, height: 48,
        borderRadius: 64
    },
    text: {
        paddingLeft: 15,
        justifyContent: "center"
    },
    title: {
        color: "white",
        fontFamily: "Poppins",
        fontSize: 18,
        width: screenWidth - 120,
        fontWeight: "bold"
    },
    subtitle: {
        color: "white",
        fontFamily: "Poppins",
        fontSize: 18,
        width: screenWidth - 120,
    },
    offlineOverlay: {
        backgroundColor: `rgba(21,21,21,0.4)`,
        width: screenWidth - 20,
        height: 70,
        position: "absolute",
        zIndex: 1,
        borderRadius: 20,
    },
    detailsContainer: {
        padding: 15,
    },
    details: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    detailsIcon: {
        width: 64,
        height: 64,
        borderRadius: 12,
    },
    detailsText: {
        flexDirection: "column",
        gap: 5,
        width: screenWidth - 140,
    },
    button: {
        width: "100%",
        height: 50,
        borderRadius: 25,
        backgroundColor: "#319a02",
    }
});

export const ControlStyle = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginLeft: 20,
        zIndex: 10000,
    },
    image: {
        height: 60,
        width: Dimensions.get("window").width - 38,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 2.5
    },
    controls: {
        flexDirection: "row",
        position: "absolute",
        right: "5%",
        zIndex: 10,
        marginRight: 10,
        gap: 10
    },
    button: {
        fontSize: 45,
    },
    info: {
        width: Dimensions.get("window").width - 40,
        position: "absolute",
        right: -20,
        justifyContent: "center",
    }
});

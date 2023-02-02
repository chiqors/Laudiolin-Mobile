import React from "react";
import { StyleSheet, View } from "react-native";

import { TabView } from "@rneui/themed";

import Home from "@pages/Home";
import SearchPage from "@pages/SearchPage";
import LoginPage from "@pages/LoginPage";
import SettingsPage from "@pages/SettingsPage";
import PlaylistsPage from "@pages/PlaylistsPage";
import PlayingTrackPage from "@pages/PlayingTrackPage";
import PlaylistPage from "@pages/PlaylistPage";

import NavBar from "@components/NavBar";
import QuickControl from "@components/player/QuickControl";
import Hide from "@components/common/Hide";

import { registerListener } from "@backend/navigation";
import * as user from "@backend/user";
import emitter from "@backend/events";

class Hide extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return this.props.show ? this.props.children : null;
    }
}

interface IState {
    pageIndex: number;
    loggedIn: boolean;

    showTabs: boolean;
    showPlayingTrackPage: boolean;
    showPlaylistsPage: boolean;
    showPlaylistPage: boolean;
}

const style = StyleSheet.create({
    control: {
        position: "absolute",
        bottom: "8%",
    }
});

class App extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            pageIndex: 0,
            loggedIn: user.userData != null,

            showTabs: true,
            showPlayingTrackPage: false,
            showPlaylistsPage: false,
            showPlaylistPage: false
        };

        emitter.on("login", () =>
            this.setState({ loggedIn: true }));
    }

    async componentDidMount() {
        // Login to laudiolin.
        await user.login();

        registerListener(page => {
            switch (page) {
                default:
                    return;
                case "Home":
                    this.setState({
                        pageIndex: 0,
                        loggedIn: true,
                        showTabs: true,
                        showPlayingTrackPage: false,
                        showPlaylistsPage: false,
                        showPlaylistPage: false
                    });
                    return;
                case "Login":
                    this.setState({
                        pageIndex: 0,
                        loggedIn: false,
                        showTabs: false,
                        showPlayingTrackPage: false,
                        showPlaylistsPage: false,
                        showPlaylistPage: false
                    });
                    return;
                case "Playlist":
                    this.setState({
                        pageIndex: 0,
                        showTabs: false,
                        showPlayingTrackPage: false,
                        showPlaylistsPage: false,
                        showPlaylistPage: true
                    });
                    return;
            }
        });
    }

    render() {
        return this.state.loggedIn ? (
            <>
                <Hide show={this.state.showTabs}>
                    <TabView
                        value={this.state.pageIndex}
                        onChange={(i) => this.setState({ pageIndex: i })}
                        animationType="spring"
                        animationConfig={{ useNativeDriver: true, speed: 100 }}
                        disableSwipe={true}
                        containerStyle={{ backgroundColor: "#0c0f17" }}
                    >
                        <TabView.Item>
                            <Home />
                        </TabView.Item>
                        <TabView.Item>
                            <SearchPage />
                        </TabView.Item>
                        <TabView.Item>
                            <SettingsPage />
                        </TabView.Item>
                    </TabView>

                    <NavBar pageIndex={this.state.pageIndex} setPageIndex={(i) => this.setState({ pageIndex: i })} />
                </Hide>

                <PlayingTrackPage
                    showPage={this.state.showPlayingTrackPage}
                    showPageFn={(show) => this.setState({ showPlayingTrackPage: show })}
                />
                <PlaylistsPage showPage={this.state.showPlaylistsPage} />
                <PlaylistPage showPage={this.state.showPlaylistPage} />

                <View style={style.control}>
                    <QuickControl />
                </View>
            </>
        ) : (
            <>
                <LoginPage />
            </>
        )
    }
}

export default App;

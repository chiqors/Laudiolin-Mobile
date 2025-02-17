import React from "react";
import { TouchableHighlight, View, Animated } from "react-native";

import { Text } from "@rneui/themed";
import FastImage from "react-native-fast-image";
import TextTicker from "react-native-text-ticker";
import BasicText from "@components/common/BasicText";
import BasicButton from "@components/common/BasicButton";

import { UserStyle } from "@styles/WidgetStyle";

import type { OfflineUser, OnlineUser } from "@backend/types";
import { listenWith, listeningWith } from "@backend/social";

interface IProps {
    user: OnlineUser & OfflineUser;
    isOffline?: boolean;
}

interface IState {
    isExpanded: boolean;
}

class User extends React.PureComponent<IProps, IState> {
    _height: Animated.Value = new Animated.Value(70);

    constructor(props: IProps) {
        super(props);

        this.state = {
            isExpanded: false
        }
    }

    toTime(duration: number|undefined = 0) {
        let seconds: string|number = Math.floor((duration) % 60);
        let minutes: string|number = Math.floor((duration / (60)) % 60);

        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;

        return [minutes, seconds];
    }

    animateChangeInHeight = () => {
        Animated.timing(this._height, {
            toValue: this.state.isExpanded ? 70 : 220,
            duration: 100,
            useNativeDriver: false
        }).start(() => this.setState({ isExpanded: !this.state.isExpanded }));
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<never>, snapshot?: any) {
        if (prevProps.user.userId != this.props.user.userId) {
            this._height.setValue(70);
            this.setState({ isExpanded: false });
        }
    }

    render() {
        const { user } = this.props;

        let discriminator = user.discriminator ?? "";
        if (discriminator && discriminator != "0")
            discriminator = "#" + discriminator;

        return (
            <TouchableHighlight
                underlayColor={`rgba(0, 0, 0, 0.9)`}
                onPress={this.animateChangeInHeight}
                disabled={this.props.isOffline}
            >
                <Animated.View style={{ ...UserStyle.container, height: this._height  }}>
                    {
                        this.props.isOffline ?
                            <View style={UserStyle.offlineOverlay} /> :
                            null
                    }
                    <View style={{ flexDirection: "row" }}>
                        <FastImage
                            style={UserStyle.userIcon}
                            source={{ uri: user.avatar }}
                            resizeMode={"cover"}
                        />

                        <View style={UserStyle.text}>
                            <BasicText text={`${user.username}${discriminator}`} style={UserStyle.title} />
                            { !this.state.isExpanded ? this.props.isOffline ?
                                <BasicText text={"Last listening to: " + user.lastListeningTo?.title} numberOfLines={1} containerStyle={UserStyle.subtitle} /> :
                                <BasicText text={"Listening to: " + user.listeningTo?.title} numberOfLines={1} containerStyle={UserStyle.subtitle} /> :
                                null
                            }
                        </View>
                    </View>

                    {
                        this.props.isOffline || !this.state.isExpanded ?
                            null :
                            (
                                <View style={UserStyle.detailsContainer}>
                                    <View style={UserStyle.details}>
                                        <FastImage
                                            style={UserStyle.detailsIcon}
                                            source={{ uri: user.listeningTo?.icon }}
                                            resizeMode={"cover"}
                                        />

                                        <View style={UserStyle.detailsText}>
                                            <TextTicker
                                                style={{ color: "white" }}
                                                duration={10000} loop
                                            >
                                                <Text style={{ fontWeight: "bold", color: "white", fontSize: 16 }}>Listening to: </Text>
                                                {user.listeningTo?.title}
                                            </TextTicker>
                                            <Text numberOfLines={3} style={{ color: "white" }}>
                                                <Text style={{ fontWeight: "bold", color: "white", fontSize: 16 }}>Elapsed: </Text>
                                                {this.toTime(user.progress).join(":")}
                                            </Text>
                                        </View>
                                    </View>

                                    <BasicButton
                                        text={listeningWith?.userId == user?.userId ?
                                            "Already Listening!" : "Listen Along!"}
                                        disabled={listeningWith?.userId == user?.userId}
                                        button={UserStyle.button}
                                        container={{ marginTop: 15 }}
                                        title={{ color: "white", fontSize: 18, fontWeight: "bold" }}
                                        press={() => listenWith(user?.userId ?? null)}
                                    />
                                </View>
                            )
                    }
                </Animated.View>
            </TouchableHighlight>
        );
    }
}

export default User;

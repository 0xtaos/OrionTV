import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { View, TextInput, StyleSheet, Animated, Platform } from "react-native";
import { useTVEventHandler } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { SettingsSection } from "./SettingsSection";
import { useSettingsStore } from "@/stores/settingsStore";
import { useRemoteControlStore } from "@/stores/remoteControlStore";
import { useButtonAnimation } from "@/hooks/useAnimation";
import { Colors } from "@/constants/Colors";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface LiveStreamSectionProps {
  onChanged: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
}

export interface LiveStreamSectionRef {
  setInputValue: (value: string) => void;
}

export const LiveStreamSection = forwardRef<LiveStreamSectionRef, LiveStreamSectionProps>(
  ({ onChanged, onFocus, onBlur, onPress }, ref) => {
    const { m3uUrl, setM3uUrl, remoteInputEnabled } = useSettingsStore();
    const { serverUrl } = useRemoteControlStore();
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSectionFocused, setIsSectionFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const inputAnimationStyle = useButtonAnimation(isSectionFocused, 1.01);
    const deviceType = useResponsiveLayout().deviceType;

    const handleUrlChange = (url: string) => {
      setM3uUrl(url);
      onChanged();
    };

    useImperativeHandle(ref, () => ({
      setInputValue: (value: string) => {
        setM3uUrl(value);
        onChanged();
      },
    }));

    const handleSectionFocus = () => {
      setIsSectionFocused(true);
      onFocus?.();
    };

    const handleSectionBlur = () => {
      setIsSectionFocused(false);
      onBlur?.();
    };

    const handlePress = () => {
      inputRef.current?.focus();
      onPress?.();
    }

    const handleTVEvent = React.useCallback(
      (event: any) => {
        if (isSectionFocused && event.eventType === "select") {
          inputRef.current?.focus();
        }
      },
      [isSectionFocused]
    );

    useTVEventHandler(handleTVEvent);

    return (
      <SettingsSection focusable onFocus={handleSectionFocus} onBlur={handleSectionBlur}
      onPress={Platform.isTV||deviceType !=='tv' ? undefined : handlePress}
      >
        <View style={styles.inputContainer}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.sectionTitle}>直播源地址</ThemedText>
            {remoteInputEnabled && serverUrl && (
              <ThemedText style={styles.subtitle}>用手机访问 {serverUrl}，可远程输入</ThemedText>
            )}
          </View>
          <Animated.View style={inputAnimationStyle}>
            <TextInput
              ref={inputRef}
              style={[styles.input, isInputFocused && styles.inputFocused]}
              value={m3uUrl}
              onChangeText={handleUrlChange}
              placeholder="输入 M3U 直播源地址"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              // onPress={handlePress}
            />
          </Animated.View>
        </View>
      </SettingsSection>
    );
  }
);

LiveStreamSection.displayName = "LiveStreamSection";

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#3a3a3c",
    color: "white",
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});

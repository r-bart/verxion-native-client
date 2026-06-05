import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import {
  SHOWCASE_METRICS,
  SHOWCASE_MAX,
  type AthleteProfile,
  type SectionVisibility,
  type FeedSharingSettings,
  type TimelineDetailLevel,
  type ShowcaseMetric,
} from "@/domain/settings";
import { SettingsScaffold } from "../components/SettingsScaffold";
import { SettingsSection } from "../components/SettingsSection";
import { SettingsRow } from "../components/SettingsRow";
import { Toggle } from "../components/Toggle";
import { useAthleteProfile } from "../hooks/useAthleteProfile";
import {
  useUpdateVisibility,
  useUpdateShowcase,
  useUpdateTimelineDetail,
  useUpdateFollowApproval,
  useFeedSharing,
  useUpdateFeedSharing,
} from "../hooks/usePrivacy";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";

export function PrivacyScreen() {
  const { t } = useTranslation();
  const profileQuery = useAthleteProfile();
  const feedQuery = useFeedSharing();

  if (profileQuery.isLoading || feedQuery.isLoading || !profileQuery.data || !feedQuery.data) {
    return (
      <SettingsScaffold title={t("settings.screens.privacy.title")}>
        <ActivityIndicator color={glass.lava} style={{ marginTop: 24 }} />
      </SettingsScaffold>
    );
  }

  const seedKey = `${JSON.stringify(profileQuery.data.sectionVisibility)}|${profileQuery.data.showcaseMetrics.join(",")}|${profileQuery.data.timelineDetailLevel}|${profileQuery.data.requireFollowApproval}|${JSON.stringify(feedQuery.data)}`;
  return <PrivacyForm key={seedKey} profile={profileQuery.data} feed={feedQuery.data} />;
}

function SectionHint({ text }: { text: string }) {
  return (
    <Text style={{ fontFamily: mono(400), fontSize: 12, lineHeight: 17, color: glass.ink3, marginTop: -4 }}>
      {text}
    </Text>
  );
}

function PrivacyForm({ profile, feed }: { profile: AthleteProfile; feed: FeedSharingSettings }) {
  const { t } = useTranslation();
  const updateVisibility = useUpdateVisibility();
  const updateShowcase = useUpdateShowcase();
  const updateTimeline = useUpdateTimelineDetail();
  const updateFollow = useUpdateFollowApproval();
  const updateFeed = useUpdateFeedSharing();

  const [visibility, setVisibility] = useState<SectionVisibility>(profile.sectionVisibility);
  const [feedSharing, setFeedSharing] = useState<FeedSharingSettings>(feed);
  const [timeline, setTimeline] = useState<TimelineDetailLevel>(profile.timelineDetailLevel);
  const [requireApproval, setRequireApproval] = useState(profile.requireFollowApproval);
  const [showcase, setShowcase] = useState<ShowcaseMetric[]>(profile.showcaseMetrics);

  // Optimistic toggles: apply locally for instant feedback, then revert that
  // exact change if the write fails (and the error line below surfaces it).
  const toggleVisibility = (key: keyof SectionVisibility) => (next: boolean) => {
    const prev = visibility;
    setVisibility({ ...visibility, [key]: next });
    updateVisibility.mutate({ ...visibility, [key]: next }, { onError: () => setVisibility(prev) });
  };

  const toggleFeed = (key: keyof FeedSharingSettings) => (next: boolean) => {
    const prev = feedSharing;
    setFeedSharing({ ...feedSharing, [key]: next });
    updateFeed.mutate({ ...feedSharing, [key]: next }, { onError: () => setFeedSharing(prev) });
  };

  const setTimelineLevel = (level: TimelineDetailLevel) => {
    if (level === timeline) return;
    const prev = timeline;
    setTimeline(level);
    updateTimeline.mutate(level, { onError: () => setTimeline(prev) });
  };

  const toggleApproval = (next: boolean) => {
    const prev = requireApproval;
    setRequireApproval(next);
    updateFollow.mutate(next, { onError: () => setRequireApproval(prev) });
  };

  const toggleMetric = (metric: ShowcaseMetric) => {
    const selected = showcase.includes(metric);
    if (!selected && showcase.length >= SHOWCASE_MAX) return; // cap reached
    const prev = showcase;
    const updated = selected ? showcase.filter((m) => m !== metric) : [...showcase, metric];
    setShowcase(updated);
    updateShowcase.mutate(updated, { onError: () => setShowcase(prev) });
  };

  const hasError =
    updateVisibility.isError ||
    updateFeed.isError ||
    updateTimeline.isError ||
    updateFollow.isError ||
    updateShowcase.isError;

  return (
    <SettingsScaffold
      title={t("settings.screens.privacy.title")}
      subtitle={t("settings.screens.privacy.subtitle")}
    >
      {hasError && (
        <Text style={{ fontFamily: mono(400), fontSize: 12, color: glass.lava }}>
          {t("settings.screens.privacy.error")}
        </Text>
      )}

      {/* Section visibility */}
      <SettingsSection label={t("settings.screens.privacy.visibilityTitle")}>
        {(["bio", "training", "bodyMetrics", "nutrition"] as const).map((key) => (
          <SettingsRow
            key={key}
            label={t(`settings.screens.privacy.visibility.${key}`)}
            right={
              <Toggle
                value={visibility[key]}
                onValueChange={toggleVisibility(key)}
                testID={`visibility-${key}`}
              />
            }
          />
        ))}
      </SettingsSection>

      {/* Timeline detail */}
      <View style={{ gap: 8 }}>
        <SettingsSection label={t("settings.screens.privacy.timelineTitle")}>
          <View style={{ padding: 14, gap: 10 }}>
            <SectionHint text={t("settings.screens.privacy.timelineHint")} />
            <View
              style={{
                flexDirection: "row",
                gap: 2,
                padding: 3,
                borderRadius: 9999,
                backgroundColor: glass.fill,
                borderWidth: 1,
                borderColor: glass.stroke,
                alignSelf: "flex-start",
              }}
            >
              {(["summary", "detailed"] as const).map((level) => {
                const active = timeline === level;
                return (
                  <Pressable
                    key={level}
                    onPress={() => setTimelineLevel(level)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    testID={`timeline-${level}`}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 7,
                      borderRadius: 9999,
                      backgroundColor: active ? "rgba(255,98,98,0.16)" : "transparent",
                      borderWidth: 1,
                      borderColor: active ? glass.lavaBorder : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: sans(active ? 600 : 500),
                        fontSize: 13,
                        color: active ? glass.lava : glass.ink2,
                      }}
                    >
                      {t(`settings.screens.privacy.timeline.${level}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SettingsSection>
      </View>

      {/* Followers */}
      <SettingsSection label={t("settings.screens.privacy.followTitle")}>
        <SettingsRow
          label={t("settings.screens.privacy.followApproval")}
          right={
            <Toggle value={requireApproval} onValueChange={toggleApproval} testID="follow-approval" />
          }
        />
      </SettingsSection>

      {/* Feed sharing */}
      <View style={{ gap: 8 }}>
        <SettingsSection label={t("settings.screens.privacy.feedTitle")}>
          {(["training", "nutrition", "bodyMetrics"] as const).map((key) => (
            <SettingsRow
              key={key}
              label={t(`settings.screens.privacy.feed.${key}`)}
              right={
                <Toggle value={feedSharing[key]} onValueChange={toggleFeed(key)} testID={`feed-${key}`} />
              }
            />
          ))}
        </SettingsSection>
        <SectionHint text={t("settings.screens.privacy.feedHint")} />
      </View>

      {/* Showcase metrics */}
      <View style={{ gap: 8 }}>
        <SettingsSection label={t("settings.screens.privacy.showcaseTitle")}>
          <View style={{ padding: 14, gap: 12 }}>
            <SectionHint
              text={t("settings.screens.privacy.showcaseHint", { count: showcase.length, max: SHOWCASE_MAX })}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {SHOWCASE_METRICS.map((metric) => {
                const selected = showcase.includes(metric);
                const atCap = !selected && showcase.length >= SHOWCASE_MAX;
                return (
                  <Pressable
                    key={metric}
                    onPress={() => toggleMetric(metric)}
                    disabled={atCap}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    testID={`showcase-${metric}`}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 9999,
                      backgroundColor: selected ? glass.upBg : glass.fill,
                      borderWidth: 1,
                      borderColor: selected ? "rgba(95,227,154,0.4)" : glass.stroke,
                      opacity: atCap ? 0.4 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: sans(selected ? 600 : 500),
                        fontSize: 12.5,
                        color: selected ? glass.up : glass.ink2,
                      }}
                    >
                      {t(`settings.screens.privacy.metrics.${metric}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </SettingsSection>
      </View>
    </SettingsScaffold>
  );
}

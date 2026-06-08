import { useReducer } from "react";
import { View, Text, Pressable } from "react-native";
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
import { SettingsSkeleton } from "../components/SettingsSkeleton";
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
    return <SettingsSkeleton title={t("settings.screens.privacy.title")} variant="form" />;
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

type PrivacyFormState = {
  visibility: SectionVisibility;
  feedSharing: FeedSharingSettings;
  timeline: TimelineDetailLevel;
  requireApproval: boolean;
  showcase: ShowcaseMetric[];
};

type PrivacyFormAction =
  | { type: 'SET_VISIBILITY'; value: SectionVisibility }
  | { type: 'SET_FEED_SHARING'; value: FeedSharingSettings }
  | { type: 'SET_TIMELINE'; value: TimelineDetailLevel }
  | { type: 'SET_REQUIRE_APPROVAL'; value: boolean }
  | { type: 'SET_SHOWCASE'; value: ShowcaseMetric[] }
  | { type: 'REVERT_VISIBILITY'; value: SectionVisibility }
  | { type: 'REVERT_FEED_SHARING'; value: FeedSharingSettings }
  | { type: 'REVERT_TIMELINE'; value: TimelineDetailLevel }
  | { type: 'REVERT_REQUIRE_APPROVAL'; value: boolean }
  | { type: 'REVERT_SHOWCASE'; value: ShowcaseMetric[] };

function privacyFormReducer(state: PrivacyFormState, action: PrivacyFormAction): PrivacyFormState {
  switch (action.type) {
    case 'SET_VISIBILITY':
    case 'REVERT_VISIBILITY':
      return { ...state, visibility: action.value };
    case 'SET_FEED_SHARING':
    case 'REVERT_FEED_SHARING':
      return { ...state, feedSharing: action.value };
    case 'SET_TIMELINE':
    case 'REVERT_TIMELINE':
      return { ...state, timeline: action.value };
    case 'SET_REQUIRE_APPROVAL':
    case 'REVERT_REQUIRE_APPROVAL':
      return { ...state, requireApproval: action.value };
    case 'SET_SHOWCASE':
    case 'REVERT_SHOWCASE':
      return { ...state, showcase: action.value };
    default:
      return state;
  }
}

function PrivacyForm({ profile, feed }: { profile: AthleteProfile; feed: FeedSharingSettings }) {
  const { t } = useTranslation();
  const updateVisibility = useUpdateVisibility();
  const updateShowcase = useUpdateShowcase();
  const updateTimeline = useUpdateTimelineDetail();
  const updateFollow = useUpdateFollowApproval();
  const updateFeed = useUpdateFeedSharing();

  const [state, dispatch] = useReducer(privacyFormReducer, {
    visibility: profile.sectionVisibility,
    feedSharing: feed,
    timeline: profile.timelineDetailLevel,
    requireApproval: profile.requireFollowApproval,
    showcase: profile.showcaseMetrics,
  });

  // Optimistic toggles: apply locally for instant feedback, then revert that
  // exact change if the write fails (and the error line below surfaces it).
  const toggleVisibility = (key: keyof SectionVisibility) => (next: boolean) => {
    const prev = state.visibility;
    const newVisibility = { ...state.visibility, [key]: next };
    dispatch({ type: 'SET_VISIBILITY', value: newVisibility });
    updateVisibility.mutate(newVisibility, { onError: () => dispatch({ type: 'REVERT_VISIBILITY', value: prev }) });
  };

  const toggleFeed = (key: keyof FeedSharingSettings) => (next: boolean) => {
    const prev = state.feedSharing;
    const newFeedSharing = { ...state.feedSharing, [key]: next };
    dispatch({ type: 'SET_FEED_SHARING', value: newFeedSharing });
    updateFeed.mutate(newFeedSharing, { onError: () => dispatch({ type: 'REVERT_FEED_SHARING', value: prev }) });
  };

  const setTimelineLevel = (level: TimelineDetailLevel) => {
    if (level === state.timeline) return;
    const prev = state.timeline;
    dispatch({ type: 'SET_TIMELINE', value: level });
    updateTimeline.mutate(level, { onError: () => dispatch({ type: 'REVERT_TIMELINE', value: prev }) });
  };

  const toggleApproval = (next: boolean) => {
    const prev = state.requireApproval;
    dispatch({ type: 'SET_REQUIRE_APPROVAL', value: next });
    updateFollow.mutate(next, { onError: () => dispatch({ type: 'REVERT_REQUIRE_APPROVAL', value: prev }) });
  };

  const toggleMetric = (metric: ShowcaseMetric) => {
    const selected = state.showcase.includes(metric);
    if (!selected && state.showcase.length >= SHOWCASE_MAX) return; // cap reached
    const prev = state.showcase;
    const updated = selected ? state.showcase.filter((m) => m !== metric) : [...state.showcase, metric];
    dispatch({ type: 'SET_SHOWCASE', value: updated });
    updateShowcase.mutate(updated, { onError: () => dispatch({ type: 'REVERT_SHOWCASE', value: prev }) });
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
                value={state.visibility[key]}
                onValueChange={toggleVisibility(key)}
                testID={`visibility-${key}`}
                accessibilityLabel={t(`settings.screens.privacy.visibility.${key}`)}
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
                const active = state.timeline === level;
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
            <Toggle 
              value={state.requireApproval} 
              onValueChange={toggleApproval} 
              testID="follow-approval"
              accessibilityLabel={t("settings.screens.privacy.followApproval")}
            />
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
                <Toggle 
                  value={state.feedSharing[key]} 
                  onValueChange={toggleFeed(key)} 
                  testID={`feed-${key}`}
                  accessibilityLabel={t(`settings.screens.privacy.feed.${key}`)}
                />
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
              text={t("settings.screens.privacy.showcaseHint", { count: state.showcase.length, max: SHOWCASE_MAX })}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {SHOWCASE_METRICS.map((metric) => {
                const selected = state.showcase.includes(metric);
                const atCap = !selected && state.showcase.length >= SHOWCASE_MAX;
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

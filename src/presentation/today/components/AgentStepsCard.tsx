/**
 * AgentStepsCard — the prominent "what to do" block on the empty "Hoy" (handoff
 * `13/14 Estado Vacío`, scenario B). A glass card framing onboarding as two
 * steps: connect the agent, then make the first request.
 *
 * The connection state is REAL, not hardcoded: `useConnectedAgent` reads the
 * same connected-apps signal the web SPA uses (`GET /auth-sessions/apps`). Step 1
 * shows "done" (with the connected app's name) once an agent is authorized, and
 * step 2 becomes the active one; otherwise step 1 is active and step 2 upcoming.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useConnectedAgent } from "../hooks/useConnectedAgent";

type StepState = "done" | "active" | "upcoming";

function StepBullet({ n, state }: { n: number; state: StepState }) {
  const active = state === "active";
  const done = state === "done";
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 9999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: done ? "rgba(255,255,255,0.06)" : active ? glass.lavaBg : "transparent",
        borderWidth: done ? 0 : 1.5,
        borderColor: active ? glass.lavaBorder : glass.stroke,
      }}
    >
      {done ? (
        <Check size={13} color={glass.up} strokeWidth={3} />
      ) : (
        <Text style={{ fontFamily: mono(600), fontSize: 11, color: active ? glass.lava : glass.ink3 }}>
          {n}
        </Text>
      )}
    </View>
  );
}

function Step({
  n,
  state,
  title,
  hint,
}: {
  n: number;
  state: StepState;
  title: string;
  hint: string;
}) {
  const done = state === "done";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <StepBullet n={n} state={state} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: sans(700),
            fontSize: 14.5,
            letterSpacing: -0.2,
            color: state === "active" ? glass.white : glass.ink2,
            textDecorationLine: done ? "line-through" : "none",
          }}
        >
          {title}
        </Text>
        <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: done ? glass.up : glass.ink3 }}>
          {hint}
        </Text>
      </View>
    </View>
  );
}

export function AgentStepsCard() {
  const { t } = useTranslation();
  const { connected, appName } = useConnectedAgent();

  return (
    <GlassSurface radius={20} style={{ padding: 18, gap: 16 }}>
      <View style={{ gap: 3 }}>
        <Text style={{ fontFamily: sans(700), fontSize: 18, letterSpacing: -0.4, color: glass.white }}>
          {t("today.empty.steps.title")}
        </Text>
        <Text style={{ fontFamily: sans(400), fontSize: 13, color: glass.ink2 }}>
          {t("today.empty.steps.subtitle")}
        </Text>
      </View>

      <View style={{ gap: 14 }}>
        <Step
          n={1}
          state={connected ? "done" : "active"}
          title={t("today.empty.steps.connect")}
          hint={
            connected
              ? t("today.empty.steps.connectedAs", { name: appName ?? t("today.empty.steps.anAgent") })
              : t("today.empty.steps.connectHint")
          }
        />
        <View style={{ height: 1, backgroundColor: glass.stroke, marginLeft: 36 }} />
        <Step
          n={2}
          state={connected ? "active" : "upcoming"}
          title={t("today.empty.steps.firstRequest")}
          hint={t("today.empty.steps.firstRequestHint")}
        />
      </View>
    </GlassSurface>
  );
}

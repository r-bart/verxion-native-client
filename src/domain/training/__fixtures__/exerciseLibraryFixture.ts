/**
 * exerciseLibraryFixture — typed example payload for `ExerciseLibrary`, the
 * contract proposal for `GET /training/exercise-library`. Layer-neutral. Mirrors
 * the handoff's `exercises-data` catalogue.
 *
 * TEMPORARY: served by the repository stub until the endpoint ships.
 */
import type { ExerciseLibrary } from "../models/ExerciseLibrary";

export const exerciseLibraryFixture: ExerciseLibrary = {
  exercises: [
    { id: "press-banca", name: "Press banca", muscle: "Pecho", group: "Pecho", equipment: "Barra", part: "push", prLabel: "82,5 kg", logCount: 18, isCustom: false },
    { id: "press-inclinado-mancuerna", name: "Press inclinado mancuerna", muscle: "Pecho superior", group: "Pecho", equipment: "Mancuerna", part: "push", prLabel: null, logCount: 12, isCustom: false },
    { id: "aperturas-en-polea", name: "Aperturas en polea", muscle: "Pecho", group: "Pecho", equipment: "Polea", part: "push", prLabel: null, logCount: 6, isCustom: false },
    { id: "press-militar", name: "Press militar", muscle: "Hombro", group: "Hombro", equipment: "Barra", part: "push", prLabel: "55 kg", logCount: 11, isCustom: false },
    { id: "elevaciones-laterales", name: "Elevaciones laterales", muscle: "Deltoides lateral", group: "Hombro", equipment: "Mancuerna", part: "push", prLabel: null, logCount: 8, isCustom: false },
    { id: "face-pull", name: "Face pull", muscle: "Deltoides posterior", group: "Hombro", equipment: "Polea", part: "pull", prLabel: null, logCount: 5, isCustom: false },
    { id: "dominadas-lastradas", name: "Dominadas lastradas", muscle: "Dorsal", group: "Espalda", equipment: "Peso corporal", part: "pull", prLabel: "+20 kg", logCount: 15, isCustom: false },
    { id: "remo-con-barra", name: "Remo con barra", muscle: "Espalda", group: "Espalda", equipment: "Barra", part: "pull", prLabel: null, logCount: 14, isCustom: false },
    { id: "jalon-al-pecho", name: "Jalón al pecho", muscle: "Dorsal", group: "Espalda", equipment: "Polea", part: "pull", prLabel: null, logCount: 7, isCustom: false },
    { id: "curl-de-biceps", name: "Curl de bíceps", muscle: "Bíceps", group: "Brazo", equipment: "Mancuerna", part: "pull", prLabel: null, logCount: 9, isCustom: false },
    { id: "sentadilla", name: "Sentadilla", muscle: "Cuádriceps", group: "Pierna", equipment: "Barra", part: "legs", prLabel: "142,5 kg", logCount: 16, isCustom: false },
    { id: "peso-muerto-rumano", name: "Peso muerto rumano", muscle: "Femoral", group: "Pierna", equipment: "Barra", part: "legs", prLabel: "122,5 kg", logCount: 13, isCustom: false },
    { id: "prensa-inclinada", name: "Prensa inclinada", muscle: "Cuádriceps", group: "Pierna", equipment: "Máquina", part: "legs", prLabel: null, logCount: 10, isCustom: false },
    { id: "hip-thrust", name: "Hip thrust", muscle: "Glúteo", group: "Pierna", equipment: "Barra", part: "legs", prLabel: "110 kg", logCount: 12, isCustom: false },
    { id: "plancha", name: "Plancha", muscle: "Core", group: "Core", equipment: "Peso corporal", part: "core", prLabel: null, logCount: 0, isCustom: false },
  ],
  facets: {
    groups: ["Pecho", "Hombro", "Espalda", "Brazo", "Pierna", "Core"],
    equipment: ["Barra", "Mancuerna", "Polea", "Máquina", "Peso corporal"],
  },
};

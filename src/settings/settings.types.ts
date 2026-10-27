import type { InitiativeViewState } from "src/tracker/view.types";
import type { RollPlayerInitiativeBehavior } from "src/utils";
import type { Condition } from "src/types/creatures";
import type { HomebrewCreature } from "src/types/creatures";
import type { BuilderState } from "src/builder/builder.types";

export interface InitiativeTrackerData {
    beginnerTips: boolean;
    displayDifficulty: boolean;
    preferStatblockLink: boolean;
    statuses: Condition[];
    unconsciousId: string;
    openState: {
        playerView?: boolean;
        battle: boolean;
        party: boolean;
        status: boolean;
        plugin: boolean;
        player: boolean;
        builder: boolean;
    };
    players: HomebrewCreature[];
    parties: Party[];
    defaultParty: string;

    rpgSystem: string;
    canUseDiceRoll: boolean;
    initiative: string;
    modifier: string;
    sync: boolean;
    playerMarker: string;
    monsterMarker: string;
    state: InitiativeViewState;
    encounters: { [key: string]: InitiativeViewState };
    condense: boolean;
    clamp: boolean;
    hpOverflow: string;
    additiveTemp: boolean;
    autoStatus: boolean;
    warnedAboutImports: boolean;
    logging: boolean;
    logFolder: string;
    resolveTies: string;
    useLegacy: boolean;
    diplayPlayerHPValues: boolean;
    playerViewInitiative: PlayerViewInitiative;
    playerViewOrder: PlayerViewOrder;
    playerViewShowHP: boolean;
    playerViewShowStatuses: boolean;
    rollHP: boolean;
    letterNumbering: boolean;
    builder: BuilderState;
    descending: boolean;
    version: number[];

    rollPlayerInitiatives: RollPlayerInitiativeBehavior;
}
export interface InputValidate {
    input: HTMLInputElement;
    validate: (i: HTMLInputElement) => boolean;
}
export interface Party {
    players: string[];
    name: string;
}

/** When a piece of combat information is visible in the player view. */
export type PlayerViewReveal = "always" | "after-first-round" | "never";
/** Initiative values: can also be limited to player characters. */
export type PlayerViewInitiative = PlayerViewReveal | "players-only";
/** Turn order: can also reveal enemies in order as they take their first turn. */
export type PlayerViewOrder = PlayerViewReveal | "as-they-act";

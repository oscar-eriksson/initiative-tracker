import { ButtonComponent, Modal, Setting } from "obsidian";
import { get } from "svelte/store";
import type InitiativeTracker from "src/main";
import { tracker } from "src/tracker/stores/tracker";
import type { CreatureState } from "src/types/creatures";

interface Group {
    label: string;
    ids: string[];
    allied: boolean;
}

class StartEncounterModal extends Modal {
    result: string[] | null = null;
    #surprised = new Set<Group>();
    #advanced = false;

    constructor(
        plugin: InitiativeTracker,
        public groups: Group[],
        public willReplace: boolean
    ) {
        super(plugin.app);
    }

    #setSide(allied: boolean, value: boolean) {
        for (const group of this.groups) {
            if (group.allied !== allied) continue;
            if (value) this.#surprised.add(group);
            else this.#surprised.delete(group);
        }
    }

    onOpen() {
        this.containerEl.addClass("initiative-tracker-modal");
        this.contentEl.addClass("confirm-modal");
        this.titleEl.setText("Start encounter");
        this.display();
    }

    display() {
        this.contentEl.empty();

        if (this.willReplace) {
            this.contentEl.createEl("p", {
                text: "The current encounter will be lost. Player characters are kept."
            });
        }

        this.contentEl.createEl("p", {
            text: "Surprised creatures roll initiative with disadvantage."
        });

        if (!this.#advanced) {
            for (const [name, allied] of [
                ["Party & allies surprised", true],
                ["Enemies surprised", false]
            ] as const) {
                const sides = this.groups.filter((g) => g.allied === allied);
                if (!sides.length) continue;
                new Setting(this.contentEl).setName(name).addToggle((t) =>
                    t
                        .setValue(sides.every((g) => this.#surprised.has(g)))
                        .onChange((v) => this.#setSide(allied, v))
                );
            }
        } else {
            for (const group of this.groups) {
                new Setting(this.contentEl)
                    .setName(group.label)
                    .addToggle((t) =>
                        t
                            .setValue(this.#surprised.has(group))
                            .onChange((v) =>
                                v
                                    ? this.#surprised.add(group)
                                    : this.#surprised.delete(group)
                            )
                    );
            }
        }

        const buttonEl = this.contentEl.createDiv("confirm-buttons");
        new ButtonComponent(buttonEl)
            .setButtonText(this.#advanced ? "Simple" : "Advanced")
            .onClick(() => {
                this.#advanced = !this.#advanced;
                this.display();
            });
        new ButtonComponent(buttonEl)
            .setButtonText("Start")
            .setCta()
            .onClick(() => {
                this.result = [...this.#surprised].flatMap((g) => g.ids);
                this.close();
            });
        new ButtonComponent(buttonEl).setButtonText("Cancel").onClick(() => {
            this.close();
        });
    }
}

/**
 * Asks the user to confirm starting a new encounter and which creatures are surprised.
 * Resolves with the ids of the surprised creatures, or null if cancelled.
 */
export function promptStartEncounter(
    plugin: InitiativeTracker,
    creatures: CreatureState[]
): Promise<string[] | null> {
    const willReplace = get(tracker).some((c) => !c.player);

    const groups = new Map<string, Group>();
    for (const creature of creatures) {
        const name = creature.display ?? creature.name;
        const key = `${creature.player || creature.friendly ? "a" : "e"}:${name}`;
        if (!groups.has(key)) groups.set(key, {
                label: name,
                ids: [],
                allied: !!(creature.player || creature.friendly)
            });
        groups.get(key)!.ids.push(creature.id);
    }

    return new Promise((resolve) => {
        const modal = new StartEncounterModal(plugin, [...groups.values()], willReplace);
        modal.onClose = () => resolve(modal.result);
        modal.open();
    });
}

<script lang="ts">
    import { Notice } from "obsidian";

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let initiative: number;

    export let modifier: number;

    export let rolls: number[] | undefined = undefined;

    const label = (
        initiative: number,
        modifier: number,
        rolls: number[] | undefined
    ) => {
        // Manual edits change the initiative, which invalidates the stored rolls.
        if (!rolls?.length || Math.min(...rolls) != initiative)
            return `${initiative - modifier} + ${modifier}`;
        const kept = rolls.indexOf(initiative);
        const dropped = rolls.filter((_, i) => i != kept);
        return `Disadvantage: kept ${initiative - modifier} (dropped ${dropped
            .map((r) => r - modifier)
            .join(", ")}) + ${modifier}`;
    };
</script>

<div class="tree-item-flair-outer">
    {#key initiative}
        <input
            class="editable initiative tree-item-flair"
            aria-label={label(initiative, modifier, rolls)}
            on:click={function (evt) {
                this.select();
            }}
            on:blur={function (evt) {
                const value = this.value;
                if (isNaN(Number(value))) {
                    new Notice("Enter a valid initiative.");
                    this.value = `${initiative}`;
                    return;
                }
                if (initiative == Number(value)) {
                    return;
                }
                dispatch("initiative", Number(value));
            }}
            on:keydown={function (evt) {
                if (evt.key === "Enter" || evt.key === "Tab") {
                    evt.preventDefault();
                    this.blur();
                    return;
                }
                if (
                    !/^(-?\d*\.?\d*|Backspace|Delete|Arrow\w+)$/.test(evt.key)
                ) {
                    evt.preventDefault();
                    return false;
                }
            }}
            value={initiative}
        />
    {/key}
</div>

<style>
    .tree-item-flair-outer::after {
        content: "";
    }
    .initiative {
        display: block;
        padding: 0;
        width: 20px;
        text-align: center;
        white-space: nowrap;
        user-select: all;
        border: 0;
        color: inherit;
    }
</style>

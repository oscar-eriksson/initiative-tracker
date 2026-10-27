<script lang="ts">
    import { setIcon } from "obsidian";
    import { fade } from "svelte/transition";
    import { SyncLoader } from "svelte-loading-spinners";

    import { AC, FRIENDLY, HP, INITIATIVE } from "src/utils";
    import type { Creature } from "src/utils/creature";
    import { createEventDispatcher } from "svelte";

    import { tracker } from "../stores/tracker";
    const { state, ordered, data, round } = tracker;

    const hpIcon = (node: HTMLElement) => {
        setIcon(node, HP);
    };
    const acIcon = (node: HTMLElement) => {
        setIcon(node, AC);
    };
    const iniIcon = (node: HTMLElement) => {
        setIcon(node, INITIATIVE);
    };

    const getHpStatus = (hp: number, max: number) => {
        if (!hp) return "";
        if (hp <= 0) return "Defeated";
        if (hp < max / 2) return "Bloodied";
        if (hp < max) return "Hurt";
        return "Healthy";
    };

    const amIActive = (creature: Creature) => {
        if (creature.hidden) return false;
        if (creature.active) return true;

        const active = $ordered.findIndex((c) => c.active);
        const index = $ordered.indexOf(creature);
        if (active == -1 || active < index) return false;

        const remaining = $ordered.slice(index + 1, active + 1);
        if (remaining.every((c) => c.hidden)) return true;
        return false;
    };

    const revealed = (mode: string, started: boolean, round: number) =>
        mode != "never" && (mode != "after-first-round" || (started && round > 1));

    $: initiativeMode = $data?.playerViewInitiative ?? "always";
    $: orderMode = $data?.playerViewOrder ?? "always";
    $: playersOnly = initiativeMode == "players-only";
    $: showInitiative =
        playersOnly || revealed(initiativeMode, $state, $round);
    $: asTheyAct = orderMode == "as-they-act";
    $: showHP = $data?.playerViewShowHP ?? true;
    $: showStatuses = $data?.playerViewShowStatuses ?? true;
    $: showOrder = asTheyAct || revealed(orderMode, $state, $round);

    /** Enemies are listed once they have had a turn; players and allies always are, and from round 2 everyone is. */
    const hasActed = (creature: Creature) => {
        if (creature.player || creature.friendly || $round > 1) return true;
        const active = $ordered.findIndex((c) => c.active);
        return active > -1 && $ordered.indexOf(creature) <= active;
    };

    $: activeAndVisible = (() => {
        const list = $ordered.filter((c) => c.enabled && !c.hidden);
        if (asTheyAct) {
            // Creatures yet to act go last as "?" placeholders.
            return [
                ...list.filter((c) => hasActed(c)),
                ...list.filter((c) => !hasActed(c))
            ];
        }
        if (showOrder) return list;
        return [...list].sort(
            (a, b) =>
                Number(!!b.player) - Number(!!a.player) ||
                a.getName().localeCompare(b.getName())
        );
    })();

    const name = (creature: Creature) => creature.getName();
    const friendIcon = (node: HTMLElement) => {
        setIcon(node, FRIENDLY);
    };
</script>

<table class="initiative-tracker-table" transition:fade>
    <thead class="tracker-table-header">
        {#if showInitiative}
            <th style="width:5%"><strong use:iniIcon /></th>
        {/if}
        <th class="left" style="width:30%"><strong>Name</strong></th>
        {#if showHP}
            <th style="width:15%" class="center"><strong use:hpIcon /></th>
        {/if}
        {#if showStatuses}
            <th><strong> Statuses </strong></th>
        {/if}
    </thead>
    <tbody>
        {#each activeAndVisible as creature (creature.id)}
            {@const unknown = asTheyAct && !hasActed(creature)}
            <tr class:active={!unknown && amIActive(creature) && $state}>
                {#if showInitiative}
                    <td class="center">
                        {unknown
                            ? "?"
                            : playersOnly && !creature.player
                            ? "–"
                            : creature.initiative}
                    </td>
                {/if}
                <td class='name'>
                    {#if unknown}
                        ?
                    {:else}
                    {#if creature.friendly}
                        <div
                            class="contains-icon"
                            use:friendIcon
                            aria-label={`This creature is an ally.`}
                        />
                    {/if}
                    {name(creature)}
                    {/if}
                </td>
                {#if showHP}
                    <td
                        class:center={true}
                        class={unknown
                            ? ""
                            : getHpStatus(creature.hp, creature.max).toLowerCase()}
                    >
                        {#if unknown}
                            <span>?</span>
                        {:else if creature.player && $data.diplayPlayerHPValues}
                            <div class="center">{@html creature.hpDisplay}</div>
                        {:else}
                            <span>{getHpStatus(creature.hp, creature.max)}</span>
                        {/if}
                    </td>
                {/if}
                {#if showStatuses}
                    <td class="center">
                        {unknown
                            ? ""
                            : [...creature.status].map((s) => s.name).join(", ")}
                    </td>
                {/if}
            </tr>
        {/each}
    </tbody>
</table>

<style scoped>
    .full-center {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .initiative-tracker-table {
        padding: 0.5rem;
        align-items: center;
        gap: 0.25rem 0.5rem;
        width: 100%;
        margin-left: 0rem;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0 2px;
        font-size: larger;
    }
    .left {
        text-align: left;
    }
    .name, .name > :global(svg) {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .center {
        text-align: center;
    }
    .healthy {
        color: var(--text-success);
    }
    .hurt {
        color: var(--text-warning);
    }
    .bloodied {
        color: var(--text-error);
    }
    .defeated {
        color: var(--text-faint);
    }
    .active {
        background-color: rgba(0, 0, 0, 0.1);
    }
    :global(.theme-dark) .active {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>

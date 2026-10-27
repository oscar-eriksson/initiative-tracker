import type { Menu } from "obsidian";

let active: Menu | null = null;

/**
 * Registers a menu as the open one, closing any previously open menu.
 * Needed because click handlers that stop propagation prevent Obsidian from dismissing the old menu.
 * Call right before showing the menu.
 */
export function trackMenu(menu: Menu) {
    active?.hide();
    active = menu;
    menu.onHide(() => {
        if (active === menu) active = null;
    });
}

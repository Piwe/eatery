/**
 * Ouma, Nonna & Teta — entry point.
 *
 * Everything here is enhancement. The page is a working menu with a
 * working form before any of this runs; these files add the filtering,
 * the table composition, and the art effects on top.
 *
 * Classic scripts on a single `Eatery` namespace rather than ES modules,
 * deliberately: modules are fetched, and a fetch from a `file://` page is
 * blocked by CORS, so a module build of this site silently does nothing
 * when you double-click index.html. The four files are loaded with
 * `defer`, which keeps them in order and runs them after parsing.
 */

window.Eatery = window.Eatery || {};

(function (ns) {
'use strict';

const effects = ns.initEffects();

ns.initFilters();
ns.initPlate({
  onAdd: (dish) => effects.burst(dish.kitchen),
});

// The three kitchens are always cooking.
for (const dish of document.querySelectorAll('.story__card .dish')) {
  dish.classList.add('dish--hot');
}

document.documentElement.classList.add('js');

}(window.Eatery));

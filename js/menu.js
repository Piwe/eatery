/**
 * Menu filtering.
 *
 * The chips are real buttons with aria-pressed, not a fake tab set.
 * Filtering only hides cards — it never unchecks anything, so a
 * dish already on the table stays on it while you browse.
 */

window.Eatery = window.Eatery || {};

(function (ns) {
'use strict';

const KITCHEN_NAMES = { ouma: 'Ouma', teta: 'Teta', nonna: 'Nonna' };

ns.initFilters = function initFilters() {
  const chips = [...document.querySelectorAll('.chip[data-filter]')];
  const cards = [...document.querySelectorAll('.card')];
  const courses = [...document.querySelectorAll('.course')];
  const status = document.querySelector('[data-filter-status]');
  if (!chips.length) return;

  const matches = (card, filter) =>
    filter === 'all'
    || card.dataset.kitchen === filter
    || card.dataset.tags.split(/\s+/).includes(filter);

  function apply(filter, label) {
    let shown = 0;
    for (const card of cards) {
      const visible = matches(card, filter);
      card.hidden = !visible;
      if (visible) shown += 1;
    }

    // A kitchen with nothing left in it should not leave a dangling heading.
    for (const course of courses) {
      course.hidden = !course.querySelector('.card:not([hidden])');
    }

    for (const chip of chips) {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter));
    }

    status.textContent = filter === 'all'
      ? `Showing all ${shown} dishes.`
      : `Showing ${shown} ${label} dish${shown === 1 ? '' : 'es'}.`;
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const { filter } = chip.dataset;
      apply(filter, KITCHEN_NAMES[filter] ? `${KITCHEN_NAMES[filter]}'s kitchen` : chip.textContent.trim().toLowerCase());
    });
  }
};

}(window.Eatery));

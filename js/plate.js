/**
 * The table: selection state, the running total, and the plate
 * composition that the dish art assembles itself into.
 *
 * The checkboxes in the markup are the state. Nothing is mirrored
 * into a separate store, so the page cannot disagree with itself,
 * and with JavaScript off the form still works as a form.
 */

window.Eatery = window.Eatery || {};

(function (ns) {
'use strict';

const money = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

/** @param {HTMLElement} card @returns {{id:string,name:string,price:number,kitchen:string}} */
function readCard(card) {
  const input = card.querySelector('.card__input');
  return {
    id: card.dataset.dish,
    name: card.querySelector('.card__name').textContent.trim(),
    price: Number(card.dataset.price),
    kitchen: card.dataset.kitchen,
    input,
  };
}

ns.initPlate = function initPlate({ onAdd } = {}) {
  const form = document.getElementById('menu-form');
  const stage = document.querySelector('[data-plate-stage]');
  const empty = document.querySelector('[data-plate-empty]');
  const list = document.querySelector('[data-plate-list]');
  const total = document.querySelector('[data-plate-total]');
  const note = document.querySelector('[data-plate-note]');
  const live = document.querySelector('[data-live]');
  const clearBtn = document.querySelector('[data-plate-clear]');
  const bookBtn = document.querySelector('[data-plate-book]');

  if (!form || !stage) return;

  const cards = [...form.querySelectorAll('.card')];
  /** dish id -> the art node currently on the table */
  const plated = new Map();

  const announce = (message) => { live.textContent = message; };

  const chosen = () => cards.filter((c) => c.querySelector('.card__input').checked).map(readCard);

  /** Drop a dish onto the table, at a size the table can hold. */
  function plate(dish, card) {
    const art = card.querySelector('.dish').cloneNode(true);
    art.classList.add('dish--sm', 'dish--hot', 'dish--plating');
    art.dataset.plated = dish.id;
    stage.append(art);
    plated.set(dish.id, art);
    art.addEventListener('animationend', () => art.classList.remove('dish--plating'), { once: true });
  }

  function unplate(id) {
    plated.get(id)?.remove();
    plated.delete(id);
  }

  function render() {
    const items = chosen();

    // --- the table itself ---
    const live_ids = new Set(items.map((d) => d.id));
    for (const id of [...plated.keys()]) if (!live_ids.has(id)) unplate(id);
    for (const dish of items) {
      if (!plated.has(dish.id)) plate(dish, cards.find((c) => c.dataset.dish === dish.id));
    }

    empty.hidden = items.length > 0;

    // --- the itemised list ---
    list.replaceChildren(...items.map((dish) => {
      const row = document.createElement('li');
      row.className = 'plate__row';
      row.dataset.kitchen = dish.kitchen;
      row.innerHTML = `
        <span class="plate__row-name"></span>
        <span class="plate__row-price"></span>
        <button type="button" class="plate__row-remove" data-remove="${dish.id}">
          <span aria-hidden="true">&times;</span>
          <span class="visually-hidden">Remove ${dish.name} from your table</span>
        </button>`;
      row.querySelector('.plate__row-name').textContent = dish.name;
      row.querySelector('.plate__row-price').textContent = money.format(dish.price);
      return row;
    }));

    // --- the total ---
    total.textContent = money.format(items.reduce((sum, d) => sum + d.price, 0));
    bookBtn.disabled = items.length === 0;
    clearBtn.disabled = items.length === 0;
    note.hidden = true;
  }

  form.addEventListener('change', (event) => {
    const input = event.target.closest('.card__input');
    if (!input) return;

    const dish = readCard(input.closest('.card'));
    render();
    announce(input.checked
      ? `${dish.name} added. ${chosen().length} on the table, ${total.textContent} total.`
      : `${dish.name} removed. ${chosen().length} on the table, ${total.textContent} total.`);

    if (input.checked) onAdd?.(dish);
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const card = cards.find((c) => c.dataset.dish === button.dataset.remove);
    const input = card.querySelector('.card__input');
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // Focus has just been destroyed with the row it lived on — put it somewhere real.
    input.focus();
  });

  clearBtn.addEventListener('click', () => {
    for (const card of cards) card.querySelector('.card__input').checked = false;
    render();
    announce('Table cleared.');
  });

  bookBtn.addEventListener('click', () => {
    const count = chosen().length;
    note.hidden = false;
    note.textContent = `Table held for ${count} dish${count === 1 ? '' : 'es'} — ${total.textContent}. `
      + 'We will call to confirm. (Demo site: nothing is actually sent.)';
    announce(note.textContent);
  });

  render();
};

}(window.Eatery));

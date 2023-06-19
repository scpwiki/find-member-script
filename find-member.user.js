/*
 * Wikidot member list locator userscript
 *
 * For installation instructions, see https://scpwiki.com/usertools
 */

// ==UserScript==
// @name        Wikidot find member script
// @description Adds a button to search for members in the Wikidot admin panel.
// @version     v0.0.1
// @updateURL   https://github.com/scpwiki/find-member-script/raw/main/find-member.user.js
// @downloadURL https://github.com/scpwiki/find-member-script/raw/main/find-member.user.js
// @supportURL  https://www.wikidot.com/account/messages#/new/4598089
// @include     https://*.wikidot.com/_admin
// ==/UserScript==

const MAX_GUESSES = 80; // safety valve in case of bugs
const SLEEP_DELAY_MS = 500;
const CSS = '';

function parseOdate(element) {
  for (let i = 0; i < element.classList.length; i++) {
    klass = element.classList[i];
    if (klass.startsWith('time_')) {
      const timestamp = parseInt(klass.slice(5));
      return new Date(timestamp * 1000);
    }
  }
}

function dateInRange(date, start, end) {
  return start <= date && date <= end;
}

function sleep(delayMs) {
  return new Promise(resolve => setTime(resolve, delayMs));
}

async function runBinarySearch(dateEntryInput) {
  const rawDate = dateEntryInput.value;
  const date = Date.parse(rawDate);
  if (isNaN(date)) {
    alert(`Invalid date entry: '${rawDate}'`);
    return;
  }

  const pageButton = document.querySelector('span.target:nth-last-child(2)');
  const pageCount = parseInt(pageButton.innerText);
  console.log(`Searching for ${date} among ${pageCount} pages...`);

  let guesses = 0;
  let startPage = 0;
  let endPage = pageCount;
  let membersThisPage, startDate, endDate, thisPage;
  do {
    thisPage = Math.trunc((endPage - startPage) / 2);
    console.log(`#${guesses}: Trying page ${thisPage} [start ${startPage}, end ${endPage}]`);
    membersThisPage = document.querySelectorAll('#all-members span.odate');
    startDate = parseOdate(membersThisPage[0]);
    endDate = parseOdate(membersThisPage[membersThisPage.length - 1]);

    // Adjust bounds based on binary search
    if (startDate > date) {
      // Date is before current page
      endPage = thisPage;
    } else if (endDate < date) {
      // Date is after current page
      startPage = thisPage;
    }

    guesses++;
    sleep(SLEEP_DELAY_MS);
  } while(!dateInRange(date, startDate, endDate) && guesses < MAX_GUESSES);

  console.log(`Found date ${date} on ${thisPage} after ${guesses} tries`);
}

function setup() {
  // Check that we're on the member list page
  const memberElement = document.querySelector('#all-members');
  if (!memberElement) {
    alert('Cannot find member list on this page');
    return;
  }

  // Create the UI elements
  const searchContainer = document.createElement('div');
  const dateEntryInput = document.createElement('input');
  dateEntryInput.classList.add('findmember-input');
  dateEntryInput.setAttribute('type', 'text');
  dateEntryInput.setAttribute('size', '10');
  dateEntryInput.setAttribute('style', 'margin-bottom: 0;');
  dateEntryInput.setAttribute('placeholder', '12 May 2014');
  searchContainer.appendChild(dateEntryInput);

  const searchButton = document.createElement('button');
  searchButton.innerText = 'Search';
  searchButton.classList.add('findmember-button', 'btn', 'btn-xs')
  searchButton.title = 'Search all member pages until the page with this date on it is found';
  searchButton.addEventListener('click', () => runBinarySearch(dateEntryInput));
  searchContainer.appendChild(searchButton);

  const membersTab = document.querySelector('#MembersTab');
  membersTab.appendChild(searchContainer);

  const styleSheet = document.createElement('style');
  styleSheet.innerText = CSS;
  document.head.appendChild(styleSheet);
}

function main() {
  setup();
  // TODO
}

main();

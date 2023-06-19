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

const CSS = '';

function parseOdate(element) {
  for (let i = 0; i < element.classList.length; i++) {
    klass = element.classList[i];
    if (klass.startsWith('time_')) {
      const timestamp = Integer.parseInt(klass.slice(5));
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
  const rawDate = dateEntryInput.innerText;
  const date = Date.parse(rawDate);
  const pageButton = document.querySelector('span.target:nth-last-child(2)');
  const pageCount = Integer.parseInt(pageButton.innerText);
  console.log(`Searching for ${date} among ${pageCount} pages...`);

  let guesses = 0;
  let startPage = 0;
  let endPage = pageCount;
  let membersThisPage, startDate, endDate;
  do {
    const thisPage = Math.trunc((endPage - startPage) / 2);
    console.log(`Trying page ${thisPage}, guess #${guesses}, start ${startPage}, end ${endPage}`);
    membersThisPage = document.querySelector('#all-members span.odate');
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
    sleep(500);
  } while(!dateInRange(date, startDate, endDate));
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

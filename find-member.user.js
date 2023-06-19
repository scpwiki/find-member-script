/*
 * Wikidot member list locator userscript
 *
 * For installation instructions, see https://scpwiki.com/usertools
 */

// ==UserScript==
// @name        Wikidot find member script
// @description Adds a button to search for members in the Wikidot admin panel.
// @version     v0.1.1
// @updateURL   https://github.com/scpwiki/find-member-script/raw/main/find-member.user.js
// @downloadURL https://github.com/scpwiki/find-member-script/raw/main/find-member.user.js
// @supportURL  https://www.wikidot.com/account/messages#/new/4598089
// @include     http://*.wikidot.com/_admin
// @include     https://*.wikidot.com/_admin
// ==/UserScript==

const MAX_STEPS = 30;
const SLEEP_DELAY_MS = 4000;
const CSS = `
.findmember-notice {
  font-family: 'Courier New', monospace;
  text-align: center;
  font-size: 1.2em;
}

.findmember-success {
  color: green;
  font-weight: bold;
}

.findmember-error {
  color: red;
  font-weight: bold;
}
`;

let dateEntryInput;
let noticeElement;
let currentlyRunning = false;

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
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

function notice(message) {
  noticeElement.classList.remove('findmember-error');
  noticeElement.classList.remove('findmember-success');
  noticeElement.innerText = message;
}

function error(message) {
  noticeElement.classList.remove('findmember-success');
  noticeElement.classList.add('findmember-error');
  noticeElement.innerText = message;
}

function success(message) {
  noticeElement.classList.remove('findmember-error');
  noticeElement.classList.add('findmember-success');
  noticeElement.innerText = message;
}

function doSearch() {
  if (currentlyRunning) {
    console.warn('Already running, ignoring input');
    return;
  }

  try {
    currentlyRunning = true;
    binarySearch();
  } finally {
    currentlyRunning = false;
  }
}

async function binarySearch() {
  const rawDate = dateEntryInput.value;
  const date = new Date(Date.parse(rawDate));
  if (isNaN(date)) {
    error(`Invalid date entry: '${rawDate}'.`);
    return;
  }

  const pageButton = document.querySelector('span.target:nth-last-child(2)');
  const pageCount = parseInt(pageButton.innerText);

  let steps = 0;
  let startPage = 1;
  let endPage = pageCount;
  let membersThisPage, startDate, endDate, thisPage;
  let lastStart = null;
  let lastEnd = null;

  while (true) {
    const offset = Math.trunc((endPage - startPage) / 2);
    thisPage = startPage + offset;
    notice(`#${steps}: Trying page ${thisPage} [start ${startPage}, end ${endPage}]`);
    WIKIDOT.modules.ManageSiteMembersListModule.listeners.loadMemberList(thisPage);
    await sleep(SLEEP_DELAY_MS);

    membersThisPage = document.querySelectorAll('#all-members span.odate');
    if (!membersThisPage.length) {
      error('No members found on page?');
      return;
    }

    startDate = parseOdate(membersThisPage[0]);
    endDate = parseOdate(membersThisPage[membersThisPage.length - 1]);

    // Adjust bounds based on binary search
    if (startDate > date) {
      // Date is before current page
      endPage = thisPage;
    } else if (endDate < date) {
      // Date is after current page
      startPage = thisPage;
    } else if (dateInRange(date, startDate, endDate)) {
      success(`Found date ${rawDate} on page ${thisPage} after ${steps} steps.`);
      return;
    }

    // Safety valves in case of bugs, or if it's out of range
    if (lastStart == startPage && lastEnd == endPage) {
      error('Cannot find date, out of range.');
      return;
    }

    lastStart = startPage;
    lastEnd = endPage;
    steps++;

    if (steps > MAX_STEPS) {
      error('BUG: Too many steps');
      return;
    }
  }
}

async function main() {
  // Wait until the member list is pulled up.
  await new Promise(resolve => {
    console.log('Creating observer, waiting for members list to be opened');
    const element = document.querySelector('#sm-action-area');
    const observer = new MutationObserver(() => {
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        if (child.id == 'MembersTab') {
          console.log('Opened members list, begin initialization');
          observer.disconnect();
          resolve();
          return;
        }
      }
    });

    observer.observe(element, { childList: true });
  });

  // Check that we're on the member list page
  const memberElement = document.querySelector('#all-members');
  if (!memberElement) {
    alert('No member list?');
    return;
  }

  // Create the UI elements
  const searchContainer = document.createElement('div');
  dateEntryInput = document.createElement('input');
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
  searchButton.addEventListener('click', () => doSearch());
  searchContainer.appendChild(searchButton);

  const membersTab = document.querySelector('#MembersTab');
  membersTab.appendChild(searchContainer);

  noticeElement = document.createElement('div');
  noticeElement.classList.add('findmember-notice');
  const actionArea = document.querySelector('#sm-action-area');
  const tabContent = document.querySelector('.tab-content');
  actionArea.insertBefore(noticeElement, tabContent);

  const styleSheet = document.createElement('style');
  styleSheet.innerText = CSS;
  document.head.appendChild(styleSheet);
}

main();

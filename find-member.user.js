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

function runBinarySearch(dateEntryInput) {
  // TODO
}

function main() {
  // Create the UI elements
  const searchContainer = document.createElement('div');
  const dateEntryInput = document.createElement('input');
  dateEntryInput.setAttribute('type', 'text');
  dateEntryInput.setAttribute('size', '10');
  dateEntryInput.setAttribute('placeholder', '12 May 2014');
  searchContainer.appendChild(dateEntryInput);

  const searchButton = document.createElement('button');
  searchButton.innerText = 'Search';
  searchButton.classList.add('btn', 'btn-xs')
  searchButton.title = 'Search all member pages until the page with this date on it is found';
  searchButton.addEventListener('click', () => runBinarySearch(dateEntryInput));
  searchContainer.appendChild(searchButton);

  const membersTab = document.querySelector('#MembersTab');
  membersTab.appendChild(searchContainer);
}

main();

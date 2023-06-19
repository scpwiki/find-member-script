## Greasemonkey "Find Member in Wikidot" Script

The member list in the Wikidot admin panel is painful for site sizes over a few hundred. It does not permit you to go more than a couple pages at a time, and there is no search method to find a particular user, you must instead linearly crawl until you find the user in question.

However, you can directly call `WIKIDOT.modules.ManageSiteMembersListModule.listeners.loadMemberList(<pageNumber>)` to jump to a particular page, so it actually is possible to automate this as a binary search instead.

![screenshot of script](screenshot.png)

This is what this [Greasemonkey](https://www.greasespot.net) script does. Enter the date the user joined the site on (_not_ when they joined Wikidot! Also, remember to get the join date for the correct site) and hit search. The preferred date format is `DD Month YYYY`, the same format used by Wikidot in its user info modal.

You can [install the script](https://github.com/scpwiki/find-member-script/raw/main/find-member.user.js) here.

Available under the MIT License.

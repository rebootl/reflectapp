## ToDo

* add entries (on prod.):
  - code examples
  - fotos
* jwt renewal?
* images access private protected by hash?
* image upload "TypeError: NetworkError when attempting to fetch resource."
  when server offline
* on throttled conn. takes a moment till new entry appears... -> probably the
  ffox throttle feat.
* tests?

### Features

* add images
  - if image locally not found, maybe on other device => WIP, test
  - cleanup local image db on logout
  - keep local new image and upload local stored one looses new image
    => RESOLVED, only happens on ffox throttled mode

* checkbox click on label triggers event but not checkmark
* changing text and saving deletes image comment
  also check url

* pagination
* back button for single entry view
* syntax highlighting
* show synced status (using entry property)
* edit preview
* search
* multi-user/platform POG
* hide/show menu -> CSS rework
* online/offline indicator
* protect url info request route -> maybe done?
* early prevent creating duplicate tags inside add-items (would be nice)
* maybe rework edit-input to "query" input instead
* flash message after saving, message system?
* reset selection if input "emptied" in create-entry
  (needs fixing in the reset functions to prevent too much recursion)
* use service worker for offline capability
* check script/view for duplicate id's, broken links
* encrypt private entries

### Bugs / code cleanup

* edit looses image comment sometimes!!?
* make input-detection it's own component
* source doesn't get updated -> projectData
* setting inspector localapi doesn't work?
* wired link title is not correctly parsed...
* stuck on loading... on ffox, unclear why... had to reset ffox...
* improve checkbox element
* projectdata not loading on ffox mobile -> transpile maybe?
* improve client filestructure (make subdirectories for components)
* cleanups
  - cleanup console logs, more cleanups?
  - cleanup function naming (camelCase)
  - use connectedCallback for all elements
* make "input-overlay" it's own component => DONE, selection-box comp.
  - use in menu
* router
  - don't update from router if url doesn't effectively changed
  - update url inside router
  - rework

### Design/UI/UX adaptions/improvements

* show/hide private entries
* collapse entries
* add favicon
* rework CSS
* accessibility: topics-list not using keyboard tabs
* icon-button focus in chromium pixel error at bottom
* fix spacing on link detection labels -> try using flex

### Test in production LUL

* re-login necessary after server update,
  otherwise new entries/edits not shown => CONFIRM, didn't happen again..

### Done

* add images
  - abort image upload => DONE
    - delete on server in case of failure of another image => RESOLVED,
      making one request for multiple images, fixed deletion on server
    - implement for edit-images => DONE
  - edit-images "save and close", when new image broken? => FIXED,
    couldn't reproduce anymore
* detection trigger not 100% reliable, i think if the detection takes
  longer than the input it will not re-trigger after input is finished,
  tho it's probably not too terrible cause links will be pasted most of
  the time... => WONTFIX, for now
* cleanup/remove old request functions => DONE
* image dir must be docker volume => DONE
* storing entry when unchanged results in empty text => DONE
* tag after creation not active, can lead to accidental deletion
  when saving again => FIXED
* sorting not correct sometimes
  -> caused by missing pinned attr.?
  => FIXED by editing/resaving entries
* fix the flickering during link input => DONE
* fix link detection (server side) => DONE
* add pinned entries => DONE, also made buttons and icons etc.
* redirect after delete not working, also console.log not => FIXED (typo)
* delete entries => DONE, inactivate maybe later
* maybe add direct toggle for private/pinning => NOPE, would lead to
  cluttered UI
* improve small tags style => DONE
* cannot access in private mode? => WONTFIX, indexdb doesn't work
* integrate project-Data => DONE
* check for multiple topics/tags => DONE
* console log link info request error, instead of using it in title => DONE
* empty comment should be empty string => DONE
* remove console log view-single-entry => DONE
* fix link css margins => DONE
* edit-entry cancel button => DONE
* use checkbox for private/public on edit view => DONE
* redirect after saving edit => DONE, "Save and Close" button
* add edit-view => DONE
* remove dashed border css => DONE
* link creation broken => FIXED
* url detection broken, "todo:" is a url... => FIXED
* click logo to "home" view => DONE
* add page not found output if entry id not found => DONE
* fix create buttons => DONE
* fix triggers => DONE
  - entries-list update
  - auto show/hide create entry on logout/login
* make entry input a textarea => DONE
* get rid of the global_state user obj. => DONE
* add new-entry input elements => DONE
* make new/edit elements for topics and subtags => OBSOLETE
* Server side: change db public/private field => OBSOLETE
* date string has an error => FIXED, using moment.js for now
* update stuff on login/logout => FIXED, done by proj. Data now
* add pinned entries ==> DONE

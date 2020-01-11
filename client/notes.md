## ToDo

* add pinned entries => DONE, also made buttons and icons etc.
* delete entries, inactivate maybe?
* pagination
* edit preview
* icon-button focus in chromium pixel error at bottom
* projectdata not loading on ffox mobile -> transpile? :/
* cleanup/remove old request functions
* rework CSS
* protect url info request route
* re-login necessary after server update,
  otherwise new entries/edits not shown
* detection trigger not 100% reliable, i think if the detection takes
  longer than the input it will not re-trigger after input is finished,
  tho it's probably not too terrible cause links will be pasted most of
  the time...
* fix spacing on link detection labels -> try using flex
* early prevent creating duplicate tags inside add-items (would be nice)
* improve client filestructure (make subdirectories for components)
* maybe add direct toggle for private/pinning
* maybe rework edit-input to "query" input instead
* cleanups
  - cleanup console logs, more cleanups?
  - cleanup function naming (camelCase)
  - use connectedCallback for all elements
* make "input-overlay" it's own component
* flash message after saving, message system?
* reset selection if input "emptied" in create-entry
  (needs fixing in the reset functions to prevent too much recursion)
* router
  - don't update from router if url doesn't effectively changed
  - update url inside router
* accessibility: topics-list not using keyboard tabs
* use service worker for offline capability
* check script/view for duplicate id's, broken links
* encrypt private entries

### Test in production LUL

* fix the flickering during link input => DONE
* fix link detection (server side) => DONE
* storing entry when unchanged results in empty text => DONE, TEST IN PRODUCTION
* tag after creation not active, can lead to accidental deletion
  when saving again => FIXED

### Done

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

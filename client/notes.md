## ToDo

* make subdirectories
* check for multiple topics/tags => DONE
* fix link detection (server side)
* (re-)add pinned entries
* pagination
* maybe add direct toggle for private/pinning
* maybe rework edit-input to "query" input instead
* delete entries, inactivate maybe?
* rework CSS
* cleanups
  - cleanup console logs, more cleanups?
  - cleanup function naming (camelCase)
  - use connectedCallback for all elements
* make "input-overlay" it's own component
* flash message after saving, message system?
* fix the flickering during link input
* reset selection if input "emptied" in create-entry
  (needs fixing in the reset functions to prevent too much recursion)
* router
  - don't update from router if url doesn't effectively changed
  - update url inside router
* integrate project-Data => DONE
* accessibility: topics-list not using keyboard tabs
* use service worker for offline capability
* check script/view for duplicate id's, broken links
* encrypt private entries

### Test

* storing entry when unchanged results in empty text => DONE, TEST IN PRODUCTION

### Done

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

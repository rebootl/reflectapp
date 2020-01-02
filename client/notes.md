## ToDo

* storing entry when unchanged results in empty text
* make "input-overlay" it's own component
* cleanup console logs, more cleanups?
* fix link detection (server side)
* redirect after saving edit
* use checkbox for private/public on edit view
* fix the flickering during link input
* create-entry component: reset selection if input empty
  (needs fixing in the reset functions to prevent too much recursion)
* cleanup function naming (camelCase)
* use connectedCallback for all elements
* router
  - don't update from router if url doesn't effectively changed
  - update url inside router
* integrate project-Data => DONE, kinda?
* rework style LUL
* accessibility: topics-list not using keyboard tabs
* use service worker for offline capability
* check script/view for duplicate id's, broken links
* encrypt private entries

### Done

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

## ToDo

* add edit-view
* create-entry comp.
  - reset selection if input empty (needs fixing in the reset functions
    to prevent too much recursion)
* fix link detection
* router
  - don't update from router if url doesn't effectively changed
  - update url inside router
* integrate project-Data => WIP
* rework style LUL
* accessibility: topics-list not using keyboard tabs
* check script/view for duplicate id's, broken links
* encrypt private entries (probably Server side)

### Done

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

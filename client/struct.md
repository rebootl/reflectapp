# Client Structure

reflect-app
  main-header
    #logo-box
    user-menu
      user-dropdown-button      --> loggedIn(), getUsername()
      user-dropdown-menu
        loggedIn ?
          labelledButton    -> this.logout()
        :
          text-input
          password-input
          #buttonbox
            labelled-button -> this.submit()
  #wrapper-container
    main-menu
      topics-list
        (observableList)
          topic-item
      subtags-list
        (observableList)
          subtag-item
    #add-box
    main-content
      (routed)
        view-entries
        view-single-entry
        view-edit-entry

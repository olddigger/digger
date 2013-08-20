# digger

command line tools to run a [digger.io](https://github.com/binocarlos/digger.io) network

## installation

	$ npm install digger -g

## usage

navigate to a folder that contains a digger.yml file and:

	sudo digger serve

will bring up the stack on port 80

## example digger.yaml

```yaml

##############################################
# the digger database setup
digger:
  ##############################################
  # this lets us access the data in the xml files
  /config:
    type: static
    config:
      folder: <%- path('xml/config') %>
  ##############################################
  # the users warehouse used by the website auth
  /users/buildright:
    access: private
    type: mongo
    config:
      database: buildright
      collection: users
  ##############################################
  # the admin users warehouse - this is in a static file
  # we are in a private repo so this is ok
  /users/admin:
    access: private
    type: static
    config:
      file: <%- path('xml/admin/users.xml') %>
  ##############################################
  # the projects warehouse for buildright projects
  /project:
    access: private
    type: mongo
    config:
      database: buildright
      provision: collection

##############################################
# the buildright app
buildright_www:
  # the folder with the static HTML
  document_root: www
  # where to mount our digger api
  digger: /api/v1
  auth:
    # where to mount our authentication
    url: /auth
    # what backend digger warehouse will save our users
    warehouse: /users/buildright
    events:
      # the module to run when a user has registered
      register: <%- path('modules/user_register.js') %>
  domains:
    - "buildright.digger.io"
    - "buildright.local.digger.io"

```
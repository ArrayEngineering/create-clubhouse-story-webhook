const fetch = require('node-fetch')
const runtimeConfig = require('cloud-functions-runtime-config')

// FIXME: This is some seriously terrible stuff.
//
// Google Cloud Functions (right now) doesn't have an easy way to read
// configuration information from something like environment variables.
// So we have to use the "runtime config" service, which is pretty
// clunky. See: https://issuetracker.google.com/issues/35907643
//
// We should replace this with environment variables if / when they're ready.
let CLUBHOUSE_API_TOKEN = process.env.CLUBHOUSE_API_TOKEN
let CLUBHOUSE_DEFAULT_PROJECT_NAME = process.env.CLUBHOUSE_DEFAULT_PROJECT_NAME

exports.configureEnv = () => {
  if (!CLUBHOUSE_API_TOKEN || !CLUBHOUSE_DEFAULT_PROJECT_NAME) {
    return runtimeConfig.getVariable('production', 'clubhouse-api-token')
      .then(apiToken => {
        return runtimeConfig.getVariable('production', 'clubhouse-default-project-name')
          .then(projName => {
            CLUBHOUSE_API_TOKEN = apiToken
            CLUBHOUSE_DEFAULT_PROJECT_NAME = projName
          })
      })
  }
  console.log({CLUBHOUSE_API_TOKEN, CLUBHOUSE_DEFAULT_PROJECT_NAME})
  return new Promise((resolve, reject) => {resolve()})
}

const CLUBHOUSE_API_URL = 'https://api.clubhouse.io/api/v2'

const apiUrl = path => `${CLUBHOUSE_API_URL}${path}?token=${CLUBHOUSE_API_TOKEN}`

const fetchApi = (path, options) => {
  return fetch(apiUrl(path), options).then(resp => {
    return resp.json()
      .then(json => {
        if (!resp.ok) {
          throw new Error(JSON.stringify(json))
        }
        return json
      })
  })
}

exports.findMemberId = memberEmail => {
  return fetchApi('/members')
    .then(members => {
      const emailsMatch = member => member.profile.email_address === memberEmail
      const member = (members.filter(emailsMatch) || [])[0] || {}
      return member.id
    })
}

exports.findProjectId = (projectName = CLUBHOUSE_DEFAULT_PROJECT_NAME) => {
  return fetchApi('/projects')
    .then(projects => {
      const projectsMatch = project => project.name === projectName
      const project = (projects.filter(projectsMatch) || [])[0] || {}
      return project.id
    })
}

exports.writeStory = (projectId, name, description, requestedById, ownerId) => {
  const body = {
    project_id: projectId,
    name,
    description,
    requested_by_id: requestedById
  }
  if (ownerId) {
    body.owner_ids = [ownerId]
  }

  return fetchApi('/stories', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
    .then(storyData => {
      return storyData.id
    })
}

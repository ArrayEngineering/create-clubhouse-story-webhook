const util = require('util')

const {
  configureEnv,
  findMemberId,
  findProjectId,
  writeStory
} = require('./clubhouse')

const validateBody = body => {
  const {name, description, requestedByEmail, projectName} = body
  if (!name) {
    throw new Error("'name' is required")
  }
  if (!description) {
    throw new Error("'description' is required")
  }
  if (!requestedByEmail) {
    throw new Error("'requestedByEmail' is required")    
  }
}

const createStory = body => {
  validateBody(body)

  return Promise.all([
    findMemberId(body.ownerEmail),
    findMemberId(body.requestedByEmail),
    findProjectId(body.projectName)
  ])
    .then(([ownerId, requesterId, projectId]) => {
      if (!requesterId) {
        throw new Error(`no matching Clubhouse member for email '${body.requestedByEmail}'`)
      }
      if (!projectId) {
        throw new Error(`no matching Clubhouse project for name '${body.projectName}'`)
      }
      return {projectId, name: body.name, description: body.description, requesterId, ownerId}
    })
    .then(({projectId, name, description, requesterId, ownerId}) => {
      return writeStory(projectId, name, description, requesterId, ownerId)
    })
}

exports.stories = (req, res) => {
  const handleError = err => {
    console.error(err)
    res.status(500).json({error: err.toString()})
  }

  return configureEnv()
    .then(() => {
      if (req.method === 'POST') {
        return createStory(req.body)
          .then(newStoryId => {
            res.status(200).json({status: 'ok', newStoryId})
          })
          .catch(err => handleError(err))
      } else {
        throw new Error('this function supports HTTP POST only')
      }
    })
    .catch(err => {
      handleError(err)
    })
}
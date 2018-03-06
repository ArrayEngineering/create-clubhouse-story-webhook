const util = require('util')
const {
  configureEnv,
  findOwnerId,
  findProjectId,
  writeStory
} = require('./clubhouse')

const validateBody = body => {
  const {name, description, ownerEmail, projectName} = body
  if (!name) {
    throw new Error("'name' is required")
  }
  if (!description) {
    throw new Error("'description' is required")
  }
  if (!ownerEmail) {
    throw new Error("'ownerEmail' is required")
  }
}

const createStory = body => {
  validateBody(body)

  return findOwnerId(body.ownerEmail)
    .then(ownerId => {
      if (!ownerId) {
        throw new Error(`no matching Clubhouse member for email '${body.ownerEmail}'`)
      }

      return findProjectId(body.projectName)
        .then(projectId => {
          if (!ownerId) {
            throw new Error(`no matching Clubhouse project '${body.projectName}'`)
          }

          return writeStory(body.name, body.description, ownerId, projectId)
        })  
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
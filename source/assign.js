require('isomorphic-fetch')
const fs = require('fs')
const { GITHUB_AUTH_TOKEN } = process.env
// Octokit/rest npm

const getAssignees = new Promise((resolve,reject) => {
  fs.readFile('source/Assignees.json', (err, data) => {
    if (err) reject(err)
    resolve(JSON.parse(data))
  })
})

const saveAssignees = assignees => {
  fs.writeFile('source/Assignees.json', JSON.stringify(assignees), err => (err && console.log(err)))
}

const assignUserToPR = (pullRequest, assignee) => {
  const params = { assignees: [assignee] }
  fetch(`${pullRequest.issue_url}/assignees`, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      Authorization: AUTH_TOKEN,
    },
  })
  .then(response => { if (!response.ok) console.log('assign user failed, api response code: ', response.status)})
  .catch(err => console.log(err))
}

exports.work = async () => {
  let assignees = await getAssignees
  
  fetch('https://api.github.com/repos/rentpath/ag.js/pulls', {
    method: 'GET',
    headers: {
      Authorization: GITHUB_AUTH_TOKEN,
    },
  })
  .then(response => (response.json()))
  .then(pulls => {
    pulls.forEach(pullRequest => {
      pullRequest.labels.forEach(label => {
        if (label.name === 'greenkeeper' && pullRequest.assignee === null) {
          const assignee = assignees.shift()
          console.log(`assignee: ${assignee} - pullRequest: ${pullRequest.title}`)
          // assignUserToPR(pullRequest, assignee)
          assignees.push(assignee)
        }
      })
    })
    saveAssignees(assignees)
  })
  .catch(err => console.log(err))
}


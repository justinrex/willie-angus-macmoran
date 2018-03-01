require('isomorphic-fetch')
const fs = require('fs')

const buff = new Buffer(`willie-angus-macmoran:dumbest1`)
const base64data = buff.toString('base64')

const getAssignees = new Promise((resolve,reject) => {
  fs.readFile('Assignees.json', (err, data) => {
    if (err) reject(err)
    resolve(JSON.parse(data))
  })
})

const saveAssignees = assignees => {
  fs.writeFile('Assignees.json', JSON.stringify(assignees), err => (err && console.log(err)))
}

const assignUserToPR = (pullRequest, assignee) => {
  const params = { assignees: [assignee] }

  fetch(`${pullRequest.issue_url}/assignees`, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      Authorization: `Basic ${base64data}`,
    },
  })
  // .then(response => {response.json()})
  // .then(data => {})
  .catch(err => { 
    console.log(err)
  })
}

const work = async () => {
  let assignees = await getAssignees
  
  fetch('https://api.github.com/repos/justinrex/event-scraper/pulls')
  .then(response => (response.json()))
  .then(pulls => {
    pulls.forEach(pullRequest => {
      pullRequest.labels.forEach(label => {
        if (label.name === 'good first issue' && pullRequest.assignee === null) {
          const assignee = assignees.shift() // remove user from front of list 
          assignUserToPR(pullRequest, assignee)
          assignees.push(assignee)  // put user back on the end of the list
        }
      })
    })
    saveAssignees(assignees)
  })
}

work()

const express = require('express')
const app = express()
const fs = require('fs');

const path = require('path')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const readFile = (filename) => {
	return new Promise((resolve, reject) => {
		//get data
		fs.readFile(filename, 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			//tasks list data from file
			const tasks = JSON.parse(data)
			resolve(tasks)
		});
	})
}

const writeFile = (filename, data) => {
	return new Promise((resolve, reject) => {
		//get data from file
		fs.writeFile(filename, data, 'utf8', err => {
			if (err) {
				console.error(err);
				return;
			}
			resolve(true)
		});
	})
}

app.get('/', (req, res) => {
	//tasks list data from file
	readFile('./tasks.json')
	.then(tasks => {
		res.render('index', {tasks: tasks})
	})
})

//parsing
app.use(express.urlencoded({ extended: true }));

app.post('/', (req,res) => {
	//tasks list data from file
	readFile('./tasks.json')
	.then(tasks => {
		// add new task
		// create new id automatically
		let index
		if(tasks.length === 0)
		{
			index = 0
		} else {
			index = tasks[tasks.length-1].id + 1;
		}
		// create task object
		const newTask = {
			"id" : index,
			"task" : req.body.task
		}
		// add form sent task to tasks array
		tasks.push(newTask)
		data = JSON.stringify(tasks, null, 2)
		writeFile('tasks.json', data)
		//redirect
		res.redirect('/')
	})
})

app.get('/delete-task/:taskId', (req, res) => {
	let deletedTaskId = parseInt(req.params.taskId)
	readFile('./tasks.json')
	.then(tasks => {
		tasks.forEach((task, index) => {
			if(task.id === deletedTaskId){
				tasks.splice(index, 1)
			}
		})
		data = JSON.stringify(tasks, null, 2)
		writeFile('tasks.json', data)
		//redirect
		res.redirect('/')
	})
})

app.listen(3001, () => {
	console.log('Example app is started at http://localhost:3001')
})
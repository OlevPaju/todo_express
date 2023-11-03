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
		res.render('index', {
			tasks: tasks,
			error: null
		})
	})
})

//parsing
app.use(express.urlencoded({ extended: true }));

app.post('/', (req,res) => {
	//kontrollib
	let error = null
	if(req.body.task.trim().length == 0){
		error = 'Please insert correct task data'
		readFile('./tasks.json')
		.then(tasks => {
			res.render('index', {
				tasks: tasks,
				error: error
			})
		})
	} else {
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
		res.redirect('/')
	})
}
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

app.post('/clear-all', (req, res) => {
  // Teeb tasks.json tühjaks
  const emptyTasks = [];
  const data = JSON.stringify(emptyTasks, null, 2);
  writeFile('tasks.json', data)
    .then(() => {
      res.redirect('/');
    });
});

app.get('/update-task/:taskId', (req, res) => {
    const taskId = parseInt(req.params.taskId);

    readFile('./tasks.json')
        .then(tasks => {
            const taskToEdit = tasks.find(task => task.id === taskId);

            res.render('edit', {
                task: taskToEdit,
                error: null 
            });
        })
});


app.post('/update-task', (req, res) => {
    const updatedTask = {
        id: parseInt(req.body.taskId),
        task: req.body.task
    };

    // Validation for an empty task
    if (updatedTask.task.trim() === '') {
        readFile('./tasks.json')
            .then(tasks => {
                const taskToUpdate = tasks.find(task => task.id === updatedTask.id);

                res.render('edit', {
                    task: taskToUpdate,
                    error: 'Please insert correct task data'
                });
            })
    } else {
        readFile('./tasks.json')
            .then(tasks => {
                const taskToUpdate = tasks.find(task => task.id === updatedTask.id);

                if (taskToUpdate) {
                    taskToUpdate.task = updatedTask.task;

                    const data = JSON.stringify(tasks, null, 2);
                    writeFile('tasks.json', data)
                        .then(() => {
                            res.redirect('/');
                        })
                } else {
                    res.redirect('/');
                }
            })
    }
});




app.listen(3001, () => {
	console.log('Example app is started at http://localhost:3001')
})
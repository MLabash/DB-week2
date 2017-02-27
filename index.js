const express = require ("express");
const app = express();
const fs = require ("fs");
const mysql = require('mysql');

const config = JSON.parse(fs.readFileSync("config-secret.json"));

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  port: config.port, 
  database: config.database
});

// list tasks
//Get request:   http://localhost:3000/tasks
app.get('/tasks', (request, response, next)=>{
  const sql = 'SELECT Id, Done, Name FROM todos;';
  connection.query(sql, (error, results, fields)=> {
    if (error) {
      console.log(error.message);
      response.status(404).json(error);
    }
    else{ 
      response.status(200).json(results);     
    }
  }); 
});

//Add task
//Post request:   http://localhost:3000/task?task=newTask
app.post('/task', (request, response, next)=>{
  //const task = {};
  const task = request.query.task;
  console.log(request.query.task);
  if (task !== '' && task !== undefined){
    //let sql = "INSERT INTO todos (Name) VALUES('"  + task + "');";connection.escape(newTask)
    let sql = "INSERT INTO todos (Name) VALUES ("  + connection.escape(task)+ ");";
    console.log(sql);
    connection.query(sql, (error, results, fields) =>{
      if (error) throw error;
      const num = results.affectedRows;
      if (num > 0){
        response.status(201).json({ addStatus:'Added successfully'}); 
      }
      else{
        response.status(404).json({ addStatus:'Could not add the task'});
      }    
    });
    
  }
  else{
    response.status(404).json({ addStatus:'Task text not found'});
  }
});

//Update tasks
//Patch request: http://localhost:3000/task/16?task=newTask
app.patch('/task/:id', (request, response, next)=>{
  let id = request.params.id;
  let newTask = request.query.task;
  if ((newTask !== '') && (newTask !== undefined)){
    let sql = "UPDATE todos SET Name =" + connection.escape(newTask) + " WHERE Id =" + connection.escape(id);
    //let sql = "UPDATE todos SET Name ='"  + newTask  + "' WHERE Id =" + connection.escape(userId);
        console.log(sql);
        connection.query(sql, (error, results, fields) =>{
          if (error) throw error;
          var num = results.affectedRows;
          if (num > 0){
            response.status(200).json({updateStatus: 'Updated successfully'}); 
          }
          else{
            response.status(404).json({updateStatus: 'Could not update the task' });
          }
        });
    }
    else{
      response.status(404).json({updateStatus: 'Task text not found' });
    }
});

//Remove task
//Delete request:   http://localhost:3000/task/17
app.delete('/task/:id', (request, response, next)=>{
  let id = request.params.id;
  let sql = 'DELETE FROM todos WHERE Id =' + connection.escape(id);
  console.log(sql);
  connection.query(sql, (error, results, fields) =>{
    if (error) throw error;
    const num = results.affectedRows;
    if (num > 0){
      response.status(200).json({ deleteStatus:'deleted successfully'}); 
    }
    else{
      response.status(404).json({ deleteStatus:'Task ID is not found'});
    }
  });
});

//Reset tasks
//Delete request:   http://localhost:3000/tasks
app.delete('/tasks', (request, response, next)=>{
  let sql = '';  
  //sql = "truncate todos;";    //be careful
  console.log(sql);
  connection.query(sql, (error, results, fields) =>{
    if (error) throw error;
    const num = results.affectedRows;
    if (num > 0){
      response.status(200).json({ deleteStatus:'deleted successfully'}); 
    }
    else{
      response.status(404).json({ deleteStatus:'No tasks to be deleted'});
    }
  });
});

app.listen(3000,  ()=>{
  console.log("application is listining"); //http://localhost:3000
});

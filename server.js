const connection = require('./config/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');
const figlet = require('figlet');
const validate = require('./javascript/validate');
const colors = require('colors');


connection.connect((error) => {
  if (error) throw error;
  console.log(colors.red.bold(`================`));
  console.log(``);
  console.log(colors.blue.bold(figlet.textSync('Employee Tracker')));
  console.log(``);
  console.log(colors.red.bold(`================`));
  promptUser();
});

const promptUser = () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choices',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles', 
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ])

.then((answers) => {
  const {choices} = answers;

  if (choices === 'View all departments') {
      viewAllDepartments();
  }

  if (choices === 'View all roles') {
      viewAllRoles();
  }

  if (choices === 'View all employees'){
    viewAllEmployees();
  }

  if (choices === 'Add a department') {
    addDepartment();
  }

  if (choices === 'Add a role') {
    addRole();
  }

  if (choices === 'Add an employee') {
    addEmployee();
  }

  if (choices === 'Update an employee role') {
    updateEmployeeRole();
  }

  if (choices === 'Exit') {
    connection.end();
  }
});
};

//View all Departments
const viewAllDepartments = () => {
  const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
  connection.promise()
    .query(sql)
    .then(([rows]) => {
      console.log(colors.red.bold(`================`));
      console.log(`` + colors.blue.bold('All departments:'));
      console.log(colors.red.bold(`================`));
      console.table(rows);
      console.log(colors.red.bold(`================`));
      promptUser();
    })
    .catch((error) => {
      throw error;
    });
};


//View all roles
const viewAllRoles = () => {
  console.log(colors.red.bold(`================`));
  console.log(`` + colors.blue.bold(`Everyone's role:`));
  console.log(colors.red.bold(`================`));
  const sql = `SELECT role.id, role.title, department.department_name AS department
                FROM role
                INNER JOIN department ON role.department_id = department.id`;
  connection.promise()
  .query(sql)
  .then(([rows, fields]) => {
    rows.forEach((role) => {console.log(role.title);});
    console.log(colors.red.bold(`================`));
    promptUser();
  })
  .catch((error) => {
    console.log(error);
    promptUser();
  });
};



//View all employees
const viewAllEmployees = () => {
  const sql = `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.department_name AS 'department', 
    role.salary
    FROM employee, role, department 
    WHERE department.id = role.department_id 
    AND role.id = employee.role_id
    ORDER BY employee.id ASC`;

  connection.promise()
    .query(sql)
    .then(([rows, fields]) => {
      console.log(colors.red.bold(`================`));
      console.log(`` + colors.blue.bold('Every Employee:'));
      console.log(colors.red.bold(`================`));
      console.table(rows);
      console.log(colors.red.bold(`================`));
      promptUser();
    })
    .catch((err) => {
      console.error(err);
      promptUser();
    });
};



//Add a department
const addDepartment = () => {
  inquirer.prompt([
    {
      name: 'createDepartment',
      type: 'input',
      message: 'What would you like your new department to be named?',
      validate: validate.validateString
    }
  ])
  .then((answers) => {
    let sql = `INSERT INTO department (department_name) VALUES (?)`;
    connection.query(sql, answers.createDepartment, (error, response) => {
      if (error) throw error;
      console.log(``);
      console.log(colors.blue(answers.createDepartment + ` Your department has been sucessfully created!`));
      console.log(``);
      viewAllDepartments();
    });
  });
};


//Add a role
const addRole = async () => {
  try {
    const [rows, fields] = await connection.promise().query('SELECT * FROM department');
    const deptNamesArray = rows.map((row) => row.department_name);
    deptNamesArray.push('Create Department Role');

    const answers = await inquirer.prompt([
      {
        name: 'departmentRole',
        type: 'list',
        message: 'Which department would you like this current role in?',
        choices: deptNamesArray,
      },
    ]);

    if (answers.departmentRole === 'Create Department Role') {
      await this.addDepartment();
    } else {
      await addRoleResume(rows, answers);
    }
  } catch (error) {
    throw error;
  }
};

const addRoleResume = async (rows, departmentData) => {
  try {
    const answers = await inquirer.prompt([
      {
        name: 'newRole',
        type: 'input',
        message: 'Name your new role!',
        validate: validate.validateString,
      },
      {
        name: 'roleSalary',
        type: 'input',
        message: `What is the new role's salary?`,
        validate: validate.validateSalary,
      },
    ]);

    const createdRole = answers.newRole;
    let departmentId;
    rows.forEach((row) => {
      if (departmentData.departmentRole === row.department_name) {
        departmentId = row.id;
      }
    });

    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
    const crit = [createdRole, answers.roleSalary, departmentId];
    await connection.promise().query(sql, crit);

    console.log(colors.red.bold(`================`));
    console.log(colors.blue('Role has been successfully created!'));
    console.log(colors.red.bold(`================`));
    await viewAllRoles();
  } catch (error) {
    throw error;
  }
};



//Add an employee
const addEmployee = async () => {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: `What is the employee's first name?`,
        validate: addFirstName => {
          if (addFirstName) {
            return true;
          } else {
            console.log('Enter your first name!');
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: `What is the employee's last name?`,
        validate: addLastName => {
          if (addLastName) {
            return true;
          } else {
            console.log('Enter your last name!');
            return false;
          }
        }
      }
    ]);

    const crit = [answers.firstName, answers.lastName];

    const roleSql = `SELECT role.id, role.title FROM role`;

    const [roleData] = await connection.promise().query(roleSql);

    const roles = roleData.map(({ id, title }) => ({ name: title, value: id }));

    const roleChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: `What is the new employee's role?`,
        choices: roles
      }
    ]);

    const role = roleChoice.role;
    crit.push(role);

    const managerSql = `SELECT * FROM employee`;

    const [managerData] = await connection.promise().query(managerSql);

    const managers = managerData.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

    const managerChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: `Who is the new employee's manager?`,
        choices: managers
      }
    ]);

    const manager = managerChoice.manager;
    crit.push(manager);

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES (?, ?, ?, ?)`;

    await connection.promise().query(sql, crit);

    console.log('A new employee has been added to the list!');
    viewAllEmployees();

  } catch (error) {
    console.error(error);
  }
};



  //Update an employee role
  const updateEmployeeRole = async () => {
    try {
      let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
      FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
  
      const [response, fields] = await connection.promise().query(sql);
  
      let employeeNameArray =[];
      response.forEach((employee) => {employeeNameArray.push(`${employee.first_name} ${employee.last_name}`);});
  
      let sql2 = `SELECT role.id, role.title FROM role`;
  
      const [response2, fields2] = await connection.promise().query(sql2);
  
      let rolesArray = [];
      response2.forEach((role) => {rolesArray.push(role.title);});
  
      const answers = await inquirer.prompt([
        {
          name: 'chooseEmployee',
          type: 'list',
          message: 'Which employee has the new role?',
          choices: employeeNameArray
        },
        {
          name: 'chooseRole',
          type: 'list',
          message: 'What is the new role?',
          choices: rolesArray
        }
      ]);
  
      let newTitleId, employeeId;
      response.forEach((role) => {
        if (answers.chooseRole === role.title) {
          newTitleId = role.id;
        }
      });
      response.forEach((employee) => {
        if (answers.chooseEmployee === `${employee.first_name} ${employee.last_name}`){
          employeeId = employee.id;
        }
      });
  
      let sql3 =  `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
      await connection.promise().query(sql3, [newTitleId, employeeId]);
  
      console.log(colors.red.bold(`================`));
      console.log(colors.blue(`Employee's new role has been updated`));
      console.log(colors.red.bold(`================`));
      promptUser();
    } catch (error) {
      console.error(error);
    }
  };
  


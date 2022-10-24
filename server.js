const connection = require('./config/connection');
const inquirer = require('inquirer');
const chalk = require('chalk');
connection.connect((error) => {
    if (error) throw error;
    choiceList();
});


const choiceList = () => {
    inquirer.prompt([
        {
            name: 'choices',
            type: 'list',
            message: 'Select an option below:',
            choices: [
                'All Employees',
                'All Roles',
                'All Departments',
                'Budgets',
                'Update Employee Role',
                'Update Employee Manager',
                'Add Employee',
                'Add Role',
                'Add Department',
                'Remove Employee',
                'Remove Role',
                'Remove Department',
                'Exit'
            ]
        }
    ])
        .then((answers) => {
            const { choices } = answers;

            if (choices === 'All Employees') {
                showEmp();
            }

            if (choices === 'All Departments') {
                showDept();
            }
            if (choices === 'All Roles') {
                showRoles();
            }

            if (choices === 'Budgets') {
                showBudg();
            }

            if (choices === 'Update Employee Role') {
                updEmpRole();
            }

            if (choices === 'Update Employee Manager') {
                updEmpMan();
            }

            

            
            if (choices === 'Add Employee') {
                createEmp();
            }

            if (choices === 'Add Role') {
                createRole();
            }

            if (choices === 'Add Department') {
                createDept();
            }


            if (choices === 'Remove Employee') {
                deleteEmp();
            }

            if (choices === 'Remove Department') {
                deleteDept();
            }
            if (choices === 'Remove Role') {
                deleteRole();
            }
            if (choices === 'Exit') {
                connection.end();
            }
        });
};



//Roles
const showRoles = () => {

    console.log(`                              ` + chalk.blue.bold(`Current Employee Roles`));
    console.log(chalk.yellow.bold(`____________________________________________________________`));
    const sql = `SELECT role.id, role.title, department.name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log(chalk.yellow.bold(`____________________________________________________________`));
        choiceList();
    });
};

//Employees
const showEmp = () => {
    let sql = `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
    connection.query(sql, (error, response) => {
        if (error) return error;
        console.log(`                              ` + chalk.blue.bold(`Current Employees`));

        console.table(response);
        console.log(error)
        choiceList();
    });
};

//depts

const showDept = () => {
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log(`                              ` + chalk.blue.bold(`All Departments`));
        console.table(response);
        choiceList();
    });
};



const showBudg = () => {
    console.log(`                              ` + chalk.blue.bold(`Budget By Department`));
    const sql = `SELECT department_id AS id, 
                  department.name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        choiceList();
    });
};

//create

//New Employee
const createEmp = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'fistName',
            message: "Employee's first name",
            
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Employee's last name",
            
        }
    ])
        .then(answer => {
            const crit = [answer.fistName, answer.lastName]
            const roleSql = `SELECT role.id, role.title FROM role`;
            connection.query(roleSql, (error, data) => {
                if (error) throw error;
                const roles = data.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "Employee's role",
                        choices: roles
                    }
                ])
                    .then(roleChoice => {
                        const role = roleChoice.role;
                        crit.push(role);
                        const managerSql = `SELECT * FROM employee`;
                        connection.query(managerSql, (error, data) => {
                            if (error) throw error;
                            const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: "Who is the employee's manager?",
                                    choices: managers
                                }
                            ])
                                .then(managerChoice => {
                                    const manager = managerChoice.manager;
                                    crit.push(manager);
                                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                                    connection.query(sql, crit, (error) => {
                                        if (error) throw error;
                                        console.log("Employee has been added!")
                                        showEmp();
                                    });
                                });
                        });
                    });
            });
        });
};

//New Role
const createRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let deptNamesArray = [];
        response.forEach((department) => { deptNamesArray.push(department.name); });
        deptNamesArray.push('Create Department');
        inquirer
            .prompt([
                {
                    name: 'departmentName',
                    type: 'list',
                    message: 'Which department is this new role in?',
                    choices: deptNamesArray
                }
            ])
            .then((answer) => {
                if (answer.departmentName === 'Create Department') {
                    this.createDept();
                } else {
                    createRoleResume(answer);
                }
            });

        const createRoleResume = (departmentData) => {
            inquirer
                .prompt([
                    {
                        name: 'newRole',
                        type: 'input',
                        message: 'Name of your new role',
                        
                    },
                    {
                        name: 'salary',
                        type: 'input',
                        message: 'Salary of the new role',
                        
                    }
                ])
                .then((answer) => {
                    let createdRole = answer.newRole;
                    let departmentId;

                    response.forEach((department) => {
                        if (departmentData.departmentName === department.name) { departmentId = department.id; }
                    });

                    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let crit = [createdRole, answer.salary, departmentId];

                    connection.query(sql, crit, (error) => {
                        if (error) throw error;
                        console.log(chalk.greenBright(`Role successfully created!`));
                        showRoles();
                    });
                });
        };
    });
};

//New Department
const createDept = () => {
    inquirer
        .prompt([
            {
                name: 'newDepartment',
                type: 'input',
                message: 'Name of your new Department',
                
            }
        ])
        .then((answer) => {
            let sql = `INSERT INTO department (name) VALUES (?)`;
            connection.query(sql, answer.newDepartment, (error, response) => {
                if (error) throw error;
                console.log(``);
                console.log(chalk.greenBright(answer.newDepartment + ` Department successfully created!`));
                console.log(``);
                showDept();
            });
        });
};


// delete

const deleteEmp = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.query(sql, (error, response) => {
        if (error) throw error;
        let employeeNamesArray = [];
        response.forEach((employee) => { employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`); });

        inquirer
            .prompt([
                {
                    name: 'chosenEmployee',
                    type: 'list',
                    message: 'Employee would you like to delete',
                    choices: employeeNamesArray
                }
            ])
            .then((answer) => {
                let employeeId;

                response.forEach((employee) => {
                    if (
                        answer.chosenEmployee ===
                        `${employee.first_name} ${employee.last_name}`
                    ) {
                        employeeId = employee.id;
                    }
                });

                let sql = `DELETE FROM employee WHERE employee.id = ?`;
                connection.query(sql, [employeeId], (error) => {
                    if (error) throw error;
                    console.log(chalk.redBright(`Employee Successfully Removed`));
                    showEmp();
                });
            });
    });
};

const deleteRole = () => {
    let sql = `SELECT role.id, role.title FROM role`;

    connection.query(sql, (error, response) => {
        if (error) throw error;
        let roleNamesArray = [];
        response.forEach((role) => { roleNamesArray.push(role.title); });

        inquirer
            .prompt([
                {
                    name: 'chosenRole',
                    type: 'list',
                    message: 'Which role would you like to delete?',
                    choices: roleNamesArray
                }
            ])
            .then((answer) => {
                let roleId;

                response.forEach((role) => {
                    if (answer.chosenRole === role.title) {
                        roleId = role.id;
                    }
                });

                let sql = `DELETE FROM role WHERE role.id = ?`;
                connection.query(sql, [roleId], (error) => {
                    if (error) throw error;
                    console.log(chalk.greenBright(`Role Successfully Removed`));
                    showRoles();
                });
            });
    });
};

const deleteDept = () => {
    let sql = `SELECT department.id, department.name FROM department`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let departmentNamesArray = [];
        response.forEach((department) => { departmentNamesArray.push(department.name); });

        inquirer
            .prompt([
                {
                    name: 'chosenDept',
                    type: 'list',
                    message: 'Which department would you like to delete?',
                    choices: departmentNamesArray
                }
            ])
            .then((answer) => {
                let departmentId;

                response.forEach((department) => {
                    if (answer.chosenDept === department.name) {
                        departmentId = department.id;
                    }
                });

                let sql = `DELETE FROM department WHERE department.id = ?`;
                connection.query(sql, [departmentId], (error) => {
                    if (error) throw error;
                    console.log(chalk.redBright(`Department Successfully Removed`));
                    showDept();
                });
            });
    });
};

//edit


const updEmpRole = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let employeeNamesArray = [];
        response.forEach((employee) => { employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`); });

        let sql = `SELECT role.id, role.title FROM role`;
        connection.query(sql, (error, response) => {
            if (error) throw error;
            let rolesArray = [];
            response.forEach((role) => { rolesArray.push(role.title); });

            inquirer
                .prompt([
                    {
                        name: 'chosenEmployee',
                        type: 'list',
                        message: 'Which employee has a new role?',
                        choices: employeeNamesArray
                    },
                    {
                        name: 'chosenRole',
                        type: 'list',
                        message: 'What is their new role?',
                        choices: rolesArray
                    }
                ])
                .then((answer) => {
                    let newTitleId, employeeId;

                    response.forEach((role) => {
                        if (answer.chosenRole === role.title) {
                            newTitleId = role.id;
                        }
                    });

                    response.forEach((employee) => {
                        if (
                            answer.chosenEmployee ===
                            `${employee.first_name} ${employee.last_name}`
                        ) {
                            employeeId = employee.id;
                        }
                    });

                    let sqls = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
                    connection.query(
                        sqls,
                        [newTitleId, employeeId],
                        (error) => {
                            if (error) throw error;
                            console.log(chalk.greenBright(`Employee Role Updated`));
                            showEmp();
                            choiceList();
                        }
                    );
                });
        });
    });
};

const updEmpMan = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
                    FROM employee`;
    connection.query(sql, (error, response) => {
        let employeeNamesArray = [];
        response.forEach((employee) => { employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`); });

        inquirer
            .prompt([
                {
                    name: 'chosenEmployee',
                    type: 'list',
                    message: 'Which employee has a new manager?',
                    choices: employeeNamesArray
                },
                {
                    name: 'newManager',
                    type: 'list',
                    message: 'Who is their manager?',
                    choices: employeeNamesArray
                }
            ])
            .then((answer) => {
                let employeeId, managerId;
                response.forEach((employee) => {
                    if (
                        answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`
                    ) {
                        employeeId = employee.id;
                    }

                    if (
                        answer.newManager === `${employee.first_name} ${employee.last_name}`
                    ) {
                        managerId = employee.id;
                    }
                });

                
             
                    let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

                    connection.query(
                        sql,
                        [managerId, employeeId],
                        (error) => {
                            if (error) throw error;
                            console.log(chalk.greenBright(`Employee Manager Updated`));
                            choiceList();
                        }
                    );
                
            });
    });
};


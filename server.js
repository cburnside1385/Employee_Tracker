const connection = require('./config/connection');
const inquirer = require('inquirer');
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
                'All Positions',
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
            if (choices === 'All Positions') {
                showPosition();
            }

            if (choices === 'Budgets') {
                showBudg();
            }

            if (choices === 'Update Employee Position') {
                updEmpRole();
            }

            if (choices === 'Update Employee Manager') {
                updEmpMan();
            }

            

            
            if (choices === 'Add Employee') {
                createEmp();
            }

            if (choices === 'Add Position') {
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
            if (choices === 'Remove Position') {
                deleteRole();
            }
            if (choices === 'Exit') {
                connection.end();
            }
        });
};



//Position
const showPosition = () => {

    console.log('Current Employee Position');
    console.log(`____________________________________________________________`);
    const query = `SELECT role.id, role.title, department.name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
    connection.query(query, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log(`____________________________________________________________`);
        choiceList();
    });
};

//Employees
const showEmp = () => {
    let query = `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
    connection.query(query, (error, response) => {
        if (error) return error;
        console.log(`Current Employees`);

        console.table(response);
        console.log(error)
        choiceList();
    });
};

//depts

const showDept = () => {
    const query = `SELECT department.id AS id, department.name AS department FROM department`;
    connection.query(query, (error, response) => {
        if (error) throw error;
        console.log(`All Departments`);
        console.table(response);
        choiceList();
    });
};



const showBudg = () => {
    console.log(`Budget By Department`);
    const query = `SELECT department_id AS id, 
                  department.name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.query(query, (error, response) => {
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
            name: 'fName',
            message: "Employee's first name",
            
        },
        {
            type: 'input',
            name: 'lName',
            message: "Employee's last name",
            
        }
    ])
        .then(answer => {
            const crit = [answer.fName, answer.lName]
            const rolequery = `SELECT role.id, role.title FROM role`;
            connection.query(rolequery, (error, data) => {
                if (error) throw error;
                const Position = data.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "Employee's position",
                        choices: Position
                    }
                ])
                    .then(roleChoice => {
                        const role = roleChoice.role;
                        crit.push(role);
                        const manquery = `SELECT * FROM employee`;
                        connection.query(manquery, (error, data) => {
                            if (error) throw error;
                            const bosses = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: "Who is the employee's manager?",
                                    choices: bosses
                                }
                            ])
                                .then(bossChose => {
                                    const manager = bossChose.manager;
                                    crit.push(manager);
                                    const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                                    connection.query(query, crit, (error) => {
                                        if (error) throw error;
                                        console.log("Employee has been added")
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
    const query = 'SELECT * FROM department'
    connection.query(query, (error, response) => {
        if (error) throw error;
        let deptNames = [];
        response.forEach((department) => { deptNames.push(department.name); });
        deptNames.push('Create Department');
        inquirer
            .prompt([
                {
                    name: 'departmentName',
                    type: 'list',
                    message: 'Department this new position in?',
                    choices: deptNames
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

                    let query = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let crit = [createdRole, answer.salary, departmentId];

                    connection.query(query, crit, (error) => {
                        if (error) throw error;
                        console.log(`Role successfully created!`);
                        showPosition();
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
                message: 'Name of the new Department',
                
            }
        ])
        .then((answer) => {
            let query = `INSERT INTO department (name) VALUES (?)`;
            connection.query(query, answer.newDepartment, (error, response) => {
                if (error) throw error;
                console.log('Department successfully created!');
                showDept();
            });
        });
};


// delete

const deleteEmp = () => {
    let query = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.query(query, (error, response) => {
        if (error) throw error;
        let emps = [];
        response.forEach((employee) => { emps.push(`${employee.first_name} ${employee.last_name}`); });

        inquirer
            .prompt([
                {
                    name: 'chosenEmployee',
                    type: 'list',
                    message: 'Employee would you like to delete',
                    choices: emps
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

                let query = `DELETE FROM employee WHERE employee.id = ?`;
                connection.query(query, [employeeId], (error) => {
                    if (error) throw error;
                    console.log(`Employee Successfully Removed`);
                    showEmp();
                });
            });
    });
};

const deleteRole = () => {
    let query = `SELECT role.id, role.title FROM role`;

    connection.query(query, (error, response) => {
        if (error) throw error;
        let positions = [];
        response.forEach((role) => { positions.push(role.title); });

        inquirer
            .prompt([
                {
                    name: 'chosenRole',
                    type: 'list',
                    message: 'Which position would you like to delete?',
                    choices: positions
                }
            ])
            .then((answer) => {
                let roleId;

                response.forEach((role) => {
                    if (answer.chosenRole === role.title) {
                        roleId = role.id;
                    }
                });

                let query = `DELETE FROM role WHERE role.id = ?`;
                connection.query(query, [roleId], (error) => {
                    if (error) throw error;
                    console.log(`Position Successfully Removed`);
                    showPosition();
                });
            });
    });
};

const deleteDept = () => {
    let query = `SELECT department.id, department.name FROM department`;
    connection.query(query, (error, response) => {
        if (error) throw error;
        let depts = [];
        response.forEach((department) => { depts.push(department.name); });

        inquirer
            .prompt([
                {
                    name: 'chosenDept',
                    type: 'list',
                    message: 'Which department would you like to delete?',
                    choices: depts
                }
            ])
            .then((answer) => {
                let departmentId;

                response.forEach((department) => {
                    if (answer.chosenDept === department.name) {
                        departmentId = department.id;
                    }
                });

                let query = `DELETE FROM department WHERE department.id = ?`;
                connection.query(query, [departmentId], (error) => {
                    if (error) throw error;
                    console.log(`Department Successfully Removed`);
                    showDept();
                });
            });
    });
};

//edit


const updEmpRole = () => {
    let query = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.query(query, (error, response) => {
        if (error) throw error;
        let emps = [];
        response.forEach((employee) => { emps.push(`${employee.first_name} ${employee.last_name}`); });

        let query = `SELECT role.id, role.title FROM role`;
        connection.query(query, (error, response) => {
            if (error) throw error;
            let pos = [];
            response.forEach((role) => { pos.push(role.title); });

            inquirer
                .prompt([
                    {
                        name: 'chosenEmployee',
                        type: 'list',
                        message: 'Which employee has a new role?',
                        choices: emps
                    },
                    {
                        name: 'chosenRole',
                        type: 'list',
                        message: 'What is their new role?',
                        choices: pos
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

                    let querys = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
                    connection.query(
                        querys,
                        [newTitleId, employeeId],
                        (error) => {
                            if (error) throw error;
                            console.log('Employee Role Updated');
                            showEmp();
                            choiceList();
                        }
                    );
                });
        });
    });
};

const updEmpMan = () => {
    let query = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
                    FROM employee`;
    connection.query(query, (error, response) => {
        if (error) throw error;
        let emps = [];
        response.forEach((employee) => { emps.push(`${employee.first_name} ${employee.last_name}`); });

        inquirer
            .prompt([
                {
                    name: 'chosenEmployee',
                    type: 'list',
                    message: 'Which employee has a new manager?',
                    choices: emps
                },
                {
                    name: 'newManager',
                    type: 'list',
                    message: 'Who is their manager?',
                    choices: emps
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

                
             
                    let query = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

                    connection.query(
                        query,
                        [managerId, employeeId],
                        (error) => {
                            if (error) throw error;
                            console.log(`Employee Manager Updated`);
                            choiceList();
                        }
                    );
                
            });
    });
};


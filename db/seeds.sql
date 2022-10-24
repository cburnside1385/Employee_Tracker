INSERT INTO department(department_name)
VALUES(IT), ("Sales"), ("Finance"), ("Customer Facing")

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 110000, 1), ("Senior Engineer", 155000, 1), ("CFO", 4000000, 3), ("Collections VP", 300000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Chris', 'Burnside', 3, null), ('Lauren', 'Deane', 2, 1), ('Christian', 'Carter', 1, 2), ('Cruz', 'Alexander', 4, 3)
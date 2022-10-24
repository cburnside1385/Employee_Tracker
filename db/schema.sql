DROP DATABASE IF EXISTS company;
CREATE DATABASE company;
USE company;

CREATE TABLE department (
 id INT NOT NULL IDENTITY(1, 1),
        name VARCHAR(30)
    );
CREATE TABLE role (
    id INT NOT NULL IDENTITY(1, 1),
    title VARCHAR NOT NULL,
    salary DECIMAL NOT NULL,
    department_id int
);

CREATE TABLE employee(
    id INT NOT NULL IDENTITY(1, 1),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    role_id int,
    manager_id int
);




    
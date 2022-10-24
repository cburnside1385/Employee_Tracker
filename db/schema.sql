DROP DATABASE IF EXISTS Company;
CREATE DATABASE Company;
USE Company;

CREATE TABLE department (
    id int PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR 
    );
CREATE TABLE role (
    id int PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR NOT NULL,
    salary DECIMAL NOT NULL,
    department_id int
);

CREATE TABLE employee(
    id int PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    role_id int,
    manager_id int
);




    